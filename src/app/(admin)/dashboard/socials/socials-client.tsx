"use client";

import { useState, useCallback } from "react";
import { Reorder, useDragControls } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2, Pencil, GripVertical, type LucideIcon } from "lucide-react";
import { icons as allLucideIcons } from "lucide-react";
import { toast } from "sonner";
import {
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  reorderItems,
} from "../actions";
import { LucideIconPicker } from "@/components/admin/lucide-icon-picker";
import type { SocialLink } from "@/db/schema";
import { useRouter } from "next/navigation";

// Convert kebab-case slug to PascalCase for lookup
function toPascal(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

function LucideIconPreview({ name }: { name: string | null }) {
  if (!name) return <span className="text-muted-foreground">—</span>;
  const IconComp = allLucideIcons[toPascal(name) as keyof typeof allLucideIcons] as LucideIcon | undefined;
  if (IconComp) {
    return (
      <div className="flex items-center gap-2">
        <IconComp className="size-4" />
        <span className="text-muted-foreground text-xs">{name}</span>
      </div>
    );
  }
  return <span className="text-muted-foreground text-sm">{name}</span>;
}

interface SocialsClientProps {
  socials: SocialLink[];
}

export function SocialsClient({ socials: initialSocials }: SocialsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [socials, setSocials] = useState(
    [...initialSocials].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
  );
  const router = useRouter();

  function handleEdit(link: SocialLink) {
    setEditing(link);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  const handleReorder = useCallback(async (newItems: SocialLink[]) => {
    setSocials(newItems);
    const updates = newItems.map((item, index) => ({
      id: item.id,
      sortOrder: index,
    }));
    try {
      await reorderItems("socialLinks", updates);
    } catch {
      toast.error("Failed to save order.");
    }
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Social Links</h1>
        <Button onClick={handleNew}>
          <Plus className="mr-2 size-4" />
          Add Link
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Platform</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <Reorder.Group
          as="tbody"
          axis="y"
          values={socials}
          onReorder={handleReorder}
        >
          {socials.map((link) => (
            <SocialRow
              key={link.id}
              link={link}
              onEdit={() => handleEdit(link)}
              onDelete={async () => {
                await deleteSocialLink(link.id);
                toast.success("Deleted.");
                router.refresh();
              }}
            />
          ))}
          {socials.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground text-center"
              >
                No social links yet.
              </TableCell>
            </TableRow>
          )}
        </Reorder.Group>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Social Link" : "New Social Link"}
            </DialogTitle>
          </DialogHeader>
          <SocialForm
            link={editing}
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

function SocialRow({
  link,
  onEdit,
  onDelete,
}: {
  link: SocialLink;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      as="tr"
      value={link}
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
      <TableCell className="font-medium">{link.platform}</TableCell>
      <TableCell className="max-w-xs truncate">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          {link.url}
        </a>
      </TableCell>
      <TableCell>
        <LucideIconPreview name={link.icon} />
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onEdit}>
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
                <AlertDialogTitle>Delete link?</AlertDialogTitle>
                <AlertDialogDescription>
                  Remove {link.platform} link permanently.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </Reorder.Item>
  );
}

function SocialForm({
  link,
  onSuccess,
}: {
  link: SocialLink | null;
  onSuccess: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [form, setForm] = useState({
    platform: link?.platform ?? "",
    url: link?.url ?? "",
    icon: link?.icon ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    try {
      if (link) {
        await updateSocialLink(link.id, form);
        toast.success("Updated!");
      } else {
        await createSocialLink(form);
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
        <Label>Platform</Label>
        <Input
          value={form.platform}
          onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
          placeholder="GitHub"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>URL</Label>
        <Input
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          placeholder="https://github.com/username"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Icon</Label>
        <LucideIconPicker
          value={form.icon}
          onChange={(slug) => setForm((f) => ({ ...f, icon: slug }))}
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving..." : link ? "Update" : "Create"}
      </Button>
    </form>
  );
}
