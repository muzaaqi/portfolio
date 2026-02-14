import { db } from "@/db";
import { profile } from "@/db/schema";
import { ProfileForm } from "./profile-form";

export default async function AdminProfilePage() {
  const rows = await db.select().from(profile).limit(1);
  const currentProfile = rows[0] ?? null;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Profile</h1>
      <ProfileForm profile={currentProfile} />
    </div>
  );
}
