"use server";

import { db } from "@/db";
import { contactMessages, guestbook } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod/v4";

function invalidateTag(tag: string) {
  revalidateTag(tag, { expire: 0 });
}

// ─── Contact Form ───

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  subject: z.string().optional(),
  message: z.string().min(1, "Message is required"),
});

export async function submitContactMessage(formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await db.insert(contactMessages).values({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject ?? null,
      message: parsed.data.message,
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to submit message." };
  }
}

// ─── Guestbook ───

export async function postGuestbookMessage(message: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  if (!message.trim()) {
    return { success: false, error: "Message cannot be empty." };
  }

  try {
    await db.insert(guestbook).values({
      userId: session.user.id,
      authorName: session.user.name,
      authorEmail: session.user.email,
      authorAvatarUrl: session.user.image ?? null,
      message: message.trim(),
      isApproved: false,
    });
    invalidateTag("guestbook");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to post message." };
  }
}

export async function deleteGuestbookMessage(id: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  try {
    await db
      .delete(guestbook)
      .where(and(eq(guestbook.id, id), eq(guestbook.userId, session.user.id)));
    invalidateTag("guestbook");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete message." };
  }
}
