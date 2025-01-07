'use client';

import { VStack, Text, useColorMode } from '@chakra-ui/react';

function Hanzi(props: { hanzi: string; pronunciation: string }) {
  const { colorMode } = useColorMode();
  return (
    <VStack
      border={colorMode === 'light' ? 'solid 1px #468DA4' : 'solid 1px #282828'}
      padding="0.5rem"
      paddingTop="0"
      backgroundColor={colorMode === 'light' ? '#85E2FF' : '#495255'}
    >
      <Text fontSize="3xl" fontWeight="bold">
        {props.hanzi}
      </Text>

      {props.pronunciation ? (
        <Text fontSize="l">{props.pronunciation.toLowerCase()}</Text>
      ) : null}
    </VStack>
  );
}

export default Hanzi;
