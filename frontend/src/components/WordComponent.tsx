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
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import Pinyin from 'pinyin-tone';
import { useEffect, useState } from 'react';

function Word(props: {
  word: MandarinWordType;
  pronunciation: string[];
  definitions: string[];
}) {
  const [definitionFontSize, setDefinitionFontSize] = useState(12);
  const [pronunciationFontSize, setPronunciationFontSize] = useState(12);

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'definitionFontSize') {
      setDefinitionFontSize(Number(event.newValue));
    }
    if (event.key === 'pronunciationFontSize') {
      setPronunciationFontSize(Number(event.newValue));
    }
  };

  useEffect(() => {
    setDefinitionFontSize(
      Number(localStorage.getItem('definitionFontSize')) || 12,
    );
    setPronunciationFontSize(
      Number(localStorage.getItem('definitionFontSize')) || 12,
    );
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
  const dictionary = useSelector(
    (state: RootState) => state.sentence.mandarinDictionary,
  );
  const pronunciation = (hanzi: string): string => {
    if (pronunciationSetting === 'pinyin') {
      if (pinyinSetting === 'pinyin_acc') {
        return Pinyin(dictionary[hanzi].pinyin[0].toLowerCase());
      } else {
        return dictionary[hanzi].pinyin[0];
      }
    }
    return dictionary[hanzi].zhuyin[0];
  };

  return (
    <>
      {!punctuation ? (
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
              {definitionFontSize !== 0 && (
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
              )}
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
