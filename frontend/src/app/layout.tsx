'use client';

import { Suspense } from 'react';
import { Provider, useSelector } from 'react-redux';
import { RootState, store } from '../utils/store/store';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import TopNav from '@/components/TopNavComponent';
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
          </ChakraProvider>
        </body>
      </Provider>
    </html>
  );
}

const UpdateUserSettings = () => {
  MandoBotAPI.updateCSRF().then(() => {
    MandoBotAPI.getUserSettings();
  });
  return null;
};
