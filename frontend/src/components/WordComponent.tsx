'use client';

import Hanzi from './HanziComponent';
import Definition from './DefinitionComponent';
import { MandarinWordType, ChineseDictionary } from '../utils/types';
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
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import Pinyin from 'pinyin-tone';
import { UserLanguage } from '@/localization/main';

function Word(props: {
  word: MandarinWordType;
  pronunciation: string[];
  definitions: string[];
  user_language: UserLanguage;
  dictionary?: ChineseDictionary;
}) {
  const definitionFontSize = useSelector(
    (state: RootState) => state.settings.definitionFontSize,
  );
  const pronunciationFontSize = useSelector(
    (state: RootState) => state.settings.pronunciationFontSize,
  );

  // TODO: Account for compound words (e.g. 軍事將領, and 成語)
  const punctuation =
    props.word.word === props.pronunciation[0] || props.word.word === '';
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const pronunciationSetting = useSelector(
    (state: RootState) => state.settings.pronunciation,
  );
  const pinyinSetting = useSelector(
    (state: RootState) => state.settings.pinyin_type,
  );
  const reduxDictionary = useSelector(
    (state: RootState) => state.sentence.mandarinDictionary,
  );
  const dictionary = props.dictionary ?? reduxDictionary;
  const pronunciation = (hanzi: string): string => {
    if (!dictionary[hanzi]) return '';
    if (pronunciationSetting === 'pinyin') {
      if (pinyinSetting === 'pinyin_acc') {
        return Pinyin(dictionary[hanzi].pinyin[0].toLowerCase());
      } else {
        return dictionary[hanzi].pinyin[0];
      }
    }
    return dictionary[hanzi].zhuyin[0];
  };

  if (punctuation) {
    return (
      <Flex align="center" justify="center" h="70%" m={2}>
        <Text fontSize="lg">{props.word.word}</Text>
      </Flex>
    );
  }

  if (definitionFontSize === 0) {
    return (
      <Flex align="center" justify="center" m={2} onClick={onOpen} cursor="pointer">
        <Definition
          pronunciations={props.pronunciation}
          word={props.word.word}
          definitions={props.definitions}
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          user_language={props.user_language}
          dictionary={props.dictionary}
        />
        <HStack spacing="0.1rem" fontSize={pronunciationFontSize}>
          {pronunciationFontSize !== 0 ? (
            props.word.word.split('').map((char, index) => (
              <Hanzi hanzi={char} key={index} pronunciation={pronunciation(char)} />
            ))
          ) : (
            <Text fontSize="lg">{props.word.word}</Text>
          )}
        </HStack>
      </Flex>
    );
  }

  return (
    <>
      <Card
        margin="0.1rem"
        marginBottom="0.5rem"
        padding="0.2rem"
        onClick={onOpen}
        __css={styles.darkBox[colorMode]}
        cursor="pointer"
        _hover={{ borderColor: '#999' }}
        aria-label={`word card: ${props.word.word}`}
      >
        <Definition
          pronunciations={props.pronunciation}
          word={props.word.word}
          definitions={props.definitions}
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          user_language={props.user_language}
          dictionary={props.dictionary}
        />

        <CardBody>
          <Center>
            <HStack spacing="0.1rem" fontSize={pronunciationFontSize}>
              {pronunciationFontSize !== 0 ? (
                props.word.word
                  .split('')
                  .map((char, index) => (
                    <Hanzi
                      hanzi={char}
                      key={index}
                      pronunciation={pronunciation(char)}
                    />
                  ))
              ) : (
                <Text fontSize="32" p={2}>
                  {props.word.word}
                </Text>
              )}
            </HStack>
          </Center>
        </CardBody>

        <Center>
          <CardFooter>
            <Text
              noOfLines={2}
              maxWidth="10rem"
              minWidth="5rem"
              my="0.5rem"
              textAlign="center"
              fontSize={definitionFontSize}
            >
              {props.definitions.join('; ')}
            </Text>
          </CardFooter>
        </Center>
      </Card>
    </>
  );
}

export default Word;
