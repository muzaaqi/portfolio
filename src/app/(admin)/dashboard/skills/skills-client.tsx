"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Reorder } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { createSkill, updateSkill, deleteSkill, reorderItems } from "../actions";
import { DeviconIconPicker } from "@/components/admin/devicon-icon-picker";
import type { Skill } from "@/db/schema";
import { useRouter } from "next/navigation";

const categoryLabels: Record<string, string> = {
  language: "Languages",
  framework: "Frameworks",
  database: "Databases",
  tool: "Tools",
  design: "Design",
  other: "Other",
};

const categoryOrder = [
  "language",
  "framework",
  "tool",
  "database",
  "design",
  "other",
];

function getDeviconUrl(slug: string) {
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
}

interface SkillsClientProps {
  skills: Skill[];
}

export function SkillsClient({ skills: initialSkills }: SkillsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [skills, setSkills] = useState(initialSkills);
  const router = useRouter();

  function handleEdit(skill: Skill) {
    setEditing(skill);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  const handleReorder = useCallback(
    async (category: string, newItems: Skill[]) => {
      // Optimistically update local state
      setSkills((prev) => {
        const others = prev.filter((s) => s.category !== category);
        return [...others, ...newItems];
      });

      // Persist new order
      const updates = newItems.map((item, index) => ({
        id: item.id,
        sortOrder: index,
      }));
      try {
        await reorderItems("skills", updates);
      } catch {
        toast.error("Failed to save order.");
      }
    },
    [],
  );

  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      label: categoryLabels[cat] ?? cat,
      items: skills
        .filter((s) => s.category === cat)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Skills</h1>
        <Button onClick={handleNew}>
          <Plus className="mr-2 size-4" />
          Add Skill
        </Button>
      </div>

      {grouped.length > 0 ? (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.category}>
              <h2 className="text-foreground/80 mb-4 text-lg font-semibold">
                {group.label}
              </h2>
              <Reorder.Group
                axis="x"
                values={group.items}
                onReorder={(newItems) =>
                  handleReorder(group.category, newItems)
                }
                className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
              >
                {group.items.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onEdit={() => handleEdit(skill)}
                  />
                ))}
              </Reorder.Group>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center">No skills yet.</p>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Skill" : "New Skill"}</DialogTitle>
          </DialogHeader>
          <SkillForm
            key={editing?.id ?? "new"}
            skill={editing}
            onSuccess={() => {
              setDialogOpen(false);
              router.refresh();
            }}
            onDelete={
              editing
                ? async () => {
                    await deleteSkill(editing.id);
                    toast.success("Deleted.");
                    setDialogOpen(false);
                    router.refresh();
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SkillCard({
  skill,
  onEdit,
}: {
  skill: Skill;
  onEdit: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Reorder.Item
      value={skill}
      className="group bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card relative flex cursor-grab flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:cursor-grabbing"
      whileDrag={{ scale: 1.05, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
    >
      {/* Drag handle indicator */}
      <div className="text-muted-foreground/40 absolute top-1.5 left-1/2 -translate-x-1/2">
        <GripVertical className="size-3" />
      </div>

      {/* Edit button — visible on hover */}
      <button
        onClick={onEdit}
        className="bg-background/80 border-border absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-md border opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
        title="Edit skill"
      >
        <Pencil className="size-3.5" />
      </button>

      <div className="bg-muted/50 group-hover:bg-primary/10 flex size-12 items-center justify-center rounded-lg transition-colors duration-300">
        {skill.icon && !imgError ? (
          <Image
            src={getDeviconUrl(skill.icon)}
            alt={skill.name}
            width={28}
            height={28}
            className="object-contain transition-transform duration-300 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-muted-foreground text-lg font-bold">
            {skill.name.charAt(0)}
          </span>
        )}
      </div>
      <span className="text-sm font-medium">{skill.name}</span>
      {skill.description && (
        <span className="text-muted-foreground line-clamp-2 text-center text-[10px]">
          {skill.description}
        </span>
      )}
    </Reorder.Item>
  );
}

function SkillForm({
  skill,
  onSuccess,
  onDelete,
}: {
  skill: Skill | null;
  onSuccess: () => void;
  onDelete?: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [form, setForm] = useState({
    name: skill?.name ?? "",
    category: skill?.category ?? "language",
    icon: skill?.icon ?? "",
    description: skill?.description ?? "",
  });
  const [iconPreviewError, setIconPreviewError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    try {
      const data = {
        ...form,
        category: form.category as
          | "language"
          | "framework"
          | "database"
          | "tool"
          | "design"
          | "other",
      };
      if (skill) {
        await updateSkill(skill.id, data);
        toast.success("Updated!");
      } else {
        await createSkill(data);
        toast.success("Created!");
      }
      onSuccess();
    } catch {
      toast.error("Failed to save.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Icon preview */}
      <div className="flex justify-center">
        <div className="bg-muted/50 flex size-16 items-center justify-center rounded-xl">
          {form.icon && !iconPreviewError ? (
            <Image
              src={getDeviconUrl(form.icon)}
              alt="icon preview"
              width={36}
              height={36}
              className="object-contain"
              onError={() => setIconPreviewError(true)}
            />
          ) : (
            <span className="text-muted-foreground text-2xl font-bold">
              {form.name.charAt(0) || "?"}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={form.category}
          onValueChange={(v) =>
            setForm((f) => ({
              ...f,
              category: v as
                | "language"
                | "framework"
                | "database"
                | "tool"
                | "design"
                | "other",
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="language">Language</SelectItem>
            <SelectItem value="framework">Framework</SelectItem>
            <SelectItem value="database">Database</SelectItem>
            <SelectItem value="tool">Tool</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Short description shown on hover"
          maxLength={255}
        />
      </div>
      <div className="space-y-2">
        <Label>Icon</Label>
        <DeviconIconPicker
          value={form.icon}
          onChange={(slug) => {
            setForm((f) => ({ ...f, icon: slug }));
            setIconPreviewError(false);
          }}
        />
      </div>

      <DialogFooter className="flex gap-2 sm:justify-between">
        {onDelete ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" size="sm">
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete &quot;{skill?.name}&quot;?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <div />
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : skill ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}
