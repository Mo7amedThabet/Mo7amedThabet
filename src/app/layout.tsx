import type { Metadata } from "next";
import { Cairo, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppProvider } from "@/context/AppContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Mohamed Thabet | Full-Stack Engineer Portfolio",
  description:
    "Premium gamified portfolio of Mohamed Thabet — Full-Stack / Front-End Software Engineer. Projects, skills, certificates & contact.",
  keywords: [
    "Mohamed Thabet",
    "portfolio",
    "React",
    "Full-Stack",
    "Front-End",
  ],
  openGraph: {
    title: "Mohamed Thabet — Portfolio",
    description: "Interactive gamified developer portfolio",
    images: ["/profile.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${cairo.variable} min-h-screen antialiased`}
      >
        <ThemeProvider>
          <AppProvider>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
