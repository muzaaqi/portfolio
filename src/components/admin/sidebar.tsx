"use client";

import {
  LayoutDashboard,
  User,
  FolderKanban,
  Zap,
  Briefcase,
  MessageSquare,
  Mail,
  Link2,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/profile", icon: User, label: "Profile" },
  { href: "/admin/socials", icon: Link2, label: "Social Links" },
  { href: "/admin/projects", icon: FolderKanban, label: "Projects" },
  { href: "/admin/skills", icon: Zap, label: "Skills" },
  { href: "/admin/experience", icon: Briefcase, label: "Experience" },
  { href: "/admin/guestbook", icon: MessageSquare, label: "Guestbook" },
  { href: "/admin/messages", icon: Mail, label: "Messages" },
];

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <h2 className="text-lg font-bold">Admin Panel</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href)
                    }
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={user.image ?? ""} />
            <AvatarFallback>{user.name?.charAt(0) ?? "A"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              {user.email}
            </p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
