/* eslint-disable react-hooks/immutability */
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap, Shield } from "lucide-react";

// Polar product ID for Premium (one-time purchase)
const PREMIUM_PRODUCT_ID = "bd1b1f8b-f18a-4e0d-947c-00fd61f3b81a";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/forever",
    description: "Perfect for trying out Memory Well",
    features: [
      "Up to 3 memory walls",
      "50 signatures per wall",
      "Basic themes",
      "Standard support",
    ],
    cta: "Current Plan",
    disabled: true,
  },
  {
    name: "Premium",
    price: "$9",
    period: " one-time",
    description: "Lifetime access to all premium features",
    popular: true,
    features: [
      "Unlimited memory walls",
      "Unlimited signatures",
      "All premium themes",
      "Custom branding",
      "Priority support",
      "Export to PDF",
      "Remove Memory Well branding",
    ],
    cta: "Upgrade to Premium",
    disabled: false,
    productId: PREMIUM_PRODUCT_ID,
  },
];

export default function BillingPage() {
  const profile = useQuery(api.profiles.me);
  useQuery(api.subscriptions.getMySubscription); // Keep for potential future use
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success message after checkout
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      // Clear the URL param
      globalThis.history.replaceState({}, "", "/dashboard/billing");
    }
  }, [searchParams]);

  const isPremium = profile?.tier === "premium";

  const handleUpgrade = (productId: string) => {
    // Redirect to Polar checkout with user email
    const email = profile?.email || "";
    const checkoutUrl = `/api/checkout?products=${productId}&customerEmail=${encodeURIComponent(email)}`;
    globalThis.location.href = checkoutUrl;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-900/50 border border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-400" />
            <p className="text-green-200 font-medium">
              Thank you for subscribing! Your account has been upgraded to
              Premium.
            </p>
          </div>
        </div>
      )}

      {/* Current Plan Status */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown
                className={`h-5 w-5 ${isPremium ? "text-yellow-400" : "text-zinc-400"}`}
              />
              <CardTitle className="text-white">Current Plan</CardTitle>
            </div>
            <Badge
              variant="secondary"
              className={
                isPremium
                  ? "bg-yellow-900/50 text-yellow-400"
                  : "bg-zinc-800 text-zinc-400"
              }>
              {isPremium ? "Premium (Lifetime)" : "Free"}
            </Badge>
          </div>
          <CardDescription>
            {isPremium
              ? "You have lifetime access to all premium features"
              : "Upgrade to unlock all features"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Available Plans
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`bg-zinc-900 border-zinc-800 relative ${
                plan.popular ? "ring-2 ring-white/20" : ""
              }`}>
              {plan.popular && (
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-white text-black">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pt-8">
                <CardTitle className="text-white flex items-center gap-2">
                  {plan.name}
                  {plan.name === "Premium" && (
                    <Zap className="h-4 w-4 text-yellow-400" />
                  )}
                </CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-zinc-400">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-col flex h-full!">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="h-4 w-4 text-green-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-auto!"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={
                    plan.disabled || (isPremium && plan.name === "Premium")
                  }
                  onClick={() => {
                    if ("productId" in plan && plan.productId) {
                      handleUpgrade(plan.productId);
                    }
                  }}>
                  {isPremium && plan.name === "Premium"
                    ? "Current Plan"
                    : plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Info */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-zinc-400" />
            <CardTitle className="text-white">Secure Payments</CardTitle>
          </div>
          <CardDescription>
            All payments are securely processed through Polar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span>We accept:</span>
            <div className="flex items-center gap-2">
              <div className="bg-zinc-800 rounded px-2 py-1 text-xs font-medium">
                Visa
              </div>
              <div className="bg-zinc-800 rounded px-2 py-1 text-xs font-medium">
                Mastercard
              </div>
              <div className="bg-zinc-800 rounded px-2 py-1 text-xs font-medium">
                Apple Pay
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
