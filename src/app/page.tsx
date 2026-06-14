import { HeroSection } from '@/components/home/HeroSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { PopularDestinations } from '@/components/home/PopularDestinations';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Benefits } from '@/components/home/Benefits';
import { Testimonials } from '@/components/home/Testimonials';
import { FAQ } from '@/components/home/FAQ';
import { CTASection } from '@/components/home/CTASection';
import { TrackPageVisit } from '@/components/analytics/TrackPageVisit';

export default function HomePage() {
  return (
    <>
      <TrackPageVisit />
      <HeroSection />
      <ServicesSection />
      <PopularDestinations />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <FAQ />
      <CTASection />
    </>
  );
}
