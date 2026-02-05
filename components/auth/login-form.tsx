"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"sign-in" | "verify-email">("sign-in");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("password", {
        email,
        password,
        flow: "signIn",
      });
      if (result.signingIn) {
        router.push("/dashboard");
        return;
      }

      setPendingEmail(email);
      setStep("verify-email");
      setVerificationCode("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (
        errorMessage.includes("InvalidAccountId") ||
        errorMessage.includes("Could not find")
      ) {
        setError("No account found with this email. Please sign up first.");
      } else if (
        errorMessage.includes("InvalidSecret") ||
        errorMessage.includes("password")
      ) {
        setError("Incorrect password. Please try again.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!pendingEmail) return;

    setError(null);
    setIsLoading(true);

    try {
      const normalizedCode = verificationCode.replace(/\s+/g, "").trim();
      const result = await signIn("password", {
        email: pendingEmail,
        code: normalizedCode,
        flow: "email-verification",
      });

      if (result.signingIn) {
        router.push("/dashboard");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to verify your email",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail || resendCooldown > 0) return;
    setError(null);
    setIsLoading(true);

    try {
      await signIn("password", {
        email: pendingEmail,
        flow: "email-verification",
      });
      setVerificationCode("");
      setResendCooldown(30);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resend verification",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(
      () => setResendCooldown((prev) => Math.max(0, prev - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (step === "verify-email") {
    return (
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={handleVerify}
        {...props}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-muted-foreground text-sm text-balance">
              We sent a verification code to{" "}
              <span className="font-medium text-foreground">
                {pendingEmail}
              </span>
            </p>
          </div>

          {error && (
            <div
              className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-red-200 text-sm"
              role="alert"
              aria-live="polite">
              {error}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="verificationCode">
              Verification code
            </FieldLabel>
            <Input
              id="verificationCode"
              type="text"
              placeholder="Enter the 8-digit code"
              required
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              disabled={isLoading}
              autoComplete="one-time-code"
            />
          </Field>

          <Field>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Verifying..." : "Verify and continue"}
            </Button>
          </Field>

          <Field>
            <FieldDescription className="text-center">
              <button
                type="button"
                onClick={handleResend}
                className="underline underline-offset-4"
                disabled={isLoading || resendCooldown > 0}>
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Resend code"}
              </button>
            </FieldDescription>
          </Field>

          <Field>
            <FieldDescription className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep("sign-in");
                  setError(null);
                  setVerificationCode("");
                  setResendCooldown(0);
                }}
                className="underline underline-offset-4">
                Back to sign in
              </button>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Sign in to manage your memory walls
          </p>
        </div>

        {error && (
          <div
            className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-red-200 text-sm"
            role="alert"
            aria-live="polite">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline text-muted-foreground">
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
