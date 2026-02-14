import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { desc } from "drizzle-orm";
import { MessagesClient } from "./messages-client";

export default async function AdminMessagesPage() {
  const allMessages = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));

  return <MessagesClient messages={allMessages} />;
}
