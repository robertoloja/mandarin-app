'use client';

import Hanzi from './HanziComponent';
import Definition from './DefinitionComponent';
import { MandarinWordType } from '../utils/types';
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
import styles from '@/themes';

function Word(props: {
  word: MandarinWordType;
  pronunciation: string[];
  definitions: string[];
}) {
  // TODO: Account for compound words (e.g. 軍事將領, and 成語)
  const punctuation =
    props.word.word === props.pronunciation[0] || props.word.word === '';
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();

  return (
    <>
      {!punctuation ? (
        <Card
          margin="0.1rem"
          marginBottom="0.5rem"
          padding="0.2rem"
          onClick={onOpen}
          __css={styles.darkBox[colorMode]}
        >
          <Definition
            pronunciations={props.pronunciation}
            word={props.word.word}
            definitions={props.definitions}
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
          />

          <CardBody>
            <Center>
              <HStack spacing="0.1rem">
                {props.word.word.split('').map((char, index) => (
                  <Hanzi
                    hanzi={char}
                    key={index}
                    pronunciation={props.pronunciation[index]}
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
