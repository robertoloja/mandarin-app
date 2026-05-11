'use client';

import { RootState, store } from '@/utils/store/store';
import { useSelector } from 'react-redux';
import { Box, Collapse, Text, useColorMode, useDisclosure } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  setPronunciationFontSize,
  togglePinyin,
  togglePronunciation,
  setToneColors,
} from '@/utils/store/settingsSlice';
import { MandoBotAPI } from '@/utils/api';
import PasswordChangeComponent from '../auth/components/PasswordChangeComponent';
import LanguagePreferencesComponent from '@/components/LanguagePreferencesComponent';
import localization from '@/localization/main';
import {
  FONT_SANS,
  FONT_SERIF,
  FONT_SIZE_LABEL,
  FONT_SIZE_SMALL,
  FONT_SIZE_UI,
  FONT_SIZE_SUBHEAD,
} from '@/theme';

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
      fontSize={FONT_SIZE_SMALL}
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

function SegControl({ children }: { children: React.ReactNode }) {
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" gap={4} py="10px">
      <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgBody" whiteSpace="nowrap">
        {label}
      </Text>
      {children}
    </Box>
  );
}

function Divider() {
  return <Box borderBottom="1px solid" borderColor="borderSubtle" />;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <Box
      maxW="2xl"
      w="100%"
      border="1px solid"
      borderColor="borderDefault"
      borderRadius="12px"
      bg="bgCanvas"
      px={[6, 8]}
      py={6}
      mb={4}
    >
      {children}
    </Box>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontFamily={FONT_SANS}
      fontSize={FONT_SIZE_LABEL}
      textTransform="uppercase"
      letterSpacing="0.14em"
      color="fgMuted"
      mb={4}
    >
      {children}
    </Text>
  );
}

export default function Settings() {
  const router = useRouter();
  const email = useSelector((state: RootState) => state.auth.email);
  const username = useSelector((state: RootState) => state.auth.username);
  const user_language = useSelector((state: RootState) => state.settings.user_language);
  const pronunciation = useSelector((state: RootState) => state.settings.pronunciation);
  const pinyinType = useSelector((state: RootState) => state.settings.pinyin_type);
  const pronunciationFontSize = useSelector((state: RootState) => state.settings.pronunciationFontSize);
  const toneColors = useSelector((state: RootState) => state.settings.toneColors);
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure();

  const loc = localization.account_settings;
  const navLoc = localization.top_nav;
  const rubyOn = pronunciationFontSize !== 0;

  useEffect(() => {
    document.title = 'mandoBot - Settings';
    if (!username) router.push('/');
  }, []);

  if (!username) return null;

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

  return (
    <Box display="flex" flexDirection="column" alignItems="center" px={[4, 8]} pt={10} pb={20}>
      <Box maxW="2xl" w="100%" mb={6}>
        <Text
          fontFamily={FONT_SERIF}
          fontSize={FONT_SIZE_SUBHEAD}
          fontWeight={500}
          fontStyle="italic"
          color="fgPrimary"
        >
          {loc.settings[user_language]}
        </Text>
      </Box>

      <Card>
        <SectionLabel>{loc.account[user_language]}</SectionLabel>
        <Row label={loc.username[user_language]}>
          <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgMuted">
            {username}
          </Text>
        </Row>
        <Divider />
        <Row label={loc.email[user_language]}>
          <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgMuted">
            {email}
          </Text>
        </Row>
        <Divider />
        <Row label={loc.change_password[user_language]}>
          <Box
            as="button"
            onClick={onToggle}
            fontFamily={FONT_SANS}
            fontSize={FONT_SIZE_SMALL}
            fontWeight={500}
            px={3}
            py="4px"
            border="1px solid"
            borderColor="borderEmphasis"
            borderRadius="6px"
            bg="transparent"
            color="fgBody"
            cursor="pointer"
            transition="all 0.14s"
            _hover={{ borderColor: 'fgMuted', color: 'fgPrimary' }}
          >
            {isOpen ? loc.hide[user_language] : loc.show[user_language]}
          </Box>
        </Row>
        <Collapse in={isOpen}>
          <Box pt={2} pb={1}>
            <PasswordChangeComponent changed={onToggle} user_language={user_language} />
          </Box>
        </Collapse>
      </Card>

      <Card>
        <SectionLabel>{loc.pronunciation_preferences[user_language]}</SectionLabel>
        <Row label={navLoc.pronunciation[user_language]}>
          <SegControl>
            <SegBtn
              active={!rubyOn}
              onClick={() => store.dispatch(setPronunciationFontSize(0))}
            >
              {navLoc.off[user_language]}
            </SegBtn>
            <SegBtn
              active={rubyOn}
              onClick={() => store.dispatch(setPronunciationFontSize(pronunciationFontSize || 15))}
            >
              {navLoc.on[user_language]}
            </SegBtn>
          </SegControl>
        </Row>
        <Divider />
        <Row label={navLoc.script[user_language]}>
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
            <Divider />
            <Row label={navLoc.format[user_language]}>
              <SegControl>
                <SegBtn
                  active={pinyinType === 'pinyin_acc'}
                  onClick={pinyinType !== 'pinyin_acc' ? handleTogglePinyin : () => {}}
                >
                  pīnyīn
                </SegBtn>
                <SegBtn
                  active={pinyinType === 'pinyin_num'}
                  onClick={pinyinType !== 'pinyin_num' ? handleTogglePinyin : () => {}}
                >
                  pin1yin1
                </SegBtn>
              </SegControl>
            </Row>
          </>
        )}
        <Divider />
        <Row label={loc.tone_colors[user_language]}>
          <SegControl>
            <SegBtn active={!toneColors} onClick={() => store.dispatch(setToneColors(false))}>
              {navLoc.off[user_language]}
            </SegBtn>
            <SegBtn active={toneColors} onClick={() => store.dispatch(setToneColors(true))}>
              {navLoc.on[user_language]}
            </SegBtn>
          </SegControl>
        </Row>
      </Card>

      <Card>
        <SectionLabel>{loc.interface[user_language]}</SectionLabel>
        <Row label={loc.user_language[user_language]}>
          <LanguagePreferencesComponent />
        </Row>
        <Divider />
        <Row label={loc.color_theme[user_language]}>
          <SegControl>
            <SegBtn
              active={colorMode === 'light'}
              onClick={colorMode !== 'light' ? toggleColorMode : () => {}}
            >
              {loc.light[user_language]}
            </SegBtn>
            <SegBtn
              active={colorMode === 'dark'}
              onClick={colorMode !== 'dark' ? toggleColorMode : () => {}}
            >
              {loc.dark[user_language]}
            </SegBtn>
          </SegControl>
        </Row>
      </Card>

      <Card>
        <SectionLabel>{loc.danger_zone[user_language]}</SectionLabel>
        <Row label={loc.delete_account[user_language]}>
          <Box
            as="button"
            disabled
            fontFamily={FONT_SANS}
            fontSize={FONT_SIZE_SMALL}
            fontWeight={500}
            px={3}
            py="4px"
            border="1px solid"
            borderColor="red.300"
            borderRadius="6px"
            bg="transparent"
            color="red.300"
            cursor="not-allowed"
            opacity={0.5}
          >
            {loc.delete_account[user_language]}
          </Box>
        </Row>
      </Card>
    </Box>
  );
}
