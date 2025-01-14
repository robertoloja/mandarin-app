'use client';

import {
  Switch,
  IconButton,
  HStack,
  Text,
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

import { togglePronunciation } from '@/utils/store/settingsSlice';
import { store } from '@/utils/store/store';

export default function LanguageMenu(props: { iconSize: number }) {
  const { colorMode } = useColorMode();
  const toggle = () => {
    store.dispatch(togglePronunciation());
  };

  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          aria-label="Language settings"
          icon={<IoLanguageOutline size={props.iconSize + 3} />}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          mr={1}
        />
      </PopoverTrigger>
      <PopoverContent width="auto" boxShadow="1px 1px 2px rgba(0, 0, 0, 0.5)">
        <PopoverArrow />
        {/* <PopoverCloseButton /> */}
        <PopoverHeader>
          <Center>Language Options</Center>
        </PopoverHeader>
        <PopoverBody>
          <HStack justifyContent="center">
            <Text>pīnyīn</Text>
            <Switch onChange={toggle} />
            <Text>ㄅㄆㄇㄈ</Text>
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
