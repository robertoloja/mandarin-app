'use client';

import {
  Button,
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
  ListItem,
  Text,
  UnorderedList,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import PasswordInputComponent from '../PasswordInputComponent';
import { useState } from 'react';
import { MandoBotAPI } from '@/utils/api';
import { store } from '@/utils/store/store';
import { login } from '@/utils/store/authSlice';

export default function PasswordResetPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const urlPasswordToken = useSearchParams().get('token') || '';

  if (urlPasswordToken === '') {
    router.push('/');
    return <></>;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrors([]);

    if (newPassword.length < 8) {
      setInvalid(true);
      toast({
        title: 'New password must be at least 8 characters long',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setTimeout(() => {
        setInvalid(false);
      }, 5000);
      return;
    }
    if (newPassword !== confirmation) {
      setInvalid(true);
      toast({
        title: 'Passwords do not match',
        description: 'New password and password confirmation must match',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setTimeout(() => {
        setInvalid(false);
      }, 5000);
      return;
    }
    setLoading(true);
    MandoBotAPI.resetPassword(urlPasswordToken, newPassword, confirmation)
      .then((response) => {
        toast({
          title: 'Password changed successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setTimeout(async () => {
          const username = response.message;
          const password = newPassword;
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
        }, 3000);
      })
      .catch((error) => {
        setLoading(false);
        setErrors(error.response.data.error);
        toast({
          title: 'Failed to change password',
          description: errors.join('\n'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };

  return (
    <Container>
      <Heading>Reset Password</Heading>
      <form onSubmit={handleSubmit}>
        <Grid
          templateColumns={{ base: '1fr', md: '1fr 2fr' }}
          mt={2}
          p={2}
          gap={2}
          width="100%"
        >
          <GridItem colSpan={1} pt={2}>
            <Text>New Password: </Text>
          </GridItem>
          <PasswordInputComponent
            placeHolderText="Enter new password"
            handlePasswordChange={(e) => setNewPassword(e.target.value)}
            invalid={invalid}
          />

          <GridItem colSpan={1} pt={2}>
            <Text>Confirm New Password: </Text>
          </GridItem>
          <PasswordInputComponent
            placeHolderText="Confirm new password"
            handlePasswordChange={(e) => setConfirmation(e.target.value)}
            invalid={invalid}
          />
        </Grid>

        <Center my={4}>
          <VStack>
            <Button
              type="submit"
              disabled={!newPassword || !confirmation || loading}
            >
              Reset Password
            </Button>
            {errors.length > 0 && (
              <UnorderedList>
                <ListItem>{errors}</ListItem>
              </UnorderedList>
            )}
          </VStack>
        </Center>
      </form>
    </Container>
  );
}
