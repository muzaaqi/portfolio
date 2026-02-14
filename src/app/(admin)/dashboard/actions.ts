"use server";

import { db } from "@/db";
import {
  profile,
  socialLinks,
  projects,
  skills,
  experiences,
  guestbook,
  contactMessages,
  user,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";

function invalidateTag(tag: string) {
  revalidateTag(tag, { expire: 0 });
}
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

// ─── Profile ───

export async function updateProfile(data: {
  name: string;
  title: string;
  bio?: string;
  shortBio?: string;
  profileImageUrl?: string;
  resumeUrl?: string;
  email?: string;
  location?: string;
  availableForHire?: boolean;
}) {
  await requireAdmin();

  const existing = await db.select().from(profile).limit(1);
  if (existing.length === 0) {
    await db.insert(profile).values(data);
  } else {
    await db.update(profile).set(data).where(eq(profile.id, existing[0].id));
  }

  invalidateTag("profile");
  return { success: true };
}

// ─── Social Links ───

export async function createSocialLink(data: {
  platform: string;
  url: string;
  icon?: string;
  sortOrder?: number;
}) {
  await requireAdmin();
  await db.insert(socialLinks).values(data);
  invalidateTag("socials");
  return { success: true };
}

export async function updateSocialLink(
  id: number,
  data: {
    platform?: string;
    url?: string;
    icon?: string;
    sortOrder?: number;
    isVisible?: boolean;
  },
) {
  await requireAdmin();
  await db.update(socialLinks).set(data).where(eq(socialLinks.id, id));
  invalidateTag("socials");
  return { success: true };
}

export async function deleteSocialLink(id: number) {
  await requireAdmin();
  await db.delete(socialLinks).where(eq(socialLinks.id, id));
  invalidateTag("socials");
  return { success: true };
}

// ─── Projects ───

export async function createProject(data: {
  title: string;
  slug: string;
  description?: string;
  longDescription?: string;
  imageUrl?: string;
  liveUrl?: string;
  repoUrl?: string;
  tags?: string[];
  isFeatured?: boolean;
  status?: "completed" | "in_progress" | "archived";
  sortOrder?: number;
}) {
  await requireAdmin();
  await db.insert(projects).values(data);
  invalidateTag("projects");
  return { success: true };
}

export async function updateProject(
  id: number,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    longDescription?: string;
    imageUrl?: string;
    liveUrl?: string;
    repoUrl?: string;
    tags?: string[];
    isFeatured?: boolean;
    status?: "completed" | "in_progress" | "archived";
    sortOrder?: number;
  },
) {
  await requireAdmin();
  await db.update(projects).set(data).where(eq(projects.id, id));
  invalidateTag("projects");
  return { success: true };
}

export async function deleteProject(id: number) {
  await requireAdmin();
  await db.delete(projects).where(eq(projects.id, id));
  invalidateTag("projects");
  return { success: true };
}

// ─── Skills ───

export async function createSkill(data: {
  name: string;
  icon?: string;
  description?: string;
  category?:
    | "language"
    | "framework"
    | "tool"
    | "database"
    | "design"
    | "other";
  proficiency?: number;
  sortOrder?: number;
}) {
  await requireAdmin();
  await db.insert(skills).values(data);
  invalidateTag("skills");
  return { success: true };
}

export async function updateSkill(
  id: number,
  data: {
    name?: string;
    icon?: string;
    description?: string;
    category?:
      | "language"
      | "framework"
      | "tool"
      | "database"
      | "design"
      | "other";
    proficiency?: number;
    sortOrder?: number;
    isVisible?: boolean;
  },
) {
  await requireAdmin();
  await db.update(skills).set(data).where(eq(skills.id, id));
  invalidateTag("skills");
  return { success: true };
}

export async function deleteSkill(id: number) {
  await requireAdmin();
  await db.delete(skills).where(eq(skills.id, id));
  invalidateTag("skills");
  return { success: true };
}

// ─── Experience ───

export async function createExperience(data: {
  type: "work" | "education";
  company: string;
  role: string;
  description?: string;
  location?: string;
  companyUrl?: string;
  companyLogoUrl?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent?: boolean;
  sortOrder?: number;
}) {
  await requireAdmin();
  await db.insert(experiences).values(data);
  invalidateTag("experiences");
  return { success: true };
}

export async function updateExperience(
  id: number,
  data: {
    type?: "work" | "education";
    company?: string;
    role?: string;
    description?: string;
    location?: string;
    companyUrl?: string;
    companyLogoUrl?: string;
    startDate?: Date;
    endDate?: Date | null;
    isCurrent?: boolean;
    sortOrder?: number;
  },
) {
  await requireAdmin();
  await db.update(experiences).set(data).where(eq(experiences.id, id));
  invalidateTag("experiences");
  return { success: true };
}

export async function deleteExperience(id: number) {
  await requireAdmin();
  await db.delete(experiences).where(eq(experiences.id, id));
  invalidateTag("experiences");
  return { success: true };
}

// ─── Guestbook (moderation) ───

export async function deleteGuestbookEntry(id: number) {
  await requireAdmin();
  // Delete child replies first, then the entry itself
  await db.delete(guestbook).where(eq(guestbook.parentId, id));
  await db.delete(guestbook).where(eq(guestbook.id, id));
  invalidateTag("guestbook");
  return { success: true };
}

// ─── Contact Messages ───

export async function markMessageAsRead(id: number) {
  await requireAdmin();
  await db
    .update(contactMessages)
    .set({ isRead: true })
    .where(eq(contactMessages.id, id));
  return { success: true };
}

export async function deleteContactMessage(id: number) {
  await requireAdmin();
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  return { success: true };
}

// ─── User Management ───

export async function updateUserRole(userId: string, role: string) {
  const session = await requireAdmin();
  if (userId === session.user.id) {
    return { success: false, error: "Cannot change your own role." };
  }
  await db.update(user).set({ role }).where(eq(user.id, userId));
  return { success: true };
}

export async function banUser(
  userId: string,
  reason?: string,
  expiresAt?: Date,
) {
  const session = await requireAdmin();
  if (userId === session.user.id) {
    return { success: false, error: "Cannot ban yourself." };
  }
  await db
    .update(user)
    .set({
      banned: true,
      banReason: reason ?? null,
      banExpires: expiresAt ?? null,
    })
    .where(eq(user.id, userId));
  return { success: true };
}

export async function unbanUser(userId: string) {
  await requireAdmin();
  await db
    .update(user)
    .set({ banned: false, banReason: null, banExpires: null })
    .where(eq(user.id, userId));
  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await requireAdmin();
  if (userId === session.user.id) {
    return { success: false, error: "Cannot delete yourself." };
  }
  await db.delete(user).where(eq(user.id, userId));
  return { success: true };
}
