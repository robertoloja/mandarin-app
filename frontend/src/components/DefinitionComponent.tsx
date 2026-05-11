'use client';

import { Box, Text, VStack, HStack, useColorMode } from '@chakra-ui/react';
import { FONT_SANS, FONT_SERIF, FONT_CHINESE, FONT_SIZE_MICRO, FONT_SIZE_SMALL, FONT_SIZE_UI, FONT_SIZE_BODY, FONT_SIZE_SUBHEAD, FONT_SIZE_HANZI_SM } from '@/theme';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import { UserLanguage } from '@/localization/main';
import { ChineseDictionary } from '@/utils/types';
import localization from '@/localization/main';
import { TONE_DARK, TONE_LIGHT, getTone, getCharPron } from '@/utils/mandarin';

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
  const toneColors = useSelector((state: RootState) => state.settings.toneColors);
  const palette = toneColors ? (colorMode === 'dark' ? TONE_DARK : TONE_LIGHT) : {};

  const pron = (c: string) => getCharPron(c, props.dictionary, pronunciationSetting, pinyinSetting);

  const chars = props.word.split('');
  const isMulti = chars.length > 1;
  const charFontSize = chars.length <= 2 ? '2.75rem' : chars.length <= 4 ? '2.25rem' : chars.length <= 6 ? '1.75rem' : FONT_SIZE_HANZI_SM;
  const pronFontSize = chars.length <= 2 ? FONT_SIZE_SUBHEAD : chars.length <= 4 ? FONT_SIZE_BODY : FONT_SIZE_SMALL;

  return (
    <VStack align="stretch" spacing={0}>
      <Box p="18px 18px 14px" borderBottomWidth={1} borderColor="borderDefault">
        <Box display="flex" flexWrap="wrap" gap="6px" alignItems="flex-end" mb={3}>
          {chars.map((c, i) => (
            <Box key={i} display="flex" flexDirection="column" alignItems="center">
              <Text
                fontFamily={FONT_SANS}
                fontSize={pronFontSize}
                lineHeight={1}
                mb="3px"
                color="fgMuted"
                letterSpacing="0.01em"
              >
                {pron(c)}
              </Text>
              <Text
                fontFamily={FONT_CHINESE}
                fontSize={charFontSize}
                lineHeight={1}
                color={palette[getTone(c, props.dictionary)]}
              >
                {c}
              </Text>
            </Box>
          ))}
        </Box>
        <Text
          fontFamily={FONT_SERIF}
          fontSize={FONT_SIZE_SUBHEAD}
          lineHeight={1.45}
          fontStyle="italic"
        >
          {props.definitions.join('; ')}
        </Text>
      </Box>

      {isMulti && (
        <Box pt="10px" pb="4px">
          <Text
            fontSize={FONT_SIZE_MICRO}
            textTransform="uppercase"
            letterSpacing="0.14em"
            color="fgMuted"
            mb={1}
            px="14px"
          >
            {localization.top_nav.characters[props.user_language]}
          </Text>
          {chars.map((c, i) =>
            props.dictionary[c] ? (
              <Box key={i}>
                {i > 0 && (
                  <Box borderTopWidth={1} borderColor="borderDefault" mx="14px" />
                )}
                <HStack spacing={3} align="flex-start" px="14px" py="8px">
                  <Text
                    fontFamily={FONT_CHINESE}
                    fontSize={FONT_SIZE_HANZI_SM}
                    lineHeight={1}
                    color={palette[getTone(c, props.dictionary)]}
                    minW="30px"
                    pt="1px"
                  >
                    {c}
                  </Text>
                  <Text
                    fontFamily={FONT_SANS}
                    fontSize={FONT_SIZE_UI}
                    lineHeight={1}
                    color="fgMuted"
                    minW="48px"
                    pt="3px"
                  >
                    {pron(c)}
                  </Text>
                  <Text
                    fontFamily={FONT_SERIF}
                    fontSize={FONT_SIZE_BODY}
                    lineHeight={1.4}
                    fontStyle="italic"
                  >
                    {props.dictionary[c][props.user_language]?.join(' / ')}
                  </Text>
                </HStack>
              </Box>
            ) : null,
          )}
        </Box>
      )}
    </VStack>
  );
}

export default DefinitionContent;
