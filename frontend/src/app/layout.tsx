import { Metadata } from 'next';
import { IBM_Plex_Sans, Spectral, Noto_Serif_SC } from 'next/font/google';
import Providers from './Providers';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-chinese',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mandobot.com'),
  title: {
    default: 'mandoBot',
    template: 'mandoBot - %s',
  },
  description: 'Mandarin text segmentation and translation tool',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${ibmPlexSans.variable} ${spectral.variable} ${notoSerifSC.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
