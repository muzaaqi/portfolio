"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface SectionContextType {
  activeSection: string | null;
  setActiveSection: (section: string | null) => void;
  scrollTo: (sectionId: string) => void;
}

const SectionContext = createContext<SectionContextType>({
  activeSection: null,
  setActiveSection: () => {},
  scrollTo: () => {},
});

export function SectionProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<string | null>("home");

  const scrollTo = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <SectionContext.Provider
      value={{ activeSection, setActiveSection, scrollTo }}
    >
      {children}
    </SectionContext.Provider>
  );
}

export function useSection() {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error("useSection must be used within a SectionProvider");
  }
  return context;
}
