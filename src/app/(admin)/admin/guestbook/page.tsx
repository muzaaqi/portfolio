import { db } from "@/db";
import { guestbook } from "@/db/schema";
import { desc } from "drizzle-orm";
import { GuestbookClient } from "./guestbook-client";

export default async function AdminGuestbookPage() {
  const allEntries = await db
    .select()
    .from(guestbook)
    .orderBy(desc(guestbook.createdAt));

  return <GuestbookClient entries={allEntries} />;
}
