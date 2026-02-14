import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Zap, MessageSquare, Mail } from "lucide-react";
import { db } from "@/db";
import { projects, skills, guestbook, contactMessages } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminDashboard() {
  const [projectRows, skillRows, guestbookRows, messageRows] =
    await Promise.all([
      db.select().from(projects),
      db.select().from(skills),
      db.select().from(guestbook).where(eq(guestbook.isApproved, false)),
      db
        .select()
        .from(contactMessages)
        .where(eq(contactMessages.isRead, false)),
    ]);

  const stats = [
    {
      label: "Projects",
      value: projectRows.length,
      icon: FolderKanban,
    },
    {
      label: "Skills",
      value: skillRows.length,
      icon: Zap,
    },
    {
      label: "Pending Guestbook",
      value: guestbookRows.length,
      icon: MessageSquare,
    },
    {
      label: "Unread Messages",
      value: messageRows.length,
      icon: Mail,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
