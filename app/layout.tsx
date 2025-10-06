import { Providers } from "./providers";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/src/shared/utils/cn";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Docu2 - Professional Document Management",
  description: "Modern document management platform for companies and cabinets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.variable
      )}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}