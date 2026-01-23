import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { WhoItsFor } from './components/WhoItsFor';
import { HowItWorks } from './components/HowItWorks';
import { Integrations } from './components/Integrations';
import { Pricing } from './components/Pricing';
import { UseCases } from './components/UseCases';
import { Footer } from './components/Footer';
import { SocialProof } from './components/SocialProof';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navigation />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <Features />
      <Integrations />
      <WhoItsFor />
      <Pricing />
      <UseCases />
      <Footer />
    </div>
  );
}
