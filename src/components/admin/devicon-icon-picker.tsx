"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Curated list of popular devicon slugs
const deviconSlugs = [
  "aftereffects",
  "amazonwebservices",
  "android",
  "angular",
  "ansible",
  "apache",
  "apple",
  "astro",
  "atom",
  "azure",
  "babel",
  "bash",
  "bitbucket",
  "blender",
  "bootstrap",
  "bun",
  "c",
  "canva",
  "chrome",
  "clojure",
  "cloudflare",
  "cmake",
  "codepen",
  "cplusplus",
  "csharp",
  "css3",
  "d3js",
  "dart",
  "deno",
  "devicon",
  "django",
  "docker",
  "dot-net",
  "drupal",
  "electron",
  "elixir",
  "elm",
  "emacs",
  "eslint",
  "express",
  "fastapi",
  "figma",
  "firebase",
  "flask",
  "flutter",
  "gatsby",
  "gcc",
  "git",
  "github",
  "gitlab",
  "go",
  "godot",
  "google",
  "googlecloud",
  "gradle",
  "graphql",
  "gulp",
  "haskell",
  "heroku",
  "html5",
  "illustrator",
  "insomnia",
  "intellij",
  "java",
  "javascript",
  "jest",
  "jira",
  "jquery",
  "json",
  "julia",
  "jupyter",
  "k3s",
  "kafka",
  "kotlin",
  "kubernetes",
  "laravel",
  "latex",
  "less",
  "linux",
  "lua",
  "markdown",
  "materialui",
  "matlab",
  "maven",
  "mongodb",
  "mongoose",
  "mysql",
  "neo4j",
  "nestjs",
  "netlify",
  "nextjs",
  "nginx",
  "nodejs",
  "npm",
  "nuxtjs",
  "opencv",
  "opengl",
  "opera",
  "oracle",
  "pandas",
  "perl",
  "photoshop",
  "php",
  "playwright",
  "pnpm",
  "postgresql",
  "postman",
  "powershell",
  "premierepro",
  "prisma",
  "pycharm",
  "python",
  "pytorch",
  "r",
  "rails",
  "raspberrypi",
  "react",
  "redis",
  "redux",
  "regex",
  "rollupjs",
  "ruby",
  "rust",
  "safari",
  "sass",
  "scala",
  "selenium",
  "sentry",
  "sketch",
  "slack",
  "socketio",
  "solidjs",
  "spring",
  "sqlite",
  "storybook",
  "supabase",
  "svelte",
  "swift",
  "symfony",
  "tailwindcss",
  "terraform",
  "threejs",
  "typescript",
  "ubuntu",
  "unity",
  "unrealengine",
  "v8",
  "vercel",
  "vim",
  "visualstudio",
  "vitejs",
  "vitest",
  "vscode",
  "vuejs",
  "vuetify",
  "webflow",
  "webpack",
  "windows11",
  "wordpress",
  "xd",
  "yarn",
  "zig",
].sort();

function getDeviconUrl(slug: string) {
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
}

interface DeviconIconPickerProps {
  value: string;
  onChange: (slug: string) => void;
}

export function DeviconIconPicker({ value, onChange }: DeviconIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [errorSlugs, setErrorSlugs] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!search) return deviconSlugs;
    const q = search.toLowerCase();
    return deviconSlugs.filter((slug) => slug.includes(q));
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 font-normal",
            !value && "text-muted-foreground",
          )}
        >
          {value ? (
            <>
              <Image
                src={getDeviconUrl(value)}
                alt={value}
                width={16}
                height={16}
                className="size-4 object-contain"
                onError={() => {}}
              />
              <span>{value}</span>
            </>
          ) : (
            "Pick an icon…"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 pb-2">
          <Input
            placeholder="Search devicons…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
            autoFocus
          />
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-6 gap-1 p-3 pt-0">
            {filtered.map((slug) => (
              <button
                key={slug}
                type="button"
                title={slug}
                className={cn(
                  "hover:bg-accent flex items-center justify-center rounded-md p-2 transition-colors",
                  value === slug && "bg-accent ring-primary ring-2",
                )}
                onClick={() => {
                  onChange(slug);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {errorSlugs.has(slug) ? (
                  <span className="text-muted-foreground text-xs font-bold">
                    {slug.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <Image
                    src={getDeviconUrl(slug)}
                    alt={slug}
                    width={20}
                    height={20}
                    className="size-5 object-contain"
                    onError={() =>
                      setErrorSlugs((prev) => new Set(prev).add(slug))
                    }
                  />
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-muted-foreground col-span-6 py-6 text-center text-sm">
                No icons found.
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
