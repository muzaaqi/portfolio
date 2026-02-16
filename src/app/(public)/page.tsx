import {
  getProfile,
  getSocialLinks,
  getProjects,
  getSkills,
  getExperiences,
  getApprovedGuestbook,
  getUserGuestbookLikes,
  getGitHubActivity,
  getGitHubLanguages,
  getGitHubContributions,
  getGitHubRepos,
} from "@/db/queries";
import {
  HeroSection,
  AboutSection,
  SkillsSection,
  ActivitySection,
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

  // Fetch GitHub data if username is configured
  const githubUsername = profile?.githubUsername ?? "";
  const [ghEvents, ghLanguages, ghContributions, ghRepos] = githubUsername
    ? await Promise.all([
        getGitHubActivity(githubUsername),
        getGitHubLanguages(githubUsername),
        getGitHubContributions(githubUsername),
        getGitHubRepos(githubUsername),
      ])
    : [[], [], null, []];

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

  // Build ItemList structured data for projects
  const itemListSchema =
    projects.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Projects",
          numberOfItems: projects.length,
          itemListElement: projects.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "CreativeWork",
              name: project.title,
              description: project.description,
              ...(project.imageUrl && { image: project.imageUrl }),
              ...(project.liveUrl && { url: project.liveUrl }),
              ...(project.repoUrl && {
                codeRepository: project.repoUrl,
              }),
            },
          })),
        }
      : null;

  return (
    <>
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itemListSchema),
          }}
        />
      )}
      <SectionObserver />
      <HeroSection profile={profile} socialLinks={socialLinks} />
      <AboutSection profile={profile} experiences={experiences} />
      <SkillsSection skills={skills} />
      <ActivitySection
        events={ghEvents}
        languages={ghLanguages}
        contributions={ghContributions}
        repos={ghRepos}
        githubUsername={githubUsername}
      />
      <ProjectsSection projects={projects} />
      <ContactSection profile={profile} />
      <GuestbookSection
        entries={guestbookEntries}
        userLikedIds={userLikedIds}
      />
    </>
  );
}
