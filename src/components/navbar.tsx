"use client";
import { Code, House, Mail, PanelsTopLeft, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitch } from "./theme-switch";

const Navbar = () => {
  const currentPath = usePathname();
  return (
    <div className="fixed right-0 flex h-svh w-15 flex-col items-center justify-center p-4">
      <div className="flex flex-col space-y-6">
        <Link
          href="/"
          className={`hover:text-foreground transition-all duration-150 hover:-translate-x-1/2 hover:scale-125 ${currentPath === "/" ? "scale-125" : "text-muted-foreground/70"}`}
        >
          <House />
        </Link>
        <Link
          href="/about"
          className={`hover:text-foreground transition-all duration-150 hover:-translate-x-1/2 hover:scale-125 ${currentPath === "/about" ? "scale-125" : "text-muted-foreground/70"}`}
        >
          <User />
        </Link>
        <Link
          href="/projects"
          className={`hover:text-foreground transition-all duration-150 hover:-translate-x-1/2 hover:scale-125 ${currentPath === "/projects" ? "scale-125" : "text-muted-foreground/70"}`}
        >
          <Code />
        </Link>
        <Link
          href="/dashboard"
          className={`hover:text-foreground transition-all duration-150 hover:-translate-x-1/2 hover:scale-125 ${currentPath === "/dashboard" ? "scale-125" : "text-muted-foreground/70"}`}
        >
          <PanelsTopLeft />
        </Link>
        <Link
          href="/contact"
          className={`hover:text-foreground transition-all duration-150 hover:-translate-x-1/2 hover:scale-125 ${currentPath === "/contact" ? "scale-125" : "text-muted-foreground/70"}`}
        >
          <Mail />
        </Link>
      </div>
      <ThemeSwitch />
    </div>
  );
};

export default Navbar;
