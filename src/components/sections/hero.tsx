"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Github, Instagram, Linkedin, Youtube } from "lucide-react";
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
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          "-=0.3",
        )
        .fromTo(
          subtitleRef.current,
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

  return (
    <section
      ref={containerRef}
      id="home"
      data-section="home"
      className="container flex min-h-svh w-full flex-col items-center justify-center px-4 py-20"
    >
      {/* Profile image */}
      <div ref={imageRef} className="relative mb-8">
        <div className="bg-primary/20 absolute inset-0 scale-110 rounded-full blur-2xl" />
        <Image
          src={profile?.profileImageUrl ?? "/profile.webp"}
          alt="profile-picture"
          width={160}
          height={160}
          priority
          className="relative z-10 rounded-full border-2 border-white/10 object-cover"
        />
      </div>

      {/* Name — bold centered typography */}
      <div ref={nameRef} className="mb-4 text-center">
        <h1 className="text-6xl leading-tight font-black tracking-tight md:text-8xl lg:text-9xl">
          {name}
        </h1>
      </div>

      {/* Title */}
      <h2
        ref={subtitleRef}
        className="text-muted-foreground mb-10 text-center font-mono text-lg tracking-widest uppercase md:text-xl"
      >
        {title}
      </h2>

      {/* Social links */}
      <div ref={socialsRef} className="flex gap-6">
        {socialLinks.length > 0
          ? socialLinks.map((link) => (
              <Link
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
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
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
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
