'use client';

import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  VStack,
  DrawerCloseButton,
  HStack,
  Text,
  Spacer,
  useColorMode,
} from '@chakra-ui/react';
import {
  IoFolderOpenOutline,
  IoHomeOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoLibraryOutline,
  IoInformationCircleOutline,
} from 'react-icons/io5';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import { MandoBotAPI } from '@/utils/api';
import SettingsButton from './SettingsButton';

function NavPanel(props: { isOpen: boolean; onClose: () => void }) {
  const { colorMode } = useColorMode();
  const user = useSelector((state: RootState) => state.auth.user);
  const darkTextShadow = '1px 1px rgba(50, 50, 50, 0.3)';
  const lightTextShadow = '1px 1px rgba(50, 50, 50, 0.1)';

  const handleAuthClick = (e: any) => {
    if (user) {
      e.preventDefault();
      MandoBotAPI.logout().then((response) => {
        console.log(response);
      });
    } else {
      props.onClose();
    }
  };

  return (
    <Drawer
      isOpen={props.isOpen}
      placement="left"
      onClose={props.onClose}
      size="xs"
      allowPinchZoom={true}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />

        <DrawerBody ml="-4rem">
          <VStack spacing="2rem" marginLeft="7.4rem" alignItems="left">
            <SettingsButton onClose={props.onClose} />
            <Link href="/" passHref onClick={props.onClose} prefetch={true}>
              <HStack>
                <IoHomeOutline size="22" />
                <Text
                  _hover={{ textDecoration: 'underline' }}
                  textShadow={
                    colorMode === 'light' ? lightTextShadow : darkTextShadow
                  }
                >
                  Home
                </Text>
              </HStack>
            </Link>

            <Link
              href="/history"
              passHref
              onClick={props.onClose}
              prefetch={true}
            >
              <HStack>
                <IoFolderOpenOutline size="22" />
                <Text
                  _hover={{ textDecoration: 'underline' }}
                  textShadow={
                    colorMode === 'light' ? lightTextShadow : darkTextShadow
                  }
                >
                  Sentence History
                </Text>
              </HStack>
            </Link>

            <Link
              href="/reading"
              passHref
              onClick={props.onClose}
              prefetch={true}
            >
              <HStack>
                <IoLibraryOutline
                  size="22"
                  color={colorMode === 'light' ? '#222' : '#d9d9d9'}
                />
                <Text
                  _hover={{ textDecoration: 'underline' }}
                  textShadow={
                    colorMode === 'light' ? lightTextShadow : darkTextShadow
                  }
                >
                  Reading Room
                </Text>
              </HStack>
            </Link>
          </VStack>

          <Spacer mt="16rem" />

          <VStack spacing="2rem" marginLeft="7.4rem" alignItems="left">
            <Link
              href="/about"
              passHref
              onClick={props.onClose}
              prefetch={true}
            >
              <HStack>
                <IoInformationCircleOutline size="22" />
                <Text
                  _hover={{ textDecoration: 'underline' }}
                  textShadow={
                    colorMode === 'light' ? lightTextShadow : darkTextShadow
                  }
                >
                  About
                </Text>
              </HStack>
            </Link>

            <Link href="/auth" passHref onClick={handleAuthClick}>
              <HStack>
                {user ? (
                  <IoLogOutOutline size="22" />
                ) : (
                  <IoLogInOutline size="22" />
                )}
                <Text
                  _hover={{ textDecoration: 'underline' }}
                  textShadow={
                    colorMode === 'light' ? lightTextShadow : darkTextShadow
                  }
                >
                  {user ? 'Log Out' : 'Log In'}
                </Text>
              </HStack>
            </Link>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default NavPanel;
