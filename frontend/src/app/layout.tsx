'use client';

import React from 'react';
import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { store } from '../utils/store/store';
import { ChakraProvider } from '@chakra-ui/react';
import TopNav from '@/components/TopNav';

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
            <React.StrictMode>
              <Suspense>{children}</Suspense>
            </React.StrictMode>
          </ChakraProvider>
        </body>
      </Provider>
    </html>
  );
}
