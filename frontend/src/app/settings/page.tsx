'use client';

import { RootState } from '@/utils/store/store';
import { useSelector } from 'react-redux';
import { Box, Button, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Settings() {
  const router = useRouter();
  const username = useSelector((state: RootState) => state.auth.username);

  useEffect(() => {
    if (!username) {
      router.push('/');
    }
  });

  if (!username) {
    return <></>;
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
