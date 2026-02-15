"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Mail, MapPin, FileDown } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { submitContactMessage } from "@/app/(public)/actions";
import type { Profile } from "@/db/schema";

interface ContactSectionProps {
  profile: Profile | null;
}

export function ContactSection({ profile }: ContactSectionProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      const result = await submitContactMessage(formData);
      if (result.success) {
        toast.success("Message sent successfully!");
        formRef.current?.reset();
      } else {
        toast.error(result.error ?? "Failed to send message.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section
      id="contact"
      data-section="contact"
      className="container mx-auto min-h-svh px-4 py-20 md:pr-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="mb-2 text-4xl font-bold">Contact</h2>
        <div className="bg-primary mb-12 h-1 w-16" />
      </motion.div>

      <div className="grid gap-12 md:grid-cols-2">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <form ref={formRef} action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="What's this about?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Your message..."
                rows={5}
                required
              />
            </div>
            <Button type="submit" disabled={isPending}>
              <Send className="mr-2 size-4" />
              {isPending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div>
            <h3 className="mb-4 text-2xl font-bold">Get in Touch</h3>
            <p className="text-muted-foreground">
              Feel free to reach out for collaborations, opportunities, or just
              a friendly hello!
            </p>
          </div>
          {profile?.email && (
            <div className="flex items-center gap-3">
              <Mail className="text-primary size-5" />
              <span className="text-muted-foreground">{profile.email}</span>
            </div>
          )}
          {profile?.location && (
            <div className="flex items-center gap-3">
              <MapPin className="text-primary size-5" />
              <span className="text-muted-foreground">{profile.location}</span>
            </div>
          )}
          {profile?.resumeUrl && (
            <div className="pt-2">
              <Button variant="outline" asChild className="gap-2">
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileDown className="size-4" />
                  Download CV
                </a>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
