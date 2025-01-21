'use client';

import { MandoBotAPI } from '@/utils/api';
import {
  togglePinyin,
  togglePronunciation,
  // toggleTheme,
} from '@/utils/store/settingsSlice';
import { RootState, store } from '@/utils/store/store';
import { Grid, Text, Switch } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function LanguagePreferencesComponent() {
  const localPronunciation = useSelector(
    (state: RootState) => state.settings.pronunciation,
  );
  const localPinyinType = useSelector(
    (state: RootState) => state.settings.pinyin_type,
  );
  const username = useSelector((state: RootState) => state.auth.username);
  // const localTheme = useSelector((state: RootState) => state.settings.theme);

  useEffect(() => {
    console.log('localPronunciation updated:', localPronunciation);
    if (username) {
      MandoBotAPI.pronunciationPreference(
        localPronunciation === 'zhuyin' ? 'zhuyin' : localPinyinType,
      );
    }
  }, [localPronunciation]);

  useEffect(() => {
    if (username) {
      MandoBotAPI.pronunciationPreference(localPinyinType);
    }
  }, [localPinyinType]);

  // const toggleThem = () => {
  //   if (!username) {
  //     store.dispatch(toggleTheme());
  //   } else {
  //     MandoBotAPI.themePreference(localTheme === 'light' ? 1 : 0);
  //   }
  // };

  return (
    <Grid templateColumns="1fr auto 1fr" gap={2} alignItems="center">
      <Text align="right">
        {localPinyinType === 'pinyin_acc' ? 'pīnyīn' : 'pin1yin1'}
      </Text>
      <Switch
        onChange={() => {
          store.dispatch(togglePronunciation());
        }}
        isChecked={localPronunciation === 'zhuyin'}
      />
      <Text>ㄅㄆㄇㄈ</Text>

      {localPronunciation == 'pinyin' && (
        <>
          <Text align="right">pīnyīn</Text>
          <Switch
            onChange={() => {
              store.dispatch(togglePinyin());
            }}
            isChecked={localPinyinType === 'pinyin_num'}
          />
          <Text>pin1yin1</Text>
        </>
      )}
    </Grid>
  );
}
