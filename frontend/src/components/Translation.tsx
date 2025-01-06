'use client';

import React, { useState } from 'react';
import { Center, Box, Text, useColorMode } from '@chakra-ui/react';

function Translation(props: { text: string }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const { colorMode } = useColorMode();
  const lightGradientBgString =
    'linear-gradient(to bottom, rgba(255, 255, 255, 1) 80%, rgba(0, 0, 0, 0) 100%);';
  const darkGradientBgString =
    'linear-gradient(to bottom, rgba(40, 40, 40, 1) 50%, rgba(0, 0, 0, 0) 100%);';

  return (
    <Box
      className="translation"
      p={4}
      pt={0}
      borderWidth={1}
      borderBottomWidth={0}
      borderTopRadius="lg"
      borderColor="black"
      position="fixed"
      bottom={0}
      left={['0%', '10%']}
      right={['0%', '10%']}
      width={['100%', '80%']}
      height={isMinimized ? '2.2vh' : ['35vh', '20vh']}
      overflowY={isMinimized ? 'hidden' : 'scroll'}
      shadow="md"
      bg={colorMode === 'light' ? 'white' : '#282828'}
      zIndex={1}
      transition="height 0.2s ease"
    >
      <Box
        onClick={() => setIsMinimized(!isMinimized)}
        width={['100%', '75%']}
        height="2.3rem"
        cursor="pointer"
        position="fixed"
        borderTopRadius="lg"
        mx="10%"
        bg={
          colorMode === 'light' ? lightGradientBgString : darkGradientBgString
        }
        left="40%"
        transform="translatex(-50%)"
      >
        <Box
          m={2}
          mx="30%"
          borderRadius="lg"
          bg="darkgrey"
          minW="10rem"
          height="0.3rem"
        />
      </Box>

      <Center>
        <Text my={6} textAlign="justify" px={5}>
          {props.text}
        </Text>
      </Center>
    </Box>
  );
}

export default Translation;
