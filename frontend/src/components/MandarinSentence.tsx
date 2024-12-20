import React, { useState } from 'react';
import Word from './Word';
import { MandarinSentenceType } from '../types';
import { Flex } from '@chakra-ui/react';


function MandarinSentence(props: MandarinSentenceType) {
  // State to keep track of which definition tooltip is open.
  const [childStates, setChildStates] = useState(
    props.sentence.map((word, id) => ({ id: id, isOpen: false }))
  );

  function toggleDefinition(id: number) {
    console.log("clicked")
    const updatedStates = childStates.map(child => {
      if (child.id === id) {
        return { ...child, isOpen: !child.isOpen };
      }
      return { ...child, isOpen: false };
    });
    setChildStates(updatedStates);
  }

  return (
    <Flex
      align="stretch"
      w='100%'
      px={['0', '5%']}
      flexWrap="wrap"
      mb={["45vh", "20vh"]}
      overflowX="hidden"
    >
      {props.sentence.map((word, index) =>
        <Word
          word={word}
          pronunciation={word.pinyin}
          definitions={word.definitions}
          dictionary={word.dictionary}
          key={index}
          isOpen={childStates[index].isOpen}
          onClick={() => toggleDefinition(index)}
        />
      )}
    </Flex>
  );
}

export default MandarinSentence;