"use client";
import { Code, House, Mail, PanelsTopLeft, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const currentPath = usePathname();
  return (
    <div className="absolute right-0 flex h-svh w-15 flex-col items-center justify-center space-y-6 p-4">
      <Link
        href="/"
        className={`transition-all duration-150 hover:text-foreground hover:-translate-x-1/2 hover:scale-125 ${currentPath === "/" ? "scale-125" : "text-muted-foreground/70"}`}
      >
        <House />
      </Link>
      <Link
        href="/about"
        className={`transition-all duration-150 hover:text-foreground hover:-translate-x-1/2 hover:scale-125 ${currentPath === "/about" ? "scale-125" : "text-muted-foreground/70"}`}
      >
        <User />
      </Link>
      <Link
        href="/projects"
        className={`transition-all duration-150 hover:text-foreground hover:-translate-x-1/2 hover:scale-125 ${currentPath === "/projects" ? "scale-125" : "text-muted-foreground/70"}`}
      >
        <Code />
      </Link>
      <Link
        href="/dashboard"
        className={`transition-all duration-150 hover:text-foreground hover:-translate-x-1/2 hover:scale-125 ${currentPath === "/dashboard" ? "scale-125" : "text-muted-foreground/70"}`}
      >
        <PanelsTopLeft />
      </Link>
      <Link
        href="/contact"
        className={`transition-all duration-150 hover:text-foreground hover:-translate-x-1/2 hover:scale-125 ${currentPath === "/contact" ? "scale-125" : "text-muted-foreground/70"}`}
      >
        <Mail />
      </Link>
    </div>
  );
};

export default Navbar;
