import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  serial,
  pgEnum,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Enums ───

export const experienceTypeEnum = pgEnum("experience_type", [
  "work",
  "education",
]);

export const skillCategoryEnum = pgEnum("skill_category", [
  "language",
  "framework",
  "tool",
  "database",
  "design",
  "other",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "completed",
  "in_progress",
  "archived",
]);

// ─── Better Auth tables ───

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Profile (singleton — one row) ───

export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  bio: text("bio"),
  shortBio: text("short_bio"),
  profileImageUrl: text("profile_image_url"),
  resumeUrl: text("resume_url"),
  email: varchar("email", { length: 255 }),
  location: varchar("location", { length: 255 }),
  availableForHire: boolean("available_for_hire").default(false),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ─── Social Links ───

export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  platform: varchar("platform", { length: 50 }).notNull(),
  url: text("url").notNull(),
  icon: varchar("icon", { length: 50 }),
  sortOrder: integer("sort_order").default(0),
  isVisible: boolean("is_visible").default(true),
});

// ─── Projects ───

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    longDescription: text("long_description"),
    imageUrl: text("image_url"),
    liveUrl: text("live_url"),
    repoUrl: text("repo_url"),
    tags: json("tags").$type<string[]>().default([]),
    isFeatured: boolean("is_featured").default(false),
    status: projectStatusEnum("status").default("completed"),
    sortOrder: integer("sort_order").default(0),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("projects_slug_idx").on(table.slug),
    index("projects_featured_idx").on(table.isFeatured),
  ],
);

// ─── Skills ───

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 100 }),
  category: skillCategoryEnum("category").default("other"),
  proficiency: integer("proficiency").default(50),
  sortOrder: integer("sort_order").default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Experience ───

export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  type: experienceTypeEnum("type").notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  companyUrl: text("company_url"),
  companyLogoUrl: text("company_logo_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isCurrent: boolean("is_current").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ─── Guestbook ───

export const guestbook = pgTable(
  "guestbook",
  {
    id: serial("id").primaryKey(),
    parentId: integer("parent_id"),
    userId: text("user_id").notNull(),
    authorName: varchar("author_name", { length: 255 }).notNull(),
    authorEmail: varchar("author_email", { length: 255 }),
    authorAvatarUrl: text("author_avatar_url"),
    message: text("message").notNull(),
    isApproved: boolean("is_approved").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("guestbook_parent_id_idx").on(table.parentId)],
);

// ─── Guestbook Likes ───

export const guestbookLikes = pgTable(
  "guestbook_likes",
  {
    id: serial("id").primaryKey(),
    entryId: integer("entry_id")
      .notNull()
      .references(() => guestbook.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("guestbook_likes_entry_user_idx").on(
      table.entryId,
      table.userId,
    ),
  ],
);

// ─── Contact Messages ───

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Type exports ───

export type Profile = typeof profile.$inferSelect;
export type NewProfile = typeof profile.$inferInsert;

export type SocialLink = typeof socialLinks.$inferSelect;
export type NewSocialLink = typeof socialLinks.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;

export type Experience = typeof experiences.$inferSelect;
export type NewExperience = typeof experiences.$inferInsert;

export type GuestbookEntry = typeof guestbook.$inferSelect;
export type NewGuestbookEntry = typeof guestbook.$inferInsert;

export type GuestbookLike = typeof guestbookLikes.$inferSelect;
export type NewGuestbookLike = typeof guestbookLikes.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;

export type User = typeof user.$inferSelect;
