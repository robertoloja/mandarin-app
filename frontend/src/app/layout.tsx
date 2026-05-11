import { Metadata } from 'next';
import Providers from './Providers';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Spectral:ital,wght@0,400;0,500;1,400;1,500&family=Noto+Serif+SC:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
