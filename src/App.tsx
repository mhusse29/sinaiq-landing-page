import InteractiveHero from './components/InteractiveHero'
import About from './components/About'
import Services from './components/Services'
import WhyChoose from './components/WhyChoose'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import SiteFooter from './components/SiteFooter'

export default function App() {
  return (
    <main className="min-h-screen">
      <InteractiveHero />
      <About />
      <Services />
      <WhyChoose />
      <Testimonials />
      <CTA />
      <SiteFooter />
    </main>
  )
}
