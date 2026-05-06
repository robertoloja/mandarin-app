'use client';

import { Suspense, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../utils/store/store';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import TopNav from '@/components/TopNav/TopNavComponent';
import { MandoBotAPI } from '@/utils/api';
import { accordionTheme } from './reading/components/Accordion';

const theme = extendTheme({
  components: { Accordion: accordionTheme },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: true,
  },
});

const UpdateUserSettings = () => {
  useEffect(() => {
    MandoBotAPI.updateCSRF().then(() => {
      MandoBotAPI.getUserSettings();
    });
  }, []);
  return null;
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ChakraProvider resetCSS theme={theme}>
        <UpdateUserSettings />
        <TopNav />
        <Suspense>{children}</Suspense>
      </ChakraProvider>
    </Provider>
  );
}
