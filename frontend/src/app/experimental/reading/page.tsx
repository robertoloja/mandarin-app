'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Flex } from '@chakra-ui/react';
import MandarinSentence from '@/components/MandarinSentenceComponent';
import Translation from '@/components/TranslationComponent';
import { appendToMandarinDictionary } from '@/utils/store/mandarinSentenceSlice';
import chapterData from './two_brothers.json';
import { RootState } from '@/utils/store/store';

export default function ExperimentalReadingPage() {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );

  useEffect(() => {
    dispatch(appendToMandarinDictionary(chapterData.dictionary));
    setReady(true);
  }, [dispatch]);

  return (
    <Flex direction="column" w="100%" h="100%" p={4}>
      {ready && (
        <MandarinSentence
          user_language={user_language}
          sentence={chapterData.sentence}
          dictionary={chapterData.dictionary}
          translation={chapterData.translation[user_language]}
        />
      )}
      <Translation text={chapterData.translation[user_language]} />
    </Flex>
  );
}
