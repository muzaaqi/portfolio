import { db } from "@/db";
import { projects } from "@/db/schema";
import { asc } from "drizzle-orm";
import { ProjectsClient } from "./projects-client";

export default async function AdminProjectsPage() {
  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.sortOrder));

  return <ProjectsClient projects={allProjects} />;
}
