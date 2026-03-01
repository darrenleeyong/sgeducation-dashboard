import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SG EduStats",
  description:
    "Singapore Education Data Dashboard — PSLE Performance, Enrolment, and School Metrics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
        <body
        className={`${firaCode.variable} font-mono antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
