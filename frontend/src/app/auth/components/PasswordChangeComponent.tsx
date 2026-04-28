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
import localization, { UserLanguage } from '@/localization/main';

export default function PasswordResetForm(props: { changed: () => void, user_language: UserLanguage }) {
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
        width="100%"
      >
        <GridItem colSpan={1} pt={2}>
          <Text>{localization.account_settings.current_password[props.user_language]}:</Text>
        </GridItem>
        <PasswordInputComponent
          placeHolderText={localization.account_settings.current_password[props.user_language]}
          handlePasswordChange={(e) => setCurrentPassword(e.target.value)}
          user_language={props.user_language}
        />

        <GridItem colSpan={1} pt={2}>
          <Text>{localization.account_settings.new_password[props.user_language]}:</Text>
        </GridItem>
        <PasswordInputComponent
          placeHolderText={localization.account_settings.new_password[props.user_language]}
          handlePasswordChange={(e) => setNewPassword(e.target.value)}
          invalid={invalid}
          user_language={props.user_language}
        />

        <GridItem colSpan={1} pt={2}>
          <Text>{localization.account_settings.confirmation[props.user_language]}:</Text>
        </GridItem>
        <PasswordInputComponent
          placeHolderText={localization.account_settings.confirmation[props.user_language]}
          handlePasswordChange={(e) => setConfirmation(e.target.value)}
          invalid={invalid}
          user_language={props.user_language}
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
            {localization.account_settings.reset_password[props.user_language]}
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
