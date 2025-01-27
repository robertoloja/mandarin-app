'use client';

import React, { useRef } from 'react';
import { Center, Box, Text, useColorMode } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState, store } from '@/utils/store/store';
import { setTranslationPanelHeight } from '@/utils/store/mandarinSentenceSlice';

function Translation(props: { text: string }) {
  const { colorMode } = useColorMode();
  const lightGradientBgString =
    'linear-gradient(to bottom, rgba(255, 255, 255, 1) 10%, rgba(0, 0, 0, 0) 100%);';
  const darkGradientBgString = `linear-gradient(to bottom, rgba(40, 40, 40, 1) 10%, rgba(0, 0, 0, 0) 100%);`;

  const minHeight = 20;
  const maxHeight = 300;

  const height = useSelector(
    (state: RootState) => state.sentence.translationPanelHeight,
  );

  const tempHeightRef = useRef(height);
  const isResizingRef = useRef(false);

  const handleStartResize = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    isResizingRef.current = true;

    const startY =
      'touches' in event ? event.touches[0].clientY : event.clientY;
    const startHeight = tempHeightRef.current;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      moveEvent.preventDefault();

      if (!isResizingRef.current) return;
      const currentY =
        'touches' in moveEvent
          ? moveEvent.touches[0].clientY
          : moveEvent.clientY;
      const newHeight = Math.min(
        Math.max(startHeight + (startY - currentY), minHeight),
        maxHeight,
      );
      tempHeightRef.current = newHeight;

      if (resizableRef.current) {
        resizableRef.current.style.height = `${newHeight}px`;
      }
    };

    const handleEnd = () => {
      isResizingRef.current = false;
      store.dispatch(setTranslationPanelHeight(tempHeightRef.current));
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  };

  const resizableRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      ref={resizableRef}
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
      overflowY="scroll"
      height={`${height}px`}
      maxHeight="50%"
      shadow="md"
      bg={colorMode === 'light' ? 'white' : '#282828'}
      zIndex={1}
    >
      <Box
        width={['100%', '75%']}
        height="2rem"
        cursor="ns-resize"
        position="fixed"
        borderTopRadius="lg"
        mx="10%"
        bg={
          colorMode === 'light' ? lightGradientBgString : darkGradientBgString
        }
        left="40%"
        transform="translatex(-50%)"
        onMouseDown={handleStartResize}
        onTouchStart={handleStartResize}
      >
        <Box
          m={2}
          cursor="ns-resize"
          mx="30%"
          borderRadius="lg"
          bg="darkgrey"
          minW="10rem"
          height="0.3rem"
          onMouseDown={handleStartResize}
          onTouchStart={handleStartResize}
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
