export default function CTA() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main CTA Content */}
        <div 
          className="rounded-3xl border border-white/10 backdrop-blur p-8 md:p-12 lg:p-16 relative overflow-hidden"
          style={{
            background: 'color-mix(in srgb, var(--surface) 80%, transparent)'
          }}
        >
          {/* Background Gradient Effect */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(ellipse at center, var(--ai-1) 0%, var(--ai-2) 50%, transparent 70%)'
            }}
          />
          
          <div className="relative z-10">
            {/* Headline */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-6">
              Ready to{' '}
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  background: 'linear-gradient(135deg, var(--ai-1), var(--ai-2))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Transform
              </span>
              {' '}Your Marketing?
            </h2>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-[var(--muted)] mb-8 max-w-2xl mx-auto leading-relaxed">
              Let SINAIQ craft strategies that deliver real growth, not just vanity metrics.
            </p>

            {/* Primary CTA Button */}
            <button className="bg-[var(--primary)] text-white rounded-2xl px-8 py-4 md:px-10 md:py-5 shadow-lg hover:shadow-xl transition-all duration-300 text-lg md:text-xl font-semibold mb-4 hover:scale-105">
              Book Your Free Strategy Call
            </button>

            {/* Social Proof/Privacy Note */}
            <p className="text-sm text-[var(--muted)] mt-4">
              🔒 Your information is secure and will never be shared. No spam, ever.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
