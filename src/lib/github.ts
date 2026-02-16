// ─── GitHub API data-fetching utilities ───
// All functions accept a username so nothing is hardcoded.

const GITHUB_API = "https://api.github.com";

function headers(): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-app",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

// ─── Types ───

export interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string; url: string };
  payload: Record<string, unknown>;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  fork: boolean;
  archived: boolean;
  updated_at: string;
  pushed_at: string;
  created_at: string;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel:
    | "NONE"
    | "FIRST_QUARTILE"
    | "SECOND_QUARTILE"
    | "THIRD_QUARTILE"
    | "FOURTH_QUARTILE";
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionData {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface LanguageStat {
  name: string;
  percentage: number;
  color: string;
}

// ─── Recent Activity (REST) ───

export async function getRecentActivity(
  username: string,
  count = 5,
): Promise<GitHubEvent[]> {
  try {
    const res = await fetch(
      `${GITHUB_API}/users/${username}/events/public?per_page=${count}`,
      { headers: headers(), next: { revalidate: 1800 } },
    );
    if (!res.ok) return [];
    return (await res.json()) as GitHubEvent[];
  } catch {
    return [];
  }
}

// ─── Repositories (REST) ───

export async function getRepositories(
  username: string,
  count = 100,
): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      `${GITHUB_API}/users/${username}/repos?per_page=${count}&sort=pushed&type=owner`,
      { headers: headers(), next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const repos = (await res.json()) as GitHubRepo[];
    // Filter out forks and archived, sort by stars descending
    return repos
      .filter((r) => !r.fork && !r.archived)
      .sort((a, b) => b.stargazers_count - a.stargazers_count);
  } catch {
    return [];
  }
}

// ─── Top Languages (aggregated from repos) ───

export async function getTopLanguages(
  username: string,
): Promise<LanguageStat[]> {
  try {
    const repos = await getRepositories(username);
    // Fetch language breakdown for each repo (in parallel, limited)
    const langPromises = repos.slice(0, 20).map(async (repo) => {
      try {
        const res = await fetch(
          `${GITHUB_API}/repos/${repo.full_name}/languages`,
          { headers: headers(), next: { revalidate: 86400 } },
        );
        if (!res.ok) return {} as Record<string, number>;
        return (await res.json()) as Record<string, number>;
      } catch {
        return {} as Record<string, number>;
      }
    });

    const allLangs = await Promise.all(langPromises);

    // Aggregate bytes per language
    const totals: Record<string, number> = {};
    for (const langs of allLangs) {
      for (const [lang, bytes] of Object.entries(langs)) {
        totals[lang] = (totals[lang] ?? 0) + bytes;
      }
    }

    const totalBytes = Object.values(totals).reduce((a, b) => a + b, 0);
    if (totalBytes === 0) return [];

    // Sort by bytes, take top 8
    const sorted = Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);

    return sorted.map(([name, bytes]) => ({
      name,
      percentage: Math.round((bytes / totalBytes) * 1000) / 10,
      color: LANG_COLORS[name] ?? "oklch(0.7 0.03 90)",
    }));
  } catch {
    return [];
  }
}

// ─── Contribution Graph (GraphQL) ───

export async function getContributionGraph(
  username: string,
): Promise<ContributionData | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        ...headers(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const calendar =
      json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) return null;

    return {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks,
    };
  } catch {
    return null;
  }
}

// ─── Language colors (GitHub's official-ish color map) ───

const LANG_COLORS: Record<string, string> = {
  TypeScript: "oklch(0.65 0.18 250)",
  JavaScript: "oklch(0.78 0.18 90)",
  Python: "oklch(0.62 0.15 260)",
  Rust: "oklch(0.55 0.12 30)",
  Go: "oklch(0.68 0.14 200)",
  Java: "oklch(0.58 0.14 25)",
  "C++": "oklch(0.55 0.15 310)",
  C: "oklch(0.50 0.12 260)",
  "C#": "oklch(0.55 0.18 300)",
  Ruby: "oklch(0.55 0.17 15)",
  PHP: "oklch(0.55 0.12 280)",
  Swift: "oklch(0.65 0.18 25)",
  Kotlin: "oklch(0.58 0.18 280)",
  Dart: "oklch(0.60 0.17 210)",
  HTML: "oklch(0.60 0.18 30)",
  CSS: "oklch(0.55 0.15 270)",
  SCSS: "oklch(0.60 0.16 340)",
  Shell: "oklch(0.60 0.10 150)",
  Lua: "oklch(0.55 0.18 260)",
  Vue: "oklch(0.68 0.18 155)",
  Svelte: "oklch(0.60 0.18 20)",
  Astro: "oklch(0.60 0.18 310)",
  MDX: "oklch(0.65 0.15 60)",
  Dockerfile: "oklch(0.55 0.12 230)",
  Nix: "oklch(0.58 0.12 250)",
  Zig: "oklch(0.72 0.18 80)",
  Elixir: "oklch(0.55 0.15 310)",
  Haskell: "oklch(0.55 0.15 280)",
};
