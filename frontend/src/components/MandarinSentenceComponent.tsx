'use client';

import { Flex } from '@chakra-ui/react';
import Word from './WordComponent';
import { MandarinWordType, ChineseDictionary } from '@/utils/types';
import { UserLanguage } from '@/localization/main';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';

interface MandarinSentenceProps {
  sentence: MandarinWordType[];
  dictionary: ChineseDictionary;
  user_language: UserLanguage;
}

function MandarinSentence(props: MandarinSentenceProps) {
  const pronunciation = useSelector(
    (state: RootState) => state.settings.pronunciation,
  );
  const height = useSelector(
    (state: RootState) => state.sentence.translationPanelHeight,
  );

  return (
    <Flex
      align="stretch"
      w="100%"
      h="100%"
      px={['0', '5%']}
      flexWrap="wrap"
      mb={`${height}px`}
      overflow="hidden"
      aria-label="mandarin sentence"
    >
      {props.sentence.map((word, index) => (
        <Word
          word={word}
          pronunciation={pronunciation == 'pinyin' ? word.pinyin : word.zhuyin}
          definitions={word.definitions[props.user_language]}
          user_language={props.user_language}
          dictionary={props.dictionary}
          key={index}
        />
      ))}
    </Flex>
  );
}

export default MandarinSentence;
