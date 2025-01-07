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
import React, { useEffect } from 'react';
import 'pinyin-tone';

import Hanzi from './Hanzi';
import { ChineseDictionary } from '@/utils/types';
import Pinyin from 'pinyin-tone';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';

function Definition(props: {
  word: string;
  pronunciations: string[];
  definitions: string[];
  dictionary: ChineseDictionary;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const pronunciationSetting = useSelector(
    (state: RootState) => state.settings.pronunciation,
  );

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
                  <HStack key={hanziIndex}>
                    <Hanzi
                      hanzi={hanzi}
                      pronunciation={
                        pronunciationSetting == 'pinyin'
                          ? Pinyin(
                              props.dictionary[hanzi].pinyin[0],
                            ) /* COULD CAUSE BUGS */
                          : props.dictionary[hanzi].zhuyin[0]
                      }
                    />
                    <Text>{props.dictionary[hanzi].english}</Text>
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
