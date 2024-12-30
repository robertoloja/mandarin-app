'use client'

import { 
  Text, 
  VStack, 
  HStack,
  Heading,
  Divider,
  Accordion,
} from '@chakra-ui/react';
import Hanzi from './Hanzi';
import { ChineseDictionary } from '@/utils/types';
import React from 'react';

function Definition(props: {
  word: string,
  pronunciations: string[],
  definitions: string[],
  dictionary: ChineseDictionary,
  }) {

  let savedIndex: number
  let pinyin: string

  return (
    <VStack>

      {/* The full mandarin word */}
      <Heading>
        {props.word}
      </Heading>

      {/* The pronunciation */}
      <Heading size='sm'>
        {props.pronunciations.join(' ')}
      </Heading>

      {/* Each definition of the word */}
      {props.definitions.map((definition, index) => 
        <React.Fragment key={index}>
          <Text textAlign="center" key={index}>
            {`${props.definitions.length > 1 ? index + 1 + '.' : ''} ${definition}`}
          </Text>
          {props.definitions.length -1 > index ? <Divider /> : null}
        </React.Fragment>
      )}

      {props.word.split('').length !== 1 ? 
        <VStack align="start">

          {/* The individual hanzi information */}
          {props.word.split('').map((hanzi: string, hanziIndex) => 
            <VStack align="start" key={hanziIndex}>
              <HStack key={hanziIndex}>

                {savedIndex = props.dictionary[hanzi].pinyin.indexOf(props.pronunciations[hanziIndex])}
                {pinyin = props.dictionary[hanzi].pinyin[savedIndex]}

                <Hanzi
                  hanzi={hanzi}
                  pinyin={pinyin} />
 
                {/* The definition of the hanzi
                Display all definitions that match the same pronunciation */}
                <VStack key={hanziIndex} align="start">
                {props.dictionary[hanzi].pinyin
                  .slice(savedIndex) // only look past the point of the savedIndex
                  .map((x, i) => ({x, i})) // get the pinyin and its index
                  .filter(({ x }) => x == pinyin) // filter pinyin that don't match
                  .map(x => // get the english definitions at those indices
                    <Text key={x.i}>
                      {`${x.i + 1}. ${props.dictionary[hanzi].english[x.i + savedIndex]}`}
                    </Text>
                  )}
                  </VStack>
                
              </HStack>
            </VStack>
          )}
        </VStack>
      : undefined}
    </VStack> 
  );
}

export default Definition;