import { pgTable, serial, varchar, text, boolean, timestamp, integer, index, unique, json, foreignKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const experienceType = pgEnum("experience_type", ['work', 'education'])
export const projectStatus = pgEnum("project_status", ['completed', 'in_progress', 'archived'])
export const skillCategory = pgEnum("skill_category", ['language', 'framework', 'tool', 'database', 'design', 'other'])


export const contactMessages = pgTable("contact_messages", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	subject: varchar({ length: 255 }),
	message: text().notNull(),
	isRead: boolean("is_read").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const experiences = pgTable("experiences", {
	id: serial().primaryKey().notNull(),
	type: experienceType().notNull(),
	company: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 255 }).notNull(),
	description: text(),
	location: varchar({ length: 255 }),
	companyUrl: text("company_url"),
	companyLogoUrl: text("company_logo_url"),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	isCurrent: boolean("is_current").default(false),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const guestbook = pgTable("guestbook", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	authorName: varchar("author_name", { length: 255 }).notNull(),
	authorEmail: varchar("author_email", { length: 255 }),
	authorAvatarUrl: text("author_avatar_url"),
	message: text().notNull(),
	isApproved: boolean("is_approved").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const profile = pgTable("profile", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	bio: text(),
	shortBio: text("short_bio"),
	profileImageUrl: text("profile_image_url"),
	resumeUrl: text("resume_url"),
	email: varchar({ length: 255 }),
	location: varchar({ length: 255 }),
	availableForHire: boolean("available_for_hire").default(false),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const projects = pgTable("projects", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	longDescription: text("long_description"),
	imageUrl: text("image_url"),
	liveUrl: text("live_url"),
	repoUrl: text("repo_url"),
	tags: json().default([]),
	isFeatured: boolean("is_featured").default(false),
	status: projectStatus().default('completed'),
	sortOrder: integer("sort_order").default(0),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("projects_featured_idx").using("btree", table.isFeatured.asc().nullsLast().op("bool_ops")),
	index("projects_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("projects_slug_unique").on(table.slug),
]);

export const skills = pgTable("skills", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	icon: varchar({ length: 100 }),
	category: skillCategory().default('other'),
	proficiency: integer().default(50),
	sortOrder: integer("sort_order").default(0),
	isVisible: boolean("is_visible").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const socialLinks = pgTable("social_links", {
	id: serial().primaryKey().notNull(),
	platform: varchar({ length: 50 }).notNull(),
	url: text().notNull(),
	icon: varchar({ length: 50 }),
	sortOrder: integer("sort_order").default(0),
	isVisible: boolean("is_visible").default(true),
});

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
	impersonatedBy: text("impersonated_by"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	role: text(),
	banned: boolean(),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires", { mode: 'string' }),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);
