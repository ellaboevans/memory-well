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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"sign-up" | "verify-email">("sign-up");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("password", {
        email,
        password,
        name,
        flow: "signUp",
      });
      if (result.signingIn) {
        router.push("/dashboard");
        return;
      }

      setStep("verify-email");
      setVerificationCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const normalizedCode = verificationCode.replace(/\s+/g, "").trim();
      const result = await signIn("password", {
        email,
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
    if (resendCooldown > 0) return;
    setError(null);
    setIsLoading(true);

    try {
      await signIn("password", {
        email,
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
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="text-muted-foreground text-sm text-balance">
              We sent a verification code to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-red-200 text-sm">
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
                  setStep("sign-up");
                  setError(null);
                  setVerificationCode("");
                  setResendCooldown(0);
                }}
                className="underline underline-offset-4">
                Back to sign up
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Start collecting memories in minutes
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-red-200 text-sm">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </Field>

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
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline underline-offset-4">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
