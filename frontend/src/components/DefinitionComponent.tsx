'use client';

import { Box, Text, VStack, HStack, useColorMode } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import { UserLanguage } from '@/localization/main';
import { ChineseDictionary } from '@/utils/types';
import Pinyin from 'pinyin-tone';

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

function DefinitionContent(props: {
  word: string;
  definitions: string[];
  dictionary: ChineseDictionary;
  user_language: UserLanguage;
}) {
  const { colorMode } = useColorMode();
  const pronunciationSetting = useSelector(
    (state: RootState) => state.settings.pronunciation,
  );
  const pinyinSetting = useSelector(
    (state: RootState) => state.settings.pinyin_type,
  );
  const palette = colorMode === 'dark' ? TONE_DARK : TONE_LIGHT;
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'gray.200';
  const subColor = colorMode === 'dark' ? 'gray.500' : 'gray.400';

  const getCharPron = (c: string): string => {
    if (!props.dictionary[c]) return '';
    if (pronunciationSetting === 'pinyin') {
      if (pinyinSetting === 'pinyin_acc') {
        return Pinyin(props.dictionary[c].pinyin[0]?.toLowerCase() ?? '');
      }
      return props.dictionary[c].pinyin[0] ?? '';
    }
    return props.dictionary[c].zhuyin[0] ?? '';
  };

  const chars = props.word.split('');
  const isMulti = chars.length > 1;
  const wordPron = chars.map((c) => getCharPron(c)).join(' ');

  return (
    <VStack align="stretch" spacing={0}>
      {/* Header: large character + pinyin + definition */}
      <Box p="18px 18px 14px" borderBottomWidth={1} borderColor={borderColor}>
        <HStack align="flex-start" spacing={4} mb={3}>
          <Text
            fontFamily='"Noto Serif SC", serif'
            fontSize="44px"
            lineHeight={1}
            letterSpacing="1px"
            flexShrink={0}
          >
            {chars.map((c, i) => (
              <Box as="span" key={i} color={palette[getTone(c, props.dictionary)]}>
                {c}
              </Box>
            ))}
          </Text>
          <Box pt={1}>
            <Text
              fontFamily='"IBM Plex Sans", system-ui, sans-serif'
              fontSize="18px"
              letterSpacing="0.01em"
              mb={1}
            >
              {wordPron}
            </Text>
          </Box>
        </HStack>
        <Text
          fontFamily='"Spectral", Georgia, serif'
          fontSize="16px"
          lineHeight={1.45}
          fontStyle="italic"
        >
          {props.definitions.join('; ')}
        </Text>
      </Box>

      {/* Per-hanzi breakdown for multi-char words */}
      {isMulti && (
        <Box p="12px 14px 14px">
          <Text
            fontSize="10px"
            textTransform="uppercase"
            letterSpacing="0.14em"
            color={subColor}
            mb={2}
            pl={1}
          >
            characters
          </Text>
          <VStack align="start" spacing={2}>
            {chars.map((c, i) =>
              props.dictionary[c] ? (
                <HStack key={i} spacing={3}>
                  <Text
                    fontFamily='"Noto Serif SC", serif'
                    fontSize="22px"
                    color={palette[getTone(c, props.dictionary)]}
                    minW="30px"
                  >
                    {c}
                  </Text>
                  <Text
                    fontFamily='"IBM Plex Sans", system-ui, sans-serif'
                    fontSize="13px"
                    color={subColor}
                    minW="48px"
                  >
                    {getCharPron(c)}
                  </Text>
                  <Text
                    fontFamily='"Spectral", Georgia, serif'
                    fontSize="14px"
                    fontStyle="italic"
                  >
                    {props.dictionary[c][props.user_language]?.join(' / ')}
                  </Text>
                </HStack>
              ) : null,
            )}
          </VStack>
        </Box>
      )}
    </VStack>
  );
}

export default DefinitionContent;
