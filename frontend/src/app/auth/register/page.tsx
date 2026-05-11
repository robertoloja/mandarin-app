'use client';

import { MandoBotAPI } from '@/utils/api';
import { login } from '@/utils/store/authSlice';
import { RootState, store } from '@/utils/store/store';
import { Box, Input, Text, useToast } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import PasswordInputComponent from '../components/PasswordInputComponent';
import { useSelector } from 'react-redux';
import localization from '@/localization/main';
import { FONT_SANS, FONT_SERIF, FONT_SIZE_UI, FONT_SIZE_SUBHEAD } from '@/theme';
import Link from 'next/link';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgBody" mb={1}>
      {children}
    </Text>
  );
}

export default function RegistrationPage() {
  const router = useRouter();
  const [linkError, setLinkError] = useState('');
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const user_language = useSelector((state: RootState) => state.settings.user_language);
  const toast = useToast();
  const loc = localization.registration_page;

  const urlRegisterId = useSearchParams().get('register_id') || '';
  useEffect(() => {
    if (urlRegisterId !== '') {
      MandoBotAPI.registerId(urlRegisterId)
        .then((response) => setEmail(response))
        .catch((error) => setLinkError(error.response.data.error));
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    MandoBotAPI.register(username, password, email)
      .then(async () => {
        await store.dispatch(login({ username, password })).unwrap();
        setError('');
        setLinkError('');
        setPasswordErrors([]);
        toast({
          title: loc.toasts.account_created.title[user_language],
          description: loc.toasts.account_created.description[user_language],
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setTimeout(() => router.push('/settings'), 5000);
      })
      .catch((error) => {
        if (error.status === 400) {
          setPasswordErrors(error.response.data.error);
        } else {
          setError(error.response.data.error);
        }
        setLoading(false);
      });
  };

  const isDisabled = !!(linkError || loading);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" px={[4, 8]} pt={10} pb={20}>
      <Box maxW="md" w="100%" mb={6}>
        <Text fontFamily={FONT_SERIF} fontSize={FONT_SIZE_SUBHEAD} fontWeight={500} fontStyle="italic" color="fgPrimary">
          {loc.heading[user_language]}
        </Text>
      </Box>

      <Box maxW="md" w="100%" border="1px solid" borderColor="borderDefault" borderRadius="12px" bg="bgCanvas" px={[6, 8]} py={6}>
        <form onSubmit={handleSubmit}>
          <Box mb={4}>
            <FieldLabel>{loc.email[user_language]}</FieldLabel>
            <Input
              type="text"
              placeholder={loc.email[user_language]}
              value={email}
              disabled
              fontFamily={FONT_SANS}
              fontSize={FONT_SIZE_UI}
              borderRadius="8px"
              border="1px solid"
              borderColor="borderDefault"
              bg="bgSubtle"
              color="fgMuted"
              _placeholder={{ color: 'fgSubtle', fontFamily: FONT_SANS }}
              _focus={{ boxShadow: 'none', outline: 'none' }}
            />
          </Box>

          <Box mb={4}>
            <FieldLabel>{loc.username[user_language]}</FieldLabel>
            <Input
              type="text"
              placeholder={loc.username[user_language]}
              required
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              fontFamily={FONT_SANS}
              fontSize={FONT_SIZE_UI}
              borderRadius="8px"
              border="1px solid"
              borderColor="borderDefault"
              bg="bgCanvas"
              _placeholder={{ color: 'fgSubtle', fontFamily: FONT_SANS }}
              _focus={{ borderColor: 'fgSubtle', boxShadow: 'none', outline: 'none' }}
              _hover={{ borderColor: 'borderEmphasis' }}
            />
          </Box>

          <Box mb={6}>
            <FieldLabel>{loc.password[user_language]}</FieldLabel>
            <PasswordInputComponent
              handlePasswordChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
            {loc.register[user_language]}
          </Box>
        </form>

        {passwordErrors.length > 0 && (
          <Box mt={4}>
            {passwordErrors.map((err, i) => (
              <Text key={i} fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="red.400">
                · {err}
              </Text>
            ))}
          </Box>
        )}

        {linkError && (
          <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="red.400" mt={4}>
            {linkError}
          </Text>
        )}

        {error && (
          <Box mt={4}>
            <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgBody">
              {loc.user_already_exists[user_language]}
            </Text>
            <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgBody" mt={1}>
              {loc.forgot_password[1][user_language]}{' '}
              <Link href="/auth/password_reset">
                <Text as="span" color="fgLink" _hover={{ textDecoration: 'underline' }}>
                  {loc.forgot_password.link[user_language]}
                </Text>
              </Link>
              .
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
