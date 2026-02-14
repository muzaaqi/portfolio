"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { updateProfile } from "../actions";
import type { Profile } from "@/db/schema";
import { ImageUpload } from "@/components/admin/image-upload";

interface ProfileFormProps {
  profile: Profile | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name ?? "",
    title: profile?.title ?? "",
    bio: profile?.bio ?? "",
    shortBio: profile?.shortBio ?? "",
    profileImageUrl: profile?.profileImageUrl ?? "",
    resumeUrl: profile?.resumeUrl ?? "",
    email: profile?.email ?? "",
    location: profile?.location ?? "",
    availableForHire: profile?.availableForHire ?? false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success("Profile updated!");
      }
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, title: e.target.value }))
                }
                placeholder="e.g. Fullstack Developer"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortBio">Short Bio (for hero section)</Label>
            <Textarea
              id="shortBio"
              value={formData.shortBio}
              onChange={(e) =>
                setFormData((d) => ({ ...d, shortBio: e.target.value }))
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Full Bio (for about section)</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData((d) => ({ ...d, bio: e.target.value }))
              }
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Profile Image</Label>
            <ImageUpload
              value={formData.profileImageUrl}
              onChange={(url) =>
                setFormData((d) => ({ ...d, profileImageUrl: url }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, location: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resumeUrl">Resume URL</Label>
            <Input
              id="resumeUrl"
              value={formData.resumeUrl}
              onChange={(e) =>
                setFormData((d) => ({ ...d, resumeUrl: e.target.value }))
              }
              placeholder="URL or upload PDF"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={formData.availableForHire}
              onCheckedChange={(checked) =>
                setFormData((d) => ({ ...d, availableForHire: checked }))
              }
            />
            <Label>Available for hire</Label>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
