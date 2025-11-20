import { Button } from "@/components/ui/button";
import { Github, Instagram, Linkedin, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center font-sans">
      <main className="container flex min-h-screen w-full flex-col items-center justify-center space-y-10">
        <div className="border-border drop-shadow-primary/20 flex flex-col-reverse gap-2 border-b-2 px-5 drop-shadow-lg md:flex-row">
          <Image
            src="/profile.png"
            alt="Description"
            width={300}
            height={300}
          />
          <div className="mb-5 space-y-5 md:self-end md:pl-8">
            <div>
              <h1 className="text-foreground/80 mb-4 text-5xl font-bold md:text-6xl">
                Muhammad
              </h1>
              <h1 className="text-foreground/80 mb-4 text-4xl font-bold md:text-5xl">
                <span className="text-foreground underline">Zaki</span> As
                Shidiqi
              </h1>
              <h2 className="font-mono text-2xl">Frontend Developer</h2>
            </div>
            <Button>Download CV</Button>
          </div>
        </div>
        <div className="flex space-x-6">
          <Link href="https://github.com/muzaaqi" target="_blank"><Github className="text-muted-foreground/50" /></Link>
          <Link href="https://instagram.com/muzaaqi_" target="_blank"><Instagram className="text-muted-foreground/50" /></Link>
          <Link href="https://linkedin.com/in/muzaaqi" target="_blank"><Linkedin className="text-muted-foreground/50" /></Link>
          <Link href="https://youtube.com/@muzaaqi_" target="_blank"><Youtube className="text-muted-foreground/50"></Youtube></Link>
        </div>
      </main>
    </div>
  );
}
