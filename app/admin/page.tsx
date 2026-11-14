import type { Metadata } from "next";
import Admin from "@/components/Admin";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.github.com",
  "form-action 'none'",
  "base-uri 'none'",
  "object-src 'none'",
].join("; ");

export default function AdminPage() {
  return (
    <>
      {process.env.NODE_ENV === "production" && <meta httpEquiv="Content-Security-Policy" content={csp} />}
      <meta name="referrer" content="no-referrer" />
      <Admin />
    </>
  );
}
