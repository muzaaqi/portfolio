"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Instagram, Linkedin, Youtube, Download } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Profile, SocialLink } from "@/db/schema";

gsap.registerPlugin(useGSAP);

interface HeroSectionProps {
  profile: Profile | null;
  socialLinks: SocialLink[];
}

export function HeroSection({ profile, socialLinks }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", clearProps: "all" },
      });

      tl.fromTo(
        imageRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8 },
      )
        .fromTo(
          nameRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.3",
        )
        .fromTo(
          subtitleRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.2",
        )
        .fromTo(
          buttonRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.2",
        )
        .fromTo(
          socialsRef.current?.children
            ? Array.from(socialsRef.current.children)
            : [],
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1 },
          "-=0.2",
        );
    },
    { scope: containerRef },
  );

  const name = profile?.name ?? "Muhammad Zaki As Shidiqi";
  const title = profile?.title ?? "Fullstack Developer";
  const nameParts = name.split(" ");

  return (
    <section
      ref={containerRef}
      id="home"
      data-section="home"
      className="container flex min-h-svh w-full flex-col items-center justify-center space-y-10 py-20"
    >
      <div className="border-border drop-shadow-primary/20 flex flex-col-reverse gap-2 border-b-2 px-5 drop-shadow-lg md:flex-row">
        <div ref={imageRef}>
          <Image
            src={profile?.profileImageUrl ?? "/profile.png"}
            alt="profile-picture"
            width={300}
            height={300}
            priority
          />
        </div>
        <div className="mb-5 space-y-5 md:self-end md:pl-8">
          <div ref={nameRef}>
            <h1 className="text-foreground/80 mb-4 text-5xl font-bold md:text-6xl">
              {nameParts[0]}
            </h1>
            <h1 className="text-foreground/80 mb-4 text-4xl font-bold md:text-5xl">
              <span className="text-foreground underline">{nameParts[1]}</span>{" "}
              {nameParts.slice(2).join(" ")}
            </h1>
            <h2 ref={subtitleRef} className="font-mono text-xl md:text-2xl">
              {title}
            </h2>
          </div>
          <div ref={buttonRef}>
            {profile?.resumeUrl ? (
              <Button asChild>
                <a href={profile.resumeUrl} download>
                  <Download className="mr-2 size-4" />
                  Download CV
                </a>
              </Button>
            ) : (
              <Button>
                <Download className="mr-2 size-4" />
                Download CV
              </Button>
            )}
          </div>
        </div>
      </div>
      <div ref={socialsRef} className="flex space-x-6">
        {socialLinks.length > 0
          ? socialLinks.map((link) => (
              <Link
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                <SocialIcon platform={link.platform} />
              </Link>
            ))
          : defaultSocialLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                {link.icon}
              </Link>
            ))}
      </div>
    </section>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  const icons: Record<string, React.ReactNode> = {
    github: <Github />,
    instagram: <Instagram />,
    linkedin: <Linkedin />,
    youtube: <Youtube />,
  };
  return <>{icons[platform.toLowerCase()] ?? <Github />}</>;
}

const defaultSocialLinks = [
  {
    href: "https://github.com/muzaaqi",
    icon: <Github />,
  },
  {
    href: "https://instagram.com/muzaaqi_",
    icon: <Instagram />,
  },
  {
    href: "https://linkedin.com/in/muzaaqi",
    icon: <Linkedin />,
  },
  {
    href: "https://youtube.com/@muzaaqi_",
    icon: <Youtube />,
  },
];
