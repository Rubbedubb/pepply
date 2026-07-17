import type { Metadata, Viewport } from "next";
import { CookieNotice } from "@/components/cookie-notice";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Pepply – en lugn minut för dig",
    template: "%s · Pepply",
  },
  description:
    "En personlig och lugn kvällsritual som hjälper dig att avsluta dagen lite bättre.",
  applicationName: "Pepply",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pepply",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffdf8" },
    { media: "(prefers-color-scheme: dark)", color: "#171612" },
  ],
};

const themeScript = `
  try {
    const saved = localStorage.getItem('pepply-theme');
    const dark = saved === 'dark' || (saved !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main-content"
          className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition focus:translate-y-0"
        >
          Hoppa till innehållet
        </a>
        {children}
        <CookieNotice />
        <PwaRegister />
      </body>
    </html>
  );
}
