"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  Link as LinkIcon,
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Globe,
  ExternalLink,
  Upload,
  ArrowUpDown,
  type LucideIcon,
} from "lucide-react";
import { icons as allLucideIcons } from "lucide-react";
import { toast } from "sonner";
import {
  createLink,
  updateLink,
  deleteLink,
  reorderItems,
  updateProfile,
} from "../actions";
import { LucideIconPicker } from "@/components/admin/lucide-icon-picker";
import type { Link, Profile, SocialLink } from "@/db/schema";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { ImageUpload } from "@/components/admin/image-upload";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";

// Convert kebab-case slug to PascalCase for lookup
function toPascal(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

const getIcon = (iconName: string | null) => {
  if (!iconName) return <LinkIcon className="w-5 h-5" />;

  switch (iconName.toLowerCase()) {
    case "x":
      return <Twitter className="w-5 h-5" />;
    case "website":
      return <Globe className="w-5 h-5" />;
    case "email":
      return <Mail className="w-5 h-5" />;
  }

  const IconComp = allLucideIcons[
    toPascal(iconName) as keyof typeof allLucideIcons
  ] as LucideIcon | undefined;
  
  if (IconComp) return <IconComp className="w-5 h-5" />;
  
  return <LinkIcon className="w-5 h-5" />;
};

interface LinksClientProps {
  links: Link[];
  socialLinks: SocialLink[];
  profile: Profile | null;
}

export function LinksClient({ links: initialLinks, socialLinks, profile }: LinksClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Link | null>(null);
  const [links, setLinks] = useState(
    [...initialLinks].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
  );
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  function handleEdit(link: Link) {
    setEditing(link);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  const [profileForm, setProfileForm] = useState({
    linkName: profile?.linkName ?? "",
    linkBio: profile?.linkBio ?? "",
    linkProfileImageUrl: profile?.linkProfileImageUrl ?? "",
    linkSocialPosition: profile?.linkSocialPosition ?? "bottom",
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveProfile = async (updates: Partial<typeof profileForm>) => {
    if (!profile) return;
    const newForm = { ...profileForm, ...updates };
    setProfileForm(newForm);
    
    try {
      await updateProfile({
        name: profile.name,
        title: profile.title,
        ...newForm,
      });
      router.refresh();
    } catch {
      toast.error("Failed to save profile.");
    }
  };

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (res.ok) {
        const { uploadUrl, publicUrl } = await res.json();
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (uploadRes.ok) {
          await saveProfile({ linkProfileImageUrl: publicUrl });
          toast.success("Profile image updated");
        }
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = links.findIndex((l) => l.id === active.id);
      const newIndex = links.findIndex((l) => l.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(links, oldIndex, newIndex);
      const updatedReordered = reordered.map((l, i) => ({
        ...l,
        sortOrder: i,
      }));
      setLinks(updatedReordered);

      const updates = updatedReordered.map((l) => ({
        id: l.id,
        sortOrder: l.sortOrder!,
      }));
      try {
        await reorderItems("links", updates);
      } catch {
        toast.error("Failed to save order.");
      }
    },
    [links]
  );

  const displayNameFallback = profile?.name || "Anonymous";
  const displayBioFallback = profile?.shortBio || profile?.bio || "Add a bio...";
  const displayImage = profileForm.linkProfileImageUrl || profile?.profileImageUrl;
  const socialPosition = profileForm.linkSocialPosition;

  const socialIconsBlock = socialLinks && socialLinks.length > 0 && (
    <div className={`flex justify-center space-x-4 flex-wrap gap-y-4 relative group ${socialPosition === "top" ? "pt-4 pb-2" : "pt-8 pb-4"}`}>
      <button
        onClick={() => saveProfile({ linkSocialPosition: socialPosition === 'top' ? 'bottom' : 'top' })}
        className="absolute -top-3 right-0 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:bg-primary hover:text-primary-foreground z-10"
      >
        <ArrowUpDown className="size-3" /> {socialPosition === 'top' ? 'Move Down' : 'Move Up'}
      </button>
      {socialLinks.map((social) => (
        <a
          key={social.id}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-secondary/50 hover:bg-primary hover:text-primary-foreground rounded-full transition-all duration-300 hover:scale-110"
          aria-label={social.platform}
          title={social.platform}
        >
          {getIcon(social.icon || social.platform)}
        </a>
      ))}
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Linktree Links</h1>
        <Button onClick={handleNew}>
          <Plus className="mr-2 size-4" />
          Add Link
        </Button>
      </div>

      <div className="mt-8 bg-background border rounded-3xl py-16 px-4 flex flex-col items-center shadow-sm relative overflow-hidden">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center mb-8 flex justify-center items-center gap-2">
            <span className="inline-block bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">Live Preview & Editor</span>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center text-center space-y-4 relative group/profile">
            <div 
              className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 p-1 cursor-pointer group-hover/profile:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="relative w-full h-full rounded-full overflow-hidden">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                    {(profileForm.linkName || displayNameFallback).charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  {isUploading ? <Spinner className="size-5 text-white" /> : <Upload className="size-5 text-white mb-1" />}
                  <span className="text-[10px] text-white font-medium">Change</span>
                </div>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            
            <div className="w-full px-4">
              <input
                type="text"
                value={profileForm.linkName}
                onChange={(e) => setProfileForm({ ...profileForm, linkName: e.target.value })}
                onBlur={() => saveProfile({ linkName: profileForm.linkName })}
                placeholder={displayNameFallback}
                className="text-2xl font-bold tracking-tight text-center bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none focus:ring-0 placeholder:text-foreground/30 w-full transition-colors pb-1"
              />
            </div>
            
            <div className="w-full px-4">
              <textarea
                value={profileForm.linkBio}
                onChange={(e) => setProfileForm({ ...profileForm, linkBio: e.target.value })}
                onBlur={() => saveProfile({ linkBio: profileForm.linkBio })}
                placeholder={displayBioFallback}
                className="text-sm text-foreground/80 text-center bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none focus:ring-0 placeholder:text-foreground/30 w-full resize-none transition-colors overflow-hidden"
                rows={2}
              />
            </div>
          </div>

          {socialPosition === "top" && socialIconsBlock}

          {/* Links Section */}
          <div className="w-full pt-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={links.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {links.map((link) => (
                    <SortableLinkCard
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
                    <div className="text-center p-6 border border-dashed rounded-xl text-muted-foreground text-sm">
                      No links added yet.
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {socialPosition !== "top" && socialIconsBlock}
        </div>
      </div>

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

function SortableLinkCard({
  link,
  onEdit,
  onDelete,
}: {
  link: Link;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group flex flex-col p-4 bg-card hover:bg-accent/50 border border-border rounded-xl transition-all duration-300 overflow-visible"
    >
      <div 
        {...attributes}
        {...listeners}
        className="absolute -left-12 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-2 text-muted-foreground/50 hover:text-foreground transition-colors hidden sm:flex touch-none"
      >
        <GripVertical className="size-5" />
      </div>
      
      {/* Mobile drag handle */}
      <div 
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-foreground transition-colors sm:hidden z-10 touch-none"
      >
        <GripVertical className="size-4" />
      </div>

      <div className="absolute -right-12 top-1/2 -translate-y-1/2 hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground">
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
      </div>

      {/* Mobile actions */}
      <div className="absolute right-2 top-2 sm:hidden z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon-sm" className="h-6 w-6 text-muted-foreground rounded-full opacity-70">
              <MoreHorizontal className="size-3" />
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
      </div>

      {link.showBanner && (
         <BannerPreview link={link} />
      )}
      <div className="flex items-center w-full relative sm:px-0 px-6">
        <div className="flex-shrink-0 mr-4 text-muted-foreground group-hover:text-primary transition-colors">
          {getIcon(link.icon)}
        </div>
        <div className="flex-grow text-center font-medium sm:mr-9">
          {link.title}
        </div>
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
          <ExternalLink className="size-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

function BannerPreview({ link }: { link: Link }) {
  const [imgUrl, setImgUrl] = useState<string | null>(link.customBannerUrl ?? null);

  useEffect(() => {
    if (link.customBannerUrl) {
      setImgUrl(link.customBannerUrl);
      return;
    }
    import("../actions").then((m) => {
      m.fetchOgImage(link.url).then((res) => {
        if (res) setImgUrl(res);
      });
    });
  }, [link.url, link.customBannerUrl]);

  if (!imgUrl) return null;

  return (
    <div className="w-full h-32 mb-4 rounded-md overflow-hidden relative border border-border/50">
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
    customBannerUrl: link?.customBannerUrl ?? "",
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
      {form.showBanner && (
        <div className="space-y-2">
          <Label>Custom Banner (Optional)</Label>
          <p className="text-xs text-muted-foreground mb-2">Upload a custom image to override the auto-fetched Open Graph banner.</p>
          <ImageUpload
            value={form.customBannerUrl}
            onChange={(url) => setForm((f) => ({ ...f, customBannerUrl: url }))}
          />
        </div>
      )}
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


