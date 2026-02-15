"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Search,
  Shield,
  ShieldOff,
  ShieldCheck,
  UserIcon,
  Ban,
  CircleCheck,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { updateUserRole, banUser, unbanUser, deleteUser } from "../actions";
import type { User } from "@/db/schema";
import { useRouter } from "next/navigation";

interface UsersClientProps {
  users: User[];
}

export function UsersClient({ users }: UsersClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banTarget, setBanTarget] = useState<User | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const admins = filtered.filter((u) => u.role === "admin").length;
  const banned = filtered.filter((u) => u.banned).length;

  function getStatusBadge(u: User) {
    if (u.banned) {
      return (
        <Badge variant="destructive" className="text-xs">
          <Ban className="size-3" />
          Banned
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-green-500/30 text-xs text-green-600"
      >
        <CircleCheck className="size-3" />
        Active
      </Badge>
    );
  }

  async function handleRoleChange(userId: string, newRole: string) {
    const result = await updateUserRole(userId, newRole);
    if (result.success) {
      toast.success(`Role updated to "${newRole}".`);
      router.refresh();
    } else {
      toast.error("error" in result ? result.error : "Failed to update role.");
    }
  }

  async function handleBan() {
    if (!banTarget) return;
    const result = await banUser(banTarget.id, banReason || undefined);
    if (result.success) {
      toast.success(`User "${banTarget.name}" has been banned.`);
      router.refresh();
    } else {
      toast.error("error" in result ? result.error : "Failed to ban user.");
    }
    setBanDialogOpen(false);
    setBanTarget(null);
    setBanReason("");
  }

  async function handleUnban(u: User) {
    const result = await unbanUser(u.id);
    if (result.success) {
      toast.success(`User "${u.name}" has been unbanned.`);
      router.refresh();
    } else {
      toast.error("Failed to unban user.");
    }
  }

  async function handleDelete(u: User) {
    const result = await deleteUser(u.id);
    if (result.success) {
      toast.success(`User "${u.name}" has been deleted.`);
      router.refresh();
    } else {
      toast.error("error" in result ? result.error : "Failed to delete user.");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {users.length} total — {admins} admin{admins !== 1 ? "s" : ""},{" "}
          {banned} banned
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={u.image ?? ""} />
                    <AvatarFallback className="text-xs">
                      {u.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-muted-foreground text-xs">{u.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={u.role ?? "user"}
                  onValueChange={(value) => handleRoleChange(u.id, value)}
                >
                  <SelectTrigger className="h-8 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="size-3" />
                        User
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="size-3 text-purple-500" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(u)}
                  {u.banned && u.banReason && (
                    <span className="text-muted-foreground max-w-[200px] truncate text-[10px]">
                      {u.banReason}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(u.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {u.banned ? (
                      <DropdownMenuItem onClick={() => handleUnban(u)}>
                        <Shield className="mr-2 size-4 text-green-600" />
                        Unban
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => {
                          setBanTarget(u);
                          setBanDialogOpen(true);
                        }}
                      >
                        <ShieldOff className="mr-2 size-4 text-orange-500" />
                        Ban
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete user?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{u.name}&quot;
                            and all their sessions and accounts. This cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(u)}
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
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground py-8 text-center"
              >
                {search ? "No matching users." : "No users registered yet."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban &quot;{banTarget?.name}&quot; from the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Reason (optional)</Label>
            <Textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for banning..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBanDialogOpen(false);
                setBanReason("");
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBan}>
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
