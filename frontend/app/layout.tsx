import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Space Dashboard",
  description: "Track ISS position, explore JWST images, and discover astronomical events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`antialiased min-h-screen bg-background selection:bg-primary selection:text-primary-foreground`}
        style={{
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}
      >
        {children}
      </body>
    </html>
  );
}
