'use client';

import { VStack, Text } from '@chakra-ui/react';

const PUNCT = ',，。！？：；、“”‘’（）《》【】〔〕…—～·　';

function Hanzi(props: { hanzi: string; pronunciation: string }) {
  if (PUNCT.includes(props.hanzi)) return null;

  return (
    <VStack
      padding="0.5rem"
      paddingTop="0"
      border="1px solid"
      borderColor="borderDefault"
      borderRadius="8px"
      bg="bgSubtle"
    >
      <Text fontSize="3xl" fontWeight="bold">
        {props.hanzi}
      </Text>
      {props.pronunciation && (
        <Text>{props.pronunciation.toLowerCase()}</Text>
      )}
    </VStack>
  );
}

export default Hanzi;
