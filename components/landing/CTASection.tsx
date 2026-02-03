import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-t from-card/50 to-background" />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative rounded-3xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative px-8 py-16 lg:px-16 lg:py-24 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Start preserving memories
              <br />
              <span className="bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
                today
              </span>
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
              Create your first memory wall in minutes. No credit card required.
              Free forever for up to 3 walls.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/sign-up">
                  Get started for free
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="h-12 px-8 text-base"
                asChild>
                <Link href="#features">Learn more</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
