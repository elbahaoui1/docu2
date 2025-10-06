"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { Card, CardHeader } from "@/components/ui/Card";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!token || !email) {
        setError("Missing token or email");
        return;
      }
      const res = await fetch(`/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Email verified. You can sign in now.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.message || "Verification failed");
      }
    };
    run();
  }, [token, email, router]);

  return (
    <AuthShell title="Verify email" subtitle="We’re confirming your email.">
      <Card>
        <CardHeader title="Email verification" />
        <div className="text-sm text-zinc-700">{error ? <span className="text-red-600">{error}</span> : (message || "Verifying...")}</div>
      </Card>
    </AuthShell>
  );
}


