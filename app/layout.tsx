import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './brutalist.css';

export const metadata: Metadata = {
  title: 'Nishit Rana — Software Engineer',
  description: 'Backend engineer building edge platforms and AI-driven workflows.',
  metadataBase: new URL('https://nishitrana.me'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Nishit Rana — Software Engineer',
    description: 'Backend engineer building edge platforms and AI-driven workflows.',
    type: 'website',
    url: 'https://nishitrana.me',
    locale: 'en_US',
    siteName: 'Nishit Rana',
  },
  twitter: {
    card: 'summary',
    title: 'Nishit Rana — Software Engineer',
    description: 'Backend engineer building edge platforms and AI-driven workflows.',
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Nishit Rana',
  url: 'https://nishitrana.me',
  email: 'nrana4148@gmail.com',
  jobTitle: 'Software Engineer',
  description: 'Backend engineer building edge platforms and AI-driven workflows.',
  knowsAbout: ['Go', 'TypeScript', 'Cloudflare Workers', 'Distributed Systems', 'AI workflows'],
  sameAs: ['https://github.com/nrana-pixel'],
};

// Unicode-escape <, >, & so the serialised JSON can never break out of a
// <script> tag (e.g. if a value contained "</script>").
const schemaJson = JSON.stringify(personSchema)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Inter+Tight:wght@300;400;500;600&family=Caveat:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />

        {/* Microsoft Clarity — analytics/session replay */}
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "x3b2cywsji");`}
        </Script>

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
