'use client';

import { HStack, Spacer, useColorMode } from '@chakra-ui/react';
import Link from 'next/link';
import { Text } from '@chakra-ui/react';
import { IoSettingsOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';

export default function SettingsButton(props: { onClose: () => void }) {
  const { colorMode } = useColorMode();
  const username = useSelector((state: RootState) => state.auth.username);
  const darkTextShadow = '1px 1px rgba(50, 50, 50, 0.3)';
  const lightTextShadow = '1px 1px rgba(50, 50, 50, 0.1)';

  return (
    <>
      <Spacer mt="3.5rem" />
      <Link href="/settings" passHref prefetch={true} onClick={props.onClose}>
        <HStack visibility={username ? 'visible' : 'hidden'}>
          <IoSettingsOutline size="22" />
          <Text
            textShadow={
              colorMode === 'light' ? lightTextShadow : darkTextShadow
            }
          >
            Settings
          </Text>
        </HStack>
      </Link>
    </>
  );
}
