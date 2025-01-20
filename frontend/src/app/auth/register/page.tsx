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
  InputRightElement,
  Link,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefObject, useEffect, useRef, useState } from 'react';

export default function RegistrationPage() {
  const router = useRouter();
  const passwordRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const [linkError, setLinkError] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (passwordRef.current && usernameRef.current) {
      setUsername(usernameRef.current.value);
      setPassword(passwordRef.current.value);

      setLoading(true);
      console.log(`${username}, ${email}`);
      MandoBotAPI.register(username, password, email)
        .then(async () => {
          await store.dispatch(login({ username, password })).unwrap();

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
          setError(error.response.data.error);
        });
    }
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
              ref={usernameRef}
            />
          </InputGroup>
        </HStack>

        <HStack>
          <Text w="7rem" textAlign="right">
            Password:
          </Text>
          <PasswordInput passwordRef={passwordRef} />
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
            <Text>
              If you have forgotten your password,{' '}
              <Link>
                <u>click here to reset it</u> {/* TODO */}
              </Link>
              .
            </Text>
          </VStack>
        </Center>
      )}
    </Container>
  );
}

function PasswordInput(props: {
  passwordRef: RefObject<HTMLInputElement | null>;
}) {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  return (
    <InputGroup>
      <Input
        pr="4.5rem"
        type={show ? 'text' : 'password'}
        placeholder="Enter password"
        ref={props.passwordRef}
      />
      <InputRightElement width="4.5rem">
        <Button h="1.75rem" size="sm" onClick={handleClick}>
          {show ? 'Hide' : 'Show'}
        </Button>
      </InputRightElement>
    </InputGroup>
  );
}
