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
  const dictionary = useSelector(
    (state: RootState) => state.sentence.mandarinDictionary,
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
                    {!dictionary[hanzi] ? (
                      <>
                        {console.log(`Missing ${hanzi} in dictionary`)}
                        {console.log(props.word)}
                      </>
                    ) : (
                      <>
                        <Hanzi
                          hanzi={hanzi}
                          pronunciation={
                            pronunciationSetting == 'pinyin'
                              ? Pinyin(
                                  dictionary[hanzi].pinyin[0],
                                ) /* COULD CAUSE BUGS */
                              : dictionary[hanzi].zhuyin[0]
                          }
                        />
                        <Text>{dictionary[hanzi].english}</Text>{' '}
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
