import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Zilla_Slab } from "next/font/google";
import "./styles.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const zilla = Zilla_Slab({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-zilla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fin | Matai Tech assistant",
  description: "Fin is the AI assistant on mataitech.co, built by Luke Pauga.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} ${zilla.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
