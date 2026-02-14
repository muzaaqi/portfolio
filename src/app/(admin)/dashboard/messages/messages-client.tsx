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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { markMessageAsRead, deleteContactMessage } from "../actions";
import type { ContactMessage } from "@/db/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MessagesClientProps {
  messages: ContactMessage[];
}

export function MessagesClient({ messages }: MessagesClientProps) {
  const router = useRouter();
  const [viewing, setViewing] = useState<ContactMessage | null>(null);

  const unread = messages.filter((m) => !m.isRead);
  const read = messages.filter((m) => m.isRead);

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>From</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((msg) => (
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
                {msg.message.slice(0, 60)}...
              </TableCell>
              <TableCell className="text-sm">
                {msg.createdAt
                  ? new Date(msg.createdAt).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleView(msg)}
                  >
                    <Eye className="size-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <Trash2 className="size-4" />
                      </Button>
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
                </div>
              </TableCell>
            </TableRow>
          ))}
          {messages.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground text-center"
              >
                No messages yet.
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
              <p className="whitespace-pre-wrap">{viewing.message}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
