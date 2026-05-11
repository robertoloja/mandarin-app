'use client';

import React from 'react';
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  HStack,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import {
  IoCloseOutline,
  IoFolderOpenOutline,
  IoHomeOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoLibraryOutline,
  IoInformationCircleOutline,
  IoBugOutline,
  IoSettingsOutline,
} from 'react-icons/io5';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import { MandoBotAPI } from '@/utils/api';
import { useRouter } from 'next/navigation';
import localization from '@/localization/main';
import { FONT_SANS, FONT_SIZE_UI } from '@/theme';

function NavItem({
  href,
  icon,
  label,
  onClick,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      prefetch={!external}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <HStack
        px={3}
        py="7px"
        borderRadius="7px"
        color="fgMuted"
        gap={3}
        _hover={{ bg: 'bgSubtle', color: 'fgBody' }}
        transition="all 0.14s"
      >
        {icon}
        <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI}>
          {label}
        </Text>
      </HStack>
    </Link>
  );
}

function NavPanel(props: { isOpen: boolean; onClose: () => void }) {
  const toast = useToast();
  const router = useRouter();
  const username = useSelector((state: RootState) => state.auth.username);
  const user_language = useSelector((state: RootState) => state.settings.user_language);
  const loc = localization.nav_panel;
  const iconSize = 16;

  const handleAuthClick = (e: React.MouseEvent) => {
    if (username) {
      e.preventDefault();
      MandoBotAPI.logout().then(() => {
        router.push('/');
        toast({ title: 'Logged out', status: 'success', duration: 2000, isClosable: true });
        props.onClose();
      });
    } else {
      props.onClose();
    }
  };

  return (
    <Drawer isOpen={props.isOpen} placement="left" onClose={props.onClose} size="xs" allowPinchZoom>
      <DrawerOverlay />
      <DrawerContent bg="bgCanvas" maxW="220px">
        <DrawerBody px={3} py={4} display="flex" flexDirection="column">
          <Box
            as="button"
            alignSelf="flex-end"
            mb={4}
            onClick={props.onClose}
            color="fgSubtle"
            _hover={{ color: 'fgMuted' }}
            lineHeight={0}
            aria-label="close navigation"
          >
            <IoCloseOutline size={20} />
          </Box>

          <VStack spacing={0} align="stretch">
            {username && (
              <NavItem
                href="/settings"
                icon={<IoSettingsOutline size={iconSize} />}
                label={loc.settings[user_language]}
                onClick={props.onClose}
              />
            )}
            <NavItem
              href="/"
              icon={<IoHomeOutline size={iconSize} />}
              label={loc.home[user_language]}
              onClick={props.onClose}
            />
            <NavItem
              href="/reading"
              icon={<IoLibraryOutline size={iconSize} />}
              label={loc.reading_room[user_language]}
              onClick={props.onClose}
            />
            <NavItem
              href="/history"
              icon={<IoFolderOpenOutline size={iconSize} />}
              label={loc.sentence_history[user_language]}
              onClick={props.onClose}
            />
          </VStack>

          <Box flex={1} />

          <Box borderTop="1px solid" borderColor="borderDefault" my={3} />

          <VStack spacing={0} align="stretch">
            <NavItem
              href="/about"
              icon={<IoInformationCircleOutline size={iconSize} />}
              label={loc.status_about[user_language]}
              onClick={props.onClose}
            />
            <NavItem
              href="https://forms.gle/j89uiVM2xv3CeK7HA"
              icon={<IoBugOutline size={iconSize} />}
              label={loc.report_bug[user_language]}
              external
            />
            <NavItem
              href="/auth"
              icon={username ? <IoLogOutOutline size={iconSize} /> : <IoLogInOutline size={iconSize} />}
              label={username ? loc.logout[user_language] : loc.login[user_language]}
              onClick={handleAuthClick}
            />
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default NavPanel;
