'use client';

import {
  Button,
  Center,
  Grid,
  GridItem,
  ListItem,
  Text,
  UnorderedList,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { MandoBotAPI } from '@/utils/api';
import { RootState } from '@/utils/store/store';
import { useSelector } from 'react-redux';
import PasswordInputComponent from './PasswordInputComponent';

export default function PasswordResetForm(props: { changed: () => void }) {
  const username = useSelector((state: RootState) => state.auth.username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [errors, setErrors] = useState([]);
  const toast = useToast();

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
    if (username) {
      setLoading(true);
      MandoBotAPI.changePassword(
        username,
        currentPassword,
        newPassword,
        confirmation,
      )
        .then(() => {
          setLoading(false);
          toast({
            title: 'Password changed successfully!',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          props.changed();
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
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid
        templateColumns={{ base: '1fr', md: '1fr 2fr' }}
        mt={2}
        p={2}
        gap={2}
      >
        <GridItem colSpan={1} pt={2}>
          <Text>Current Password:</Text>
        </GridItem>
        <PasswordInputComponent
          placeHolderText="Enter current password"
          handlePasswordChange={(e) => setCurrentPassword(e.target.value)}
        />

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
            disabled={
              !currentPassword || !newPassword || !confirmation || loading
            }
          >
            Reset Password
          </Button>
          {errors && (
            <UnorderedList>
              {errors.map((error, i) => (
                <ListItem key={i}>{error}</ListItem>
              ))}
            </UnorderedList>
          )}
        </VStack>
      </Center>
    </form>
  );
}
