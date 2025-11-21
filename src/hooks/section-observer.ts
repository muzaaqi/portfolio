"use client"
import { useEffect, useState } from "react";

export const useSectionObserver = (sectionRefs: Record<string, React.RefObject<HTMLElement>>) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observerCallback = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute("data-section") || "");
          }
        });
      },
      { threshold: 0.5 }
    );
    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) {
        observerCallback.observe(ref.current);
      }
    });
    return () => {
      observerCallback.disconnect();
    };
  }, [sectionRefs]);

  return activeSection;
};