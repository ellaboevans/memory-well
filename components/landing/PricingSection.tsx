import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for personal use and small events.",
    features: [
      "Up to 3 walls",
      "Unlimited signatures",
      "Basic themes",
      "Share via link",
      "Mobile-friendly",
    ],
    cta: "Get started free",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "15",
    period: "/month",
    description: "For professionals and larger events.",
    features: [
      "Unlimited walls",
      "Advanced theming",
      "Analytics dashboard",
      "PDF & image export",
      "Verification badges",
      "Priority support",
      "Custom domains",
    ],
    cta: "Start 14-day trial",
    href: "/sign-up?plan=premium",
    highlighted: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Simple pricing,
            <br />
            <span className="bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
              no surprises
            </span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Start free and upgrade when you need more. Cancel anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-white/20 bg-linear-to-b from-white/10 to-white/5"
                  : "border-border bg-card/50"
              }`}
            >
              {/* Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-black">
                    Most popular
                  </span>
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-lg font-semibold">{plan.name}</h3>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">GH₵{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>

              {/* Description */}
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="size-4 text-white/60 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-8">
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
