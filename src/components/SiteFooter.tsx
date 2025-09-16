import SinaiqLogo from "./SinaiqLogo";

export default function SiteFooter() {
  return (
    <footer className="py-16 md:py-20 px-6 md:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-12">
          {/* Left Column - Brand */}
          <div className="lg:col-span-1">
            {/* SINAIQ Logo */}
            <div className="mb-4">
              <SinaiqLogo 
                width={180} 
                height={32} 
                className="drop-shadow-[0_0_8px_rgba(109,95,255,0.15)]" 
              />
            </div>
            
            <p className="text-[var(--muted)] leading-relaxed max-w-md">
              Empowering brands with AI-driven marketing strategies that deliver measurable growth and lasting impact.
            </p>
          </div>

          {/* Right Columns - Contact & Social */}
          <div className="md:col-span-1 lg:col-span-2">
            <div className="grid sm:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Get in Touch</h3>
                <div className="space-y-3 text-[var(--muted)]">
                  <div className="flex items-center space-x-3">
                    <span>📍</span>
                    <span>Cairo, Egypt</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span>📧</span>
                    <a href="mailto:hello@aurimarketing.com" className="hover:text-white transition-colors">
                      hello@aurimarketing.com
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span>📱</span>
                    <a href="tel:+20XXXXXXXXX" className="hover:text-white transition-colors">
                      +20 XXX XXX XXXX
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
                <div className="space-y-3">
                  <div className="flex flex-col space-y-2 text-[var(--muted)]">
                    <a href="#" className="hover:text-white transition-colors flex items-center space-x-2">
                      <span>🌐</span>
                      <span>Facebook</span>
                    </a>
                    <a href="#" className="hover:text-white transition-colors flex items-center space-x-2">
                      <span>📸</span>
                      <span>Instagram</span>
                    </a>
                    <a href="#" className="hover:text-white transition-colors flex items-center space-x-2">
                      <span>💼</span>
                      <span>LinkedIn</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Divider */}
        <div className="h-px bg-white/10 mb-8"></div>

        {/* Copyright */}
        <div className="text-center text-[var(--muted)] text-sm">
          <p>© 2024 SINAIQ Marketing Agency. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
