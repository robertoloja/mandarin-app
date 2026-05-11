'use client';

import {
  Box,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import { MandarinWordType, ChineseDictionary } from '@/utils/types';
import { UserLanguage } from '@/localization/main';
import DefinitionContent from './DefinitionComponent';
import { TONE_DARK, TONE_LIGHT, getTone, getCharPron, isPunct as isPunctChar } from '@/utils/mandarin';
import { FONT_SANS, FONT_CHINESE, FONT_SIZE_MICRO, FONT_SIZE_LABEL, FONT_SIZE_HANZI_MD } from '@/theme';

function VocabCard({
  word,
  dictionary,
  user_language,
}: {
  word: MandarinWordType;
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

  const isDark = colorMode === 'dark';
  const palette = isDark ? TONE_DARK : TONE_LIGHT;
  const chars = word.word.split('');
  const definitions = word.definitions[user_language] ?? [];
  const firstDef = (definitions[0] ?? '').split('(')[0].trim();

  const pron = (c: string) => getCharPron(c, dictionary, pronunciationSetting, pinyinSetting);

  return (
    <Popover placement="bottom" isLazy lazyBehavior="unmount">
      <PopoverTrigger>
        <Box
          as="button"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap="2px"
          borderRadius="6px"
          border="1px solid"
          borderColor="borderDefault"
          bg="bgSubtle"
          px="10px"
          py="8px"
          minW={`${chars.length * 36 + 12}px`}
          cursor="pointer"
          transition="all 0.14s"
          _hover={{
            borderColor: 'fgMuted',
          }}
          className="reading-token"
          aria-label={`word: ${word.word}`}
        >
          <Flex gap="4px">
            {chars.map((c, i) => (
              <Box
                key={i}
                display="flex"
                flexDirection="column"
                alignItems="center"
                minW="28px"
              >
                <Text
                  fontFamily={FONT_CHINESE}
                  fontSize={FONT_SIZE_HANZI_MD}
                  lineHeight={1.1}
                  color={palette[getTone(c, dictionary)]}
                >
                  {c}
                </Text>
                <Text
                  fontFamily={FONT_SANS}
                  fontSize={FONT_SIZE_MICRO}
                  color="fgMuted"
                  mt="1px"
                >
                  {pron(c)}
                </Text>
              </Box>
            ))}
          </Flex>
          {firstDef && (
            <Text
              fontFamily={FONT_SANS}
              fontSize={FONT_SIZE_LABEL}
              color="fgMuted"
              mt="4px"
              maxW="140px"
              textAlign="center"
              lineHeight={1.25}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {firstDef}
            </Text>
          )}
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
            word={word.word}
            definitions={definitions}
            dictionary={dictionary}
            user_language={user_language}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

interface VocabGridProps {
  sentence: MandarinWordType[];
  dictionary: ChineseDictionary;
  user_language: UserLanguage;
}

function VocabGrid({ sentence, dictionary, user_language }: VocabGridProps) {
  return (
    <Box>
      <Flex flexWrap="wrap" gap={2} alignItems="flex-start">
        {sentence.map((word, i) => {
          if (word.word === '\n') {
            return <Box key={i} w="100%" mb={2} />;
          }
          if (isPunctChar(word.word, word.pinyin)) {
            return (
              <Text
                key={i}
                as="span"
                fontFamily={FONT_CHINESE}
                fontSize="1.25rem"
                color="fgMuted"
                alignSelf="center"
                px="2px"
              >
                {word.word}
              </Text>
            );
          }
          return (
            <VocabCard
              key={i}
              word={word}
              dictionary={dictionary}
              user_language={user_language}
            />
          );
        })}
      </Flex>
    </Box>
  );
}

export default VocabGrid;
