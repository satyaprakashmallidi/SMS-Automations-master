import { LandingNav } from '../components/landing/LandingNav'
import { Hero } from '../components/landing/Hero'
import { HowItWorks } from '../components/landing/HowItWorks'
import { Features } from '../components/landing/Features'
import { CTASection } from '../components/landing/CTASection'
import { Footer } from '../components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <LandingNav />
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* How It Works Section */}
        <section id="how-it-works">
          <HowItWorks />
        </section>

        {/* Features Section */}
        <section id="features">
          <Features />
        </section>

        {/* Final CTA Section */}
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
