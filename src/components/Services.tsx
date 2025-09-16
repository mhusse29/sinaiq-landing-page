export default function Services() {
  const services = [
    {
      title: "Social Media Marketing",
      description: "Build awareness and engagement on Instagram, Facebook, TikTok & LinkedIn."
    },
    {
      title: "Performance Ads",
      description: "Maximize ROI with precision-targeted campaigns."
    },
    {
      title: "Content Creation",
      description: "Stunning visuals, reels, and copywriting that capture attention."
    },
    {
      title: "SEO & Google Ads",
      description: "Boost visibility and attract high-intent customers."
    },
    {
      title: "Brand Strategy",
      description: "Position your business for long-term success."
    },
    {
      title: "AI-Powered Media Planning",
      description: "Plan your campaigns with smart AI tools and make data-driven decisions."
    }
  ]

  return (
    <section className="py-24 md:py-32 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-6">
            What We Do{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{
                background: 'linear-gradient(135deg, var(--ai-1), var(--ai-2))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Best
            </span>
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-white/10 backdrop-blur p-6 md:p-8 hover:scale-105 transition-all duration-300 hover:border-white/20"
              style={{
                background: 'color-mix(in srgb, var(--surface) 70%, transparent)'
              }}
            >
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 leading-tight">
                {service.title}
              </h3>
              <p className="text-[var(--muted)] leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Line */}
        <div className="text-center">
          <p className="text-lg md:text-xl text-[var(--muted)] font-medium">
            <span 
              className="bg-clip-text text-transparent"
              style={{
                background: 'linear-gradient(135deg, var(--ai-1), var(--ai-2))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              All-in-One Platform Reach
            </span>
            {' '}— Run and manage campaigns across all major platforms from one hub.
          </p>
        </div>
      </div>
    </section>
  )
}
