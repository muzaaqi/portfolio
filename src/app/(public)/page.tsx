import {
  getProfile,
  getSocialLinks,
  getProjects,
  getSkills,
  getExperiences,
  getApprovedGuestbook,
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

export const dynamic = "force-dynamic";

export default async function Home() {
  const [profile, socialLinks, projects, skills, experiences, guestbookEntries] =
    await Promise.all([
      getProfile(),
      getSocialLinks(),
      getProjects(),
      getSkills(),
      getExperiences(),
      getApprovedGuestbook(),
    ]);

  return (
    <>
      <SectionObserver />
      <HeroSection profile={profile} socialLinks={socialLinks} />
      <AboutSection profile={profile} experiences={experiences} />
      <SkillsSection skills={skills} />
      <ProjectsSection projects={projects} />
      <ContactSection profile={profile} />
      <GuestbookSection entries={guestbookEntries} />
    </>
  );
}
