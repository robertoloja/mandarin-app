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
import { useEffect } from 'react';
import Link from 'next/link';
import styles from '../../themes';
import LanguagePreferencesComponent from '@/components/LanguagePreferencesComponent';

export default function Settings() {
  const router = useRouter();
  const username = useSelector((state: RootState) => state.auth.username);
  const email = useSelector((state: RootState) => state.auth.email);
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (!username) {
      router.push('/');
    }
  });

  if (!username) {
    return <></>;
  }

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
        <Text>User Information</Text>
        <Box __css={styles.lightBox[colorMode]} p={3} m={2}>
          <Text>Username: {username}</Text>
          <Text>E-mail: {email}</Text>
          <Text>
            <Link href="">
              <u>Change Password</u>
            </Link>
          </Text>
        </Box>

        <Spacer m={5} />

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
              <Switch />
              <Text>Dark</Text>
            </HStack>
          </Center>
        </Box>

        <Spacer m={5} />

        <Text>Account</Text>
        <Box __css={styles.lightBox[colorMode]} p={5} m={2}>
          <Center>
            <Button color="red">Permanently Delete</Button>
          </Center>
        </Box>
      </Box>
    </VStack>
  );
}
