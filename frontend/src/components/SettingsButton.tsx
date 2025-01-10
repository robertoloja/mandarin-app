'use client';

import { HStack, Spacer, useColorMode } from '@chakra-ui/react';
import Link from 'next/link';
import { Link as CLink, Text } from '@chakra-ui/react';
import { IoSettingsOutline } from 'react-icons/io5';

export default function SettingsButton(props: { onClose: () => void }) {
  const { colorMode } = useColorMode();
  const darkTextShadow = '1px 1px rgba(50, 50, 50, 0.3)';
  const lightTextShadow = '1px 1px rgba(50, 50, 50, 0.1)';

  return (
    <>
      <Spacer mt="3.5rem" />
      <Link href="/settings" passHref prefetch={true} onClick={props.onClose}>
        <CLink>
          <HStack>
            <IoSettingsOutline size="22" />
            <Text
              textShadow={
                colorMode === 'light' ? lightTextShadow : darkTextShadow
              }
            >
              Settings
            </Text>
          </HStack>
        </CLink>
      </Link>
    </>
  );
}
