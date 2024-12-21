import { VStack, Text } from '@chakra-ui/react';

function Hanzi(props: { hanzi: string, pinyin: string }) {
  return (
    <VStack
      border="solid 1px #468DA4"
      padding="0.5rem"
      paddingTop="0"
      backgroundColor="#85E2FF"
    >
      <Text fontSize="3xl" fontWeight="bold">
        {props.hanzi}
      </Text>

      {props.pinyin ?
        <Text>
          {props.pinyin.toLowerCase()}
        </Text>
      : null}
    </VStack>
  )}

export default Hanzi;