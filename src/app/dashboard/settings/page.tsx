
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Moon, Sun } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
    const { user } = useAuth();
    const router = useRouter();
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account, preferences, and log out.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">Display Mode</CardTitle>
                    <CardDescription>Choose between light and dark themes for your dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ThemeToggle />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User /> Account Information</CardTitle>
                    <CardDescription>Your registered account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-semibold">{user?.email || 'Loading...'}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2"><LogOut /> Logout</CardTitle>
                    <CardDescription>Securely log out of your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={handleLogout}>
                       Logout from this device
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
