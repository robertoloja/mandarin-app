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
  useToast,
} from '@chakra-ui/react';
import {
  IoFolderOpenOutline,
  IoHomeOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoLibraryOutline,
  IoInformationCircleOutline,
  IoBugOutline,
} from 'react-icons/io5';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import { MandoBotAPI } from '@/utils/api';
import { useRouter } from 'next/navigation';
import SettingsButton from './SettingsButtonComponent';
import localization from '@/localization/main';

function NavPanel(props: { isOpen: boolean; onClose: () => void }) {
  const toast = useToast();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const username = useSelector((state: RootState) => state.auth.username);
  const user_language = useSelector((state: RootState) => state.settings.user_language);
  const darkTextShadow = '1px 1px rgba(50, 50, 50, 0.3)';
  const lightTextShadow = '1px 1px rgba(50, 50, 50, 0.1)';

  const handleAuthClick = (e: any) => {
    if (username) {
      e.preventDefault();
      MandoBotAPI.logout().then(() => {
        router.push('/');
        toast({
          title: 'Logged out',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        props.onClose();
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
        <DrawerCloseButton aria-label="close nav panel" />
        <DrawerBody ml="-4rem">
          <VStack spacing="2rem" marginLeft="7.4rem" alignItems="left">
            <SettingsButton onClose={props.onClose} />

            <Link
              href="/"
              passHref
              onClick={props.onClose}
              prefetch={true}
              aria-label="home link"
            >
              <HStack>
                <IoHomeOutline size="22" />
                <Text
                  _hover={{ textDecoration: 'underline' }}
                  textShadow={
                    colorMode === 'light' ? lightTextShadow : darkTextShadow
                  }
                >
                  {localization.nav_panel.home[user_language]}
                </Text>
              </HStack>
            </Link>
            <Link
              href="/reading"
              passHref
              onClick={props.onClose}
              prefetch={true}
              aria-label="reading room link"
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
                  {localization.nav_panel.reading_room[user_language]}
                </Text>
              </HStack>
            </Link>
            <Link
              href="/history"
              passHref
              onClick={props.onClose}
              prefetch={true}
              aria-label="sentence history link"
            >
              <HStack>
                <IoFolderOpenOutline size="22" />
                <Text
                  _hover={{ textDecoration: 'underline' }}
                  textShadow={
                    colorMode === 'light' ? lightTextShadow : darkTextShadow
                  }
                >
                  {localization.nav_panel.sentence_history[user_language]}
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
              aria-label="about page link"
            >
              <HStack>
                <IoInformationCircleOutline size="22" />
                <Text
                  _hover={{ textDecoration: 'underline' }}
                  textShadow={
                    colorMode === 'light' ? lightTextShadow : darkTextShadow
                  }
                >
                  {localization.nav_panel.status_about[user_language]}
                </Text>
              </HStack>
            </Link>

            <Link
              href="https://forms.gle/j89uiVM2xv3CeK7HA"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="bug report link"
            >
              <HStack>
                <IoBugOutline size="22" />
                <Text
                  _hover={{ textDecoration: 'underline' }}
                  textShadow={
                    colorMode === 'light' ? lightTextShadow : darkTextShadow
                  }
                >
                  {localization.nav_panel.report_bug[user_language]}
                </Text>
              </HStack>
            </Link>

            <Link
              href="/auth"
              passHref
              onClick={handleAuthClick}
              aria-label="login page link"
            >
              <HStack>
                {username ? (
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
                  {username ? localization.nav_panel.logout[user_language] : localization.nav_panel.login[user_language]}
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
