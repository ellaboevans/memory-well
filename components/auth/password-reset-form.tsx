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
import { useState } from "react";
import Link from "next/link";

export function PasswordResetForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { signIn } = useAuthActions();

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      await signIn("password", {
        email,
        flow: "reset",
      });
      setStep("verify");
      setSuccessMessage(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to request reset code",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyReset = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      await signIn("password", {
        email,
        code: verificationCode,
        newPassword,
        flow: "reset-verification",
      });
      setStep("request");
      setVerificationCode("");
      setNewPassword("");
      setSuccessMessage("Password updated. You can sign in now.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reset your password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={handleVerifyReset}
        {...props}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter the code sent to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-emerald-900/40 border border-emerald-800 rounded-lg p-3 text-emerald-200 text-sm">
              {successMessage}
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
            <FieldLabel htmlFor="newPassword">New password</FieldLabel>
            <Input
              id="newPassword"
              type="password"
              placeholder="At least 8 characters"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
            />
          </Field>

          <Field>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Updating..." : "Update password"}
            </Button>
          </Field>

          <Field>
            <FieldDescription className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep("request");
                  setError(null);
                  setSuccessMessage(null);
                  setVerificationCode("");
                  setNewPassword("");
                }}
                className="underline underline-offset-4">
                Back
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
      onSubmit={handleRequestReset}
      {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-muted-foreground text-sm text-balance">
            We&apos;ll email you a reset code.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-red-200 text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-900/40 border border-emerald-800 rounded-lg p-3 text-emerald-200 text-sm">
            {successMessage}
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
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Sending..." : "Send reset code"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center">
            Remembered it?{" "}
            <Link href="/sign-in" className="underline underline-offset-4">
              Back to sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
