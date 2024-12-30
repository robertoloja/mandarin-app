'use client';

import {
  Text,
  VStack,
  HStack,
  Heading,
  Divider,
  Accordion,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
} from '@chakra-ui/react';
import Hanzi from './Hanzi';
import { ChineseDictionary } from '@/utils/types';
import React from 'react';

function Definition(props: {
  word: string;
  pronunciations: string[];
  definitions: string[];
  dictionary: ChineseDictionary;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  let savedIndex: number;

  function getIndicesOfMatchingPinyin(index: number, hanzi: string) {
    const pinyin = props.dictionary[hanzi].pinyin[index];
    const indicesOfMatchingPinyin = props.dictionary[hanzi].pinyin
      .slice(index)
      .map((x, i) => ({ x, i }))
      .filter(({ x }) => x == pinyin)
      .map(({ x, i }) => i);
    return indicesOfMatchingPinyin;
  }

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxWidth="90vw" maxHeight="90vh" width="auto" height="auto">
        <ModalCloseButton />
        <ModalBody display="flex" p="3rem" overflow={'scroll'}>
          <VStack>
            {/* The full mandarin word */}
            <Heading>{props.word}</Heading>

            {/* The pronunciation */}
            <Heading size="sm">{props.pronunciations.join(' ')}</Heading>

            {/* Each definition of the word */}
            {props.definitions.map((definition, index) => (
              <React.Fragment key={index}>
                <Text textAlign="center" key={index}>
                  {`${props.definitions.length > 1 ? index + 1 + '.' : ''} ${definition}`}
                </Text>
                {props.definitions.length - 1 > index ? <Divider /> : null}
              </React.Fragment>
            ))}

            {props.word.split('').length !== 1 ? (
              <VStack align="start">
                {/* The individual hanzi information */}
                {props.word.split('').map((hanzi: string, hanziIndex) => (
                  <VStack align="start" key={hanziIndex}>
                    <HStack key={hanziIndex}>
                      {
                        (savedIndex = props.dictionary[hanzi].pinyin.indexOf(
                          props.pronunciations[hanziIndex],
                        ))
                      }
                      <Hanzi
                        hanzi={hanzi}
                        pinyin={props.dictionary[hanzi].pinyin[savedIndex]}
                      />

                      <VStack key={hanziIndex} align="start">
                        {getIndicesOfMatchingPinyin(savedIndex, hanzi).map(
                          (x, _, array) => (
                            <HStack key={x}>
                              <Text key={x}>
                                {array.length > 1 ? x + 1 + '.' : ''}
                              </Text>
                              <Text>
                                {
                                  props.dictionary[hanzi].english[
                                    x + savedIndex
                                  ]
                                }
                              </Text>
                            </HStack>
                          ),
                        )}
                      </VStack>
                    </HStack>
                  </VStack>
                ))}
              </VStack>
            ) : undefined}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default Definition;
