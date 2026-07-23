import { db } from "@/db";
import { links } from "@/db/schema";
import { asc } from "drizzle-orm";
import { LinksClient } from "./links-client";

export default async function AdminLinksPage() {
  const allLinks = await db
    .select()
    .from(links)
    .orderBy(asc(links.sortOrder));

  return <LinksClient links={allLinks} />;
}
