'use client';

import { Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Provider } from 'react-redux';
import { store } from '../utils/store/store';
import { ChakraProvider } from '@chakra-ui/react';
import TopNav from '@/components/TopNav/TopNavComponent';
import CaptchaWidgetComponent from '@/components/CaptchaWidgetComponent';
import { MandoBotAPI, injectStore } from '@/utils/api';
import { needsCaptchaWidget } from '@/utils/captchaRoutes';
import { logout, setUserDetails } from '@/utils/store/authSlice';
import theme from '@/theme';

injectStore(store.dispatch, logout, setUserDetails);

const CaptchaWidgetWhereNeeded = () => {
  const pathname = usePathname();
  return needsCaptchaWidget(pathname) ? <CaptchaWidgetComponent /> : null;
};

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
        <CaptchaWidgetWhereNeeded />
      </ChakraProvider>
    </Provider>
  );
}
