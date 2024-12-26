'use client'

import { 
  Flex, 
  Text, 
  HStack, 
  Center, 
  Card,
  DialogRoot,
  DialogTrigger,
} from '@chakra-ui/react';

import Hanzi from './Hanzi';
import Definition from './Definition'
import { 
  ChineseDictionary, 
  MandarinWordType 
} from '@/utils/types';
import { useState } from 'react';


function Word(props: {
  word: MandarinWordType,
  pronunciation: string[],
  definitions: string[],
  dictionary: ChineseDictionary,
}) {
  // TODO: Account for compound words (e.g. 軍事將領)
  const punctuation = props.word.word === props.pronunciation[0];
  const [dialogOpen, openDialog] = useState(false)

  return (
    <>
    {!punctuation ? 
          <Card.Root
            backgroundColor="#B8EEFF"
            margin="0.1rem"
            marginBottom="0.5rem"
            padding="0.2rem"
            border="1px solid #468DA4"
            borderRadius="4"
            boxShadow="1px 1px 1px rgba(0, 0, 0, 0.25)"
          >
            <Definition
              word={props.word.word} 
              definitions={props.definitions}
              character_definitions={props.dictionary}
              dialogOpen={dialogOpen}
              key={1}
            /> 

            <Card.Body onClick={() => { openDialog(true); console.log("click") }}>
              <Center>
                <HStack>
                  {props.word.word.split('').map((char, index) =>
                    <Hanzi
                      hanzi={char}
                      key={index}
                      pinyin={props.pronunciation[index]}
                    />
                  )}
                </HStack>
              </Center>
            </Card.Body>

            <Center>
              <Card.Footer>
                <Text
                  maxWidth="10rem"
                  minWidth="5rem"
                  fontSize="sm"
                  height="2.6rem"
                  marginTop="0.5rem"
                  marginBottom="0.5rem"
                  textAlign="center"
                >
                  {props.definitions.join('; ')}
                </Text>
              </Card.Footer>
            </Center>
          </Card.Root>

    : <Flex
        align='center' 
        justify='center' 
        h='70%'
        m={2}>
        <Text fontSize="lg">
          {props.word.word}
        </Text>
      </Flex>}
    </>
  );
}

export default Word;