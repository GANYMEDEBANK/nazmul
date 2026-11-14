import type { Metadata } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/public-sans";
import "./globals.css";
import site from "@/content/site.json";

export const metadata: Metadata = {
  title: `${site.profile.name} | ${site.profile.role}`,
  description: site.profile.tagline,
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
