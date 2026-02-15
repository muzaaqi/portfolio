"use client";

import { useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Github, Instagram, Linkedin, Youtube, Briefcase } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { Button } from "@/components/ui/button";
import type { Profile, SocialLink } from "@/db/schema";

gsap.registerPlugin(useGSAP);

interface HeroSectionProps {
  profile: Profile | null;
  socialLinks: SocialLink[];
}

export function HeroSection({ profile, socialLinks }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const lenisRef = useRef<InstanceType<typeof import("lenis").default> | null>(
    null,
  );

  useLenis((lenis) => {
    lenisRef.current = lenis;
  });

  const scrollToContact = useCallback(() => {
    lenisRef.current?.scrollTo("#contact", { lerp: 0.1, duration: 1.2 });
  }, []);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-text",
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
      )
        .fromTo(
          ".hero-image",
          { scale: 0.85, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1 },
          "-=0.6",
        )
        .fromTo(
          ".hero-bottom",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.06 },
          "-=0.3",
        );
    },
    { scope: containerRef },
  );

  // ── Customizable content (DB → fallback) ──
  const name = profile?.name ?? "Muhammad Zaki As Shidiqi";
  const title = profile?.title ?? "Fullstack Developer";
  const tagline = profile?.heroTagline || "PORTFOLIO";
  const descriptor = profile?.heroDescriptor || "CREATIVE DEVELOPER";

  // Split text for scattered placement
  const {
    nameFirstHalf,
    nameSecondHalf,
    titleWords,
    taglineLines,
    descriptorLines,
  } = useMemo(() => {
    const nw = name.split(" ");
    const mid = Math.ceil(nw.length / 2);
    return {
      nameFirstHalf: nw.slice(0, mid),
      nameSecondHalf: nw.slice(mid),
      titleWords: title.split(" "),
      taglineLines: tagline.split(/\s+/),
      descriptorLines: descriptor.split(/\s+/),
    };
  }, [name, title, tagline, descriptor]);

  const socialLinkItems =
    socialLinks.length > 0
      ? socialLinks.map((link) => (
          <Link
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-bottom text-muted-foreground hover:text-foreground transition-colors duration-200"
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
            className="hero-bottom text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            {link.icon}
          </Link>
        ));

  // Horizontal row for mobile
  const socialLinksIcon = (
    <div className="flex items-center gap-5">{socialLinkItems}</div>
  );

  const hireMeBtn = profile?.availableForHire && (
    <Button
      size="lg"
      className="hero-bottom group gap-2 rounded-full px-8"
      onClick={scrollToContact}
    >
      <Briefcase className="size-4 transition-transform group-hover:scale-110" />
      Hire Me
    </Button>
  );

  return (
    <section
      ref={containerRef}
      id="home"
      data-section="home"
      className="relative h-svh w-full overflow-hidden"
    >
      {/* ════════════════════════════════════════════
          MOBILE LAYOUT  (<md) — name & title on top, image bottom
         ════════════════════════════════════════════ */}

      {/* ── Mobile: Name + Title + CTA + Socials — top area ── */}
      <div className="absolute inset-x-0 top-0 z-15 flex flex-col items-center gap-4 px-5 pt-25 md:hidden">
        <div className="hero-text text-center">
          <h1 className="font-display text-foreground text-[clamp(2.4rem,11vw,4rem)] leading-[0.95] uppercase">
            {name}
          </h1>
        </div>
        <span className="hero-text font-display text-foreground/60 text-[clamp(1rem,4vw,1.6rem)] leading-[0.9] uppercase">
          {title}
        </span>
        <div className="hero-bottom flex items-center gap-3 pt-2 flex-col-reverse">
          {hireMeBtn}
          {socialLinksIcon}
        </div>
      </div>

      {/* ── Mobile: Profile image — bottom anchored ── */}
      <div className="hero-image pointer-events-none absolute bottom-0 z-10 flex w-full justify-center md:hidden">
        <Image
          src={profile?.profileImageUrl ?? "/profile.webp"}
          alt={name}
          width={400}
          height={600}
          priority
          className="h-[60vh] w-auto object-contain object-bottom"
        />
      </div>

      {/* ── Mobile: Vignette overlay ── */}
      <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 z-15 h-1/3 bg-linear-to-t to-transparent md:hidden" />

      {/* ════════════════════════════════════════════
          DESKTOP LAYOUT  (md+) — scattered absolute
         ════════════════════════════════════════════ */}

      {/* ── Top-left: first part of name ── */}
      <div className="hero-text absolute top-[4%] left-[3%] z-5 hidden max-w-[45vw] md:block">
        <h1 className="font-display text-foreground text-[clamp(3rem,8vw,7.5rem)] leading-[0.85] uppercase">
          {nameFirstHalf.map((w, i) => (
            <span key={i} className="block">
              {w}
            </span>
          ))}
        </h1>
      </div>

      {/* ── Top-right: title words stacked ── */}
      <div className="hero-text absolute top-[4%] right-[3%] z-5 hidden max-w-[35vw] text-right md:block">
        <span className="font-display text-foreground text-[clamp(2rem,5vw,4.5rem)] leading-[0.85] uppercase">
          {titleWords.map((w, i) => (
            <span key={i} className="block">
              {w}
            </span>
          ))}
        </span>
      </div>

      {/* ── Center: tagline (customizable) — largest text, BEHIND image ── */}
      <div className="hero-text absolute top-[45%] z-0 hidden w-full justify-center md:block">
        <span className="font-display text-foreground text-center text-[clamp(4rem,13vw,12rem)] leading-[0.78] uppercase">
          {taglineLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </span>
      </div>

      {/* ── Bottom-left: descriptor (customizable) ── */}
      <div className="hero-text absolute bottom-[6%] left-[3%] z-15 hidden max-w-[35vw] md:block">
        <span className="font-display text-foreground text-[clamp(1.8rem,4vw,3.5rem)] leading-[0.85] uppercase">
          {descriptorLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </span>
      </div>

      {/* ── Bottom-right: second part of name ── */}
      {nameSecondHalf.length > 0 && (
        <div className="hero-text absolute right-[3%] bottom-[6%] z-15 hidden max-w-[35vw] text-right md:block">
          <span className="font-display text-foreground text-[clamp(2rem,5vw,4.5rem)] leading-[0.85] uppercase">
            {nameSecondHalf.map((w, i) => (
              <span key={i} className="block">
                {w}
              </span>
            ))}
          </span>
        </div>
      )}

      {/* ── Profile image — anchored to bottom center ── */}
      <div className="hero-image pointer-events-none absolute bottom-0 z-10 hidden w-full justify-center md:flex">
        <Image
          src={profile?.profileImageUrl ?? "/profile.webp"}
          alt={name}
          width={600}
          height={800}
          priority
          className="h-[75vh] w-auto object-contain object-bottom lg:h-[82vh]"
        />
        <div className="from-background/80 absolute inset-0 bottom-0 -z-1 bg-linear-to-t to-transparent" />
      </div>

      {/* ── Hire Me CTA + Social links — bottom center ── */}
      <div className="absolute bottom-[5%] z-20 hidden w-full flex-col items-center justify-center gap-3 md:flex">
        {hireMeBtn && <div className="animate-bounce">{hireMeBtn}</div>}
        {socialLinksIcon}
      </div>

      {/* ── Vignette overlay ── */}
      <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 z-15 hidden h-1/4 bg-linear-to-t to-transparent md:block" />
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
