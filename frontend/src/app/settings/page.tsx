'use client';

import { MandoBotAPI } from '@/utils/api';
import { setUserDetails } from '@/utils/store/authSlice';
import { setPreferences } from '@/utils/store/settingsSlice';
import { store } from '@/utils/store/store';
import { RootState } from '@/utils/store/store';
import { useSelector } from 'react-redux';
import { Box, Button, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function Settings() {
  const router = useRouter();
  const username = useSelector((state: RootState) => state.auth.username);
  const email = useSelector((state: RootState) => state.auth.email);
  const theme = useSelector((state: RootState) => state.settings.theme);
  const pronunciation = useSelector(
    (state: RootState) => state.settings.pronunciation,
  );
  if (!username) {
    router.push('/');
  }

  return (
    <Box border="1px solid #AAA">
      <Heading>Settings</Heading>
      <Box>
        <Button>foo</Button>
      </Box>
    </Box>
  );
}
