'use client';

import { Box, Text, useToast } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import PasswordInputComponent from '../components/PasswordInputComponent';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, store } from '@/utils/store/store';
import { MandoBotAPI } from '@/utils/api';
import { login } from '@/utils/store/authSlice';
import localization from '@/localization/main';
import { FONT_SANS, FONT_SERIF, FONT_SIZE_UI, FONT_SIZE_SUBHEAD } from '@/theme';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgBody" mb={1}>
      {children}
    </Text>
  );
}

export default function PasswordResetPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const urlPasswordToken = useSearchParams().get('token') || '';
  const user_language = useSelector((state: RootState) => state.settings.user_language);
  const loc = localization.account_settings;

  if (urlPasswordToken === '') {
    router.push('/');
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrors([]);

    if (newPassword.length < 8) {
      setInvalid(true);
      toast({ title: 'New password must be at least 8 characters long', status: 'error', duration: 5000, isClosable: true });
      setTimeout(() => setInvalid(false), 5000);
      return;
    }
    if (newPassword !== confirmation) {
      setInvalid(true);
      toast({ title: 'Passwords do not match', description: 'New password and password confirmation must match', status: 'error', duration: 5000, isClosable: true });
      setTimeout(() => setInvalid(false), 5000);
      return;
    }

    setLoading(true);
    MandoBotAPI.resetPassword(urlPasswordToken, newPassword, confirmation)
      .then((response) => {
        toast({ title: 'Password changed successfully!', status: 'success', duration: 3000, isClosable: true });
        setTimeout(async () => {
          await store.dispatch(login({ username: response.message, password: newPassword }))
            .unwrap()
            .then(() => router.push('/settings'))
            .catch((error) => toast({ title: error.error, status: 'error', duration: 5000, isClosable: true }));
        }, 3000);
      })
      .catch((error) => {
        setLoading(false);
        setErrors(error.response.data.error);
        toast({ title: 'Failed to change password', status: 'error', duration: 5000, isClosable: true });
      });
  };

  const isDisabled = !newPassword || !confirmation || loading;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" px={[4, 8]} pt={10} pb={20}>
      <Box maxW="md" w="100%" mb={6}>
        <Text fontFamily={FONT_SERIF} fontSize={FONT_SIZE_SUBHEAD} fontWeight={500} fontStyle="italic" color="fgPrimary">
          {loc.reset_password[user_language]}
        </Text>
      </Box>

      <Box maxW="md" w="100%" border="1px solid" borderColor="borderDefault" borderRadius="12px" bg="bgCanvas" px={[6, 8]} py={6}>
        <form onSubmit={handleSubmit}>
          <Box mb={4}>
            <FieldLabel>{loc.new_password[user_language]}</FieldLabel>
            <PasswordInputComponent
              placeHolderText={loc.new_password[user_language]}
              handlePasswordChange={(e) => setNewPassword(e.target.value)}
              invalid={invalid}
              user_language={user_language}
            />
          </Box>

          <Box mb={6}>
            <FieldLabel>{loc.confirmation[user_language]}</FieldLabel>
            <PasswordInputComponent
              placeHolderText={loc.confirmation[user_language]}
              handlePasswordChange={(e) => setConfirmation(e.target.value)}
              invalid={invalid}
              user_language={user_language}
            />
          </Box>

          <Box
            as="button"
            type="submit"
            disabled={isDisabled}
            fontFamily={FONT_SANS}
            fontSize={FONT_SIZE_UI}
            fontWeight={500}
            px={4}
            py="6px"
            borderRadius="6px"
            border="1px solid"
            borderColor="borderEmphasis"
            bg="transparent"
            color={isDisabled ? 'fgSubtle' : 'fgBody'}
            cursor={isDisabled ? 'not-allowed' : 'pointer'}
            transition="all 0.14s"
            _hover={!isDisabled ? { borderColor: 'fgMuted', color: 'fgPrimary' } : undefined}
          >
            {loc.reset_password[user_language]}
          </Box>
        </form>

        {errors.length > 0 && (
          <Box mt={4}>
            {errors.map((err, i) => (
              <Text key={i} fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="red.400">
                · {err}
              </Text>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
