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
import { FONT_SANS } from '@/theme';

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      fontFamily={FONT_SANS}
      fontSize="12px"
      fontWeight={active ? 600 : 400}
      px={3}
      py="4px"
      border="none"
      borderRadius="5px"
      bg={active ? 'bgActive' : 'transparent'}
      color={active ? 'fgPrimary' : 'fgMuted'}
      cursor="pointer"
      transition="all 0.14s"
      boxShadow={active ? 'sm' : 'none'}
    >
      {children}
    </Box>
  );
}

function SegControl({
  children,
}: {
  children: React.ReactNode;
}) {
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
      {children}
    </Box>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
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
        fontFamily={FONT_SANS}
        fontSize="13px"
        color="fgBody"
        whiteSpace="nowrap"
      >
        {label}
      </Text>
      {children}
    </Box>
  );
}

function TextPreferences() {
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
      borderColor="borderSubtle"
    />
  );

  return (
    <Box fontFamily={FONT_SANS}>
      <Row label={loc.pronunciation[user_language]}>
        <SegControl>
          <SegBtn
            active={!rubyOn}
            onClick={() => store.dispatch(setPronunciationFontSize(0))}
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
          >
            {loc.on[user_language]}
          </SegBtn>
        </SegControl>
      </Row>

      {divider}

      <Row label={loc.script[user_language]}>
        <SegControl>
          <SegBtn
            active={pronunciation === 'pinyin'}
            onClick={pronunciation === 'zhuyin' ? handleTogglePronun : () => {}}
          >
            pīnyīn
          </SegBtn>
          <SegBtn
            active={pronunciation === 'zhuyin'}
            onClick={pronunciation === 'pinyin' ? handleTogglePronun : () => {}}
          >
            ㄅㄆㄇ
          </SegBtn>
        </SegControl>
      </Row>

      {pronunciation === 'pinyin' && (
        <>
          {divider}
          <Row label={loc.format[user_language]}>
            <SegControl>
              <SegBtn
                active={pinyinType === 'pinyin_acc'}
                onClick={
                  pinyinType !== 'pinyin_acc' ? handleTogglePinyin : () => {}
                }
              >
                pīnyīn
              </SegBtn>
              <SegBtn
                active={pinyinType === 'pinyin_num'}
                onClick={
                  pinyinType !== 'pinyin_num' ? handleTogglePinyin : () => {}
                }
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
  return (
    <Popover placement="bottom-end" offset={[0, 4]}>
      <PopoverTrigger>
        <IconButton
          aria-label="Text settings"
          icon={<IoTextOutline size={16} />}
          bg="transparent"
          border="1px solid"
          borderColor="borderDefault"
          h="30px"
          minW="30px"
          _hover={{ borderColor: 'borderEmphasis' }}
        />
      </PopoverTrigger>
      <PopoverContent
        width="220px"
        borderRadius="10px"
        border="1px solid"
        borderColor="borderDefault"
        bg="bgCanvas"
        boxShadow="lg"
        _focus={{ outline: 'none' }}
        px={4}
        py={2}
      >
        <PopoverArrow bg="bgCanvas" />
        <PopoverBody p={0}>
          <TextPreferences />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
