import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_DOMAIN } from "@/lib/config";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-background to-background/80" />

      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-32 lg:py-40">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-background/50 backdrop-blur-sm mb-8 animate-fade-in">
            <Sparkles className="size-3.5 text-white/70" />
            <span className="text-sm text-muted-foreground">
              Preserve memories with integrity
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in-up">
            Digital guestbooks
            <br />
            <span className="bg-linear-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              that last forever
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed animate-fade-in-up animation-delay-100">
            Create beautiful memory walls for weddings, memorials, milestones,
            and celebrations. Collect signatures, messages, and moments that
            remain untouched.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up animation-delay-200">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/sign-up">
                Start for free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base"
              asChild>
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-16 flex flex-col items-center gap-4 animate-fade-in-up animation-delay-300">
            <div className="flex -space-x-3">
              {["a", "b", "c", "d", "e"].map((id) => (
                <div
                  key={id}
                  className="size-10 rounded-full border-2 border-background bg-linear-to-br from-white/20 to-white/5"
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">2,000+</span>{" "}
              memories preserved this month
            </p>
          </div>
        </div>

        {/* Hero visual - Floating cards */}
        <div className="relative mt-20 lg:mt-24">
          <div className="relative mx-auto max-w-5xl">
            {/* Main preview card */}
            <div className="relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-1 shadow-2xl">
              <div className="rounded-xl bg-linear-to-b from-card to-background overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-white/10" />
                    <div className="size-3 rounded-full bg-white/10" />
                    <div className="size-3 rounded-full bg-white/10" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-white/5 text-xs text-muted-foreground">
                      {APP_DOMAIN}/wall/evans-elabo-wedding
                    </div>
                  </div>
                </div>

                {/* Wall preview */}
                <div className="p-8 lg:p-12">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl lg:text-3xl font-bold">
                      Sarah & James Wedding
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      June 15, 2026 • Accra, Ghana
                    </p>
                  </div>

                  {/* Signature cards grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        name: "Kwame A.",
                        message: "Wishing you both eternal happiness! 🎉",
                      },
                      {
                        name: "Ama K.",
                        message: "So happy for you two! Love conquers all.",
                      },
                      {
                        name: "Daniel O.",
                        message: "May your love grow stronger each day.",
                      },
                      {
                        name: "Grace M.",
                        message: "Beautiful ceremony! Congratulations! 💕",
                      },
                      {
                        name: "Emmanuel T.",
                        message: "To many more years of joy together!",
                      },
                      {
                        name: "Abena S.",
                        message: "You two are perfect for each other.",
                      },
                    ].map((entry) => (
                      <div
                        key={entry.name}
                        className="rounded-lg border border-border bg-background/50 p-4 transition-transform hover:-translate-y-1">
                        <div className="h-12 mb-3 rounded bg-linear-to-r from-white/5 to-transparent" />
                        <p className="font-medium text-sm">{entry.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {entry.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent cards */}
            <div className="absolute -top-6 -left-6 lg:-left-12 w-48 rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 shadow-xl -rotate-6 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-sm">Entry signed!</p>
                  <p className="text-xs text-muted-foreground">Just now</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 lg:-right-8 w-56 rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 shadow-xl rotate-[4deg] hidden md:block">
              <p className="text-sm font-medium mb-2">Wall Analytics</p>
              <div className="flex items-end gap-1">
                {[40, 65, 45, 80, 55, 90, 75].map((h) => (
                  <div
                    key={h}
                    className="flex-1 bg-white/20 rounded-sm"
                    style={{ height: `${h * 0.4}px` }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                156 signatures this week
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
