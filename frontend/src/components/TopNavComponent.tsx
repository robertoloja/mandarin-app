'use client';
import React, { useEffect, useRef } from 'react';
import {
  useDisclosure,
  IconButton,
  defineStyle,
  defineStyleConfig,
  HStack,
  useColorMode,
} from '@chakra-ui/react';

import { IoMoon, IoSunny, IoMenuOutline, IoHomeOutline } from 'react-icons/io5';

import NavPanel from './NavPanelComponent';
import ShareButton from './ShareButtonComponent';
import LanguageMenu from './LanguageMenuComponent';
import ErrorButton from './ErrorButtonComponent';
import Link from 'next/link';
import { RootState, store } from '@/utils/store/store';
import { useSelector } from 'react-redux';
import { toggleTheme } from '@/utils/store/settingsSlice';

function TopNav() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const btnRef = useRef<HTMLButtonElement>(null);

  const buttonStyle = defineStyle({
    border: '0',
    fontColor: 'blue',
    background: 'white',
  });

  defineStyleConfig({
    variants: { buttonStyle },
  });
  const toggleThemeSetting = () => {
    store.dispatch(toggleTheme());
    toggleColorMode();
    //TODO: Also change in the API
  };
  const theme = useSelector((state: RootState) => state.settings.theme);
  useEffect(() => {
    if (theme == 'light' && colorMode == 'dark') toggleColorMode();
    if (theme == 'dark' && colorMode == 'light') toggleColorMode();
  });

  const iconSize = 20;
  return (
    <HStack
      justifyContent="space-between"
      boxShadow="1px 1px 1px 0 rgba(0, 0, 0, 0.3)"
      // borderBottom="solid 1px black"
      position="sticky"
      top="0"
      zIndex="100"
      w="100%"
      h="2.5rem"
      backgroundColor={colorMode === 'light' ? 'white' : 'gray.800'}
    >
      <HStack justifyContent="left">
        <NavPanel isOpen={isOpen} onClose={onClose} />
        <IconButton
          aria-label="Open Navigation"
          icon={<IoMenuOutline size={iconSize + 7} />}
          ref={btnRef}
          onClick={onOpen}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          ml="0.2rem"
          mt={0.5}
          mb={0.5}
        />

        <Link href="/" prefetch={true}>
          <IconButton
            aria-label="Text options"
            icon={<IoHomeOutline size={iconSize} />}
            bg={colorMode === 'light' ? 'white' : 'gray.800'}
          />
        </Link>
      </HStack>

      <HStack justifyContent="right" w="100%">
        <ErrorButton iconSize={iconSize} />
        <LanguageMenu iconSize={iconSize} />
        <ShareButton iconSize={iconSize} />

        <IconButton
          aria-label="Change color mode"
          icon={
            colorMode === 'light' ? (
              <IoMoon size={iconSize} />
            ) : (
              <IoSunny size={iconSize} />
            )
          }
          onClick={toggleThemeSetting}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          mr="2rem"
        />
      </HStack>
    </HStack>
  );
}

export default TopNav;
