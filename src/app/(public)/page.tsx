import {
  getProfile,
  getSocialLinks,
  getProjects,
  getSkills,
  getExperiences,
  getApprovedGuestbook,
  getUserGuestbookLikes,
} from "@/db/queries";
import {
  HeroSection,
  AboutSection,
  SkillsSection,
  ProjectsSection,
  ContactSection,
  GuestbookSection,
} from "@/components/sections";
import { SectionObserver } from "@/components/section-observer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    profile,
    socialLinks,
    projects,
    skills,
    experiences,
    guestbookEntries,
  ] = await Promise.all([
    getProfile(),
    getSocialLinks(),
    getProjects(),
    getSkills(),
    getExperiences(),
    getApprovedGuestbook(),
  ]);

  // Get current user's likes if authenticated
  let userLikedIds: number[] = [];
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.id) {
      const likedSet = await getUserGuestbookLikes(session.user.id);
      userLikedIds = Array.from(likedSet);
    }
  } catch {
    // Not authenticated — no likes to show
  }

  return (
    <>
      <SectionObserver />
      <HeroSection profile={profile} socialLinks={socialLinks} />
      <AboutSection profile={profile} experiences={experiences} />
      <SkillsSection skills={skills} />
      <ProjectsSection projects={projects} />
      <ContactSection profile={profile} />
      <GuestbookSection
        entries={guestbookEntries}
        userLikedIds={userLikedIds}
      />
    </>
  );
}
