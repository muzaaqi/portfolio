"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import type { Profile, Experience } from "@/db/schema";

interface AboutSectionProps {
  profile: Profile | null;
  experiences: Experience[];
}

export function AboutSection({ profile, experiences }: AboutSectionProps) {
  const workExperiences = experiences.filter((e) => e.type === "work");
  const educationExperiences = experiences.filter(
    (e) => e.type === "education",
  );

  return (
    <section
      id="about"
      data-section="about"
      className="container mx-auto min-h-svh px-4 py-20 md:pr-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="mb-2 text-4xl font-bold">About Me</h2>
        <div className="bg-primary mb-8 h-1 w-16" />
      </motion.div>

      {/* Bio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
        className="mb-16 max-w-3xl"
      >
        <p className="text-muted-foreground text-lg leading-relaxed">
          {profile?.bio ?? "Bio coming soon..."}
        </p>
      </motion.div>

      <div className="grid gap-12 md:grid-cols-2">
        {/* Work Experience */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-6 flex items-center gap-3"
          >
            <Briefcase className="text-primary size-6" />
            <h3 className="text-2xl font-bold">Work Experience</h3>
          </motion.div>
          <div className="space-y-4">
            {workExperiences.length > 0 ? (
              workExperiences.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ExperienceCard experience={exp} />
                </motion.div>
              ))
            ) : (
              <p className="text-muted-foreground">
                No work experience added yet.
              </p>
            )}
          </div>
        </div>

        {/* Education */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-6 flex items-center gap-3"
          >
            <GraduationCap className="text-primary size-6" />
            <h3 className="text-2xl font-bold">Education</h3>
          </motion.div>
          <div className="space-y-4">
            {educationExperiences.length > 0 ? (
              educationExperiences.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ExperienceCard experience={exp} />
                </motion.div>
              ))
            ) : (
              <p className="text-muted-foreground">No education added yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceCard({ experience }: { experience: Experience }) {
  const startDate = experience.startDate
    ? new Date(experience.startDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";
  const endDate = experience.isCurrent
    ? "Present"
    : experience.endDate
      ? new Date(experience.endDate).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "";

  return (
    <Card className="border-border transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{experience.role}</CardTitle>
        <p className="text-muted-foreground text-sm">
          {experience.company}
          {experience.location ? ` · ${experience.location}` : ""}
        </p>
        <p className="text-muted-foreground/70 text-xs">
          {startDate} — {endDate}
        </p>
      </CardHeader>
      {experience.description && (
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {experience.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
