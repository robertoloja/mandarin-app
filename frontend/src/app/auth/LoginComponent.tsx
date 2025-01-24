'use client';

import React, { useState } from 'react';
import { login } from '@/utils/store/authSlice';
import { useSelector } from 'react-redux';
import { Button, Container, Heading, Input, useToast } from '@chakra-ui/react';
import { RootState, store } from '@/utils/store/store';
import { useRouter } from 'next/navigation';
import PasswordInputComponent from './PasswordInputComponent';

export default function LoginForm() {
  const router = useRouter();
  const authState = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    await store
      .dispatch(login({ username, password }))
      .unwrap()
      .then(() => {
        router.push('/settings');
      })
      .catch((error) => {
        toast({
          title: error.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };

  return (
    <Container>
      <Heading>Login</Heading>
      <form onSubmit={handleLogin}>
        <Input
          type="text"
          placeholder="Username"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
        />
        <PasswordInputComponent
          handlePasswordChange={(e) => setPassword(e.target.value)}
        />
        <Button disabled={authState.loading} type="submit">
          {authState.loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </Container>
  );
}
