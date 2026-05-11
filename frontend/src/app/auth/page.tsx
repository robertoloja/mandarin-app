'use client';

import React, { useState, useEffect } from 'react';
import { login } from '@/utils/store/authSlice';
import { useSelector } from 'react-redux';
import { Box, Input, Text, useToast } from '@chakra-ui/react';
import { RootState, store } from '@/utils/store/store';
import { useRouter } from 'next/navigation';
import PasswordInputComponent from './components/PasswordInputComponent';
import { MandoBotAPI } from '@/utils/api';
import localization from '@/localization/main';
import { FONT_SANS, FONT_SERIF, FONT_SIZE_UI, FONT_SIZE_SUBHEAD } from '@/theme';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgBody" mb={1}>
      {children}
    </Text>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const authState = useSelector((state: RootState) => state.auth);
  const user_language = useSelector((state: RootState) => state.settings.user_language);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const toast = useToast();
  const loc = localization.login_page;

  useEffect(() => {
    document.title = 'mandoBot - Login';
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!username) {
      setUsernameError(true);
      toast({ title: loc.toasts.username_required[user_language], status: 'error', duration: 5000, isClosable: true });
    } else {
      setUsernameError(false);
    }

    if (!password) {
      setPasswordError(true);
      toast({ title: loc.toasts.password_required[user_language], status: 'error', duration: 5000, isClosable: true });
      return;
    } else {
      setPasswordError(false);
    }

    if (!username) return;

    await store.dispatch(login({ username, password }))
      .unwrap()
      .then(() => {
        setSubmitDisabled(true);
        toast({ title: loc.toasts.login_success[user_language], status: 'success', duration: 2000, isClosable: true });
        setTimeout(() => router.push('/settings'), 2000);
      })
      .catch((error: { error: string }) => {
        toast({ title: error?.error ?? 'Login failed', status: 'error', duration: 5000, isClosable: true });
      });
  };

  const handleForgotPassword = async () => {
    if (!username) {
      setUsernameError(true);
      toast({ title: loc.toasts.username_required[user_language], status: 'error', duration: 5000, isClosable: true });
      return;
    }
    setUsernameError(false);
    MandoBotAPI.resetPasswordRequest(username).then(() => {
      toast({ title: loc.toasts.password_reset_sent[user_language], status: 'success', duration: 5000, isClosable: true });
    });
  };

  const isLoading = authState.loading || submitDisabled;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" px={[4, 8]} pt={10} pb={20}>
      <Box maxW="md" w="100%" mb={6}>
        <Text fontFamily={FONT_SERIF} fontSize={FONT_SIZE_SUBHEAD} fontWeight={500} fontStyle="italic" color="fgPrimary">
          {loc.title[user_language]}
        </Text>
      </Box>

      <Box maxW="md" w="100%" border="1px solid" borderColor="borderDefault" borderRadius="12px" bg="bgCanvas" px={[6, 8]} py={6}>
        <form onSubmit={handleLogin}>
          <Box mb={4}>
            <FieldLabel>{loc.username[user_language]}</FieldLabel>
            <Input
              type="text"
              placeholder={loc.username[user_language]}
              value={username}
              onChange={(e) => { setUsername(e.target.value); setUsernameError(false); }}
              fontFamily={FONT_SANS}
              fontSize={FONT_SIZE_UI}
              borderRadius="8px"
              border="1px solid"
              borderColor={usernameError ? 'red.400' : 'borderDefault'}
              bg="bgCanvas"
              _placeholder={{ color: 'fgSubtle', fontFamily: FONT_SANS }}
              _focus={{ borderColor: 'fgSubtle', boxShadow: 'none', outline: 'none' }}
              _hover={{ borderColor: 'borderEmphasis' }}
              aria-label="username input"
            />
          </Box>

          <Box mb={6}>
            <FieldLabel>{loc.password[user_language]}</FieldLabel>
            <PasswordInputComponent
              user_language={user_language}
              invalid={passwordError}
              handlePasswordChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
            />
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={4}>
            <Box
              as="button"
              type="submit"
              disabled={isLoading}
              fontFamily={FONT_SANS}
              fontSize={FONT_SIZE_UI}
              fontWeight={500}
              px={4}
              py="6px"
              borderRadius="6px"
              border="1px solid"
              borderColor="borderEmphasis"
              bg="transparent"
              color={isLoading ? 'fgSubtle' : 'fgBody'}
              cursor={isLoading ? 'not-allowed' : 'pointer'}
              transition="all 0.14s"
              _hover={!isLoading ? { borderColor: 'fgMuted', color: 'fgPrimary' } : undefined}
              aria-label="submit button"
            >
              {isLoading ? loc.logging_in[user_language] : loc.login[user_language]}
            </Box>

            <Text
              fontFamily={FONT_SANS}
              fontSize={FONT_SIZE_UI}
              color="fgMuted"
              cursor="pointer"
              _hover={{ color: 'fgBody', textDecoration: 'underline' }}
              onClick={handleForgotPassword}
              aria-label="forgot password link"
            >
              {loc.forgot_password[user_language]}
            </Text>
          </Box>
        </form>
      </Box>
    </Box>
  );
}
