"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";
import { motion } from "motion/react";
import type { Project } from "@/db/schema";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section
      id="projects"
      data-section="projects"
      className="container mx-auto min-h-svh px-4 py-20 md:pr-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="mb-2 text-4xl font-bold">Projects</h2>
        <div className="bg-primary mb-12 h-1 w-16" />
      </motion.div>

      {projects.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No projects added yet.</p>
      )}
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="group border-border flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg pt-0">
      {project.imageUrl && (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg">{project.title}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-1.5">
          {(project.tags ?? []).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        {project.repoUrl && (
          <Button variant="outline" size="sm" asChild>
            <Link
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-1 size-3.5" />
              Code
            </Link>
          </Button>
        )}
        {project.liveUrl && (
          <Button size="sm" asChild>
            <Link
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-1 size-3.5" />
              Live
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
