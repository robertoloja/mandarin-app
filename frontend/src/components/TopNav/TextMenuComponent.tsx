'use client';

import { RootState, store } from '@/utils/store/store';
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
import { IoTextOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import {
  setPronunciationFontSize,
  togglePronunciation,
  togglePinyin,
} from '@/utils/store/settingsSlice';
import { MandoBotAPI } from '@/utils/api';
import localization from '@/localization/main';

function SegBtn({
  active,
  onClick,
  children,
  isDark,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      fontFamily='"IBM Plex Sans", sans-serif'
      fontSize="12px"
      fontWeight={active ? 600 : 400}
      px={3}
      py="4px"
      border="none"
      borderRadius="5px"
      bg={active ? (isDark ? 'gray.700' : 'white') : 'transparent'}
      color={
        active
          ? isDark
            ? 'white'
            : 'gray.800'
          : isDark
            ? 'gray.400'
            : 'gray.500'
      }
      cursor="pointer"
      transition="all 0.14s"
      boxShadow={active ? 'sm' : 'none'}
    >
      {children}
    </Box>
  );
}

function SegControl({
  isDark,
  children,
}: {
  isDark: boolean;
  children: React.ReactNode;
}) {
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
      {children}
    </Box>
  );
}

function Row({
  label,
  isDark,
  children,
}: {
  label: string;
  isDark: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={4}
      py="10px"
    >
      <Text
        fontFamily='"IBM Plex Sans", sans-serif'
        fontSize="13px"
        color={isDark ? 'gray.300' : 'gray.600'}
        whiteSpace="nowrap"
      >
        {label}
      </Text>
      {children}
    </Box>
  );
}

function TextPreferences() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const pronunciation = useSelector(
    (state: RootState) => state.settings.pronunciation,
  );
  const pinyinType = useSelector(
    (state: RootState) => state.settings.pinyin_type,
  );
  const pronunciationFontSize = useSelector(
    (state: RootState) => state.settings.pronunciationFontSize,
  );
  const username = useSelector((state: RootState) => state.auth.username);
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );
  const loc = localization.top_nav;

  const rubyOn = pronunciationFontSize !== 0;

  const handleTogglePronun = () => {
    if (username) {
      MandoBotAPI.pronunciationPreference(
        pronunciation === 'zhuyin' ? pinyinType : 'zhuyin',
      ).then(() => store.dispatch(togglePronunciation()));
    } else {
      store.dispatch(togglePronunciation());
    }
  };

  const handleTogglePinyin = () => {
    if (username) {
      MandoBotAPI.pronunciationPreference(
        pinyinType === 'pinyin_acc' ? 'pinyin_num' : 'pinyin_acc',
      ).then(() => store.dispatch(togglePinyin()));
    } else {
      store.dispatch(togglePinyin());
    }
  };

  const divider = (
    <Box
      borderBottom="1px solid"
      borderColor={isDark ? 'gray.700' : 'gray.100'}
    />
  );

  return (
    <Box fontFamily='"IBM Plex Sans", sans-serif'>
      <Row label={loc.pronunciation[user_language]} isDark={isDark}>
        <SegControl isDark={isDark}>
          <SegBtn
            active={!rubyOn}
            onClick={() => store.dispatch(setPronunciationFontSize(0))}
            isDark={isDark}
          >
            {loc.off[user_language]}
          </SegBtn>
          <SegBtn
            active={rubyOn}
            onClick={() =>
              store.dispatch(
                setPronunciationFontSize(pronunciationFontSize || 15),
              )
            }
            isDark={isDark}
          >
            {loc.on[user_language]}
          </SegBtn>
        </SegControl>
      </Row>

      {divider}

      <Row label={loc.script[user_language]} isDark={isDark}>
        <SegControl isDark={isDark}>
          <SegBtn
            active={pronunciation === 'pinyin'}
            onClick={pronunciation === 'zhuyin' ? handleTogglePronun : () => {}}
            isDark={isDark}
          >
            pīnyīn
          </SegBtn>
          <SegBtn
            active={pronunciation === 'zhuyin'}
            onClick={pronunciation === 'pinyin' ? handleTogglePronun : () => {}}
            isDark={isDark}
          >
            ㄅㄆㄇ
          </SegBtn>
        </SegControl>
      </Row>

      {pronunciation === 'pinyin' && (
        <>
          {divider}
          <Row label={loc.format[user_language]} isDark={isDark}>
            <SegControl isDark={isDark}>
              <SegBtn
                active={pinyinType === 'pinyin_acc'}
                onClick={
                  pinyinType !== 'pinyin_acc' ? handleTogglePinyin : () => {}
                }
                isDark={isDark}
              >
                pīnyīn
              </SegBtn>
              <SegBtn
                active={pinyinType === 'pinyin_num'}
                onClick={
                  pinyinType !== 'pinyin_num' ? handleTogglePinyin : () => {}
                }
                isDark={isDark}
              >
                pin1yin1
              </SegBtn>
            </SegControl>
          </Row>
        </>
      )}
    </Box>
  );
}

export default function TextMenuButton() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Popover placement="bottom-end" offset={[0, 4]}>
      <PopoverTrigger>
        <IconButton
          aria-label="Text settings"
          icon={<IoTextOutline size={22} />}
          bg={isDark ? 'gray.800' : 'white'}
        />
      </PopoverTrigger>
      <PopoverContent
        width="220px"
        borderRadius="10px"
        border="1px solid"
        borderColor={isDark ? 'gray.700' : 'gray.200'}
        bg={isDark ? 'gray.900' : 'white'}
        boxShadow="lg"
        _focus={{ outline: 'none' }}
        px={4}
        py={2}
      >
        <PopoverArrow bg={isDark ? 'gray.900' : 'white'} />
        <PopoverBody p={0}>
          <TextPreferences />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
