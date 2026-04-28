'use client';

import {
  IconButton,
  useColorMode,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverHeader,
  Center,
} from '@chakra-ui/react';
import { IoLanguageOutline } from 'react-icons/io5';

import PronunciationPreferencesComponent from '../PronunciationPreferencesComponent';
import localization from '@/localization/main';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';

export default function LanguageMenu(props: { iconSize: number }) {
  const { colorMode } = useColorMode();

  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          aria-label="language settings"
          icon={<IoLanguageOutline size={props.iconSize + 3} />}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          mr={1}
        />
      </PopoverTrigger>
      <PopoverContent width="13rem" boxShadow="1px 1px 2px rgba(0, 0, 0, 0.5)">
        <PopoverArrow />
        <PopoverHeader>
          <Center>
            {localization.top_nav.language_options[user_language]}
          </Center>
        </PopoverHeader>
        <PopoverBody>
          <PronunciationPreferencesComponent />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
