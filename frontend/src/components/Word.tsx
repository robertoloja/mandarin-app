'use client';

import Hanzi from './Hanzi';
import Definition from './Definition';
import { ChineseDictionary, MandarinWordType } from '../utils/types';
import {
  Flex,
  Text,
  Card,
  HStack,
  Center,
  CardBody,
  CardFooter,
  useDisclosure,
  useColorMode,
} from '@chakra-ui/react';

function Word(props: {
  word: MandarinWordType;
  pronunciation: string[];
  definitions: string[];
  dictionary: ChineseDictionary;
}) {
  // TODO: Account for compound words (e.g. 軍事將領)
  const punctuation = props.word.word === props.pronunciation[0];
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();

  return (
    <>
      {!punctuation ? (
        <Card
          variant="unstyled"
          backgroundColor={colorMode === 'light' ? '#B8EEFF' : '#282828'}
          margin="0.1rem"
          marginBottom="0.5rem"
          padding="0.2rem"
          border={
            colorMode === 'light' ? '1px solid #468DA4' : '1px solid #3f3f3f'
          }
          borderRadius="4"
          boxShadow="1px 1px 1px rgba(0, 0, 0, 0.25)"
          onClick={onOpen}
        >
          {!punctuation ? (
            <Definition
              pronunciations={props.pronunciation}
              word={props.word.word}
              definitions={props.definitions}
              dictionary={props.dictionary}
              isOpen={isOpen}
              onOpen={onOpen}
              onClose={onClose}
            />
          ) : null}

          <CardBody>
            <Center>
              <HStack spacing="0.1rem">
                {props.word.word.split('').map((char, index) => (
                  <Hanzi
                    hanzi={char}
                    key={index}
                    pinyin={props.pronunciation[index]}
                  />
                ))}
              </HStack>
            </Center>
          </CardBody>

          <Center>
            <CardFooter>
              <Text
                noOfLines={2}
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
            </CardFooter>
          </Center>
        </Card>
      ) : (
        <Flex align="center" justify="center" h="70%" m={2}>
          <Text fontSize="lg">{props.word.word}</Text>
        </Flex>
      )}
    </>
  );
}

export default Word;
