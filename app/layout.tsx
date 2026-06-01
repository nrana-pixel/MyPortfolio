import type { Metadata } from 'next';
import Script from 'next/script';
import './brutalist.css';

export const metadata: Metadata = {
  title: 'Nishit Rana — Software Engineer',
  description: 'Backend engineer building edge platforms and AI-driven workflows.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Inter+Tight:wght@300;400;500;600&family=Caveat:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        {children}

        {/* Lenis smooth scroll */}
        <Script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js" strategy="beforeInteractive" />
        {/* GSAP + ScrollTrigger */}
        <Script src="https://unpkg.com/gsap@3.12.5/dist/gsap.min.js" strategy="beforeInteractive" />
        <Script src="https://unpkg.com/gsap@3.12.5/dist/ScrollTrigger.min.js" strategy="beforeInteractive" />
        {/* Three.js */}
        <Script src="https://unpkg.com/three@0.160.0/build/three.min.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
