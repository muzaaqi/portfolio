import { Metadata } from "next";
import { getProfile, getLinks, getSocialLinks } from "@/db/queries";
import Image from "next/image";
import Link from "next/link";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Globe, 
  Link as LinkIcon,
  ExternalLink
} from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function getOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { 
      next: { revalidate: 86400 },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) 
               || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

function LinkCardFallback({ link }: { link: any }) {
  return (
    <div className="group flex items-center p-4 bg-card border border-border rounded-xl opacity-70">
      <div className="flex-shrink-0 mr-4 text-muted-foreground">
        {getIcon(link.icon)}
      </div>
      <div className="flex-grow text-center font-medium mr-9">
        {link.title}
      </div>
    </div>
  );
}

async function LinkCard({ link }: { link: any }) {
  const banner = link.showBanner ? await getOgImage(link.url) : null;
  return (
    <Link
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col p-4 bg-card hover:bg-accent/50 border border-border rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md overflow-hidden relative"
    >
      {banner && (
        <div className="w-full h-32 mb-4 rounded-md overflow-hidden relative border border-border/50">
          <Image src={banner} alt={`${link.title} banner`} fill className="object-cover" unoptimized />
        </div>
      )}
      <div className="flex items-center w-full">
        <div className="flex-shrink-0 mr-4 text-muted-foreground group-hover:text-primary transition-colors">
          {getIcon(link.icon)}
        </div>
        <div className="flex-grow text-center font-medium mr-9">
          {link.title}
        </div>
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  
  if (!profile) return { title: "Links" };
  
  return {
    title: `${profile.name} | Links`,
    description: profile.shortBio || profile.heroTagline,
  };
}

const getIcon = (iconName: string | null) => {
  switch (iconName?.toLowerCase()) {
    case "github":
      return <Github className="w-5 h-5" />;
    case "twitter":
    case "x":
      return <Twitter className="w-5 h-5" />;
    case "linkedin":
      return <Linkedin className="w-5 h-5" />;
    case "mail":
    case "email":
      return <Mail className="w-5 h-5" />;
    case "website":
    case "globe":
      return <Globe className="w-5 h-5" />;
    default:
      return <LinkIcon className="w-5 h-5" />;
  }
};

export default async function LinktreePage() {
  const [profile, links, socialLinks] = await Promise.all([
    getProfile(),
    getLinks(),
    getSocialLinks(),
  ]);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          {profile.profileImageUrl ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 p-1">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={profile.profileImageUrl}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
              {profile.name.charAt(0)}
            </div>
          )}
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
            <p className="text-muted-foreground text-sm font-medium">
              {profile.title}
            </p>
          </div>
          
          {(profile.shortBio || profile.bio) && (
            <p className="text-sm text-foreground/80 max-w-xs mx-auto">
              {profile.shortBio || profile.bio}
            </p>
          )}
        </div>

        {/* Links Section */}
        <div className="w-full space-y-3 pt-4">
          {links.length > 0 ? (
            links.map((link) => (
              <Suspense key={link.id} fallback={<LinkCardFallback link={link} />}>
                <LinkCard link={link} />
              </Suspense>
            ))
          ) : (
            <div className="text-center p-6 border border-dashed rounded-xl text-muted-foreground text-sm">
              No links added yet.
            </div>
          )}
        </div>

        {/* Social Icons Footer */}
        {socialLinks.length > 0 && (
          <div className="pt-8 pb-4 flex justify-center space-x-4 flex-wrap gap-y-4">
            {socialLinks.map((social) => (
              <Link
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-secondary/50 hover:bg-primary hover:text-primary-foreground rounded-full transition-all duration-300 hover:scale-110"
                aria-label={social.platform}
                title={social.platform}
              >
                {getIcon(social.icon || social.platform)}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
