'use client';

import { MandoBotAPI } from '@/utils/api';
import { setUserLanguage } from '@/utils/store/settingsSlice';
import { RootState, store } from '@/utils/store/store';
import { Select } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import localization, { UserLanguage } from '@/localization/main';

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
    <Select
      value={user_language}
      onChange={(e) => handleLanguageChange(e.target.value as UserLanguage)}
      aria-label="select language preference"
    >
      {localization.languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label[user_language as UserLanguage]}
        </option>
      ))}
    </Select>
  );
}
