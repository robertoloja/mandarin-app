'use client';

import React, { useState } from 'react';
import { login } from '@/utils/store/authSlice';
import { useSelector } from 'react-redux';
import { Button, Container, Heading, Input } from '@chakra-ui/react';
import { RootState, store } from '@/utils/store/store';
import { useRouter } from 'next/navigation';
import { PasswordInput } from './register/page';

export default function LoginForm() {
  const router = useRouter();
  const authState = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    await store
      .dispatch(login({ username, password }))
      .unwrap()
      .then(() => {
        router.push('/settings');
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
        <PasswordInput
          handlePasswordChange={(e) => setPassword(e.target.value)}
        />
        <Button disabled={authState.loading} type="submit">
          {authState.loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      {authState.error && <p style={{ color: 'red' }}>{authState.error}</p>}
    </Container>
  );
}
