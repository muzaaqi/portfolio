"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { signIn, useSession } from "@/lib/auth-client";
import {
  postGuestbookMessage,
  deleteGuestbookMessage,
} from "@/app/(public)/actions";
import type { GuestbookEntry } from "@/db/schema";

interface GuestbookSectionProps {
  entries: GuestbookEntry[];
}

export function GuestbookSection({
  entries: initialEntries,
}: GuestbookSectionProps) {
  const { data: session } = useSession();
  const [entries, setEntries] = useState(initialEntries);
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) return;
    setIsPending(true);
    try {
      const result = await postGuestbookMessage(message);
      if (result.success) {
        toast.success("Message posted! It will appear after approval.");
        setMessage("");
      } else {
        toast.error(result.error ?? "Failed to post message.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const result = await deleteGuestbookMessage(id);
      if (result.success) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        toast.success("Message deleted.");
      }
    } catch {
      toast.error("Failed to delete message.");
    }
  }

  return (
    <section
      id="guestbook"
      data-section="guestbook"
      className="container mx-auto px-4 py-20 md:pr-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="mb-2 text-4xl font-bold">Guestbook</h2>
        <div className="bg-primary mb-8 h-1 w-16" />
        <p className="text-muted-foreground mb-8">
          Sign in and leave a message!
        </p>
      </motion.div>

      {/* Comment Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        {session ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={session.user.image ?? ""} />
                <AvatarFallback>
                  {session.user.name?.charAt(0) ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{session.user.name}</span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message..."
              rows={3}
            />
            <Button
              onClick={handleSubmit}
              disabled={isPending || !message.trim()}
            >
              <MessageSquare className="mr-2 size-4" />
              {isPending ? "Posting..." : "Post Message"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Sign in to leave a message
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => signIn.social({ provider: "github" })}
              >
                Sign in with GitHub
              </Button>
              <Button
                variant="outline"
                onClick={() => signIn.social({ provider: "google" })}
              >
                Sign in with Google
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      <Separator className="mb-8" />

      {/* Messages */}
      <AnimatePresence mode="popLayout">
        {entries.length > 0 ? (
          <div className="space-y-6">
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3"
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarImage src={entry.authorAvatarUrl ?? ""} />
                  <AvatarFallback>{entry.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {entry.authorName}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {entry.createdAt
                        ? new Date(entry.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                    {session?.user.id === entry.userId && (
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-muted-foreground hover:text-destructive ml-auto transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {entry.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No messages yet. Be the first to leave one!
          </p>
        )}
      </AnimatePresence>
    </section>
  );
}
