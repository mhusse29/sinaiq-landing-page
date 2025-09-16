export default function Testimonials() {
  const testimonials = [
    {
      quote: "SINAIQ doubled our online engagement in 3 months. They don't just market — they innovate.",
      client: "Client X"
    },
    {
      quote: "We cut our lead cost by 40% thanks to SINAIQ's AI-powered campaigns.",
      client: "Client Y"
    }
  ]

  return (
    <section className="py-24 md:py-32 px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-6">
            Proven Results,{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{
                background: 'linear-gradient(135deg, var(--ai-1), var(--ai-2))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Happy Clients
            </span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-white/10 backdrop-blur p-6 md:p-8 hover:scale-105 transition-all duration-300"
              style={{
                background: 'color-mix(in srgb, var(--surface) 70%, transparent)'
              }}
            >
              {/* Avatar Placeholder */}
              <div className="flex items-center mb-6">
                <div 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full mr-4 flex items-center justify-center text-lg md:text-xl font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, var(--ai-1), var(--ai-2))'
                  }}
                >
                  {testimonial.client.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white text-lg">
                    {testimonial.client}
                  </div>
                  <div className="text-[var(--muted)] text-sm">
                    Verified Client
                  </div>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="text-lg md:text-xl text-[var(--text)] leading-relaxed mb-4">
                "{testimonial.quote}"
              </blockquote>

              {/* Gradient Underline */}
              <div 
                className="h-1 w-16 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, var(--ai-1), var(--ai-2))'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
