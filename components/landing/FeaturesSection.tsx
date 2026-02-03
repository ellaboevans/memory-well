import { Pen, Palette, Shield, BarChart3, Download, Clock } from "lucide-react";

const features = [
  {
    icon: Pen,
    title: "Expressive Signatures",
    description:
      "Touch-friendly signature pad with freestyle drawing. Add stickers, emojis, and personal messages.",
  },
  {
    icon: Palette,
    title: "Full Customization",
    description:
      "Custom themes, colors, fonts, and cover images. Make every wall uniquely yours.",
  },
  {
    icon: Shield,
    title: "Immutable Entries",
    description:
      "Once signed, entries cannot be edited. Preserve the authenticity of every message.",
  },
  {
    icon: BarChart3,
    title: "Rich Analytics",
    description:
      "Track visitors, signatures, and engagement. Understand how your wall is being used.",
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description:
      "Download your wall as a print-ready PDF or high-resolution image. Keep memories forever.",
  },
  {
    icon: Clock,
    title: "Time Windows",
    description:
      "Set start and end dates for accepting entries. Perfect for events with defined timelines.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-card/30 to-background" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything you need to
            <br />
            <span className="bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
              preserve memories
            </span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Powerful tools to create, customize, and share your digital
            guestbooks with the people who matter most.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border bg-card/50 p-6 lg:p-8 transition-all hover:bg-card/80 hover:border-border/80">
              {/* Icon */}
              <div className="mb-5 inline-flex items-center justify-center size-12 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                <feature.icon className="size-5 text-white/80" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
