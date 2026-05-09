'use client';

import { RootState } from '@/utils/store/store';
import {
  Box,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import LanguagePreferencesComponent from '../LanguagePreferencesComponent';
import localization from '@/localization/main';
import { FONT_SANS } from '@/theme';

export default function LanguagePreferenceMenuButton({
  iconSize: _iconSize,
}: {
  iconSize: number;
}) {
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );

  return (
    <Popover placement="bottom-end" offset={[0, 4]}>
      <PopoverTrigger>
        <IconButton
          aria-label="Language preference"
          icon={
            <Text
              fontFamily={FONT_SANS}
              fontWeight={500}
              textTransform="uppercase"
              fontSize="13px"
              letterSpacing="0.04em"
            >
              {user_language}
            </Text>
          }
          bg="transparent"
          border="1px solid"
          borderColor="borderDefault"
          h="30px"
          minW="30px"
          _hover={{ borderColor: 'borderEmphasis' }}
        />
      </PopoverTrigger>

      <PopoverContent
        width="fit-content"
        borderRadius="10px"
        border="1px solid"
        borderColor="borderDefault"
        bg="bgCanvas"
        boxShadow="lg"
        _focus={{ outline: 'none' }}
        px={4}
        py={3}
      >
        <PopoverArrow bg="bgCanvas" />
        <PopoverBody p={0}>
          <Box
            fontFamily={FONT_SANS}
            fontSize="10px"
            textTransform="uppercase"
            letterSpacing="0.14em"
            color="fgSubtle"
            mb={2}
          >
            {localization.top_nav.interface_language[user_language]}
          </Box>
          <LanguagePreferencesComponent />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
