'use client';

import { MandoBotAPI } from '@/utils/api';
import { login } from '@/utils/store/authSlice';
import { store } from '@/utils/store/store';
import {
  Button,
  Center,
  Container,
  Heading,
  HStack,
  Input,
  InputGroup,
  Link,
  ListItem,
  Text,
  UnorderedList,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import PasswordInputComponent from '../PasswordInputComponent';

export default function RegistrationPage() {
  const router = useRouter();
  const [linkError, setLinkError] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState([]);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    MandoBotAPI.register(username, password, email)
      .then(async () => {
        await store.dispatch(login({ username, password })).unwrap();
        setError('');
        setLinkError('');
        setPasswordError([]);

        toast({
          title: 'Account created!',
          description: 'Redirecting you to the user preferences page',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setTimeout(() => {
          router.push('/settings');
        }, 5000);
      })
      .catch((error) => {
        if (error.status === 400) {
          setPasswordError(error.response.data.error);
        } else {
          setError(error.response.data.error);
        }
        setLoading(false);
      });
  };

  const urlRegisterId = useSearchParams().get('register_id') || '';
  useEffect(() => {
    if (urlRegisterId !== '') {
      MandoBotAPI.registerId(urlRegisterId)
        .then((response) => {
          setEmail(response);
        })
        .catch((error) => {
          setLinkError(error.response.data.error);
        });
    }
  }, []);

  return (
    <Container>
      <Heading>Register</Heading>

      <form onSubmit={handleSubmit}>
        <HStack>
          <Text w="7rem" textAlign="right">
            E-mail:
          </Text>
          <InputGroup>
            <Input
              type="text"
              placeholder="E-Mail"
              required
              disabled
              value={email}
            />
          </InputGroup>
        </HStack>

        <HStack>
          <Text w="7rem" textAlign="right">
            Username:
          </Text>
          <InputGroup>
            <Input
              type="text"
              placeholder="Username"
              required
              onChange={handleUsernameChange}
            />
          </InputGroup>
        </HStack>

        <HStack>
          <Text w="7rem" textAlign="right">
            Password:
          </Text>
          <PasswordInputComponent handlePasswordChange={handlePasswordChange} />
        </HStack>

        <Center>
          <Button
            mt="0.5rem"
            type="submit"
            disabled={linkError || loading ? true : false}
          >
            Register
          </Button>
        </Center>
      </form>

      {passwordError && (
        <Center>
          <UnorderedList>
            {passwordError.map((x, i) => (
              <ListItem key={i}>{x}</ListItem>
            ))}
          </UnorderedList>
        </Center>
      )}

      {linkError && (
        <Center>
          <Text textColor="red" mt="1rem">
            {linkError}
          </Text>
        </Center>
      )}

      {error && (
        <Center mt="1rem">
          <VStack>
            <Text ml="1.5rem">A user with this e-mail already exists.</Text>
            <Text as="u">
              If you have forgotten your password,{' '}
              <Link>click here to reset it</Link>.
            </Text>
          </VStack>
        </Center>
      )}
    </Container>
  );
}
