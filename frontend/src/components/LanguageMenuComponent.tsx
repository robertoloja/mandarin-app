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
  VStack,
} from '@chakra-ui/react';
import { IoLanguageOutline } from 'react-icons/io5';

import { togglePronunciation, togglePinyin } from '@/utils/store/settingsSlice';
import { RootState, store } from '@/utils/store/store';
import { useSelector } from 'react-redux';

export default function LanguageMenu(props: { iconSize: number }) {
  const { colorMode } = useColorMode();
  const pronunciation = useSelector(
    (state: RootState) => state.settings.pronunciation,
  );
  const pinyinType = useSelector(
    (state: RootState) => state.settings.pinyin_type,
  );
  const togglePron = () => {
    store.dispatch(togglePronunciation());
  };
  const togglePin = () => {
    store.dispatch(togglePinyin());
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
      <PopoverContent width="13rem" boxShadow="1px 1px 2px rgba(0, 0, 0, 0.5)">
        <PopoverArrow />
        {/* <PopoverCloseButton /> */}
        <PopoverHeader>
          <Center>Language Options</Center>
        </PopoverHeader>
        <PopoverBody>
          <VStack>
            <HStack>
              <Text>{pinyinType == 'pinyin_acc' ? 'pīnyīn' : 'pin1 yin1'}</Text>
              <Switch onChange={togglePron} />
              <Text>ㄅㄆㄇㄈ</Text>
            </HStack>
            {pronunciation == 'pinyin' && (
              <HStack>
                <Text>pīnyīn</Text>
                <Switch onChange={togglePin} />
                <Text>pin1yin1</Text>
              </HStack>
            )}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
