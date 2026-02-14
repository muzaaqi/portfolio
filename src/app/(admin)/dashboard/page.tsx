import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban,
  Zap,
  MessageSquare,
  Mail,
  Users,
  Heart,
  ArrowRight,
} from "lucide-react";
import {
  getDashboardStats,
  getRecentGuestbookEntries,
  getRecentMessages,
} from "@/db/queries";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function AdminDashboard() {
  const [session, stats, recentComments, recentMessages] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getDashboardStats(),
    getRecentGuestbookEntries(5),
    getRecentMessages(5),
  ]);

  const statCards = [
    {
      label: "Projects",
      value: stats.projects,
      icon: FolderKanban,
      href: "/admin/projects",
      color: "text-blue-500",
    },
    {
      label: "Skills",
      value: stats.skills,
      icon: Zap,
      href: "/admin/skills",
      color: "text-yellow-500",
    },
    {
      label: "Guestbook Entries",
      value: stats.guestbookEntries,
      icon: MessageSquare,
      href: "/admin/guestbook",
      color: "text-green-500",
    },
    {
      label: "Total Likes",
      value: stats.totalLikes,
      icon: Heart,
      href: "/admin/guestbook",
      color: "text-red-500",
    },
    {
      label: "Unread Messages",
      value: stats.unreadMessages,
      icon: Mail,
      href: "/admin/messages",
      color: "text-purple-500",
    },
    {
      label: "Registered Users",
      value: stats.totalUsers,
      icon: Users,
      href: "/admin",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Admin User Info */}
      {session && (
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={session.user.image ?? ""} />
            <AvatarFallback className="text-lg">
              {session.user.name?.charAt(0) ?? "A"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {session.user.name?.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground text-sm">
              {session.user.email}
              <Badge variant="secondary" className="ml-2 text-xs capitalize">
                {session.user.role ?? "user"}
              </Badge>
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="group hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`size-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stat.value}</div>
                <ArrowRight className="text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Guestbook */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Recent Guestbook
            </CardTitle>
            <Link
              href="/admin/guestbook"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {recentComments.length > 0 ? (
              <div className="space-y-4">
                {recentComments.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <Avatar className="size-7 shrink-0">
                      <AvatarImage src={entry.authorAvatarUrl ?? ""} />
                      <AvatarFallback className="text-xs">
                        {entry.authorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {entry.authorName}
                        </span>
                        {entry.parentId && (
                          <Badge
                            variant="outline"
                            className="text-[10px] leading-tight"
                          >
                            Reply
                          </Badge>
                        )}
                        <span className="text-muted-foreground ml-auto text-xs">
                          {entry.createdAt
                            ? new Date(entry.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        {entry.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No guestbook entries yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Recent Messages
            </CardTitle>
            <Link
              href="/admin/messages"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {recentMessages.length > 0 ? (
              <div className="space-y-4">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${msg.isRead ? "bg-muted" : "bg-blue-500"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{msg.name}</span>
                        {!msg.isRead && (
                          <Badge
                            variant="default"
                            className="text-[10px] leading-tight"
                          >
                            New
                          </Badge>
                        )}
                        <span className="text-muted-foreground ml-auto text-xs">
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        {msg.subject ? `${msg.subject}: ` : ""}
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No messages yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
