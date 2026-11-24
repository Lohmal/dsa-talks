import Hero from "@/confdsa/components/sections/home/Hero";
import Welcome from "@/confdsa/components/sections/home/Welcome";
import SpeakersSection from "@/confdsa/components/sections/home/SpeakersSection";
import ProgramSection from "@/confdsa/components/sections/home/ProgramSection";
import PosterSection from "@/confdsa/components/sections/home/PosterSection";
import CallToAction from "@/confdsa/components/sections/home/CallToAction";

export default function HomePage() {
  return (
    <div className="bg-surface">
      <Hero />
      {/* One continuous vertical wash under the hero: light blue → white → pale navy-lilac.
          z-10 keeps the Welcome sheet above the hero it overlaps; flow-root stops the sheet's negative
          margin from collapsing into this wrapper (which would pull the wash up over the hero). */}
      <div className="relative z-10 flow-root bg-[linear-gradient(to_bottom,#dbe4f3_0%,#ebf0f8_16%,#ffffff_40%,#ffffff_60%,#eef0f8_82%,#e3e6f3_100%)]">
        <Welcome />
        <PosterSection />
        <SpeakersSection />
        <ProgramSection />
        <CallToAction />
      </div>
    </div>
  );
}
