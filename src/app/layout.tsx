import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { Footer, Nav } from "@/components/chrome";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: { default: "Corazón · Where to, Chicago?", template: "%s · Corazón" },
  description: "All of Chicago's secrets, in one place. Where locals actually eat, shop and go.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable} antialiased`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Nav />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
