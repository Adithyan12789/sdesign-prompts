import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'S_de_sign prompts — Architectural AI Video Prompt Library',
    template: '%s · S_de_sign prompts',
  },
  description:
    'A premium library of AI architectural video prompts, step-by-step guides and downloadable resource bundles.',
  keywords: [
    'architectural AI',
    'AI video prompts',
    'Runway Gen-3',
    'Luma Dream Machine',
    'Midjourney architecture',
    'prompt library',
  ],
  authors: [{ name: 'S_de_sign prompts' }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
};

export const viewport: Viewport = {
  themeColor: '#121212',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full bg-ivory font-sans text-ink antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
