'use client';

import { Flex } from '@chakra-ui/react';
import Word from './WordComponent';
import { SegmentResponseType } from '@/utils/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';

function MandarinSentence(props: SegmentResponseType) {
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
          definitions={word.definitions}
          key={index}
        />
      ))}
    </Flex>
  );
}

export default MandarinSentence;
