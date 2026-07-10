"use client";

import { MarqueeTicker } from "@/components/effects/MarqueeTicker";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";

export function HeroAboutZone() {
  return (
    <div className="hero-about-zone relative overflow-x-clip overflow-y-visible">
      <Hero />
      <div className="relative left-1/2 z-30 w-screen max-w-[100vw] -translate-x-1/2">
        <MarqueeTicker />
      </div>
      <About />
    </div>
  );
}
