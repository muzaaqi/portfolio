"use client";

import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
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
        gsap.from(headingRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }

      // Stagger each group
      groupRefs.current.forEach((groupEl) => {
        if (!groupEl) return;
        const badges = groupEl.querySelectorAll("[data-skill-badge]");
        gsap.from(badges, {
          scale: 0,
          opacity: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: groupEl,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
    },
    { scope: sectionRef, dependencies: [skills] },
  );

  return (
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
              <div className="flex flex-wrap gap-3">
                {group.items.map((skill) => (
                  <Badge
                    key={skill.id}
                    data-skill-badge
                    variant="secondary"
                    className="px-4 py-2 text-sm transition-transform hover:scale-105"
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No skills added yet.</p>
      )}
    </section>
  );
}
