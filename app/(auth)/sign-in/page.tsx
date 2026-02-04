"use client";

import { Droplets } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { useConvexAuth } from "convex/react";
import Image from "next/image";

export default function SignInPage() {
  const { isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <Droplets className="size-4" />
              </div>
              Memory Well
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              Loading...
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <img
            src="/auth-signin.jpg"
            alt="Memory Wall"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Droplets className="size-4" />
            </div>
            Memory Well
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/auth-signin.jpg"
          alt="Memory Wall"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] dark:grayscale"
          width={2000}
          height={2000}
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
