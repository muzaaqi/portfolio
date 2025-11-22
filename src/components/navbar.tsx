"use client";

import { useState } from "react";
import Link from "next/link";
import { House, User, Code, PanelsTopLeft, Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeSwitch } from "./theme-switch";
import Logo from "./logo";

const items = [
  { href: "/", icon: <House /> },
  { href: "/about", icon: <User /> },
  { href: "/skills", icon: <Code /> },
  { href: "/projects", icon: <PanelsTopLeft /> },
  { href: "/contact", icon: <Mail /> },
];

const Navbar = () => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const currentPath = usePathname();

  return (
    <div className="fixed right-0 flex h-svh w-15 flex-col items-center justify-center p-4">
      <div className="absolute top-0 w-full p-4 flex items-center justify-center">
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
            <Link
              key={i}
              href={item.href}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              className={`hover:text-foreground p-3 transition-all duration-300 ${hoverClass} ${currentPath === item.href ? "scale-125" : "text-muted-foreground/70"} `}
            >
              {item.icon}
            </Link>
          );
        })}
      </div>
      <ThemeSwitch />
    </div>
  );
};

export default Navbar;
