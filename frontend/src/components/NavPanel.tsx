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
  Link as CLink,
  Spacer,
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
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';

function NavPanel(props: { isOpen: boolean; onClose: () => void }) {
  const pathName = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <Drawer
      isOpen={props.isOpen}
      placement="left"
      onClose={props.onClose}
      size="xs"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />

        <DrawerBody ml="-4rem">
          <VStack
            spacing="2rem"
            marginTop="6rem"
            marginLeft="7.4rem"
            alignItems="left"
          >
            <Link href="/" passHref onClick={props.onClose} prefetch={true}>
              <CLink>
                <HStack>
                  <IoHomeOutline size="22" />
                  <Text>Home</Text>
                </HStack>
              </CLink>
            </Link>

            <Link
              href="/history"
              passHref
              onClick={props.onClose}
              prefetch={true}
            >
              <CLink>
                <HStack>
                  <IoFolderOpenOutline size="22" />
                  <Text>Sentence History</Text>
                </HStack>
              </CLink>
            </Link>

            <Link
              href="/reading"
              passHref
              onClick={props.onClose}
              prefetch={true}
            >
              <CLink>
                <HStack>
                  <IoLibraryOutline size="22" />
                  <Text>Reading Room</Text>
                </HStack>
              </CLink>
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
              <CLink>
                <HStack>
                  <IoInformationCircleOutline size="22" />
                  <Text>About</Text>
                </HStack>
              </CLink>
            </Link>

            <Link href="/auth" passHref onClick={props.onClose}>
              <CLink>
                <HStack>
                  {user ? (
                    <IoLogOutOutline size="22" />
                  ) : (
                    <IoLogInOutline size="22" />
                  )}
                  <Text>{user ? 'Log Out' : 'Log In'}</Text>
                </HStack>
              </CLink>
            </Link>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default NavPanel;
