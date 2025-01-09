'use client';

import {
  Switch,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  HStack,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { IoLanguage } from 'react-icons/io5';

import { togglePronunciation } from '@/utils/store/settingsSlice';
import { useAppDispatch } from './LoginTest';

export default function LanguageMenu(props: { iconSize: number }) {
  const dispatch = useAppDispatch();
  const { colorMode } = useColorMode();
  const toggle = () => {
    dispatch(togglePronunciation());
  };

  return (
    <Menu closeOnSelect={false}>
      <MenuButton
        as={IconButton}
        icon={<IoLanguage size={props.iconSize + 3} />}
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        mr={1}
      />
      <MenuList>
        <MenuItem>
          <HStack>
            <Text>pīnyīn</Text>
            <Switch onChange={toggle} />
            <Text>ㄅㄆㄇㄈ</Text>
          </HStack>
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
