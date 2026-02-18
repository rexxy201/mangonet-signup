import { Link } from "wouter";
import { useEffect } from "react";
import { useLogo, useFavicon, useSeoImage } from "@/lib/storage";

export function Header() {
  const { logo } = useLogo();
  const { favicon } = useFavicon();
  const { seoImage } = useSeoImage();

  useEffect(() => {
    if (favicon) {
      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      const appleLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (link) link.href = favicon;
      if (appleLink) appleLink.href = favicon;
    }
  }, [favicon]);

  useEffect(() => {
    if (seoImage) {
      const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
      const twitterImage = document.querySelector('meta[name="twitter:image"]') as HTMLMetaElement;
      if (ogImage) ogImage.content = seoImage;
      if (twitterImage) twitterImage.content = seoImage;
    }
  }, [seoImage]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt="MangoNet Logo" className="h-8 w-8 object-contain" data-testid="img-header-logo" />
          ) : (
            <img src="/logo.png" alt="MangoNet Logo" className="h-8 w-8 object-contain" data-testid="img-header-logo" />
          )}
          <span className="text-xl font-bold tracking-tight text-primary">MangoNet</span>
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <Link href="/">
            <span className="cursor-pointer text-sm font-medium transition-colors hover:text-primary">Signup</span>
          </Link>
          <Link href="/admin">
            <span className="cursor-pointer text-sm font-medium transition-colors hover:text-primary">Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
