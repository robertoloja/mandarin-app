'use client';

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
            {children}
          </ChakraProvider>
        </body>
      </Provider>
    </html>
  );
}
