import { unstable_cache } from "next/cache";
import { db } from ".";
import { eq, asc, desc } from "drizzle-orm";
import {
  profile,
  socialLinks,
  projects,
  skills,
  experiences,
  guestbook,
  contactMessages,
} from "./schema";

// ─── Profile ───

export const getProfile = unstable_cache(
  async () => {
    const rows = await db.select().from(profile).limit(1);
    return rows[0] ?? null;
  },
  ["profile"],
  { revalidate: 3600, tags: ["profile"] },
);

// ─── Social Links ───

export const getSocialLinks = unstable_cache(
  async () => {
    return db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.isVisible, true))
      .orderBy(asc(socialLinks.sortOrder));
  },
  ["social-links"],
  { revalidate: 3600, tags: ["socials"] },
);

// ─── Projects ───

export const getProjects = unstable_cache(
  async () => {
    return db
      .select()
      .from(projects)
      .where(eq(projects.status, "completed"))
      .orderBy(asc(projects.sortOrder));
  },
  ["projects"],
  { revalidate: 3600, tags: ["projects"] },
);

export const getFeaturedProjects = unstable_cache(
  async () => {
    return db
      .select()
      .from(projects)
      .where(eq(projects.isFeatured, true))
      .orderBy(asc(projects.sortOrder));
  },
  ["featured-projects"],
  { revalidate: 3600, tags: ["projects"] },
);

// ─── Skills ───

export const getSkills = unstable_cache(
  async () => {
    return db
      .select()
      .from(skills)
      .where(eq(skills.isVisible, true))
      .orderBy(asc(skills.sortOrder));
  },
  ["skills"],
  { revalidate: 3600, tags: ["skills"] },
);

// ─── Experience ───

export const getExperiences = unstable_cache(
  async () => {
    return db.select().from(experiences).orderBy(desc(experiences.startDate));
  },
  ["experiences"],
  { revalidate: 3600, tags: ["experiences"] },
);

// ─── Guestbook ───

export const getApprovedGuestbook = unstable_cache(
  async () => {
    return db
      .select()
      .from(guestbook)
      .where(eq(guestbook.isApproved, true))
      .orderBy(desc(guestbook.createdAt));
  },
  ["guestbook-approved"],
  { revalidate: 60, tags: ["guestbook"] },
);

// ─── Contact Messages (admin only, no cache) ───

export async function getContactMessages() {
  return db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));
}

export async function getUnreadMessageCount() {
  const rows = await db
    .select()
    .from(contactMessages)
    .where(eq(contactMessages.isRead, false));
  return rows.length;
}
