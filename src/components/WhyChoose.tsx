export default function WhyChoose() {
  const reasons = [
    "AI-driven insights with human creativity.",
    "Transparent reporting & analytics.",
    "Tailored strategies for your industry.",
    "Proven track record of scaling brands."
  ]

  return (
    <section className="py-24 md:py-32 px-6 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section Header */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-16">
          Why Brands{' '}
          <span 
            className="bg-clip-text text-transparent"
            style={{
              background: 'linear-gradient(135deg, var(--ai-1), var(--ai-2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Trust Us
          </span>
        </h2>

        {/* Checklist */}
        <div className="space-y-6 md:space-y-8">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="flex items-center justify-start text-left max-w-2xl mx-auto group"
            >
              <div className="flex-shrink-0 w-8 h-8 mr-4 md:mr-6 flex items-center justify-center">
                <span className="text-2xl md:text-3xl text-green-400 group-hover:scale-110 transition-transform duration-200">
                  ✅
                </span>
              </div>
              <p className="text-lg md:text-xl text-[var(--text)] leading-relaxed group-hover:text-white transition-colors duration-200">
                {reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
