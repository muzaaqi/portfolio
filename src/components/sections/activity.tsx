"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  GitCommit,
  GitPullRequest,
  GitFork,
  Star,
  Eye,
  ArrowUpDown,
  ExternalLink,
  Github,
  MessageSquare,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type {
  GitHubEvent,
  GitHubRepo,
  ContributionData,
  LanguageStat,
} from "@/lib/github";

// ─── Props ───

interface ActivitySectionProps {
  events: GitHubEvent[];
  languages: LanguageStat[];
  contributions: ContributionData | null;
  repos: GitHubRepo[];
  githubUsername: string;
}

// ─── Main Section ───

export function ActivitySection({
  events,
  languages,
  contributions,
  repos,
  githubUsername,
}: ActivitySectionProps) {
  if (!githubUsername) {
    return null;
  }

  return (
    <section
      id="activity"
      data-section="activity"
      className="container mx-auto overflow-hidden px-4 py-20 md:pr-20"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="mb-2 flex items-center gap-3">
          <h2 className="text-4xl font-bold">Activity</h2>
        </div>
        <div className="bg-primary mb-12 h-1 w-16" />
      </motion.div>

      <div className="grid min-w-0 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Left column — Contributions + Repos */}
        <div className="min-w-0 space-y-8">
          {contributions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <ContributionGraph data={contributions} />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <RepositoryList repos={repos} />
          </motion.div>
        </div>

        {/* Right column — Languages + Recent Activity */}
        <div className="min-w-0 space-y-8">
          {languages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              viewport={{ once: true }}
            >
              <LanguageChart languages={languages} />
            </motion.div>
          )}

          {events.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              viewport={{ once: true }}
            >
              <RecentActivity events={events} />
            </motion.div>
          )}

          {/* View on GitHub link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Button variant="outline" className="w-full" asChild>
              <Link
                href={`https://github.com/${githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 size-4" />
                View Full Profile on GitHub
                <ExternalLink className="ml-2 size-3.5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Contribution Graph ───

function ContributionGraph({ data }: { data: ContributionData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(10);

  const levelColors: Record<string, string> = {
    NONE: "var(--muted)",
    FIRST_QUARTILE: "oklch(0.75 0.10 145)",
    SECOND_QUARTILE: "oklch(0.62 0.14 145)",
    THIRD_QUARTILE: "oklch(0.50 0.16 145)",
    FOURTH_QUARTILE: "oklch(0.40 0.18 145)",
  };

  const weeks = data.weeks;
  const gap = 2;
  const dayLabelWidth = 28;

  // Dynamically size cells to fill available width
  useEffect(() => {
    function calc() {
      if (!containerRef.current) return;
      // 32 = 16px padding each side
      const available = containerRef.current.clientWidth - dayLabelWidth - 32;
      const cols = weeks.length;
      if (cols === 0) return;
      const size = Math.floor((available - gap * (cols - 1)) / cols);
      setCellSize(Math.max(4, Math.min(14, size)));
    }
    calc();
    const ro = new ResizeObserver(calc);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [weeks.length]);

  const colWidth = cellSize + gap;

  // Build month labels positioned at the correct week index
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let prevMonth = "";
  for (let i = 0; i < weeks.length; i++) {
    const firstDay = weeks[i].contributionDays[0];
    if (!firstDay) continue;
    const m = new Date(firstDay.date).toLocaleDateString("en-US", {
      month: "short",
    });
    if (m !== prevMonth) {
      monthLabels.push({ label: m, weekIndex: i });
      prevMonth = m;
    }
  }

  return (
    <div
      ref={containerRef}
      className="border-border bg-card overflow-hidden border shadow-md"
    >
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-bold tracking-wider uppercase">
          Contributions
        </h3>
        <span className="bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold">
          {data.totalContributions.toLocaleString()} this year
        </span>
      </div>

      <div className="overflow-hidden p-4">
        <div
          className="mx-auto"
          style={{
            width:
              dayLabelWidth +
              weeks.length * cellSize +
              (weeks.length - 1) * gap,
          }}
        >
          {/* Month labels aligned to week columns */}
          <div
            className="relative mb-1 overflow-hidden"
            style={{ paddingLeft: dayLabelWidth }}
          >
            <div className="relative h-4">
              {monthLabels.map((m, i) => (
                <span
                  key={i}
                  className="text-muted-foreground absolute text-[10px] leading-none"
                  style={{ left: m.weekIndex * colWidth }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          {/* Grid: day labels + week columns */}
          <div className="flex overflow-hidden" style={{ gap }}>
            {/* Day-of-week labels */}
            <div
              className="flex shrink-0 flex-col"
              style={{ width: dayLabelWidth - gap, gap }}
            >
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <span
                  key={i}
                  className="text-muted-foreground flex items-center text-[9px] leading-none"
                  style={{ height: cellSize }}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap }}>
                {week.contributionDays.map((day, di) => (
                  <Tooltip key={di}>
                    <TooltipTrigger asChild>
                      <div
                        className="border border-black/5 transition-transform hover:scale-125 dark:border-white/5"
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: levelColors[day.contributionLevel],
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <span className="font-bold">
                        {day.contributionCount} contributions
                      </span>{" "}
                      on {formatDate(day.date)}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-end gap-1 text-[10px]">
            <span className="text-muted-foreground mr-1">Less</span>
            {Object.values(levelColors).map((color, i) => (
              <div
                key={i}
                className="size-[10px] border border-black/5 dark:border-white/5"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="text-muted-foreground ml-1">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Language Chart ───

function LanguageChart({ languages }: { languages: LanguageStat[] }) {
  return (
    <div className="border-border bg-card overflow-hidden border shadow-md">
      <div className="border-border border-b px-4 py-3">
        <h3 className="text-sm font-bold tracking-wider uppercase">
          Top Languages
        </h3>
      </div>

      <div className="p-4">
        {/* Stacked bar */}
        <div className="mb-4 flex h-3 overflow-hidden border border-black/10 dark:border-white/10">
          {languages.map((lang) => (
            <Tooltip key={lang.name}>
              <TooltipTrigger asChild>
                <div
                  className="h-full transition-all hover:opacity-80"
                  style={{
                    width: `${lang.percentage}%`,
                    backgroundColor: lang.color,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <span className="font-bold">{lang.name}</span> —{" "}
                {lang.percentage}%
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {languages.map((lang) => (
            <div key={lang.name} className="flex items-center gap-1.5">
              <div
                className="size-2.5 border border-black/10 dark:border-white/10"
                style={{ backgroundColor: lang.color }}
              />
              <span className="text-xs font-medium">{lang.name}</span>
              <span className="text-muted-foreground text-xs">
                {lang.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Recent Activity ───

function RecentActivity({ events }: { events: GitHubEvent[] }) {
  return (
    <div className="border-border bg-card overflow-hidden border shadow-md">
      <div className="border-border border-b px-4 py-3">
        <h3 className="text-sm font-bold tracking-wider uppercase">
          Recent Activity
        </h3>
      </div>

      <div className="divide-border divide-y">
        {events.map((event) => (
          <EventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

function EventItem({ event }: { event: GitHubEvent }) {
  const { icon, description } = parseEvent(event);
  const repoName = event.repo.name.split("/")[1] ?? event.repo.name;
  const timeAgo = getTimeAgo(event.created_at);

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="bg-muted text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center border border-black/5 dark:border-white/5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">
          <span className="text-foreground font-medium">{description}</span>
        </p>
        <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
          <Link
            href={`https://github.com/${event.repo.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary truncate font-mono transition-colors"
          >
            {repoName}
          </Link>
          <span>·</span>
          <span className="shrink-0">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Repository List ───

type SortKey = "stars" | "updated" | "name";

function RepositoryList({ repos }: { repos: GitHubRepo[] }) {
  const [sortBy, setSortBy] = useState<SortKey>("stars");
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(() => {
    const list = [...repos];
    switch (sortBy) {
      case "stars":
        return list.sort((a, b) => b.stargazers_count - a.stargazers_count);
      case "updated":
        return list.sort(
          (a, b) =>
            new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime(),
        );
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [repos, sortBy]);

  const displayed = showAll ? sorted : sorted.slice(0, 6);

  return (
    <div className="border-border bg-card overflow-hidden border shadow-md">
      <div className="border-border flex items-center justify-between gap-2 border-b px-3 py-3 sm:px-4">
        <h3 className="shrink-0 text-sm font-bold tracking-wider uppercase">
          Repositories
        </h3>
        <div className="flex shrink-0 items-center gap-1">
          <ArrowUpDown className="text-muted-foreground mr-1 size-3" />
          {(["stars", "updated", "name"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-1.5 py-0.5 text-[11px] font-medium transition-colors sm:px-2 sm:text-xs ${
                sortBy === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {key === "stars" ? "★" : key === "updated" ? "Recent" : "A-Z"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-px bg-black/5 sm:grid-cols-2 dark:bg-white/5">
        {displayed.map((repo) => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </div>

      {repos.length > 6 && (
        <div className="border-border border-t px-4 py-3 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            {showAll ? "Show less" : `Show all ${repos.length} repositories`}
          </button>
        </div>
      )}
    </div>
  );
}

function RepoCard({ repo }: { repo: GitHubRepo }) {
  return (
    <Link
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-card hover:bg-accent/50 group block p-4 transition-colors"
    >
      <div className="mb-2 flex items-start gap-2 overflow-hidden">
        <span className="text-primary truncate font-mono text-sm font-bold">
          {repo.name}
        </span>
        <ExternalLink className="text-muted-foreground mt-0.5 size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {repo.description && (
        <p className="text-muted-foreground mb-3 line-clamp-2 text-xs leading-relaxed">
          {repo.description}
        </p>
      )}

      <div className="flex items-center gap-3">
        {repo.language && (
          <span className="flex items-center gap-1 text-xs">
            <span
              className="inline-block size-2.5 border border-black/10 dark:border-white/10"
              style={{
                backgroundColor:
                  REPO_LANG_COLORS[repo.language] ?? "var(--muted-foreground)",
              }}
            />
            <span className="text-muted-foreground">{repo.language}</span>
          </span>
        )}
        <span className="text-muted-foreground flex items-center gap-0.5 text-xs">
          <Star className="size-3" />
          {repo.stargazers_count}
        </span>
        <span className="text-muted-foreground flex items-center gap-0.5 text-xs">
          <GitFork className="size-3" />
          {repo.forks_count}
        </span>
      </div>
    </Link>
  );
}

// ─── Helpers ───

function parseEvent(event: GitHubEvent) {
  const payload = event.payload as Record<string, unknown>;

  switch (event.type) {
    case "PushEvent":
      return {
        icon: <GitCommit className="size-3.5" />,
        description: `Pushed ${
          (payload.size as number) ??
          (payload.distinct_size as number) ??
          (payload.commits as unknown[])?.length ??
          1
        } commit(s)`,
      };
    case "CreateEvent":
      return {
        icon: <GitFork className="size-3.5" />,
        description: `Created ${payload.ref_type as string}${payload.ref ? ` "${payload.ref}"` : ""}`,
      };
    case "PullRequestEvent":
      return {
        icon: <GitPullRequest className="size-3.5" />,
        description: `${capitalize(payload.action as string)} pull request`,
      };
    case "IssuesEvent":
      return {
        icon: <Eye className="size-3.5" />,
        description: `${capitalize(payload.action as string)} issue`,
      };
    case "WatchEvent":
      return {
        icon: <Star className="size-3.5" />,
        description: "Starred a repository",
      };
    case "ForkEvent":
      return {
        icon: <GitFork className="size-3.5" />,
        description: "Forked a repository",
      };
    case "IssueCommentEvent":
      return {
        icon: <MessageSquare className="size-3.5" />,
        description: "Commented on an issue",
      };
    default:
      return {
        icon: <Github className="size-3.5" />,
        description: event.type.replace("Event", ""),
      };
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTimeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Repo language colors (subset, matched to oklch theme)
const REPO_LANG_COLORS: Record<string, string> = {
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
  Vue: "oklch(0.68 0.18 155)",
  Svelte: "oklch(0.60 0.18 20)",
};
