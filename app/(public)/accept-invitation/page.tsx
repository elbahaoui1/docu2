// /app/(public)/accept-invitation/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AcceptInvitationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError("No invitation token provided.");
                setIsLoading(false);
                return;
            }
            try {
                const res = await fetch(`/api/invitations/verify?token=${token}`);
                if (!res.ok) {
                    const data = await res.json();
                    setError(data.message || "Invalid or expired invitation token.");
                }
            } catch (err) {
                setError("Failed to verify invitation.");
            } finally {
                setIsLoading(false);
            }
        };
        verifyToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            const res = await fetch('/api/invitations/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message);
            } else {
                setMessage(data.message);
                setTimeout(() => router.push('/login'), 3000);
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        }
    };

    if (isLoading) return <AuthShell title="Invitation" subtitle="Verifying your invitation..." ><div /></AuthShell>;
    if (error) return <AuthShell title="Invitation"><div className="text-sm text-red-600">Error: {error}</div></AuthShell>;

    return (
        <AuthShell title="Complete your account" subtitle="Create a password to finish setup.">
            <Card>
                <CardHeader title="Set password" />
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        label="Password"
                        required
                    />
                    <Button type="submit">Create account</Button>
                    {message && <p className="text-sm text-green-600">{message}</p>}
                </form>
            </Card>
        </AuthShell>
    );
}