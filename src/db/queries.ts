import { unstable_cache } from "next/cache";
import { db } from ".";
import { eq, asc, desc, isNull, sql } from "drizzle-orm";
import {
  profile,
  socialLinks,
  projects,
  skills,
  experiences,
  guestbook,
  guestbookLikes,
  contactMessages,
  user,
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

// Subqueries for like count and reply count
const likeCountSq = db
  .select({
    entryId: guestbookLikes.entryId,
    count: sql<number>`count(*)`.as("like_count"),
  })
  .from(guestbookLikes)
  .groupBy(guestbookLikes.entryId)
  .as("like_counts");

const replyCountSq = db
  .select({
    parentId: guestbook.parentId,
    count: sql<number>`count(*)`.as("reply_count"),
  })
  .from(guestbook)
  .where(sql`${guestbook.parentId} is not null`)
  .groupBy(guestbook.parentId)
  .as("reply_counts");

export const getApprovedGuestbook = unstable_cache(
  async () => {
    const rows = await db
      .select({
        id: guestbook.id,
        parentId: guestbook.parentId,
        userId: guestbook.userId,
        authorName: guestbook.authorName,
        authorEmail: guestbook.authorEmail,
        authorAvatarUrl: guestbook.authorAvatarUrl,
        message: guestbook.message,
        isApproved: guestbook.isApproved,
        createdAt: guestbook.createdAt,
        likeCount: sql<number>`coalesce(${likeCountSq.count}, 0)`.mapWith(
          Number,
        ),
        replyCount: sql<number>`coalesce(${replyCountSq.count}, 0)`.mapWith(
          Number,
        ),
      })
      .from(guestbook)
      .leftJoin(likeCountSq, eq(guestbook.id, likeCountSq.entryId))
      .leftJoin(replyCountSq, eq(guestbook.id, replyCountSq.parentId))
      .where(isNull(guestbook.parentId))
      .orderBy(desc(guestbook.createdAt));

    return rows;
  },
  ["guestbook-approved"],
  { revalidate: 60, tags: ["guestbook"] },
);

export type GuestbookEntryWithCounts = Awaited<
  ReturnType<typeof getApprovedGuestbook>
>[number];

export async function getGuestbookReplies(parentId: number) {
  const rows = await db
    .select({
      id: guestbook.id,
      parentId: guestbook.parentId,
      userId: guestbook.userId,
      authorName: guestbook.authorName,
      authorEmail: guestbook.authorEmail,
      authorAvatarUrl: guestbook.authorAvatarUrl,
      message: guestbook.message,
      isApproved: guestbook.isApproved,
      createdAt: guestbook.createdAt,
      likeCount: sql<number>`coalesce(${likeCountSq.count}, 0)`.mapWith(Number),
    })
    .from(guestbook)
    .leftJoin(likeCountSq, eq(guestbook.id, likeCountSq.entryId))
    .where(eq(guestbook.parentId, parentId))
    .orderBy(asc(guestbook.createdAt));

  return rows;
}

export type GuestbookReply = Awaited<
  ReturnType<typeof getGuestbookReplies>
>[number];

export async function getUserGuestbookLikes(userId: string) {
  const rows = await db
    .select({ entryId: guestbookLikes.entryId })
    .from(guestbookLikes)
    .where(eq(guestbookLikes.userId, userId));

  return new Set(rows.map((r) => r.entryId));
}

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

// ─── Dashboard Stats (admin only) ───

export async function getDashboardStats() {
  const [
    projectRows,
    skillRows,
    guestbookRows,
    likeRows,
    messageRows,
    userRows,
  ] = await Promise.all([
    db.select({ id: projects.id }).from(projects),
    db.select({ id: skills.id }).from(skills),
    db.select({ id: guestbook.id }).from(guestbook),
    db.select({ id: guestbookLikes.id }).from(guestbookLikes),
    db
      .select({ id: contactMessages.id })
      .from(contactMessages)
      .where(eq(contactMessages.isRead, false)),
    db.select({ id: user.id }).from(user),
  ]);

  return {
    projects: projectRows.length,
    skills: skillRows.length,
    guestbookEntries: guestbookRows.length,
    totalLikes: likeRows.length,
    unreadMessages: messageRows.length,
    totalUsers: userRows.length,
  };
}

export async function getRecentGuestbookEntries(limit = 5) {
  return db
    .select({
      id: guestbook.id,
      authorName: guestbook.authorName,
      authorAvatarUrl: guestbook.authorAvatarUrl,
      message: guestbook.message,
      parentId: guestbook.parentId,
      createdAt: guestbook.createdAt,
    })
    .from(guestbook)
    .orderBy(desc(guestbook.createdAt))
    .limit(limit);
}

export async function getRecentMessages(limit = 5) {
  return db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(limit);
}
