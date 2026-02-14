"use client";

import { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  MessageSquare,
  Trash2,
  Heart,
  ChevronDown,
  ArrowUpDown,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import {
  postGuestbookMessage,
  deleteGuestbookMessage,
  postGuestbookReply,
  toggleGuestbookLike,
  fetchGuestbookReplies,
} from "@/app/(public)/actions";
import type { GuestbookEntryWithCounts, GuestbookReply } from "@/db/queries";

type SortOption = "top" | "replies" | "latest";

interface GuestbookSectionProps {
  entries: GuestbookEntryWithCounts[];
  userLikedIds: number[];
}

const INITIAL_VISIBLE = 5;
const LOAD_MORE_COUNT = 5;

export function GuestbookSection({
  entries: initialEntries,
  userLikedIds: initialLikedIds,
}: GuestbookSectionProps) {
  const { data: session } = useSession();
  const [entries, setEntries] = useState(initialEntries);
  const [likedIds, setLikedIds] = useState<Set<number>>(
    () => new Set(initialLikedIds),
  );
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("top");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  // Sort entries client-side
  const sortedEntries = [...entries].sort((a, b) => {
    switch (sortBy) {
      case "top":
        return b.likeCount - a.likeCount;
      case "replies":
        return b.replyCount - a.replyCount;
      case "latest":
        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );
      default:
        return 0;
    }
  });

  const visibleEntries = sortedEntries.slice(0, visibleCount);
  const hasMore = visibleCount < sortedEntries.length;

  async function handleSubmit() {
    if (!message.trim()) return;
    setIsPending(true);
    try {
      const result = await postGuestbookMessage(message);
      if (result.success) {
        toast.success("Message posted!");
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

  async function handleLike(entryId: number) {
    if (!session) {
      toast.error("Sign in to like messages.");
      return;
    }

    // Optimistic update
    const wasLiked = likedIds.has(entryId);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, likeCount: e.likeCount + (wasLiked ? -1 : 1) }
          : e,
      ),
    );

    try {
      const result = await toggleGuestbookLike(entryId);
      if (!result.success) {
        // Revert optimistic update
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (wasLiked) next.add(entryId);
          else next.delete(entryId);
          return next;
        });
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? { ...e, likeCount: e.likeCount + (wasLiked ? 1 : -1) }
              : e,
          ),
        );
        toast.error("error" in result ? result.error : "Failed to like.");
      }
    } catch {
      // Revert
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(entryId);
        else next.delete(entryId);
        return next;
      });
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? { ...e, likeCount: e.likeCount + (wasLiked ? 1 : -1) }
            : e,
        ),
      );
    }
  }

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "top", label: "Top" },
    { value: "replies", label: "Most Replies" },
    { value: "latest", label: "Latest" },
  ];

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
              <button
                onClick={() => signOut()}
                className="text-muted-foreground hover:text-foreground ml-auto transition-colors"
                title="Sign out"
              >
                <LogOut className="size-4" />
              </button>
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

      <Separator className="mb-6" />

      {/* Sort Options */}
      {entries.length > 0 && (
        <div className="mb-6 flex items-center gap-2">
          <ArrowUpDown className="text-muted-foreground size-4" />
          <span className="text-muted-foreground text-sm">Sort by:</span>
          <div className="flex gap-1.5">
            {sortOptions.map((opt) => (
              <Badge
                key={opt.value}
                variant={sortBy === opt.value ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => {
                  setSortBy(opt.value);
                  setVisibleCount(INITIAL_VISIBLE);
                }}
              >
                {opt.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="max-h-[600px] overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {visibleEntries.length > 0 ? (
            <div className="space-y-6">
              {visibleEntries.map((entry) => (
                <CommentCard
                  key={entry.id}
                  entry={entry}
                  isLiked={likedIds.has(entry.id)}
                  isOwn={session?.user.id === entry.userId}
                  isSignedIn={!!session}
                  onDelete={handleDelete}
                  onLike={handleLike}
                  likedIds={likedIds}
                  onLikeReply={handleLike}
                  session={session}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No messages yet. Be the first to leave one!
            </p>
          )}
        </AnimatePresence>
      </div>

      {/* Show More */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_COUNT)}
          >
            <ChevronDown className="mr-2 size-4" />
            Show More ({sortedEntries.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </section>
  );
}

// ─── Comment Card ───

interface CommentCardProps {
  entry: GuestbookEntryWithCounts;
  isLiked: boolean;
  isOwn: boolean;
  isSignedIn: boolean;
  onDelete: (id: number) => void;
  onLike: (id: number) => void;
  likedIds: Set<number>;
  onLikeReply: (id: number) => void;
  session: ReturnType<typeof useSession>["data"];
}

function CommentCard({
  entry,
  isLiked,
  isOwn,
  isSignedIn,
  onDelete,
  onLike,
  likedIds,
  onLikeReply,
  session,
}: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<GuestbookReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(entry.replyCount);

  const loadReplies = useCallback(async () => {
    if (loadingReplies) return;
    setLoadingReplies(true);
    try {
      const data = await fetchGuestbookReplies(entry.id);
      setReplies(data);
      setShowReplies(true);
    } catch {
      toast.error("Failed to load replies.");
    } finally {
      setLoadingReplies(false);
    }
  }, [entry.id, loadingReplies]);

  async function handleReply() {
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      const result = await postGuestbookReply(entry.id, replyText);
      if (result.success) {
        toast.success("Reply posted!");
        setReplyText("");
        setShowReplyForm(false);
        setReplyCount((prev) => prev + 1);
        // Reload replies if they're visible
        if (showReplies) {
          const data = await fetchGuestbookReplies(entry.id);
          setReplies(data);
        }
      } else {
        toast.error(result.error ?? "Failed to post reply.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsReplying(false);
    }
  }

  async function handleDeleteReply(replyId: number) {
    try {
      const result = await deleteGuestbookMessage(replyId);
      if (result.success) {
        setReplies((prev) => prev.filter((r) => r.id !== replyId));
        setReplyCount((prev) => Math.max(0, prev - 1));
        toast.success("Reply deleted.");
      }
    } catch {
      toast.error("Failed to delete reply.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarImage src={entry.authorAvatarUrl ?? ""} />
          <AvatarFallback>{entry.authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{entry.authorName}</span>
            <span className="text-muted-foreground text-xs">
              {entry.createdAt
                ? new Date(entry.createdAt).toLocaleDateString()
                : ""}
            </span>
            {isOwn && (
              <button
                onClick={() => onDelete(entry.id)}
                className="text-muted-foreground hover:text-destructive ml-auto transition-colors"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">{entry.message}</p>

          {/* Actions: Like + Reply */}
          <div className="mt-2 flex items-center gap-4">
            <button
              onClick={() => onLike(entry.id)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                isLiked
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart
                className="size-3.5"
                fill={isLiked ? "currentColor" : "none"}
              />
              {entry.likeCount > 0 && <span>{entry.likeCount}</span>}
            </button>

            {isSignedIn && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
              >
                <MessageSquare className="size-3.5" />
                Reply
              </button>
            )}

            {replyCount > 0 && (
              <button
                onClick={() => {
                  if (showReplies) {
                    setShowReplies(false);
                  } else {
                    loadReplies();
                  }
                }}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
              >
                <MessageSquare className="size-3.5" />
                {showReplies
                  ? "Hide replies"
                  : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3 space-y-2 pl-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={isReplying || !replyText.trim()}
                >
                  {isReplying ? "Posting..." : "Reply"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {showReplies && (
            <div className="border-border mt-3 space-y-4 border-l-2 pl-4">
              {loadingReplies ? (
                <p className="text-muted-foreground text-xs">
                  Loading replies...
                </p>
              ) : (
                replies.map((reply) => (
                  <ReplyCard
                    key={reply.id}
                    reply={reply}
                    isLiked={likedIds.has(reply.id)}
                    isOwn={session?.user.id === reply.userId}
                    onDelete={handleDeleteReply}
                    onLike={onLikeReply}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Reply Card ───

interface ReplyCardProps {
  reply: GuestbookReply;
  isLiked: boolean;
  isOwn: boolean;
  onDelete: (id: number) => void;
  onLike: (id: number) => void;
}

function ReplyCard({
  reply,
  isLiked,
  isOwn,
  onDelete,
  onLike,
}: ReplyCardProps) {
  return (
    <div className="flex gap-3">
      <Avatar className="size-6 shrink-0">
        <AvatarImage src={reply.authorAvatarUrl ?? ""} />
        <AvatarFallback className="text-xs">
          {reply.authorName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{reply.authorName}</span>
          <span className="text-muted-foreground text-xs">
            {reply.createdAt
              ? new Date(reply.createdAt).toLocaleDateString()
              : ""}
          </span>
          {isOwn && (
            <button
              onClick={() => onDelete(reply.id)}
              className="text-muted-foreground hover:text-destructive ml-auto transition-colors"
            >
              <Trash2 className="size-3" />
            </button>
          )}
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">{reply.message}</p>
        <div className="mt-1">
          <button
            onClick={() => onLike(reply.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              isLiked
                ? "text-red-500"
                : "text-muted-foreground hover:text-red-500"
            }`}
          >
            <Heart
              className="size-3"
              fill={isLiked ? "currentColor" : "none"}
            />
            {reply.likeCount > 0 && <span>{reply.likeCount}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
