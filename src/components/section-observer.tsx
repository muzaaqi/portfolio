"use client";

import { useEffect, useRef } from "react";
import { useSection } from "@/context/section-context";

const SECTION_IDS = [
  "home",
  "about",
  "skills",
  "projects",
  "contact",
  "guestbook",
];

export function SectionObserver() {
  const { setActiveSection } = useSection();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("data-section");
            if (sectionId) {
              setActiveSection(sectionId);
            }
          }
        });
      },
      {
        rootMargin: "-50% 0px -50% 0px",
      },
    );

    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [setActiveSection]);

  return null;
}
