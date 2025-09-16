export default function Hero() {
  return (
    <section className="relative h-[100svh] overflow-hidden bg-[var(--hero-deep)]">
      {/* Mountain Background */}
      <picture className="absolute inset-0">
        <source 
          media="(min-width: 1920px)" 
          srcSet="/assets/hero-mountain-1920.webp" 
        />
        <source 
          media="(min-width: 1440px)" 
          srcSet="/assets/hero-mountain-1440.webp" 
        />
        <source 
          media="(min-width: 1152px)" 
          srcSet="/assets/hero-mountain-1152.webp" 
        />
        <source 
          media="(min-width: 768px)" 
          srcSet="/assets/hero-mountain-768.webp" 
        />
        <img
          src="/assets/hero-mountain-original.webp"
          alt="Mountain landscape"
          className="absolute inset-0 object-cover h-full w-full"
          decoding="async"
          loading="eager"
        />
      </picture>

      {/* Vignette Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 40%, rgba(0,0,0,0.45) 100%)'
        }}
      />

      {/* Peak Glow Effect */}
      <div 
        className="absolute inset-0 mix-blend-screen animate-breath"
        style={{
          background: 'radial-gradient(ellipse at 50% 54%, rgba(77, 163, 255, 0.4) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 70%)',
          maskImage: 'radial-gradient(ellipse at 50% 54%, black 0%, transparent 70%)',
          filter: 'blur(28px) saturate(125%)',
          animation: 'breath 7s ease-in-out infinite'
        }}
      />

      {/* Base Mist Layer */}
      <div 
        className="absolute bottom-[-10%] h-[55%] w-full mix-blend-screen blur-2xl animate-drift"
        style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(77, 163, 255, 0.15) 0%, rgba(168, 85, 247, 0.1) 40%, transparent 70%)',
          animation: 'drift 24s ease-in-out infinite'
        }}
      />

      {/* Navigation Header */}
      <header className="relative z-10 flex items-center justify-between p-6 md:p-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 flex items-center justify-between w-full max-w-7xl mx-auto">
          {/* SINAIQ Wordmark */}
          <div className="flex items-center space-x-1 text-xl md:text-2xl font-bold">
            <span className="text-white">SIN</span>
            <span 
              className="bg-clip-text text-transparent"
              style={{
                background: 'linear-gradient(135deg, var(--ai-1), var(--ai-2))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              AI
            </span>
            <span className="text-white">Q</span>
          </div>

          {/* CTA Button */}
          <button className="bg-[var(--primary)] text-white rounded-2xl px-4 py-2 md:px-6 md:py-3 shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base font-medium">
            🚀 Get Your Free Consultation
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center max-w-4xl mx-auto px-6 md:px-8">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
            <span className="text-white">Elevate Your Brand with </span>
            <span 
              className="bg-clip-text text-transparent"
              style={{
                background: 'linear-gradient(135deg, var(--ai-1), var(--ai-2))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Auri Marketing Agency
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl lg:text-2xl text-[var(--muted)] mb-8 max-w-3xl mx-auto leading-relaxed">
            We blend creativity, data, and AI to deliver marketing strategies that drive business growth and engage your audience.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-[var(--primary)] text-white rounded-2xl px-6 py-3 md:px-8 md:py-4 shadow-lg hover:shadow-xl transition-all duration-300 text-base md:text-lg font-medium">
              🚀 Get Your Free Consultation
            </button>
            <button className="border border-white/15 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 rounded-2xl px-6 py-3 md:px-8 md:py-4 transition-all duration-300 text-base md:text-lg font-medium">
              See our work
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
