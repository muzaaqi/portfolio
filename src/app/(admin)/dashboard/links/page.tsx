import { db } from "@/db";
import { links } from "@/db/schema";
import { asc } from "drizzle-orm";
import { LinksClient } from "./links-client";

import { profile } from "@/db/schema";

export default async function AdminLinksPage() {
  const allLinks = await db
    .select()
    .from(links)
    .orderBy(asc(links.sortOrder));

  const profileData = await db.select().from(profile).limit(1);

  return <LinksClient links={allLinks} profile={profileData[0] || null} />;
}
