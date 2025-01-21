'use client';

import { Suspense, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../utils/store/store';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import TopNav from '@/components/TopNavComponent';
import BackToTop from '@/components/BackToTopComponent';
import { MandoBotAPI } from '@/utils/api';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = extendTheme({
    config: {
      initialColorMode: 'dark',
      useSystemColorMode: true,
    },
  });

  useEffect(() => {
    MandoBotAPI.updateCSRF().then(() => {
      MandoBotAPI.getUserSettings();
    });
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>mandoBot</title>
      </head>
      <Provider store={store}>
        <body>
          <ChakraProvider resetCSS theme={theme}>
            <TopNav />
            <Suspense>{children}</Suspense>
            <BackToTop />
          </ChakraProvider>
        </body>
      </Provider>
    </html>
  );
}
