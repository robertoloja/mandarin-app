import React, { useState } from 'react';
import { login } from '@/utils/store/authSlice';
import { useSelector } from 'react-redux';
import { Button, Container, Heading, Input } from '@chakra-ui/react';
import { RootState, store } from '@/utils/store/store';

const LoginForm: React.FC = () => {
  const authState = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const response = await store
      .dispatch(login({ username, password }))
      .unwrap();
    console.log(response);
  };

  return (
    <Container>
      <Heading>Login</Heading>
      <Input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleLogin} disabled={authState.loading}>
        {authState.loading ? 'Logging in...' : 'Login'}
      </Button>
      {authState.error && <p style={{ color: 'red' }}>{authState.error}</p>}
    </Container>
  );
};

export default LoginForm;
