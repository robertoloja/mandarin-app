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
  console.log(props.dictionary);

  function getIndicesOfMatchingPinyin(index: number, hanzi: string) {
    const pinyin = props.dictionary[hanzi].pinyin[index];
    const indicesOfMatchingPinyin = props.dictionary[hanzi].pinyin
      .slice(index)
      .map((x, i) => ({ x, i }))
      .filter(({ x }) => x == pinyin)
      .map((e: { x: string; i: number }) => e.i);
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

            {/* The current pronunciation */}
            <Heading size="sm">{props.pronunciations.join(' ')}</Heading>

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
                  <VStack align="start" key={hanziIndex}>
                    <HStack key={hanziIndex}>
                      {(() => {
                        console.log(hanzi);
                        return null;
                      })()}
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
                          (x, i, array) => (
                            <div key={i}>
                              <HStack key={x}>
                                <Text key={x} fontWeight="bold">
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
                              {i + 1 < array.length ? <Divider /> : null}
                            </div>
                          ),
                        )}
                      </VStack>
                    </HStack>
                  </VStack>
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
