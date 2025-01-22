'use client';

import { MandoBotAPI } from '@/utils/api';
import {
  togglePinyin,
  togglePronunciation,
  // toggleTheme,
} from '@/utils/store/settingsSlice';
import { RootState, store } from '@/utils/store/store';
import { Grid, Text, Switch } from '@chakra-ui/react';
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

  const togglePronun = () => {
    if (username) {
      MandoBotAPI.pronunciationPreference(
        localPronunciation === 'zhuyin' ? localPinyinType : 'zhuyin',
      ).then(() => {
        store.dispatch(togglePronunciation());
      });
    } else {
      store.dispatch(togglePronunciation());
    }
  };

  const togglePin = () => {
    if (username) {
      MandoBotAPI.pronunciationPreference(
        localPinyinType === 'pinyin_acc' ? 'pinyin_num' : 'pinyin_acc',
      ).then(() => {
        store.dispatch(togglePinyin());
      });
    } else {
      store.dispatch(togglePinyin());
    }
  };

  return (
    <Grid templateColumns="1fr auto 1fr" gap={2} alignItems="center">
      <Text align="right">
        {localPinyinType === 'pinyin_acc' ? 'pīnyīn' : 'pin1yin1'}
      </Text>
      <Switch
        onChange={togglePronun}
        isChecked={localPronunciation === 'zhuyin'}
      />
      <Text>ㄅㄆㄇㄈ</Text>

      {localPronunciation == 'pinyin' && (
        <>
          <Text align="right">pīnyīn</Text>
          <Switch
            onChange={togglePin}
            isChecked={localPinyinType === 'pinyin_num'}
          />
          <Text>pin1yin1</Text>
        </>
      )}
    </Grid>
  );
}
