import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center font-sans">
      <main className="container flex min-h-screen w-full flex-col items-center justify-center">
        <div className="border-border md:flex-row drop-shadow-primary/20 flex flex-col-reverse gap-2 border-b-2 px-5 drop-shadow-lg">
          <Image
            src="/profile.png"
            alt="Description"
            width={300}
            height={300}
          />
          <div className="mb-5 space-y-5 self-end md:pl-8">
            <div>
              <h1 className="text-foreground/80 mb-4 text-4xl md:text-6xl font-bold">
                Muhammad
              </h1>
              <h1 className="text-foreground/80 mb-4 text-4xl md:text-5xl font-bold">
                <span className="text-foreground underline">Zaki</span> As
                Shidiqi
              </h1>
              <h2 className="font-mono text-2xl">Frontend Developer</h2>
            </div>
            <Button>Download CV</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
