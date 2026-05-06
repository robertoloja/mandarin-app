'use client';

import React, { useState, useEffect } from 'react';
import { login } from '@/utils/store/authSlice';
import { useSelector } from 'react-redux';
import {
  Button,
  Center,
  Container,
  Heading,
  HStack,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import { RootState, store } from '@/utils/store/store';
import { useRouter } from 'next/navigation';
import PasswordInputComponent from './components/PasswordInputComponent';
import { MandoBotAPI } from '@/utils/api';
import localization from '@/localization/main';

export default function LoginPage() {
  const router = useRouter();
  const authState = useSelector((state: RootState) => state.auth);
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const toast = useToast();

  useEffect(() => {
    document.title = 'mandoBot - Login';
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!username) {
      setUsernameError(true);
      toast({
        title: 'Username is required',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else {
      setUsernameError(false);
    }

    if (!password) {
      setPasswordError(true);
      toast({
        title: 'Password is required',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    } else {
      setPasswordError(false);
    }
    if (!username) return;

    await store
      .dispatch(login({ username, password }))
      .unwrap()
      .then(() => {
        setSubmitDisabled(true);
        toast({
          title: 'Successfully Logged in!',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        setTimeout(() => router.push('/settings'), 2000);
      })
      .catch((error: { error: string }) => {
        toast({
          title: error?.error ?? 'Login failed',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const handleForgotPassword = async () => {
    if (!username) {
      setUsernameError(true);
      toast({
        title: 'Username is required',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    } else {
      setUsernameError(false);
    }
    MandoBotAPI.resetPasswordRequest(username).then(() => {
      toast({
        title: 'Password reset e-mail will be sent.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    });
  };

  return (
    <Container>
      <Heading>{localization.login_page.login[user_language]}</Heading>
      <form onSubmit={handleLogin}>
        <Input
          type="text"
          placeholder={localization.login_page.username[user_language]}
          value={username}
          border={usernameError ? '1px solid red' : undefined}
          onChange={(e) => {
            setUsername(e.target.value);
            setUsernameError(false);
          }}
          mb={2}
          aria-label="username input"
        />
        <PasswordInputComponent
          user_language={user_language}
          invalid={passwordError || false}
          handlePasswordChange={(e) => {
            setPassword(e.target.value);
            setPasswordError(false);
          }}
        />
        <Center mt={2}>
          <HStack justifyContent="space-between" w="100%">
            <Button
              disabled={authState.loading || submitDisabled}
              type="submit"
              aria-label="submit button"
            >
              {authState.loading
                ? localization.login_page.logging_in[user_language]
                : localization.login_page.login[user_language]}
            </Button>

            {/* This is wrong; demand username and make API request to /api/accounts/reset_password_request */}
            <Text
              _hover={{ textDecor: 'underline' }}
              cursor="pointer"
              onClick={handleForgotPassword}
              aria-label="forgot password link"
            >
              {localization.login_page.forgot_password[user_language]}
            </Text>
          </HStack>
        </Center>
      </form>
    </Container>
  );
}
