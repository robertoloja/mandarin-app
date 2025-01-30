'use client';

import { RootState } from '@/utils/store/store';
import { useSelector } from 'react-redux';
import {
  Box,
  Text,
  Button,
  Center,
  Heading,
  VStack,
  HStack,
  Switch,
  Spacer,
  useColorMode,
  useDisclosure,
  Collapse,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../themes';
import LanguagePreferencesComponent from '@/components/LanguagePreferencesComponent';
import { useEffect } from 'react';
import PasswordChangeComponent from '../auth/components/PasswordChangeComponent';

export default function Settings() {
  const router = useRouter();
  const email = useSelector((state: RootState) => state.auth.email);
  const username = useSelector((state: RootState) => state.auth.username);
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure();

  useEffect(() => {
    // TODO: This is triggering when the user is logged in
    if (!username) {
      router.push('/');
    }
  }, []);
  if (!username) return <></>;

  return (
    <VStack>
      <Heading p={5}>Settings</Heading>

      <Box
        __css={styles.darkBox[colorMode]}
        p={5}
        m={2}
        minW={['91vw', '30rem']}
      >
        <Box __css={styles.lightBox[colorMode]} p={3} m={2}>
          <Text>Username: {username}</Text>
          <Text>E-mail: {email}</Text>
          <Text as="u">
            <Link href="" onClick={onToggle}>
              Change Password
            </Link>
          </Text>
          <Collapse in={isOpen}>
            <PasswordChangeComponent changed={onToggle} />
          </Collapse>
        </Box>
        <Text>Pronunciation Preferences</Text>
        <Box __css={styles.lightBox[colorMode]} p={3} m={2}>
          <LanguagePreferencesComponent />
        </Box>

        <Spacer m={5} />

        <Text>Color Theme Preferences</Text>
        <Box __css={styles.lightBox[colorMode]} p={3} m={2}>
          <Center>
            <HStack>
              <Text>Light</Text>
              <Switch
                isChecked={colorMode === 'dark'}
                onChange={toggleColorMode}
              />
              <Text>Dark</Text>
            </HStack>
          </Center>
        </Box>

        <Spacer m={5} />

        <Text>Account</Text>

        <Spacer m={5} />
        <Box __css={styles.lightBox[colorMode]} p={5} m={2}>
          <Center>
            <Button color="red" disabled>
              Delete Account
            </Button>
          </Center>
        </Box>
      </Box>
    </VStack>
  );
}
