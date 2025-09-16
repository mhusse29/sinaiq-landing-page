export default function About() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
              A Modern Marketing Partner for{' '}
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  background: 'linear-gradient(135deg, var(--ai-1), var(--ai-2))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Ambitious Brands
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-[var(--muted)] leading-relaxed">
              At SINAIQ Marketing Agency, we believe marketing should be simple, powerful, and measurable. 
              We combine human creativity with AI-powered insights to help you connect, convert, and grow 
              in today's fast-paced digital world.
            </p>
          </div>

          {/* Right Column - USP Card */}
          <div className="lg:pl-8">
            <div 
              className="rounded-2xl border border-white/10 backdrop-blur p-6 md:p-8 relative overflow-hidden"
              style={{
                background: 'color-mix(in srgb, var(--surface) 70%, transparent)'
              }}
            >
              {/* Subtle Glow Border Effect */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-30"
                style={{
                  background: 'linear-gradient(135deg, var(--ai-1), var(--ai-2))',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'xor',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  padding: '1px'
                }}
              />
              
              <div className="relative z-10">
                <div className="text-2xl mb-4">✨</div>
                <blockquote className="text-lg md:text-xl font-medium text-white leading-relaxed">
                  "At SINAIQ, we don't just run ads — we empower you with AI tools to create media plans, 
                  manage campaigns, and scale across every platform effortlessly."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
