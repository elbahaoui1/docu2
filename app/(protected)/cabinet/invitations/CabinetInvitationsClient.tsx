"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { Copy, Link2, Mail } from "lucide-react";

export default function CabinetInvitationsClient({ cabinetId }: { cabinetId: string }) {
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return !!email && !!cabinetId && !submitting;
  }, [email, cabinetId, submitting]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setInviteLink(null);

    try {
      const res = await fetch(`/api/cabinets/${cabinetId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to send invitation");
      } else {
        if (data?.link) setInviteLink(data.link);
        setSuccess(data?.message || "Invitation created");
        setEmail("");
      }
    } catch (err) {
      setError("Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setSuccess("Invitation link copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground">Invite teammates to your cabinet.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> Send an invitation
            </CardTitle>
            <CardDescription>We will generate a secure link valid for 24 hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <Input
                type="email"
                label="Teammate email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={!canSubmit} className="sm:mt-6">
                {submitting ? "Sending..." : "Send invite"}
              </Button>
            </form>

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            {success && !error && <p className="mt-3 text-sm text-green-600">{success}</p>}

            {inviteLink && (
              <div className="mt-6">
                <Separator className="my-4" />
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">Share this link</p>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={inviteLink} className="font-mono text-xs" />
                    <Button type="button" variant="secondary" onClick={copyLink}>
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" /> How it works
            </CardTitle>
            <CardDescription>Great UX for your team onboarding.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>We create a unique, time-limited link bound to your cabinet.</p>
            <p>Share it with colleagues. They set a password and join immediately.</p>
            <div className="flex items-center gap-2">
              <span>New users join as</span>
              <Badge variant="secondary">Member</Badge>
              <span>. You can upgrade permissions later.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


