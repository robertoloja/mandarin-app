'use client';

import {
  Text,
  VStack,
  HStack,
  Heading,
  Divider,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
} from '@chakra-ui/react';
import React from 'react';
import 'pinyin-tone';

import Hanzi from './HanziComponent';
import Pinyin from 'pinyin-tone';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';

function Definition(props: {
  word: string;
  pronunciations: string[];
  definitions: string[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
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
    <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxWidth="90vw" maxHeight="90vh" width="auto" height="auto">
        <ModalCloseButton aria-label="close definition" />
        <ModalBody display="flex" p="3rem" overflow={'scroll'}>
          <VStack>
            {/* The full mandarin word */}
            <Heading>{props.word}</Heading>

            {/* The current pronunciation */}
            <Heading size="sm">
              {props.word
                .split('')
                .map((x) => pronunciation(x))
                .join(' ')}
            </Heading>

            {/* Each definition of the word */}
            {props.definitions.map((definition, index) => (
              <div key={index}>
                <Text textAlign="center" key={index}>
                  {`${props.definitions.length > 1 ? index + 1 + '.' : ''} ${definition}`}
                </Text>
                {props.definitions.length - 1 > index ? <Divider /> : null}
              </div>
            ))}

            {props.word.split('').length !== 1 ? (
              <VStack align="start">
                {/* The individual hanzi information */}
                {props.word.split('').map((hanzi: string, hanziIndex) => (
                  <HStack key={hanziIndex}>
                    {!dictionary[hanzi] ? (
                      <>
                        {/* {console.log(`Missing ${hanzi} in dictionary`)}
                        {console.log(props.word)} */}
                      </>
                    ) : (
                      <>
                        <Hanzi
                          hanzi={hanzi}
                          pronunciation={pronunciation(hanzi)}
                        />
                        <Text>{dictionary[hanzi].english.join(' / ')}</Text>
                      </>
                    )}
                  </HStack>
                ))}
              </VStack>
            ) : null}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default Definition;
