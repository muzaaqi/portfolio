import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-border bg-card border-t-2 py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Muhammad Zaki As Shidiqi. All rights
          reserved.
        </p>
        <div className="mt-4 flex justify-center space-x-6">
          <Link
            href="https://github.com/muzaaqi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="https://linkedin.com/in/muzaaqi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            LinkedIn
          </Link>
          <Link
            href="https://youtube.com/@muzaaqi_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            YouTube
          </Link>
        </div>
      </div>
    </footer>
  );
}
