'use client';

import localization from '@/localization/main';
import { RootState } from '@/utils/store/store';
import {
  Center,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import LanguagePreferencesComponent from '../LanguagePreferencesComponent';

export default function LanguagePreferenceMenuButton({ iconSize }: { iconSize: number }) {
  const { colorMode } = useColorMode();
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );

  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          aria-label="language preference"
          icon={
            <Text fontWeight="400" textTransform="uppercase" fontSize={iconSize}>
              {user_language}
            </Text>
          }
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
        />
      </PopoverTrigger>

      <PopoverContent bg={colorMode === 'light' ? 'white' : 'gray.700'}>
        <PopoverArrow />
        <PopoverHeader>
          <Center>{localization.top_nav.top_nav.language_options[user_language]}</Center>
        </PopoverHeader>
        <PopoverBody>
          <LanguagePreferencesComponent />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
