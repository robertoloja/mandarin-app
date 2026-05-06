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
import PronunciationPreferencesComponent from '@/components/PronunciationPreferencesComponent';
import LanguagePreferencesComponent from '@/components/LanguagePreferencesComponent';
import { useEffect } from 'react';
import PasswordChangeComponent from '../auth/components/PasswordChangeComponent';
import localization from '@/localization/main';

export default function Settings() {
  const router = useRouter();
  const email = useSelector((state: RootState) => state.auth.email);
  const username = useSelector((state: RootState) => state.auth.username);
  const user_language = useSelector((state: RootState) => state.settings.user_language);
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure();

  useEffect(() => {
    document.title = 'mandoBot - Settings';
    if (!username) {
      router.push('/');
    }
  }, []);
  if (!username) return <></>;

  return (
    <VStack>
      <Heading p={5}>{localization.account_settings.settings[user_language]}</Heading>

      <Box
        __css={styles.darkBox[colorMode]}
        p={5}
        m={2}
        minW={['91vw', '30rem']}
      >
        <Box __css={styles.lightBox[colorMode]} p={3} m={2}>
          <Text aria-label="username display">{localization.account_settings.username[user_language]}: {username}</Text>
          <Text aria-label="email display">{localization.account_settings.email[user_language]}: {email}</Text>

          <Text as="u">
            <Link href="" onClick={onToggle} aria-label="change password link">
              {localization.account_settings.change_password[user_language]}
            </Link>
          </Text>

          <Collapse in={isOpen}>
            <PasswordChangeComponent changed={onToggle} user_language={user_language} />
          </Collapse>
        </Box>

        <Text>{localization.account_settings.pronunciation_preferences[user_language]}</Text>

        <Box __css={styles.lightBox[colorMode]} p={3} m={2}>
          <PronunciationPreferencesComponent />
        </Box>

        <Spacer m={5} />

        <Text>{localization.account_settings.user_language[user_language]}</Text>
        <Box __css={styles.lightBox[colorMode]} p={3} m={2}>
          <LanguagePreferencesComponent />
        </Box>

        <Spacer m={5} />

        <Text>{localization.account_settings.color_theme[user_language]}</Text>
        <Box __css={styles.lightBox[colorMode]} p={3} m={2}>
          <Center>
            <HStack>
              <Text>{localization.account_settings.light[user_language]}</Text>
              <Switch
                isChecked={colorMode === 'dark'}
                onChange={toggleColorMode}
              />
              <Text>{localization.account_settings.dark[user_language]}</Text>
            </HStack>
          </Center>
        </Box>

        <Spacer m={5} />

        <Text>{localization.account_settings.account[user_language]}</Text>

        <Spacer m={5} />
        <Box __css={styles.lightBox[colorMode]} p={5} m={2}>
          <Center>
            <Button color="red" disabled>
              {localization.account_settings.delete_account[user_language]}
            </Button>
          </Center>
        </Box>
      </Box>
    </VStack>
  );
}
