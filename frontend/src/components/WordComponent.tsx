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
import DefinitionContent from './DefinitionComponent';
import {
  TONE_DARK,
  TONE_LIGHT,
  RUBY_COLOR_DARK,
  RUBY_COLOR_LIGHT,
  getTone,
  getCharPron,
  isPunct,
} from '@/utils/mandarin';
import { FONT_SANS, FONT_CHINESE, FONT_SIZE_READING } from '@/theme';

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

  if (isPunct(props.word.word, props.word.pinyin)) {
    return (
      <span
        style={{
          fontFamily: FONT_CHINESE,
          fontSize: FONT_SIZE_READING,
          lineHeight: 1.4,
          color: 'inherit',
          display: 'inline-block',
          verticalAlign: 'bottom',
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

  const rubyColor = colorMode === 'dark' ? RUBY_COLOR_DARK : RUBY_COLOR_LIGHT;

  return (
    <Popover placement="bottom" isLazy lazyBehavior="unmount">
      <PopoverTrigger>
        <Box
          as="span"
          display="inline-flex"
          verticalAlign="bottom"
          gap="1px"
          cursor="pointer"
          pb="4px"
          px="2px"
          mx="1px"
          borderRadius={4}
          borderBottomWidth="1px"
          borderBottomColor="rgba(0,0,0,0)"
          className="reading-token"
          userSelect="none"
          tabIndex={0}
          aria-label={`word: ${props.word.word}`}
          _hover={{
            borderBottomColor: 'fgSubtle',
          }}
        >
          {chars.map((c, i) => (
            <Box
              key={i}
              as="span"
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              {showRuby && (
                <Box
                  as="span"
                  fontFamily={
                    isZhuyin
                      ? '"Noto Sans TC", "Noto Serif SC", system-ui'
                      : FONT_SANS
                  }
                  fontSize={`${isZhuyin ? 0.72 : 0.65}rem`}
                  lineHeight={1}
                  mb="2px"
                  color={rubyColor}
                  whiteSpace="nowrap"
                  pointerEvents="none"
                  aria-hidden
                >
                  {getCharPron(
                    c,
                    dictionary,
                    pronunciationSetting,
                    pinyinSetting,
                  )}
                </Box>
              )}
              <Box
                as="span"
                fontFamily={FONT_CHINESE}
                fontSize={FONT_SIZE_READING}
                lineHeight={1.1}
                color={palette[getTone(c, dictionary)]}
              >
                {c}
              </Box>
            </Box>
          ))}
        </Box>
      </PopoverTrigger>
      <PopoverContent
        width="360px"
        borderRadius="10px"
        zIndex={200}
        _focus={{ outline: 'none' }}
      >
        <PopoverArrow />
        <PopoverBody p={0} overflow="hidden" borderRadius="10px">
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
