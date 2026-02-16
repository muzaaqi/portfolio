"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, MoreHorizontal, Search, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { markMessageAsRead, deleteContactMessage } from "../actions";
import type { ContactMessage } from "@/db/schema";
import { useRouter } from "next/navigation";

interface MessagesClientProps {
  messages: ContactMessage[];
}

export function MessagesClient({ messages }: MessagesClientProps) {
  const router = useRouter();
  const [viewing, setViewing] = useState<ContactMessage | null>(null);

  // Search & filter state
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("all");
  const [sortField, setSortField] = useState<
    "name" | "email" | "createdAt" | null
  >(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const displayMessages = useMemo(() => {
    let list = [...messages];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.subject ?? "").toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q),
      );
    }

    if (readFilter === "unread") list = list.filter((m) => !m.isRead);
    else if (readFilter === "read") list = list.filter((m) => m.isRead);

    if (sortField) {
      list.sort((a, b) => {
        let cmp = 0;
        if (sortField === "name") cmp = a.name.localeCompare(b.name);
        else if (sortField === "email") cmp = a.email.localeCompare(b.email);
        else if (sortField === "createdAt")
          cmp =
            new Date(a.createdAt ?? 0).getTime() -
            new Date(b.createdAt ?? 0).getTime();
        return sortDir === "desc" ? -cmp : cmp;
      });
    }

    return list;
  }, [messages, search, readFilter, sortField, sortDir]);

  function toggleSort(field: "name" | "email" | "createdAt") {
    if (sortField === field) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortField(null);
        setSortDir("asc");
      }
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const unread = messages.filter((m) => !m.isRead);

  async function handleView(message: ContactMessage) {
    setViewing(message);
    if (!message.isRead) {
      await markMessageAsRead(message.id);
      router.refresh();
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Messages
          {unread.length > 0 && (
            <Badge variant="destructive" className="ml-3 align-middle">
              {unread.length} new
            </Badge>
          )}
        </h1>
      </div>

      {/* Search & Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search name, email, subject, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={readFilter} onValueChange={setReadFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                className="flex items-center gap-1"
                onClick={() => toggleSort("name")}
              >
                From
                <ArrowUpDown className="text-muted-foreground size-3" />
              </button>
            </TableHead>
            <TableHead>
              <button
                className="flex items-center gap-1"
                onClick={() => toggleSort("email")}
              >
                Email
                <ArrowUpDown className="text-muted-foreground size-3" />
              </button>
            </TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>
              <button
                className="flex items-center gap-1"
                onClick={() => toggleSort("createdAt")}
              >
                Date
                <ArrowUpDown className="text-muted-foreground size-3" />
              </button>
            </TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayMessages.map((msg) => (
            <TableRow
              key={msg.id}
              className={!msg.isRead ? "bg-muted/50 font-medium" : ""}
            >
              <TableCell>
                {msg.name}
                {!msg.isRead && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    New
                  </Badge>
                )}
              </TableCell>
              <TableCell>{msg.email}</TableCell>
              <TableCell className="max-w-xs truncate">
                {msg.subject || msg.message.slice(0, 60) + "..."}
              </TableCell>
              <TableCell className="text-sm">
                {msg.createdAt
                  ? new Date(msg.createdAt).toLocaleDateString()
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
                    <DropdownMenuItem onClick={() => handleView(msg)}>
                      <Eye className="mr-2 size-4" />
                      View
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
                          <AlertDialogTitle>Delete message?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={async () => {
                              await deleteContactMessage(msg.id);
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
          {displayMessages.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground text-center"
              >
                {search || readFilter !== "all"
                  ? "No matching messages."
                  : "No messages yet."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {viewing?.name}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="text-muted-foreground text-sm">
                {viewing.email} •{" "}
                {viewing.createdAt
                  ? new Date(viewing.createdAt).toLocaleString()
                  : "—"}
              </div>
              {viewing.subject && (
                <p className="text-sm font-medium">{viewing.subject}</p>
              )}
              <p className="whitespace-pre-wrap">{viewing.message}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
