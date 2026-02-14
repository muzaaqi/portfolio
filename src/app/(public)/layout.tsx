import { Navbar } from "@/components";
import { SectionProvider } from "@/context/section-context";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Footer } from "@/components/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <SectionProvider>
        <Navbar />
        <main className="bg-background font-sans container mx-auto">{children}</main>
        <Footer />
      </SectionProvider>
    </SmoothScroll>
  );
}
