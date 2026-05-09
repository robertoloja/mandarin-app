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
import { TONE_DARK, TONE_LIGHT, RUBY_COLOR_DARK, RUBY_COLOR_LIGHT, getTone, getCharPron } from '@/utils/mandarin';

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
          className="reading-token"
          userSelect="none"
          tabIndex={0}
          aria-label={`word: ${props.word.word}`}
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
                      : '"IBM Plex Sans", system-ui, sans-serif'
                  }
                  fontSize={`${isZhuyin ? 0.72 : 0.65}rem`}
                  lineHeight={1}
                  mb="2px"
                  color={rubyColor}
                  whiteSpace="nowrap"
                  pointerEvents="none"
                  aria-hidden
                >
                  {getCharPron(c, dictionary, pronunciationSetting, pinyinSetting)}
                </Box>
              )}
              <Box
                as="span"
                fontFamily='"Noto Serif SC", serif'
                fontSize="1.5rem"
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
