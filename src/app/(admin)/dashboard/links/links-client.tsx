"use client";

import { useState, useCallback } from "react";
import { Reorder, useDragControls } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Plus,
  Trash2,
  Pencil,
  GripVertical,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { icons as allLucideIcons } from "lucide-react";
import { toast } from "sonner";
import {
  createLink,
  updateLink,
  deleteLink,
  reorderItems,
} from "../actions";
import { LucideIconPicker } from "@/components/admin/lucide-icon-picker";
import type { Link } from "@/db/schema";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";

// Convert kebab-case slug to PascalCase for lookup
function toPascal(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

function LucideIconPreview({ name }: { name: string | null }) {
  if (!name) return null;
  const IconComp = allLucideIcons[
    toPascal(name) as keyof typeof allLucideIcons
  ] as LucideIcon | undefined;
  if (IconComp) return <IconComp className="text-muted-foreground size-4" />;
  return null;
}

interface LinksClientProps {
  links: Link[];
}

export function LinksClient({ links: initialLinks }: LinksClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Link | null>(null);
  const [links, setLinks] = useState(
    [...initialLinks].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
  );
  const router = useRouter();

  function handleEdit(link: Link) {
    setEditing(link);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  const handleReorder = useCallback(async (newItems: Link[]) => {
    setLinks(newItems);
    const updates = newItems.map((item, index) => ({
      id: item.id,
      sortOrder: index,
    }));
    try {
      await reorderItems("links", updates);
    } catch {
      toast.error("Failed to save order.");
    }
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Linktree Links</h1>
        <Button onClick={handleNew}>
          <Plus className="mr-2 size-4" />
          Add Link
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Title</TableHead>
            <TableHead>URL</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <Reorder.Group
          as="tbody"
          axis="y"
          values={links}
          onReorder={handleReorder}
        >
          {links.map((link) => (
            <LinkRow
              key={link.id}
              link={link}
              onEdit={() => handleEdit(link)}
              onDelete={async () => {
                await deleteLink(link.id);
                toast.success("Deleted.");
                router.refresh();
              }}
            />
          ))}
          {links.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-muted-foreground text-center"
              >
                No links yet.
              </TableCell>
            </TableRow>
          )}
        </Reorder.Group>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Link" : "New Link"}
            </DialogTitle>
          </DialogHeader>
          <LinkForm
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

function LinkRow({
  link,
  onEdit,
  onDelete,
}: {
  link: Link;
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
      <TableCell>
        <div className="flex items-center gap-2">
          <LucideIconPreview name={link.icon} />
          <span className="font-medium">{link.title}</span>
        </div>
        {link.showBanner && (
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> 
            <span className="text-xs text-muted-foreground">Banner Active</span>
            <BannerPreview url={link.url} />
          </div>
        )}
      </TableCell>
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
                  variant="destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete link?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Remove {link.title} link permanently.
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
      </TableCell>
    </Reorder.Item>
  );
}

function BannerPreview({ url }: { url: string }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    import("../actions").then((m) => {
      m.fetchOgImage(url).then((res) => {
        if (res) setImgUrl(res);
      });
    });
  }, [url]);

  if (!imgUrl) return null;

  return (
    <div className="h-8 w-16 relative rounded overflow-hidden border border-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgUrl} alt="Banner Preview" className="object-cover w-full h-full" />
    </div>
  );
}

function LinkForm({
  link,
  onSuccess,
}: {
  link: Link | null;
  onSuccess: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [form, setForm] = useState({
    title: link?.title ?? "",
    url: link?.url ?? "",
    icon: link?.icon ?? "",
    showBanner: link?.showBanner ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    try {
      if (link) {
        await updateLink(link.id, form);
        toast.success("Updated!");
      } else {
        await createLink(form);
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
        <Label>Title</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="My Latest Blog Post"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>URL</Label>
        <Input
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          placeholder="https://example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Icon (Optional)</Label>
        <LucideIconPicker
          value={form.icon}
          onChange={(slug) => setForm((f) => ({ ...f, icon: slug }))}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Show Banner</Label>
          <p className="text-sm text-muted-foreground">
            Automatically fetch and display the Open Graph image for this link as a banner.
          </p>
        </div>
        <Switch
          checked={form.showBanner}
          onCheckedChange={(checked) => setForm((f) => ({ ...f, showBanner: checked }))}
        />
      </div>
      <div className="flex gap-3">
        <DialogClose asChild>
          <Button type="button" variant="outline" className="flex-1">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending && <Spinner className="mr-2 size-4" />}
          {isPending ? "Saving..." : link ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
