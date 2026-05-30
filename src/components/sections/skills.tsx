"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Skill } from "@/db/schema";

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
  const shouldReduceMotion = useReducedMotion();

  // Group skills by category
  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      label: categoryLabels[cat] ?? cat,
      items: skills.filter((s) => s.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: {
      y: shouldReduceMotion ? 0 : 40,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <TooltipProvider>
      <section
        id="skills"
        data-section="skills"
        className="container mx-auto min-h-svh px-4 py-20 md:pr-20"
      >
        <motion.div
          initial={{ y: shouldReduceMotion ? 0 : 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="mb-2 text-4xl font-bold">Skills</h2>
          <div className="bg-primary mb-12 h-1 w-16" />
        </motion.div>

        {grouped.length > 0 ? (
          <div className="space-y-10">
            {grouped.map((group) => (
              <motion.div
                key={group.category}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-15% 0px" }}
                variants={containerVariants}
              >
                <h3 className="text-foreground/80 mb-4 text-xl font-semibold">
                  {group.label}
                </h3>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {group.items.map((skill) => (
                    <motion.div key={skill.id} variants={cardVariants}>
                      <SkillCard skill={skill} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No skills added yet.</p>
        )}
      </section>
    </TooltipProvider>
  );
}
