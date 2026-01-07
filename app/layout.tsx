import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Matai RAG - AI Knowledge Assistant",
  description: "Transform your documents into an intelligent AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
