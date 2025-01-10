'use client';

import { Flex } from '@chakra-ui/react';
import Word from './Word';
import { SegmentResponseType } from '@/utils/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';

function MandarinSentence(props: SegmentResponseType) {
  const pronunciation = useSelector(
    (state: RootState) => state.settings.pronunciation,
  );
  return (
    <Flex
      align="stretch"
      w="100%"
      h="100%"
      px={['0', '5%']}
      flexWrap="wrap"
      mb={['45vh', '20vh']}
      overflow="hidden"
    >
      {props.sentence.map((word, index) => (
        <Word
          word={word}
          pronunciation={pronunciation == 'pinyin' ? word.pinyin : word.zhuyin}
          definitions={word.definitions}
          dictionary={props.dictionary}
          key={index}
        />
      ))}
    </Flex>
  );
}

export default MandarinSentence;
