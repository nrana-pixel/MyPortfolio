import type {Metadata} from 'next';
import { Space_Mono, Bebas_Neue } from "next/font/google";
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BackToTop } from '@/components/BackToTop';

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Nothing Design Concept",
  description: "Designed to be seen.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${bebasNeue.variable} scroll-smooth`}>
       <body suppressHydrationWarning className="font-mono antialiased bg-[#0A0A0A] text-[#F5F5F5] min-h-screen">
        <Navbar />
        {children}
        <BackToTop />
        <Footer />
      </body>
    </html>
  );
}
