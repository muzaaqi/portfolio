"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Skill } from "@/db/schema";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface SkillsSectionProps {
  skills: Skill[];
}

const categoryLabels: Record<string, string> = {
  language: "Languages",
  framework: "Frameworks",
  tool: "Tools",
  database: "Databases",
  design: "Design",
  other: "Other",
};

const categoryOrder = [
  "language",
  "framework",
  "tool",
  "database",
  "design",
  "other",
];

function getDeviconUrl(slug: string) {
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
}

function SkillCard({ skill }: { skill: Skill }) {
  const [imgError, setImgError] = useState(false);

  const card = (
    <div
      data-skill-card
      className="group bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card relative flex flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="bg-muted/50 group-hover:bg-primary/10 flex size-12 items-center justify-center rounded-lg transition-colors duration-300">
        {skill.icon && !imgError ? (
          <Image
            src={getDeviconUrl(skill.icon)}
            alt={skill.name}
            width={28}
            height={28}
            className="object-contain transition-transform duration-300 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-muted-foreground text-lg font-bold">
            {skill.name.charAt(0)}
          </span>
        )}
      </div>
      <span className="text-sm font-medium">{skill.name}</span>
    </div>
  );

  if (skill.description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-[220px] text-center text-xs"
        >
          {skill.description}
        </TooltipContent>
      </Tooltip>
    );
  }

  return card;
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Group skills by category
  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      label: categoryLabels[cat] ?? cat,
      items: skills.filter((s) => s.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReducedMotion) return;

      // Heading animation
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            clearProps: "all",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // Stagger each group with slide-up animation
      groupRefs.current.forEach((groupEl) => {
        if (!groupEl) return;
        const cards = groupEl.querySelectorAll("[data-skill-card]");
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: "power3.out",
            clearProps: "all",
            scrollTrigger: {
              trigger: groupEl,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    },
    { scope: sectionRef, dependencies: [skills] },
  );

  return (
    <TooltipProvider>
      <section
        ref={sectionRef}
        id="skills"
        data-section="skills"
        className="container mx-auto min-h-svh px-4 py-20 md:pr-20"
      >
        <div ref={headingRef}>
          <h2 className="mb-2 text-4xl font-bold">Skills</h2>
          <div className="bg-primary mb-12 h-1 w-16" />
        </div>

        {grouped.length > 0 ? (
          <div className="space-y-10">
            {grouped.map((group, i) => (
              <div
                key={group.category}
                ref={(el) => {
                  groupRefs.current[i] = el;
                }}
              >
                <h3 className="text-foreground/80 mb-4 text-xl font-semibold">
                  {group.label}
                </h3>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {group.items.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No skills added yet.</p>
        )}
      </section>
    </TooltipProvider>
  );
}
