"use client";

import { useState, useCallback, useMemo } from "react";
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
  DialogClose,
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
  DropdownMenuSeparator,
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
import {
  MoreHorizontal,
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  ArrowUpDown,
} from "lucide-react";
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

  // Search & filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [sortField, setSortField] = useState<
    "title" | "status" | "createdAt" | null
  >(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const hasFilters =
    search !== "" ||
    statusFilter !== "all" ||
    featuredFilter !== "all" ||
    sortField !== null;

  const displayProjects = useMemo(() => {
    let list = [...projects];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

    if (featuredFilter === "featured") {
      list = list.filter((p) => p.isFeatured);
    } else if (featuredFilter === "not-featured") {
      list = list.filter((p) => !p.isFeatured);
    }

    if (sortField) {
      list.sort((a, b) => {
        let cmp = 0;
        if (sortField === "title") cmp = a.title.localeCompare(b.title);
        else if (sortField === "status")
          cmp = (a.status ?? "").localeCompare(b.status ?? "");
        else if (sortField === "createdAt")
          cmp =
            new Date(a.createdAt ?? 0).getTime() -
            new Date(b.createdAt ?? 0).getTime();
        return sortDir === "desc" ? -cmp : cmp;
      });
    }

    return list;
  }, [projects, search, statusFilter, featuredFilter, sortField, sortDir]);

  function toggleSort(field: "title" | "status" | "createdAt") {
    if (sortField === field) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortField(null);
        setSortDir("asc");
      }
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

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

      {/* Search & Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search title or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visibility</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="not-featured">Not Featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {!hasFilters && <TableHead className="w-10" />}
            <TableHead>
              <button
                className="flex items-center gap-1"
                onClick={() => toggleSort("title")}
              >
                Title
                <ArrowUpDown className="text-muted-foreground size-3" />
              </button>
            </TableHead>
            <TableHead>
              <button
                className="flex items-center gap-1"
                onClick={() => toggleSort("status")}
              >
                Status
                <ArrowUpDown className="text-muted-foreground size-3" />
              </button>
            </TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        {hasFilters ? (
          <TableBody>
            {displayProjects.map((project) => (
              <ProjectRowStatic
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
            {displayProjects.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground text-center"
                >
                  No matching projects.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        ) : (
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
        )}
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

/* Shared actions dropdown */
function ProjectActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
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
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* Draggable row (no filters active) */
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
      <TableCell>
        {project.isFeatured ? (
          <Eye className="text-primary size-4" />
        ) : (
          <EyeOff className="text-muted-foreground size-4" />
        )}
      </TableCell>
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
        <ProjectActions onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </Reorder.Item>
  );
}

/* Static row (filters active — no DnD) */
function ProjectRowStatic({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{project.title}</TableCell>
      <TableCell>
        <Badge
          variant={project.status === "completed" ? "default" : "secondary"}
        >
          {project.status}
        </Badge>
      </TableCell>
      <TableCell>
        {project.isFeatured ? (
          <Eye className="text-primary size-4" />
        ) : (
          <EyeOff className="text-muted-foreground size-4" />
        )}
      </TableCell>
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
        <ProjectActions onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
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

      <div className="flex gap-3">
        <DialogClose asChild>
          <Button type="button" variant="outline" className="flex-1">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending
            ? "Saving..."
            : project
              ? "Update Project"
              : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
