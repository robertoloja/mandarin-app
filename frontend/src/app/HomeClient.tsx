'use client';

import { Box, Text } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { MandarinSentenceClass } from './MandarinSentenceClass';
import MandarinSentence from '@/components/MandarinSentenceComponent';
import ProgressBar from '@/components/ProgressBarComponent';
import { SegmentResponseType, MandarinWordType } from '@/utils/types';
import { RootState, store } from '@/utils/store/store';
import { MandoBotAPI } from '@/utils/api';
import TextInput from '@/components/TextInputComponent';
import { updateLoading } from '@/utils/store/loadingSlice';
import localization from '@/localization/main';
import WelcomeCard from '@/components/WelcomeCardComponent';
import { FONT_SANS, FONT_SERIF } from '@/theme';

const SENTENCE_ENDINGS = new Set(['。', '！', '？', '…', '!', '?']);

export default function HomeClient() {
  const [isReturningUser, setIsReturningUser] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const percentLoaded = useSelector(
    (state: RootState) => state.loading.percentLoaded,
  );
  const mandarinSentence = useSelector(
    (state: RootState) => state.sentence.mandarinSentence,
  );
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );
  const urlShareId = useSearchParams().get('share_id') || '';

  useEffect(() => {
    setIsReturningUser(!!localStorage.getItem('hasVisited'));
    localStorage.setItem('hasVisited', '1');
  }, []);

  useEffect(() => {
    if (urlShareId !== '') {
      store.dispatch(updateLoading({ percent: 0 }));
      const sharedSentence = new MandarinSentenceClass('');
      sharedSentence.setActive();

      MandoBotAPI.shared(urlShareId).then((response: SegmentResponseType) => {
        store.dispatch(updateLoading({ percent: 100 }));
        if (
          response.translations &&
          Object.keys(response.translations).length > 0
        ) {
          const sharedSentenced = new MandarinSentenceClass(
            '',
            response.sentence,
            response.dictionary,
            response.translations,
            urlShareId,
          );
          sharedSentenced.setActive();
          if (inputRef.current)
            inputRef.current.value = sharedSentenced.mandarin;
        }
      });
    } else {
      if (mandarinSentence.mandarin && inputRef.current)
        inputRef.current.value = mandarinSentence.mandarin;
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    let inputValue = '';
    if (inputRef.current && inputRef.current.value !== '') {
      inputValue = inputRef.current.value;
    }
    const mandarinClassInstance = new MandarinSentenceClass(inputValue);
    mandarinClassInstance.populate();
  };

  const sentences = useMemo<MandarinWordType[][]>(() => {
    if (!mandarinSentence.segments.length) return [];
    const result: MandarinWordType[][] = [];
    let current: MandarinWordType[] = [];
    for (const word of mandarinSentence.segments as MandarinWordType[]) {
      current.push(word);
      if (SENTENCE_ENDINGS.has(word.word) && current.length > 0) {
        result.push(current);
        current = [];
      }
    }
    if (current.length > 0) result.push(current);
    return result;
  }, [mandarinSentence.segments]);

  const translation = mandarinSentence.translations[user_language] ?? '';
  const isLoading = percentLoaded < 100;

  return (
    <Box w="100%" minH="100vh">
      <ProgressBar />
      <Box maxW="760px" mx="auto" px={[4, 8]} pt={8} pb={20}>
        <form onSubmit={handleSubmit}>
          <TextInput inputRef={inputRef} user_language={user_language} />

          <Box display="flex" alignItems="center" gap={3} mt={3}>
            <Box
              as="button"
              type="submit"
              disabled={isLoading}
              fontFamily={FONT_SANS}
              fontSize="13px"
              fontWeight={500}
              px={4}
              py="6px"
              borderRadius="6px"
              border="1px solid"
              borderColor="borderEmphasis"
              bg="transparent"
              color={isLoading ? 'fgSubtle' : 'fgBody'}
              cursor={isLoading ? 'not-allowed' : 'pointer'}
              transition="all 0.14s"
              _hover={
                !isLoading
                  ? { borderColor: 'fgMuted', color: 'fgPrimary' }
                  : undefined
              }
            >
              {localization.home_page.submit[user_language]} ↵
            </Box>

            {isLoading && (
              <Text
                fontFamily={FONT_SANS}
                fontSize="13px"
                fontStyle="italic"
                color="fgSubtle"
              >
                {percentLoaded === 0
                  ? localization.home_page.loading_text1[user_language]
                  : localization.home_page.loading_text2[user_language]}
              </Text>
            )}
          </Box>
        </form>

        <Box mt={8}>
          {sentences.length === 0 && urlShareId === '' ? (
            isReturningUser !== null && (
              <WelcomeCard
                isReturningUser={isReturningUser}
                user_language={user_language}
              />
            )
          ) : (
            <>
              {sentences.map((sentence, i) => (
                <Box key={i} mb={6}>
                  <MandarinSentence
                    sentence={sentence}
                    user_language={user_language}
                    noBottomMargin
                  />
                </Box>
              ))}
              {translation && (
                <Box
                  mt={2}
                  mb={6}
                  pl={4}
                  borderLeftWidth={2}
                  borderLeftColor="borderEmphasis"
                >
                  <Text
                    fontFamily={FONT_SERIF}
                    fontStyle="italic"
                    fontSize="16px"
                    lineHeight={1.65}
                    color="fgMuted"
                  >
                    {translation}
                  </Text>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
