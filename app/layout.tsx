import type { Metadata } from "next";
import { Inter, PT_Serif } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const serif = PT_Serif({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: {
    default: "OSINT Carrier Tracker",
    template: "%s | OSINT Carrier Tracker",
  },
  description:
    "An open intelligence portal that visualizes the last known positions of U.S. Navy aircraft carriers.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "OSINT Carrier Tracker",
    description:
      "Visualizing the last known positions of U.S. Navy aircraft carriers with transparent sourcing and confidence levels.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-12">
          <header className="sticky top-0 z-50 bg-slate-950/80 py-6 backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href="/" className="font-semibold uppercase tracking-widest text-navy-200">
                  OSINT Carrier Tracker
                </Link>
                <p className="max-w-2xl text-sm text-slate-400">
                  Visualizing the last publicly verifiable locations of U.S. Navy aircraft carriers. Data is delayed, curated
                  from open sources, and includes confidence assessments.
                </p>
              </div>
              <nav className="flex items-center gap-4 text-sm text-slate-300">
                <Link href="/data" className="hover:text-white">
                  Data Explorer
                </Link>
                <Link href="/methodology" className="hover:text-white">
                  Methodology
                </Link>
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 py-8">{children}</main>
          <footer className="border-t border-slate-800 pt-6 text-xs text-slate-500">
            <p>
              Information is sourced from publicly available materials and does not represent official U.S. Navy positions.
              Coordinates are approximate and may be delayed for operational security.
            </p>
            <p className="mt-2">
              &copy; {new Date().getFullYear()} OSINT Carrier Tracker. Built with transparency and ethical OSINT practices.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
