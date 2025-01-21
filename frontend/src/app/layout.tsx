'use client';

import { Suspense, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { RootState, store } from '../utils/store/store';
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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>mandoBot</title>
      </head>
      <Provider store={store}>
        <body>
          <ChakraProvider resetCSS theme={theme}>
            <UpdateUserSettings />
            <TopNav />
            <Suspense>{children}</Suspense>
            <BackToTop />
          </ChakraProvider>
        </body>
      </Provider>
    </html>
  );
}

const UpdateUserSettings = () => {
  const username = useSelector((state: RootState) => state.auth.username);
  MandoBotAPI.updateCSRF().then(() => {
    if (username) MandoBotAPI.getUserSettings();
  });
  return null;
};
