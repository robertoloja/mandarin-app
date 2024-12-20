import React from 'react';
import { Box, Text, IconButton } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import Hanzi from './Hanzi';

function Definition(props: {
  word: string,
  onClick: any,
  definitions: string[],
  character_definitions: Record<string, {english: string, pinyin: string, simplified: string}>
}) {
  return (
    <Box
      className="definition"
      // width="200%"
      minWidth="6rem"
      maxWidth="100%"
      position="absolute"
      left="50%"
      transform="translateX(-50%)"
      top="25%"
      margin={0}
      padding="5px"
      backgroundColor="rgba(50, 228, 255, 0.497)"
      zIndex={100}
      border="1px solid rgb(0, 127, 169)"
      background="rgb(211, 249, 255)"
      boxShadow="0 2px 2px rgba(0, 0, 0, 0.163)"
      fontSize="small"
      maxHeight="20vh"
      overflowY="auto"
    >
      <IconButton
        className="close-button"
        position="absolute"
        right="0.3rem"
        top={0}
        margin={0}
        padding={0}
        cursor="pointer"
        icon={<CloseIcon />}
        onClick={props.onClick}
        aria-label="Close"
        variant="ghost"
      />

      {props.word.split('').map((hanzi, index) => (
        <Box key={index} fontSize="160%" fontWeight="900">
          <Hanzi
            hanzi={hanzi}
            pinyin="pinyin" // {props.character_definitions[hanzi].english}
          />
        </Box>
      ))}

      <Text margin={0} padding={0} textAlign="left">
        {props.definitions.join('; ')}
      </Text>
    </Box>
  );
}

export default Definition;