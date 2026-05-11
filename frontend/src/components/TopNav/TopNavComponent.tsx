'use client';

import React, { useEffect } from 'react';
import {
  useDisclosure,
  IconButton,
  HStack,
  Box,
  useColorMode,
} from '@chakra-ui/react';

import { IoMenuOutline, IoHomeOutline, IoSunny, IoSunnyOutline, IoMoon, IoMoonOutline } from 'react-icons/io5';

import NavPanel from '../NavPanelComponent';
import ShareButton from '../ShareButtonComponent';
import ErrorButton from './ErrorButtonComponent';
import Link from 'next/link';
import { RootState, store } from '@/utils/store/store';
import { useSelector } from 'react-redux';
import { toggleTheme } from '@/utils/store/settingsSlice';
import { usePathname } from 'next/navigation';
import BackToTop from './BackToTopComponent';
import TextMenuButton from './TextMenuComponent';
import LanguagePreferenceMenuButton from './LanguagePreferenceMenuComponent';
import TableOfContentsButton from './TableOfContentsButton';
import ReadingModeToggle from './ReadingModeToggle';

function NavDivider() {
  return <Box w="1px" h="22px" bg="borderDefault" flexShrink={0} />;
}

function ThemeControl({ theme, onToggle }: { theme: string; onToggle: () => void }) {
  const items = [
    { v: 'light', filled: <IoSunny size={13} />, outline: <IoSunnyOutline size={13} /> },
    { v: 'dark', filled: <IoMoon size={13} />, outline: <IoMoonOutline size={13} /> },
  ];
  return (
    <Box
      display="inline-flex"
      bg="bgSubtle"
      border="1px solid"
      borderColor="borderDefault"
      borderRadius="7px"
      p="2px"
      gap="1px"
    >
      {items.map((it) => {
        const isActive = theme === it.v;
        return (
          <Box
            key={it.v}
            as="button"
            w="26px"
            h="22px"
            border="none"
            borderRadius="5px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={isActive ? 'bgActive' : 'transparent'}
            color={isActive ? 'fgPrimary' : 'fgSubtle'}
            cursor="pointer"
            onClick={() => { if (!isActive) onToggle(); }}
          >
            {isActive ? it.filled : it.outline}
          </Box>
        );
      })}
    </Box>
  );
}


function TopNav() {
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  const toggleThemeSetting = () => {
    store.dispatch(toggleTheme());
    toggleColorMode();
  };
  const theme = useSelector((state: RootState) => state.settings.theme);
  const shareLink = useSelector((state: RootState) => state.sentence.shareLink);
  const hasSegments = useSelector(
    (state: RootState) => state.sentence.mandarinSentence.segments.length > 0,
  );
  useEffect(() => {
    if (theme === 'light' && colorMode === 'dark') toggleColorMode();
    if (theme === 'dark' && colorMode === 'light') toggleColorMode();
  }, []);

  const iconSize = 20;
  const iconBtnProps = {
    bg: 'bgSubtle' as const,
    border: '1px solid',
    borderColor: 'borderDefault',
    h: '30px',
    minW: '30px',
    _hover: { borderColor: 'borderEmphasis' },
  };

  return (
    <HStack
      justifyContent="space-between"
      borderBottom="1px solid"
      borderColor="borderDefault"
      position="sticky"
      top="0"
      zIndex="100"
      w="100%"
      h="52px"
      px={4}
      gap={2}
      backgroundColor="bgCanvas"
    >
      <HStack gap={2} flexShrink={0}>
        <NavPanel isOpen={isOpen} onClose={onClose} />
        <IconButton
          aria-label="Open navigation"
          icon={<IoMenuOutline size={iconSize + 4} />}
          onClick={onOpen}
          {...iconBtnProps}
        />
        {pathname !== '/' && (
          <Link href="/" prefetch={true}>
            <IconButton
              aria-label="Go home"
              icon={<IoHomeOutline size={iconSize} />}
              {...iconBtnProps}
            />
          </Link>
        )}
      </HStack>

      <HStack gap={2} flexShrink={0} ml="auto">
        <ErrorButton iconSize={iconSize} />

        {pathname === '/' && hasSegments && (
          <>
            <BackToTop iconSize={iconSize} />
            <TextMenuButton />
            {shareLink !== '' && <ShareButton iconSize={iconSize} />}
          </>
        )}

        {pathname.includes('/reading/') && (
          <>
            <ReadingModeToggle />
            <NavDivider />
            <BackToTop iconSize={iconSize} />
            <TextMenuButton />
          </>
        )}

        <NavDivider />
        <LanguagePreferenceMenuButton iconSize={iconSize} />
        <NavDivider />
        <ThemeControl theme={theme} onToggle={toggleThemeSetting} />

        {pathname.includes('/reading/') && (
          <TableOfContentsButton iconSize={iconSize} />
        )}
      </HStack>
    </HStack>
  );
}

export default TopNav;
