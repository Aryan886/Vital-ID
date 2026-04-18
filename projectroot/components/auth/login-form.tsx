"use client";

import { LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AUTH_COOKIE_NAME,
  DEMO_SESSION_TOKEN,
  createBrowserSupabaseClient,
  hasSupabaseEnv
} from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("care@vitalid.demo");
  const [password, setPassword] = useState("demo-access");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (!hasSupabaseEnv()) {
        document.cookie = `${AUTH_COOKIE_NAME}=${DEMO_SESSION_TOKEN}; path=/; max-age=86400; samesite=lax`;
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const supabase = createBrowserSupabaseClient();

      if (!supabase) {
        throw new Error("Supabase client could not be created.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error || !data.session?.access_token) {
        throw new Error(error?.message ?? "Unable to sign in.");
      }

      document.cookie = `${AUTH_COOKIE_NAME}=${data.session.access_token}; path=/; max-age=3600; samesite=lax`;
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Authentication failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md overflow-hidden">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-3 text-teal-800">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="data-pill">
            {hasSupabaseEnv() ? "Live auth enabled" : "Demo auth enabled"}
          </span>
        </div>
        <div>
          <CardTitle className="font-serif text-3xl">
            Secure clinician access
          </CardTitle>
          <CardDescription className="mt-2 text-sm leading-6">
            Sign in to enter the protected Vital ID dashboard. When Supabase
            keys are not configured, the form falls back to a safe demo session.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="doctor@hospital.org"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}
          <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Authorizing
              </>
            ) : (
              <>
                <LockKeyhole className="h-4 w-4" />
                Enter dashboard
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
