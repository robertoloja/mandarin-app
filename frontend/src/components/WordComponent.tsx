'use client';

import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useColorMode,
} from '@chakra-ui/react';
import { MandarinWordType, ChineseDictionary } from '../utils/types';
import { UserLanguage } from '@/localization/main';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import Pinyin from 'pinyin-tone';
import DefinitionContent from './DefinitionComponent';

const TONE_DARK: Record<number, string> = {
  1: 'oklch(0.78 0.13 25)',
  2: 'oklch(0.82 0.12 75)',
  3: 'oklch(0.80 0.13 145)',
  4: 'oklch(0.78 0.11 250)',
  0: 'oklch(0.65 0.005 60)',
};

const TONE_LIGHT: Record<number, string> = {
  1: 'oklch(0.50 0.16 25)',
  2: 'oklch(0.55 0.14 75)',
  3: 'oklch(0.48 0.14 145)',
  4: 'oklch(0.48 0.13 250)',
  0: 'oklch(0.42 0.005 60)',
};

function getTone(char: string, dict: ChineseDictionary): number {
  const py = dict[char]?.pinyin?.[0] ?? '';
  const m = py.match(/(\d)$/);
  if (!m) return 0;
  const t = parseInt(m[1]);
  return t === 5 ? 0 : t;
}

function Word(props: {
  word: MandarinWordType;
  pronunciation: string[];
  definitions: string[];
  user_language: UserLanguage;
  dictionary?: ChineseDictionary;
}) {
  const { colorMode } = useColorMode();
  const pronunciationSetting = useSelector(
    (state: RootState) => state.settings.pronunciation,
  );
  const pinyinSetting = useSelector(
    (state: RootState) => state.settings.pinyin_type,
  );
  const pronunciationFontSize = useSelector(
    (state: RootState) => state.settings.pronunciationFontSize,
  );
  const reduxDictionary = useSelector(
    (state: RootState) => state.sentence.mandarinDictionary,
  );
  const dictionary = props.dictionary ?? reduxDictionary;

  const isPunct =
    props.word.word === '' ||
    (props.pronunciation.length > 0 &&
      props.word.word === props.pronunciation[0]);

  if (isPunct) {
    return (
      <span
        style={{
          fontFamily: '"Noto Serif SC", serif',
          fontSize: '1.5rem',
          color: 'inherit',
        }}
      >
        {props.word.word}
      </span>
    );
  }

  const chars = props.word.word.split('');
  const palette = colorMode === 'dark' ? TONE_DARK : TONE_LIGHT;
  const showRuby = pronunciationFontSize !== 0;
  const isZhuyin = pronunciationSetting === 'zhuyin';

  const getCharPron = (c: string): string => {
    if (!dictionary[c]) return '';
    if (pronunciationSetting === 'pinyin') {
      if (pinyinSetting === 'pinyin_acc') {
        return Pinyin(dictionary[c].pinyin[0]?.toLowerCase() ?? '');
      }
      return dictionary[c].pinyin[0] ?? '';
    }
    return dictionary[c].zhuyin[0] ?? '';
  };

  const rubyText = chars.map((c) => getCharPron(c)).join(isZhuyin ? ' ' : '');
  const rubyColor =
    colorMode === 'dark' ? 'oklch(0.68 0.008 70)' : 'oklch(0.48 0.008 60)';

  return (
    <Popover placement="bottom" isLazy lazyBehavior="unmount">
      <PopoverTrigger>
        <Box
          as="span"
          position="relative"
          display="inline-block"
          cursor="pointer"
          fontFamily='"Noto Serif SC", serif'
          fontSize="1.5rem"
          lineHeight={showRuby ? (isZhuyin ? '2.6' : '2.4') : '1.8'}
          pt={showRuby ? (isZhuyin ? '1.7em' : '1.4em') : '2px'}
          pb="4px"
          px="2px"
          mx="1px"
          borderRadius={4}
          className="reading-token"
          userSelect="none"
          tabIndex={0}
          aria-label={`word: ${props.word.word}`}
        >
          {showRuby && (
            <Box
              as="span"
              position="absolute"
              top={isZhuyin ? '0.2em' : '0.28em'}
              left={0}
              right={0}
              textAlign="center"
              fontFamily={
                isZhuyin
                  ? '"Noto Sans TC", "Noto Serif SC", system-ui'
                  : '"IBM Plex Sans", system-ui, sans-serif'
              }
              fontSize={`${isZhuyin ? 0.72 : 0.65}rem`}
              color={rubyColor}
              whiteSpace="nowrap"
              pointerEvents="none"
              aria-hidden
            >
              {rubyText}
            </Box>
          )}
          {chars.map((c, i) => (
            <Box as="span" key={i} color={palette[getTone(c, dictionary)]}>
              {c}
            </Box>
          ))}
        </Box>
      </PopoverTrigger>
      <PopoverContent
        width="360px"
        borderRadius="10px"
        overflow="hidden"
        zIndex={200}
        _focus={{ outline: 'none' }}
      >
        <PopoverArrow />
        <PopoverBody p={0}>
          <DefinitionContent
            word={props.word.word}
            definitions={props.definitions}
            dictionary={dictionary}
            user_language={props.user_language}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default Word;
