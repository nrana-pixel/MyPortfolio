import type { Metadata } from 'next';
import AgxpPage from '@/components/brutalist/agxp';
import './agxp.css';

export const metadata: Metadata = {
  title: 'AGXP — Case Study · Nishit Rana',
  description:
    'AGXP: a Cloudflare edge platform that serves AI-crawler-optimized HTML variants. Case study.',
  openGraph: {
    title: 'AGXP — Case Study · Nishit Rana',
    description:
      'AGXP: a Cloudflare edge platform that serves AI-crawler-optimized HTML variants. Case study.',
    type: 'article',
    locale: 'en_US',
    siteName: 'Nishit Rana',
  },
};

export default function Page() {
  return <AgxpPage />;
}
