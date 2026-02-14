import Logo from "@/components/logo";

export default function Loading() {
  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring behind the logo */}
        <div className="bg-primary/10 absolute size-24 animate-ping rounded-full" />
        <div className="bg-primary/5 absolute size-20 animate-pulse rounded-full" />

        {/* Logo with pulse animation */}
        <div className="text-primary relative size-16 animate-pulse">
          <Logo />
        </div>
      </div>

      {/* Loading bar */}
      <div className="bg-muted h-0.5 w-32 overflow-hidden rounded-full">
        <div className="animate-loading-bar bg-primary h-full w-full origin-left rounded-full" />
      </div>

      <p className="text-muted-foreground animate-pulse text-sm font-medium">
        Loading…
      </p>
    </div>
  );
}
