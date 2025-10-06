"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/Separator";
import { Trash2, Mail, Shield } from "lucide-react";

type Member = { id: string; email: string; role: "ADMIN" | "MEMBER" };

export default function TeamClient({ currentUserId, isAdmin, members, cabinetId }: { currentUserId: string; isAdmin: boolean; members: Member[]; cabinetId: string; }) {
  const [filter, setFilter] = useState("");
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!filter) return members;
    return members.filter(m => m.email.toLowerCase().includes(filter.toLowerCase()));
  }, [members, filter]);

  const resetPassword = async (targetEmail: string) => {
    setWorkingId(targetEmail);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await res.json();
      if (!res.ok) setError(data?.message || "Failed to send reset email");
      else setMessage("Password reset email sent (if account exists)");
    } catch (e) {
      setError("Unexpected error");
    } finally {
      setWorkingId(null);
    }
  };

  const removeMember = async (memberId: string) => {
    setWorkingId(memberId);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/cabinets/${cabinetId}/members/${memberId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) setError(data?.message || "Failed to remove member");
      else window.location.reload();
    } catch (e) {
      setError("Unexpected error");
    } finally {
      setWorkingId(null);
    }
  };

  const inviteByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setMessage(null);
    setError(null);
    setWorkingId("invite");
    try {
      const res = await fetch(`/api/cabinets/${cabinetId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) setError(data?.message || "Failed to invite");
      else setMessage(data?.message || "Invitation created");
      setEmail("");
    } catch (e) {
      setError("Unexpected error");
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">Manage and view cabinet members.</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Search email" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Invite teammate</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={inviteByEmail} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" disabled={workingId === "invite"}>{workingId === "invite" ? "Sending..." : "Send invite"}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-md border p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{m.email}</span>
                  <Badge variant={m.role === "ADMIN" ? "default" : "secondary"}>
                    {m.role}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Member</p>
              </div>
              {isAdmin && m.id !== currentUserId && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => resetPassword(m.email)} disabled={workingId === m.email}>
                    <Mail className="mr-2 h-4 w-4" /> Reset password
                  </Button>
                  <Button variant="destructive" onClick={() => removeMember(m.id)} disabled={workingId === m.id}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </Button>
                </div>
              )}
              {!isAdmin && (
                <Shield className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}


