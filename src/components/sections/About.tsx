"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Award, GraduationCap } from "lucide-react";
import { useRef } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { SplitLetters } from "@/components/ui/SplitLetters";

gsap.registerPlugin(ScrollTrigger);

export function About() {
  const { t } = useApp();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-about-reveal]", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 40,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.from("[data-about-line]", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1,
        ease: "power3.inOut",
      });
    },
    { scope: sectionRef },
  );

  const roleDisplay = t.about.roleTitle.replace(/\s/g, " ").toUpperCase();

  return (
    <section
      ref={sectionRef}
      id="about"
      className="hero-cinematic relative scroll-mt-24 overflow-x-clip overflow-y-visible px-6 py-20 md:min-h-[min(100svh,900px)] md:px-10 md:py-24 lg:px-12"
    >
      <div className="pointer-events-none absolute inset-0 hero-cinematic-mesh opacity-60" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1380px] flex-col items-center gap-10 overflow-visible lg:flex-row lg:gap-16">
        <div
          data-about-avatar-slot
          className="relative z-20 hidden w-full justify-center overflow-visible lg:flex lg:w-1/3"
          aria-hidden
        >
          <div className="flex aspect-square w-full max-w-[min(80vw,460px)] items-center justify-center overflow-visible sm:max-w-[100vw] md:max-w-[min(30rem,36vw)]" />
        </div>

        <div className="relative z-10 flex w-full flex-col justify-center lg:w-2/3 lg:ps-4 xl:ps-12">
        <div data-about-reveal className="mb-6">
          <h2 className="about-outline-text text-[clamp(3.5rem,14vw,9rem)] font-black uppercase leading-none">
            {t.about.creativeLabel}
          </h2>
        </div>

        <div
          data-about-line
          className="hero-accent-line mb-8 h-px w-full max-w-md"
        />

        <div data-about-reveal className="mb-16">
          <SplitLetters
            as="h3"
            text={roleDisplay}
            className="text-2xl font-bold tracking-[0.35em] text-[var(--text-muted)] sm:text-3xl md:text-4xl"
            letterClassName="text-[var(--text-primary)]"
            stagger={0.025}
          />
        </div>

        <p
          data-about-reveal
          className="mb-12 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]"
        >
          {t.about.bio}
        </p>

        <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-2">
          <div data-about-reveal>
            <GlassCard className="hero-about-card !p-6" reveal={false}>
              <div className="flex items-start gap-4">
                <GraduationCap className="hero-accent-text mt-0.5 h-6 w-6 shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {t.hero.education}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    {t.hero.educationText}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          <div data-about-reveal>
            <GlassCard className="hero-about-card !p-6" reveal={false}>
              <div className="flex items-start gap-4">
                <Award className="hero-accent-text mt-0.5 h-6 w-6 shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {t.hero.certificates}
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                    {t.hero.certItems.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="hero-accent-text">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
