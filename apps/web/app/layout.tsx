import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "ShowHunt - A launch platform for your products",
  description: "ShowHunt is a product launch platform where developers and founders list projects, get discovered, and receive community engagement through upvotes and discussion.",
  icons: {
    icon: "/showcase.svg"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
