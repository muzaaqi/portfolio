"use client";

import { useState, useMemo } from "react";
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

  const defaults = useMemo(
    () => ({
      name: profile?.name ?? "",
      title: profile?.title ?? "",
      bio: profile?.bio ?? "",
      shortBio: profile?.shortBio ?? "",
      profileImageUrl: profile?.profileImageUrl ?? "",
      resumeUrl: profile?.resumeUrl ?? "",
      email: profile?.email ?? "",
      location: profile?.location ?? "",
      availableForHire: profile?.availableForHire ?? false,
      heroTagline: profile?.heroTagline ?? "",
      heroDescriptor: profile?.heroDescriptor ?? "",
    }),
    [profile],
  );

  const [formData, setFormData] = useState(defaults);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(defaults);

  function handleCancel() {
    setFormData(defaults);
  }

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
        <CardContent>
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            {/* Left column — big profile image + hire toggle */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Profile Image</Label>
                <ImageUpload
                  value={formData.profileImageUrl}
                  onChange={(url) =>
                    setFormData((d) => ({ ...d, profileImageUrl: url }))
                  }
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
            </div>

            {/* Right column — all text fields */}
            <div className="space-y-6">
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="heroTagline">Hero Tagline</Label>
                  <Input
                    id="heroTagline"
                    value={formData.heroTagline}
                    onChange={(e) =>
                      setFormData((d) => ({
                        ...d,
                        heroTagline: e.target.value,
                      }))
                    }
                    placeholder="e.g. PORTFOLIO"
                  />
                  <p className="text-muted-foreground text-xs">
                    Large background text center-left on hero
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroDescriptor">Hero Descriptor</Label>
                  <Input
                    id="heroDescriptor"
                    value={formData.heroDescriptor}
                    onChange={(e) =>
                      setFormData((d) => ({
                        ...d,
                        heroDescriptor: e.target.value,
                      }))
                    }
                    placeholder="e.g. CREATIVE DEVELOPER"
                  />
                  <p className="text-muted-foreground text-xs">
                    Descriptor text bottom-left on hero
                  </p>
                </div>
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

              <div className="flex gap-3">
                {isDirty && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
