'use client';

import React, { useState } from 'react';
import { Center, Box, Text, useColorMode } from '@chakra-ui/react';

function Translation(props: { text: string }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const { colorMode } = useColorMode();

  return (
    <Box
      className="translation"
      p={4}
      borderWidth={1}
      borderBottomWidth={0}
      borderTopRadius="lg"
      borderColor="black"
      position="fixed"
      bottom={0}
      left={['0%', '10%']}
      right={['0%', '10%']}
      width={['100%', '80%']}
      height={isMinimized ? '1vh' : ['45vh', '20vh']}
      overflowY={isMinimized ? 'hidden' : 'scroll'}
      shadow="md"
      bg={colorMode === 'light' ? 'white' : '#282828'}
      zIndex={1}
    >
      <Box
        onClick={() => setIsMinimized(!isMinimized)}
        width="40%"
        minW="10rem"
        height="0.3rem"
        bg="darkgrey"
        borderRadius="md"
        cursor="pointer"
        position="fixed"
        left="50%"
        transform="translateX(-50%)"
      />

      <Center>
        <Text mt={3} textAlign="justify" px={5}>
          {props.text}
        </Text>
      </Center>
    </Box>
  );
}

export default Translation;
