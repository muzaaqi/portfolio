"use client";

import { useState, useCallback } from "react";
import { Reorder, useDragControls } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  createProject,
  updateProject,
  deleteProject,
  reorderItems,
} from "../actions";
import { ImageUpload } from "@/components/admin/image-upload";
import type { Project } from "@/db/schema";
import { useRouter } from "next/navigation";

interface ProjectsClientProps {
  projects: Project[];
}

export function ProjectsClient({
  projects: initialProjects,
}: ProjectsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState(
    [...initialProjects].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    ),
  );
  const router = useRouter();

  function handleEdit(project: Project) {
    setEditingProject(project);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditingProject(null);
    setDialogOpen(true);
  }

  const handleReorder = useCallback(async (newItems: Project[]) => {
    setProjects(newItems);
    const updates = newItems.map((item, index) => ({
      id: item.id,
      sortOrder: index,
    }));
    try {
      await reorderItems("projects", updates);
    } catch {
      toast.error("Failed to save order.");
    }
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={handleNew}>
          <Plus className="mr-2 size-4" />
          New Project
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <Reorder.Group
          as="tbody"
          axis="y"
          values={projects}
          onReorder={handleReorder}
        >
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onEdit={() => handleEdit(project)}
              onDelete={async () => {
                await deleteProject(project.id);
                toast.success("Project deleted.");
                router.refresh();
              }}
            />
          ))}
          {projects.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-muted-foreground text-center"
              >
                No projects yet.
              </TableCell>
            </TableRow>
          )}
        </Reorder.Group>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "New Project"}
            </DialogTitle>
          </DialogHeader>
          <ProjectForm
            project={editingProject}
            onSuccess={() => {
              setDialogOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectRow({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      as="tr"
      value={project}
      dragListener={false}
      dragControls={controls}
      className="border-border/50 border-b"
    >
      <TableCell className="w-10">
        <button
          className="cursor-grab touch-none active:cursor-grabbing"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripVertical className="text-muted-foreground size-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{project.title}</TableCell>
      <TableCell>
        <Badge
          variant={project.status === "completed" ? "default" : "secondary"}
        >
          {project.status}
        </Badge>
      </TableCell>
      <TableCell>{project.isFeatured ? "Yes" : "No"}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {(project.tags ?? []).slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete project?</AlertDialogTitle>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </Reorder.Item>
  );
}

function ProjectForm({
  project,
  onSuccess,
}: {
  project: Project | null;
  onSuccess: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [form, setForm] = useState({
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    description: project?.description ?? "",
    longDescription: project?.longDescription ?? "",
    imageUrl: project?.imageUrl ?? "",
    liveUrl: project?.liveUrl ?? "",
    repoUrl: project?.repoUrl ?? "",
    tags: (project?.tags ?? []).join(", "),
    isFeatured: project?.isFeatured ?? false,
    status: project?.status ?? "completed",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);

    const data = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: form.status as "completed" | "in_progress" | "archived",
    };

    try {
      if (project) {
        await updateProject(project.id, data);
        toast.success("Project updated!");
      } else {
        await createProject(data);
        toast.success("Project created!");
      }
      onSuccess();
    } catch {
      toast.error("Failed to save project.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={form.title}
            onChange={(e) => {
              setForm((f) => ({
                ...f,
                title: e.target.value,
                slug: project
                  ? f.slug
                  : e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, ""),
              }));
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Long Description</Label>
        <Textarea
          value={form.longDescription}
          onChange={(e) =>
            setForm((f) => ({ ...f, longDescription: e.target.value }))
          }
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Image</Label>
        <ImageUpload
          value={form.imageUrl}
          onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Live URL</Label>
          <Input
            value={form.liveUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, liveUrl: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Repo URL</Label>
          <Input
            value={form.repoUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, repoUrl: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags (comma separated)</Label>
        <Input
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          placeholder="Next.js, TypeScript, Tailwind"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) =>
              setForm((f) => ({
                ...f,
                status: v as "completed" | "in_progress" | "archived",
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch
            checked={form.isFeatured}
            onCheckedChange={(checked) =>
              setForm((f) => ({ ...f, isFeatured: checked }))
            }
          />
          <Label>Featured</Label>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending
          ? "Saving..."
          : project
            ? "Update Project"
            : "Create Project"}
      </Button>
    </form>
  );
}
