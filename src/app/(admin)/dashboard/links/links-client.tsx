"use client";

import { useState, useCallback, useEffect } from "react";
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

  const displayName = profile?.linkName || profile?.name || "Anonymous";
  const displayBio = profile?.linkBio || profile?.shortBio || profile?.bio || "";
  const displayImage = profile?.linkProfileImageUrl || profile?.profileImageUrl;
  const socialPosition = profile?.linkSocialPosition || "bottom";

  const socialIconsBlock = socialLinks && socialLinks.length > 0 && (
    <div className={`flex justify-center space-x-4 flex-wrap gap-y-4 ${socialPosition === "top" ? "pt-4 pb-2" : "pt-8 pb-4"}`}>
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

      {profile && <LinkPageSettings profile={profile} />}

      <div className="mt-12 bg-background border rounded-3xl py-16 px-4 flex flex-col items-center shadow-sm relative overflow-hidden">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center mb-8">
            <span className="inline-block bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">Live Preview</span>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center text-center space-y-4">
            {displayImage ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 p-1">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={displayImage}
                    alt={displayName}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                {displayName.charAt(0)}
              </div>
            )}
            
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
            </div>
            
            {displayBio && (
              <p className="text-sm text-foreground/80 max-w-xs mx-auto">
                {displayBio}
              </p>
            )}
          </div>

          {socialPosition === "top" && socialIconsBlock}

          {/* Links Section */}
          <div className="w-full pt-4">
            <Reorder.Group
              axis="y"
              values={links}
              onReorder={handleReorder}
              className="space-y-3"
            >
              {links.map((link) => (
                <LinkCard
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
            </Reorder.Group>
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

function LinkCard({
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
      value={link}
      dragListener={false}
      dragControls={controls}
      className="relative group flex flex-col p-4 bg-card hover:bg-accent/50 border border-border rounded-xl transition-all duration-300 overflow-visible"
    >
      <div 
        className="absolute -left-12 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-2 text-muted-foreground/50 hover:text-foreground transition-colors hidden sm:flex"
        onPointerDown={(e) => controls.start(e)}
      >
        <GripVertical className="size-5" />
      </div>
      
      {/* Mobile drag handle */}
      <div 
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-foreground transition-colors sm:hidden z-10"
        onPointerDown={(e) => controls.start(e)}
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
    </Reorder.Item>
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

function LinkPageSettings({ profile }: { profile: Profile }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const [form, setForm] = useState({
    linkName: profile.linkName ?? "",
    linkBio: profile.linkBio ?? "",
    linkProfileImageUrl: profile.linkProfileImageUrl ?? "",
    linkSocialPosition: profile.linkSocialPosition ?? "bottom",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    try {
      await updateProfile({
        name: profile.name,
        title: profile.title,
        ...form,
      });
      toast.success("Link page settings saved!");
      router.refresh();
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mb-8 rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Link Page Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Display Name (Optional)</Label>
            <Input
              value={form.linkName}
              onChange={(e) => setForm({ ...form, linkName: e.target.value })}
              placeholder="Overrides portfolio name"
            />
          </div>
          <div className="space-y-2">
            <Label>Social Icons Position</Label>
            <select
              value={form.linkSocialPosition}
              onChange={(e) => setForm({ ...form, linkSocialPosition: e.target.value })}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Bio (Optional)</Label>
          <Input
            value={form.linkBio}
            onChange={(e) => setForm({ ...form, linkBio: e.target.value })}
            placeholder="Overrides portfolio bio"
          />
        </div>
        <div className="space-y-2">
          <Label>Profile Picture (Optional)</Label>
          <ImageUpload
            value={form.linkProfileImageUrl}
            onChange={(url) => setForm({ ...form, linkProfileImageUrl: url })}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner className="mr-2 size-4" />}
          Save Settings
        </Button>
      </form>
    </div>
  );
}
