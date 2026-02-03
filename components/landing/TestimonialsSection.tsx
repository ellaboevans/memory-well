const testimonials = [
  {
    quote:
      "We used Memory Well for our wedding and it was magical. Guests loved the digital signature pad, and we now have a beautiful PDF of all the messages.",
    author: "Ama & Kofi",
    role: "Married June 2025",
  },
  {
    quote:
      "After my father passed, we created a memory wall for his memorial. Family from around the world could contribute. It means everything to us.",
    author: "Grace Mensah",
    role: "Memorial organizer",
  },
  {
    quote:
      "Our company retreat needed something special. Memory Well let everyone sign and share memories. The export feature is chef's kiss.",
    author: "Daniel Osei",
    role: "Event Coordinator",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-card/20 to-background" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Loved by people
            <br />
            <span className="bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
              who cherish memories
            </span>
          </h2>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((item) => (
            <div
              key={item.author}
              className="relative rounded-2xl border border-border bg-card/50 p-6 lg:p-8">
              {/* Quote mark */}
              <div className="mb-4 text-4xl text-white/10 font-serif">
                &ldquo;
              </div>

              {/* Quote */}
              <blockquote className="text-foreground leading-relaxed mb-6">
                {item.quote}
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-linear-to-br from-white/20 to-white/5" />
                <div>
                  <p className="font-medium text-sm">{item.author}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
