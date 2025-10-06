"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/Separator";
import { AlertCircle, CheckCircle, Loader2, Building, Users } from "lucide-react";

type AccountKind = "COMPANY" | "CABINET";

export default function RegisterPage() {
  const [kind, setKind] = useState<AccountKind>("COMPANY");
  const [companyName, setCompanyName] = useState("");
  const [cabinetName, setCabinetName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);
    
    try {
      const endpoint = kind === "COMPANY" ? "/api/auth/register-company" : "/api/auth/register-cabinet";
      const body = kind === "COMPANY"
        ? { companyName, email, password }
        : { cabinetName, email, password };
        
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Registration failed");
      } else {
        setMessage(data.message || "Registered successfully. Check your email to verify.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell 
      title="Create your account" 
      subtitle="Get started with your professional document management platform"
    >
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign up</CardTitle>
          <CardDescription className="text-center">
            Choose your account type and enter your details to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Account Type</label>
            <RadioGroup className="grid grid-cols-1 gap-4">
              <div 
                className={`relative flex cursor-pointer select-none items-center rounded-lg border p-4 hover:bg-accent ${
                  kind === "COMPANY" ? "border-primary bg-accent" : ""
                }`}
                onClick={() => setKind("COMPANY")}
              >
                <RadioGroupItem
                  value="COMPANY"
                  checked={kind === "COMPANY"}
                  onChange={() => setKind("COMPANY")}
                  className="sr-only"
                />
                <Building className="mr-3 h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">Company Account</div>
                  <div className="text-sm text-muted-foreground">
                    For businesses managing their own documents
                  </div>
                </div>
                {kind === "COMPANY" && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
              
              <div 
                className={`relative flex cursor-pointer select-none items-center rounded-lg border p-4 hover:bg-accent ${
                  kind === "CABINET" ? "border-primary bg-accent" : ""
                }`}
                onClick={() => setKind("CABINET")}
              >
                <RadioGroupItem
                  value="CABINET"
                  checked={kind === "CABINET"}
                  onChange={() => setKind("CABINET")}
                  className="sr-only"
                />
                <Users className="mr-3 h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">Cabinet Account</div>
                  <div className="text-sm text-muted-foreground">
                    For professional services managing multiple clients
                  </div>
                </div>
                {kind === "CABINET" && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
            </RadioGroup>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              {kind === "COMPANY" ? (
                <Input
                  type="text"
                  placeholder="Acme Inc."
                  label="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              ) : (
                <Input
                  type="text"
                  placeholder="Acme Cabinet"
                  label="Cabinet Name"
                  value={cabinetName}
                  onChange={(e) => setCabinetName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="name@example.com"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Create a strong password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert variant="success">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          {kind === "CABINET" && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                💡 Cabinet accounts can invite collaborators and manage multiple client companies. 
                You'll have admin privileges to control access and permissions.
              </p>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link href="/login">
              <Button variant="outline" className="w-full" size="lg">
                Sign in instead
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}


