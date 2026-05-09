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
  useColorMode,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import LanguagePreferencesComponent from '../LanguagePreferencesComponent';
import localization from '@/localization/main';

export default function LanguagePreferenceMenuButton({
  iconSize: _iconSize,
}: {
  iconSize: number;
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
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
              fontFamily='"IBM Plex Sans", sans-serif'
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
          borderColor={isDark ? 'gray.700' : 'gray.200'}
          h="30px"
          minW="30px"
          _hover={{ borderColor: isDark ? 'gray.600' : 'gray.300' }}
        />
      </PopoverTrigger>

      <PopoverContent
        width="fit-content"
        borderRadius="10px"
        border="1px solid"
        borderColor={isDark ? 'gray.700' : 'gray.200'}
        bg={isDark ? 'gray.900' : 'white'}
        boxShadow="lg"
        _focus={{ outline: 'none' }}
        px={4}
        py={3}
      >
        <PopoverArrow bg={isDark ? 'gray.900' : 'white'} />
        <PopoverBody p={0}>
          <Box
            fontFamily='"IBM Plex Sans", sans-serif'
            fontSize="10px"
            textTransform="uppercase"
            letterSpacing="0.14em"
            color={isDark ? 'gray.500' : 'gray.400'}
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
