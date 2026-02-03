const steps = [
  {
    step: "01",
    title: "Create your wall",
    description:
      "Sign up and create a new memory wall in seconds. Give it a title, description, and choose your theme.",
  },
  {
    step: "02",
    title: "Share the link",
    description:
      "Get a unique link to your wall. Share it via email, text, QR code, or social media with your guests.",
  },
  {
    step: "03",
    title: "Collect signatures",
    description:
      "Visitors sign your wall with their name, message, and freestyle signature. Entries are auto-published.",
  },
  {
    step: "04",
    title: "Preserve forever",
    description:
      "Export your wall as a PDF or image. Print it, frame it, or keep it digital. The memories are yours forever.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Simple by design,
            <br />
            <span className="bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
              powerful by nature
            </span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-8 left-8 right-8 h-px bg-linear-to-r from-transparent via-border to-transparent hidden lg:block" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((item) => (
              <div key={item.step} className="relative">
                {/* Step number */}
                <div className="relative z-10 mb-6">
                  <div className="inline-flex items-center justify-center size-16 rounded-2xl border border-border bg-card text-2xl font-bold">
                    {item.step}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
