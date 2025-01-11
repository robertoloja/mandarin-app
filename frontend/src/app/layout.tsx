'use client';

import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { store } from '../utils/store/store';
import { ChakraProvider } from '@chakra-ui/react';
import TopNav from '@/components/TopNav';
import BackToTop from '@/components/BackToTopComponent';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>mandoBot</title>
      </head>
      <Provider store={store}>
        <body>
          <ChakraProvider resetCSS>
            <TopNav />
            <Suspense>{children}</Suspense>
            <BackToTop />
          </ChakraProvider>
        </body>
      </Provider>
    </html>
  );
}
