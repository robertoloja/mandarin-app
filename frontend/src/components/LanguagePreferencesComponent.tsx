'use client';

import { MandoBotAPI } from '@/utils/api';
import { setUserLanguage } from '@/utils/store/settingsSlice';
import { RootState, store } from '@/utils/store/store';
import { Box, useColorMode } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import localization, { UserLanguage } from '@/localization/main';

export default function LanguagePreferencesComponent() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );
  const username = useSelector((state: RootState) => state.auth.username);

  const handleLanguageChange = (newLanguage: UserLanguage) => {
    localStorage.setItem('user_language', newLanguage);
    if (username) {
      MandoBotAPI.languagePreference(newLanguage).then(() => {
        store.dispatch(setUserLanguage(newLanguage));
      });
    } else {
      store.dispatch(setUserLanguage(newLanguage));
    }
  };

  return (
    <Box
      display="inline-flex"
      borderRadius="7px"
      border="1px solid"
      borderColor={isDark ? 'gray.700' : 'gray.200'}
      bg={isDark ? 'gray.800' : 'gray.100'}
      p="2px"
      gap="1px"
      aria-label="select language preference"
    >
      {localization.languages.map((lang) => {
        const isActive = user_language === lang.code;
        return (
          <Box
            key={lang.code}
            as="button"
            onClick={() => handleLanguageChange(lang.code as UserLanguage)}
            fontFamily='"IBM Plex Sans", sans-serif'
            fontSize="12px"
            fontWeight={isActive ? 600 : 400}
            px={3}
            py="4px"
            border="none"
            borderRadius="5px"
            bg={isActive ? (isDark ? 'gray.700' : 'white') : 'transparent'}
            color={
              isActive
                ? isDark
                  ? 'white'
                  : 'gray.800'
                : isDark
                  ? 'gray.400'
                  : 'gray.500'
            }
            cursor="pointer"
            transition="all 0.14s"
            boxShadow={isActive ? 'sm' : 'none'}
          >
            {lang.label[lang.code as keyof typeof lang.label]}
          </Box>
        );
      })}
    </Box>
  );
}
