"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";

export function EmailVerificationDialog() {
  const status = useQuery(api.users.meVerificationStatus);
  const { signIn } = useAuthActions();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const email = status?.email;
  const isVerified = status?.emailVerified ?? true;

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(
      () => setResendCooldown((prev) => Math.max(0, prev - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const normalizedCode = code.replace(/\s+/g, "").trim();
      await signIn("password", {
        email,
        code: normalizedCode,
        flow: "email-verification",
      });
      setCode("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to verify your email",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn("password", {
        email,
        flow: "email-verification",
      });
      setCode("");
      setResendCooldown(30);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resend verification",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === undefined || status === null || isVerified) {
    return null;
  }

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Verify your email</DialogTitle>
          <DialogDescription className="text-zinc-400">
            We sent a verification code to{" "}
            <span className="font-medium text-white">{email}</span>. Enter it to
            unlock your dashboard.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="verify-code" className="text-sm text-zinc-300">
              Verification code
            </label>
            <Input
              id="verify-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter the 8-digit code"
              className="mt-2 bg-zinc-800 border-zinc-700 text-white"
              autoComplete="one-time-code"
              required
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={isSubmitting || resendCooldown > 0}
              className="border-zinc-700">
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend code"}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
