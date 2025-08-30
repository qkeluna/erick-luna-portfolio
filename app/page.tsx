import { HeroSection } from "@/components/home/hero";
import { SkillsOverviewSection } from "@/components/home/skills-overview";
import { WorkSection } from "@/components/home/work";
// import { TestimonialsSection } from "@/components/home/testimonials";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SkillsOverviewSection />
      <WorkSection />
      {/* Temporarily commented out until real customer testimonials are available */}
      {/* <TestimonialsSection /> */}
    </>
  );
}
