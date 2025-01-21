'use client';

import styles from '@/themes';
import { VStack, Text, useColorMode } from '@chakra-ui/react';

function Hanzi(props: { hanzi: string; pronunciation: string }) {
  const { colorMode } = useColorMode();
  const isPunctuation = (hanzi: string) =>
    ',，。！？：；、“”‘’（）《》【】〔〕……—～·\u3000'.includes(hanzi);

  return (
    <>
      {!isPunctuation(props.hanzi) && (
        <VStack
          padding="0.5rem"
          paddingTop="0"
          __css={styles.lightBox[colorMode]}
        >
          <Text fontSize="3xl" fontWeight="bold">
            {props.hanzi}
          </Text>

          {props.pronunciation ? (
            <Text>{props.pronunciation.toLowerCase()}</Text>
          ) : null}
        </VStack>
      )}
    </>
  );
}

export default Hanzi;
