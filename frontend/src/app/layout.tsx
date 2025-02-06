'use client';

import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { store } from '../utils/store/store';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import TopNav from '@/components/TopNav/TopNavComponent';
import { MandoBotAPI } from '@/utils/api';
import { accordionTheme } from './reading/components/Accordion';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = extendTheme({
    components: { Accordion: accordionTheme },
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
