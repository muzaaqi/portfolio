import { db } from "@/db";
import { links, socialLinks, profile } from "@/db/schema";
import { asc } from "drizzle-orm";
import { LinksClient } from "./links-client";

export default async function AdminLinksPage() {
  const allLinks = await db
    .select()
    .from(links)
    .orderBy(asc(links.sortOrder));

  const allSocials = await db
    .select()
    .from(socialLinks)
    .orderBy(asc(socialLinks.sortOrder));

  const profileData = await db.select().from(profile).limit(1);

  return <LinksClient links={allLinks} socialLinks={allSocials} profile={profileData[0] || null} />;
}
