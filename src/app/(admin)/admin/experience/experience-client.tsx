"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  createExperience,
  updateExperience,
  deleteExperience,
} from "../actions";
import type { Experience } from "@/db/schema";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExperienceClientProps {
  experiences: Experience[];
}

export function ExperienceClient({ experiences }: ExperienceClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const router = useRouter();

  const work = experiences.filter((e) => e.type === "work");
  const education = experiences.filter((e) => e.type === "education");

  function handleEdit(exp: Experience) {
    setEditing(exp);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function renderTable(items: Experience[]) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Period</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((exp) => (
            <TableRow key={exp.id}>
              <TableCell className="font-medium">{exp.role}</TableCell>
              <TableCell>{exp.company}</TableCell>
              <TableCell className="text-sm">
                {exp.startDate
                  ? new Date(exp.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : ""}{" "}
                —{" "}
                {exp.endDate
                  ? new Date(exp.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "Present"}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleEdit(exp)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            await deleteExperience(exp.id);
                            toast.success("Deleted.");
                            router.refresh();
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-muted-foreground text-center"
              >
                No entries yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Experience</h1>
        <Button onClick={handleNew}>
          <Plus className="mr-2 size-4" />
          Add Entry
        </Button>
      </div>

      <Tabs defaultValue="work">
        <TabsList>
          <TabsTrigger value="work">Work ({work.length})</TabsTrigger>
          <TabsTrigger value="education">
            Education ({education.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="work">{renderTable(work)}</TabsContent>
        <TabsContent value="education">{renderTable(education)}</TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Experience" : "New Experience"}
            </DialogTitle>
          </DialogHeader>
          <ExperienceForm
            experience={editing}
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

function ExperienceForm({
  experience,
  onSuccess,
}: {
  experience: Experience | null;
  onSuccess: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [form, setForm] = useState({
    type: experience?.type ?? "work",
    role: experience?.role ?? "",
    company: experience?.company ?? "",
    location: experience?.location ?? "",
    startDate: experience?.startDate
      ? new Date(experience.startDate).toISOString().slice(0, 10)
      : "",
    endDate: experience?.endDate
      ? new Date(experience.endDate).toISOString().slice(0, 10)
      : "",
    description: experience?.description ?? "",
    isCurrent: experience?.isCurrent ?? false,
    sortOrder: experience?.sortOrder ?? 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    try {
      const data = {
        type: form.type as "work" | "education",
        role: form.role,
        company: form.company,
        location: form.location || undefined,
        description: form.description || undefined,
        startDate: new Date(form.startDate),
        endDate: form.endDate ? new Date(form.endDate) : undefined,
        isCurrent: form.isCurrent,
        sortOrder: Number(form.sortOrder),
      };
      if (experience) {
        await updateExperience(experience.id, data);
        toast.success("Updated!");
      } else {
        await createExperience(data);
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
      <div className="space-y-2">
        <Label>Type</Label>
        <Select
          value={form.type}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, type: v as "work" | "education" }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="education">Education</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Role / Title</Label>
        <Input
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Company / Organization</Label>
        <Input
          value={form.company}
          onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, startDate: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="date"
            value={form.endDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, endDate: e.target.value }))
            }
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
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Input
          type="number"
          value={form.sortOrder}
          onChange={(e) =>
            setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))
          }
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving..." : experience ? "Update" : "Create"}
      </Button>
    </form>
  );
}
