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
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../themes';
import LanguagePreferencesComponent from '@/components/LanguagePreferencesComponent';
import { useEffect, useState } from 'react';
import PasswordChangeComponent from '../auth/PasswordChangeComponent';

export default function Settings() {
  const router = useRouter();
  const email = useSelector((state: RootState) => state.auth.email);
  const username = useSelector((state: RootState) => state.auth.username);
  const [changePassword, showChangePassword] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();

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
        w="auto"
        minW={['80vw', '30rem']}
      >
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
        <Box __css={styles.lightBox[colorMode]} p={3} m={2}>
          <Text>Username: {username}</Text>
          <Text>E-mail: {email}</Text>
          <Text as="u">
            <Link href="" onClick={() => showChangePassword(!changePassword)}>
              Change Password
            </Link>
          </Text>
          {changePassword && (
            <PasswordChangeComponent
              changed={() => {
                showChangePassword(false);
              }}
            />
          )}
        </Box>

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
