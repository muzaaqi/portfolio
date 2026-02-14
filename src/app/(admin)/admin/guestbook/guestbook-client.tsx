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
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { approveGuestbookEntry, deleteGuestbookEntry } from "../actions";
import type { GuestbookEntry } from "@/db/schema";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GuestbookClientProps {
  entries: GuestbookEntry[];
}

export function GuestbookClient({ entries }: GuestbookClientProps) {
  const router = useRouter();

  const pending = entries.filter((e) => !e.isApproved);
  const approved = entries.filter((e) => e.isApproved);

  function renderTable(items: GuestbookEntry[], showApprove: boolean) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Author</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">
                {entry.userId ?? "Anonymous"}
              </TableCell>
              <TableCell className="max-w-md">{entry.message}</TableCell>
              <TableCell className="text-sm">
                {entry.createdAt
                  ? new Date(entry.createdAt).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {showApprove && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={async () => {
                        await approveGuestbookEntry(entry.id);
                        toast.success("Approved.");
                        router.refresh();
                      }}
                    >
                      <CheckCircle className="size-4 text-green-600" />
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
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
                </div>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-muted-foreground text-center"
              >
                No entries.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Guestbook Moderation</h1>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pending.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approved.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">{renderTable(pending, true)}</TabsContent>
        <TabsContent value="approved">
          {renderTable(approved, false)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
