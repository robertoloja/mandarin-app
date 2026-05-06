import { Metadata } from 'next';
import Providers from './Providers';

export const metadata: Metadata = {
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
