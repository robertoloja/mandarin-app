'use client';

import { MandoBotAPI } from '@/utils/api';
import { setUserLanguage } from '@/utils/store/settingsSlice';
import { RootState, store } from '@/utils/store/store';
import { Box } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import localization, { UserLanguage } from '@/localization/main';
import { FONT_SANS, FONT_SIZE_SMALL } from '@/theme';

export default function LanguagePreferencesComponent() {
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
      borderColor="borderDefault"
      bg="bgSubtle"
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
            fontFamily={FONT_SANS}
            fontSize={FONT_SIZE_SMALL}
            fontWeight={isActive ? 600 : 400}
            px={3}
            py="4px"
            border="none"
            borderRadius="5px"
            bg={isActive ? 'bgActive' : 'transparent'}
            color={isActive ? 'fgPrimary' : 'fgMuted'}
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
