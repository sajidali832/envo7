
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Shield, KeyRound, User } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Admin Settings</h1>
                <p className="text-muted-foreground">Manage your admin account and platform settings.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User /> Account</CardTitle>
                    <CardDescription>Admin account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-semibold">admin@envo-pro.app</span>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield /> Security</CardTitle>
                    <CardDescription>Change your admin password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                   <Button><KeyRound className="mr-2 h-4 w-4" />Change Password</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell /> Notifications</CardTitle>
                    <CardDescription>Manage how you receive admin notifications.</CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground">Admin notification settings will be available soon.</p>
                </CardContent>
            </Card>

        </div>
    )
}
