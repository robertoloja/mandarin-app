'use client';

import { MandoBotAPI } from '@/utils/api';
import { setUserDetails } from '@/utils/store/authSlice';
import { setPreferences } from '@/utils/store/settingsSlice';
import { store } from '@/utils/store/store';
// import { RootState } from '@/utils/store/store';
// import { useSelector } from 'react-redux';
import { Box, Button, Heading } from '@chakra-ui/react';

export default function Settings() {
  // const user = useSelector((state: RootState) => state.auth.username);
  // const email = useSelector((state: RootState) => state.auth.email);
  // const theme = useSelector((state: RootState) => state.settings.theme);
  // const pronunciation = useSelector(
  //   (state: RootState) => state.settings.pronunciation,
  // );

  return (
    <Box border="1px solid #AAA">
      <Heading>Settings</Heading>
      <Box>
        <Button>foo</Button>
      </Box>
    </Box>
  );
}
