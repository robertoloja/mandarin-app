'use client'

// import { useState } from 'react';
import { Flex } from '@chakra-ui/react';
import Word from './Word';
import { MandarinSentenceType } from '@/utils/types';


function MandarinSentence(props: MandarinSentenceType) {
  return (
    <Flex
      align="stretch"
      w='100%'
      h='100%'
      px={['0', '5%']}
      flexWrap="wrap"
      mb={["45vh", "20vh"]}
      overflow="hidden"
    >
      {props.sentence.map((word, index) =>
        <Word
          word={word}
          pronunciation={word.pinyin}
          definitions={word.definitions}
          dictionary={word.dictionary}
          key={index}
        />
      )}
    </Flex>
  )
}

export default MandarinSentence;