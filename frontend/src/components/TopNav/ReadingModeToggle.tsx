'use client';

import { Box } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState, store } from '@/utils/store/store';
import { setReadingMode } from '@/utils/store/settingsSlice';
import localization from '@/localization/main';
import { FONT_SANS, FONT_SIZE_SMALL } from '@/theme';

export default function ReadingModeToggle() {
  const readingMode = useSelector((state: RootState) => state.settings.readingMode);
  const user_language = useSelector((state: RootState) => state.settings.user_language);
  const loc = localization.top_nav;

  return (
    <Box
      display="inline-flex"
      borderRadius="7px"
      border="1px solid"
      borderColor="borderDefault"
      bg="bgSubtle"
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
            fontFamily={FONT_SANS}
            fontSize={FONT_SIZE_SMALL}
            fontWeight={isActive ? 600 : 400}
            px={3}
            py="3px"
            border="none"
            borderRadius="5px"
            bg={isActive ? 'bgActive' : 'transparent'}
            color={isActive ? 'fgPrimary' : 'fgMuted'}
            cursor="pointer"
            transition="all 0.14s"
            boxShadow={isActive ? 'sm' : 'none'}
          >
            {mode === 'flow' ? loc.flow[user_language] : loc.vocab_grid[user_language]}
          </Box>
        );
      })}
    </Box>
  );
}
