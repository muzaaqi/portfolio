"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
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
  DialogClose,
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
import {
  createSkill,
  updateSkill,
  deleteSkill,
  reorderItems,
} from "../actions";
import { DeviconIconPicker } from "@/components/admin/devicon-icon-picker";
import type { Skill } from "@/db/schema";
import { useRouter } from "next/navigation";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  const [skills, setSkills] = useState(
    [...initialSkills].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
  );
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  function handleEdit(skill: Skill) {
    setEditing(skill);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      // Find which category these belong to
      const activeSkill = skills.find((s) => s.id === active.id);
      const overSkill = skills.find((s) => s.id === over.id);
      if (!activeSkill || !overSkill) return;
      if (activeSkill.category !== overSkill.category) return; // no cross-category drag

      const category = activeSkill.category;
      const categoryItems = skills
        .filter((s) => s.category === category)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

      const oldIndex = categoryItems.findIndex((s) => s.id === active.id);
      const newIndex = categoryItems.findIndex((s) => s.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(categoryItems, oldIndex, newIndex);

      // Build full skills list with updated order
      const otherSkills = skills.filter((s) => s.category !== category);
      const updatedReordered = reordered.map((s, i) => ({
        ...s,
        sortOrder: i,
      }));
      setSkills([...otherSkills, ...updatedReordered]);

      // Persist
      const updates = updatedReordered.map((s, i) => ({
        id: s.id,
        sortOrder: i,
      }));
      try {
        await reorderItems("skills", updates);
      } catch {
        toast.error("Failed to save order.");
      }
    },
    [skills],
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-8">
            {grouped.map((group) => (
              <div key={group.category}>
                <h2 className="text-foreground/80 mb-4 text-lg font-semibold">
                  {group.label}
                </h2>
                <SortableContext
                  items={group.items.map((s) => s.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                    {group.items.map((skill) => (
                      <SortableSkillCard
                        key={skill.id}
                        skill={skill}
                        onEdit={() => handleEdit(skill)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
        </DndContext>
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

function SortableSkillCard({
  skill,
  onEdit,
}: {
  skill: Skill;
  onEdit: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <SkillCard skill={skill} onEdit={onEdit} dragListeners={listeners} />
    </div>
  );
}

function SkillCard({
  skill,
  onEdit,
  dragListeners,
}: {
  skill: Skill;
  onEdit: () => void;
  dragListeners?: Record<string, unknown>;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card relative flex flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Drag handle */}
      <button
        className="absolute top-2 left-2 z-10 flex size-7 cursor-grab touch-none items-center justify-center rounded-md opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        {...dragListeners}
      >
        <GripVertical className="text-muted-foreground size-3.5" />
      </button>

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
    </div>
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
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : skill ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}
