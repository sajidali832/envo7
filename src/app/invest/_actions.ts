
'use server';

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { v4 as uuidv4 } from "uuid";

type SubmissionResult = {
    success: boolean;
    error?: string;
};

export async function submitInvestment(formData: FormData): Promise<SubmissionResult> {
    const userId = formData.get('userId') as string;
    const planId = formData.get('planId') as string;
    const price = formData.get('price') as string;
    const holderName = formData.get('holderName') as string;
    const accountNumber = formData.get('accountNumber') as string;
    const screenshotFile = formData.get('screenshotFile') as File;

    if (!userId || !planId || !price || !holderName || !accountNumber || !screenshotFile) {
        return { success: false, error: "Missing required form data." };
    }

    let filePath = '';
    
    try {
        // Step 1: Upload the screenshot to Supabase Storage using the Admin client for reliability.
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        filePath = `${userId}/${fileName}`;
        
        const { error: uploadError } = await supabaseAdmin.storage
            .from('proofs')
            .upload(filePath, screenshotFile);

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            throw new Error(`Upload Failed: ${uploadError.message}`);
        }

        // Step 2: Get the public URL of the uploaded file.
        const { data: urlData } = supabase.storage
            .from('proofs')
            .getPublicUrl(filePath);
            
        const screenshotUrl = urlData?.publicUrl ?? '';
        if (!screenshotUrl) {
            throw new Error("Could not get the public URL for the uploaded file.");
        }

        // Step 3: Insert the investment record into the database.
        const { error: insertError } = await supabaseAdmin.from('investments').insert({
            user_id: userId,
            plan_id: parseInt(planId),
            amount: parseFloat(price),
            status: 'pending',
            proof_screenshot_url: screenshotUrl,
            user_account_holder_name: holderName,
            user_account_number: accountNumber
        });

        if (insertError) {
            console.error('Insert Error:', insertError);
            throw new Error(`Submission Failed: ${insertError.message}`);
        }

        // Step 4: Update the user's profile status to 'pending_approval'.
        const { error: profileUpdateError } = await supabaseAdmin
          .from('profiles')
          .update({ status: 'pending_approval' })
          .eq('id', userId);

        if (profileUpdateError) {
            console.error('Profile Update Error:', profileUpdateError);
            throw new Error(`Status Update Failed: ${profileUpdateError.message}`);
        }

        // Step 5: All operations are successful.
        return { success: true };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Full submission error:", errorMessage);
        
        // Cleanup orphaned file if it was uploaded but a later step failed
        if (filePath) {
            await supabaseAdmin.storage.from('proofs').remove([filePath]);
        }

        return { success: false, error: errorMessage };
    }
}
