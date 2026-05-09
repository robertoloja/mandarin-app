'use client';

import { Box, useColorMode } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState, store } from '@/utils/store/store';
import { setReadingMode } from '@/utils/store/settingsSlice';

export default function ReadingModeToggle() {
  const { colorMode } = useColorMode();
  const readingMode = useSelector((state: RootState) => state.settings.readingMode);
  const isDark = colorMode === 'dark';

  return (
    <Box
      display="inline-flex"
      borderRadius="7px"
      border="1px solid"
      borderColor={isDark ? 'gray.700' : 'gray.200'}
      bg={isDark ? 'gray.800' : 'gray.100'}
      p="2px"
      gap="1px"
    >
      {(['flow', 'grid'] as const).map((mode) => {
        const isActive = readingMode === mode;
        return (
          <Box
            key={mode}
            as="button"
            onClick={() => store.dispatch(setReadingMode(mode))}
            fontFamily='"IBM Plex Sans", sans-serif'
            fontSize="12px"
            fontWeight={isActive ? 600 : 400}
            px={3}
            py="3px"
            border="none"
            borderRadius="5px"
            bg={isActive ? (isDark ? 'gray.700' : 'white') : 'transparent'}
            color={isActive ? (isDark ? 'white' : 'gray.800') : (isDark ? 'gray.400' : 'gray.500')}
            cursor="pointer"
            transition="all 0.14s"
            boxShadow={isActive ? 'sm' : 'none'}
          >
            {mode === 'flow' ? 'Flow' : 'Vocab grid'}
          </Box>
        );
      })}
    </Box>
  );
}
