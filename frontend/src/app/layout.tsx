import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: [
    {
      path: "../../public/fonts/Inter-VariableFont_opsz,wght.ttf",
      style: "normal",
    },
    {
      path: "../../public/fonts/Inter-Italic-VariableFont_opsz,wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PuzzlePro - 636 Coding Exercises for Kids | Blocks, HTML, CSS, JavaScript, Python",
  description: "Learn to code with 636 interactive coding exercises for kids. Master Scratch Blocks, HTML, CSS, JavaScript, and Python through fun gamified adventures!",
  keywords: ["coding for kids", "Scratch blocks", "HTML for kids", "CSS", "JavaScript", "Python", "PuzzlePro", "gamified learning"],
  icons: {
    icon: "/monkey1.svg",
    shortcut: "/monkey1.svg",
    apple: "/monkey1.svg",
  },
  openGraph: {
    title: "PuzzlePro - 636 Coding Exercises for Kids | Blocks, HTML, CSS, JavaScript, Python",
    description: "Learn to code with 636 interactive coding exercises for kids. Master Scratch Blocks, HTML, CSS, JavaScript, and Python through fun gamified adventures!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans h-full antialiased`}>
      <body className={`${inter.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
