"use client";

import { useState } from "react";
import Link from "next/link";
import {
  House,
  User,
  Code,
  PanelsTopLeft,
  Mail,
  MessageSquare,
  Menu,
  LayoutDashboard,
} from "lucide-react";
import { ThemeSwitch } from "./theme-switch";
import Logo from "./logo";
import { useSection } from "@/context/section-context";
import { useSession } from "@/lib/auth-client";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const items = [
  { id: "home", icon: <House />, label: "Home" },
  { id: "about", icon: <User />, label: "About" },
  { id: "skills", icon: <Code />, label: "Skills" },
  { id: "projects", icon: <PanelsTopLeft />, label: "Projects" },
  { id: "contact", icon: <Mail />, label: "Contact" },
  { id: "guestbook", icon: <MessageSquare />, label: "Guestbook" },
];

const Navbar = () => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { activeSection, scrollTo } = useSection();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  function handleClick(sectionId: string) {
    scrollTo(sectionId);
    setSheetOpen(false);
  }

  return (
    <>
      {/* Desktop: Fixed right sidebar */}
      <div className="fixed right-0 z-50 hidden h-svh w-15 flex-col items-center justify-center p-4 md:flex">
        <div className="absolute top-0 flex w-full items-center justify-center p-4">
          <Logo />
        </div>

        <div className="flex flex-col">
          {items.map((item, i) => {
            let hoverClass = "scale-100";

            if (hoverIndex === i) {
              hoverClass = "scale-125 -translate-x-1/4";
            } else if (hoverIndex === i - 1 || hoverIndex === i + 1) {
              hoverClass = "scale-115 -translate-x-1/8";
            }

            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className={`hover:text-foreground cursor-pointer p-3 transition-all duration-300 ${hoverClass} ${activeSection === item.id ? "text-foreground scale-125" : "text-muted-foreground/70"} `}
              >
                {item.icon}
              </button>
            );
          })}
        </div>
        <div className="absolute bottom-0 flex w-full flex-col items-center gap-2 p-4">
          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin"
                  className="text-muted-foreground/70 hover:text-foreground transition-colors"
                >
                  <LayoutDashboard className="size-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="left">Dashboard</TooltipContent>
            </Tooltip>
          )}
          <ThemeSwitch />
        </div>
      </div>

      {/* Mobile: Top bar + Sheet */}
      <div className="bg-background/80 fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b p-3 backdrop-blur-sm md:hidden">
        <div className="size-10">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Site navigation menu
              </SheetDescription>
              <nav className="mt-8 flex flex-col space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleClick(item.id)}
                    className={`flex items-center gap-3 rounded-md px-4 py-3 text-left transition-colors ${
                      activeSection === item.id
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/50"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setSheetOpen(false)}
                    className="text-muted-foreground hover:bg-accent/50 flex items-center gap-3 rounded-md px-4 py-3 text-left transition-colors"
                  >
                    <LayoutDashboard />
                    Dashboard
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};

export default Navbar;
