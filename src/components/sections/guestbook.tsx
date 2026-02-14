"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Github, MessageSquare, Trash2 } from "lucide-react";
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
                <Github className="size-4" />
                Sign in with GitHub
              </Button>
              <Button
                variant="outline"
                onClick={() => signIn.social({ provider: "google" })}
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
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
