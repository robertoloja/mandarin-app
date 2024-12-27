'use client'

import { 
  Text, 
  VStack, 
  HStack,
  Heading
} from '@chakra-ui/react';
import Hanzi from './Hanzi';

function Definition(props: {
  word: string,
  definitions: string[],
  character_definitions: Record<string, {english: string, pinyin: string, simplified: string}>
}) {
  return (
    <VStack>
      <Heading>
        {props.word}
      </Heading>

      {props.definitions.map((definition, index) => 
        <Text textAlign="center" key={index}>
          {definition}
        </Text>
      )}

    {props.word.split('').length !== 1 ? 
      <VStack align="start">
        {props.word.split('').map((hanzi, index) => (
          <HStack key={index}>
            <Hanzi
              hanzi={hanzi}
              pinyin={props.character_definitions[hanzi].pinyin}
            />
            <Text>
              {props.character_definitions[hanzi].english}
            </Text>
          </HStack>
        ))}
      </VStack>
    : undefined}
    </VStack> 
  );
}

export default Definition;