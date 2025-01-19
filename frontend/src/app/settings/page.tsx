'use client';

import { RootState } from '@/utils/store/store';
import { useSelector } from 'react-redux';
import { Box, Container, Heading, Text } from '@chakra-ui/react';

export default function Settings() {
  const user = useSelector((state: RootState) => state.auth.user);
  const email = useSelector((state: RootState) => state.auth.email);
  const theme = useSelector((state: RootState) => state.settings.theme);
  const pronunciation = useSelector(
    (state: RootState) => state.settings.pronunciation,
  );
  return (
    <Box border="1px solid #AAA">
      <Heading>Settings</Heading>
      <Box></Box>
    </Box>
  );
}
