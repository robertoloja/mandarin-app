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

import LanguagePreferencesComponent from './LanguagePreferencesComponent';

export default function LanguageMenu(props: { iconSize: number }) {
  const { colorMode } = useColorMode();

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
          <Center>Language Options</Center>
        </PopoverHeader>
        <PopoverBody>
          <LanguagePreferencesComponent />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
