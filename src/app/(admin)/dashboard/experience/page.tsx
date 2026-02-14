import { db } from "@/db";
import { experiences } from "@/db/schema";
import { asc } from "drizzle-orm";
import { ExperienceClient } from "./experience-client";

export default async function AdminExperiencePage() {
  const allExperiences = await db
    .select()
    .from(experiences)
    .orderBy(asc(experiences.type), asc(experiences.sortOrder));

  return <ExperienceClient experiences={allExperiences} />;
}
