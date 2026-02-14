import { db } from "@/db";
import { socialLinks } from "@/db/schema";
import { asc } from "drizzle-orm";
import { SocialsClient } from "./socials-client";

export default async function AdminSocialsPage() {
  const allSocials = await db
    .select()
    .from(socialLinks)
    .orderBy(asc(socialLinks.sortOrder));

  return <SocialsClient socials={allSocials} />;
}
