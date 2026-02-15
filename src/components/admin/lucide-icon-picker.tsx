"use client";

import { useState, useMemo } from "react";
import { icons, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Pre-compute sorted icon names list once
const allIconNames = Object.keys(icons).sort();

// Convert PascalCase to kebab-case for storage (e.g. "Github" → "github")
function toKebab(name: string) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

// Convert kebab-case back to PascalCase for lookup
function toPascal(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

interface LucideIconPickerProps {
  value: string;
  onChange: (slug: string) => void;
}

export function LucideIconPicker({ value, onChange }: LucideIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return allIconNames.slice(0, 80);
    const q = search.toLowerCase();
    return allIconNames
      .filter((name) => name.toLowerCase().includes(q) || toKebab(name).includes(q))
      .slice(0, 80);
  }, [search]);

  const SelectedIcon: LucideIcon | undefined = value
    ? icons[toPascal(value) as keyof typeof icons]
    : undefined;

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
          {SelectedIcon ? (
            <>
              <SelectedIcon className="size-4" />
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
            placeholder="Search icons…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
            autoFocus
          />
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-6 gap-1 p-3 pt-0">
            {filtered.map((name) => {
              const Icon = icons[name as keyof typeof icons];
              const slug = toKebab(name);
              return (
                <button
                  key={name}
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
                  <Icon className="size-5" />
                </button>
              );
            })}
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
