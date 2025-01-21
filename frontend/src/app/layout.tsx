'use client';

import { Suspense, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../utils/store/store';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import TopNav from '@/components/TopNavComponent';
import BackToTop from '@/components/BackToTopComponent';
import { MandoBotAPI } from '@/utils/api';
import { setUserDetails } from '@/utils/store/authSlice';
import { setPreferences } from '@/utils/store/settingsSlice';
import { useRouter } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const theme = extendTheme({
    config: {
      initialColorMode: 'dark',
      useSystemColorMode: true,
    },
  });

  useEffect(() => {
    MandoBotAPI.userSettings()
      .then((response) => {
        store.dispatch(
          setUserDetails({
            username: response.username,
            email: response.email,
          }),
        );
        store.dispatch(
          setPreferences({
            pronunciation_preference: response.pronunciation_preference,
            theme_preference: response.theme_preference,
          }),
        );
      })
      .catch(() => {
        router.push('/');
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
