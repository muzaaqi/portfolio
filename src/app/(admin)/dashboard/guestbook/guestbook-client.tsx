"use client";

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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { deleteGuestbookEntry } from "../actions";
import type { GuestbookEntry } from "@/db/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface GuestbookClientProps {
  entries: GuestbookEntry[];
}

export function GuestbookClient({ entries }: GuestbookClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = entries.filter(
    (e) =>
      e.authorName.toLowerCase().includes(search.toLowerCase()) ||
      e.message.toLowerCase().includes(search.toLowerCase()),
  );

  const comments = filtered.filter((e) => !e.parentId).length;
  const replies = filtered.filter((e) => !!e.parentId).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Guestbook</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {entries.length} entries — {comments} comments, {replies} replies
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search by author or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Author</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-16">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage src={entry.authorAvatarUrl ?? ""} />
                    <AvatarFallback className="text-xs">
                      {entry.authorName?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {entry.authorName ?? "Anonymous"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="max-w-md truncate text-sm">
                {entry.message}
              </TableCell>
              <TableCell>
                {entry.parentId ? (
                  <Badge variant="outline" className="text-xs">
                    Reply
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Comment
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {entry.createdAt
                  ? new Date(entry.createdAt).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
                          <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {entry.parentId
                              ? "This will delete this reply."
                              : "This will delete this comment and all its replies."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={async () => {
                              await deleteGuestbookEntry(entry.id);
                              toast.success("Deleted.");
                              router.refresh();
                            }}
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
                {search ? "No matching entries." : "No guestbook entries yet."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
