'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Box, Flex, Spinner, Text, useColorMode } from '@chakra-ui/react';
import MandarinSentence from '@/components/MandarinSentenceComponent';
import VocabGrid from '@/components/VocabGridComponent';
import { RootState } from '@/utils/store/store';
import { MandoBotAPI } from '@/utils/api';
import { MandarinWordType } from '@/utils/types';

const BOOK_INFO: Record<
  string,
  { title: string; author: string; titleZh: string }
> = {
  'diary-of-a-madman': {
    title: 'Diary of a Madman',
    author: 'Lu Xun · 1918',
    titleZh: '狂人日记',
  },
  'romance-of-the-three-kingdoms': {
    title: 'Romance of the Three Kingdoms',
    author: 'Luo Guanzhong · c. 1400',
    titleZh: '三国演义',
  },
};

export default function ChapterPageClient({
  initialData,
}: {
  initialData: any;
}) {
  const params = useParams();
  const { colorMode } = useColorMode();
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const readingMode = useSelector((state: RootState) => state.settings.readingMode);

  useEffect(() => {
    if (!data && params.book_slug && params.chapter_order) {
      MandoBotAPI.readingRoomChapter(
        params.book_slug as string,
        Number(params.chapter_order),
      )
        .then(setData)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  const bookSlug = params.book_slug as string;
  const chapterOrder = Number(params.chapter_order);
  const book = BOOK_INFO[bookSlug];
  const isDiary = bookSlug === 'diary-of-a-madman';
  const chapterLabel =
    isDiary && chapterOrder === 0
      ? 'Preface'
      : `Chapter ${isDiary ? chapterOrder : chapterOrder + 1}`;

  const translation = data?.translation?.[user_language] ?? '';
  const isDark = colorMode === 'dark';

  const paragraphs = useMemo<MandarinWordType[][]>(() => {
    if (!data?.sentence) return [];
    const result: MandarinWordType[][] = [];
    let current: MandarinWordType[] = [];
    for (const word of data.sentence as MandarinWordType[]) {
      if (word.word === '\n') {
        if (current.length > 0) {
          result.push(current);
          current = [];
        }
      } else {
        current.push(word);
      }
    }
    if (current.length > 0) result.push(current);
    return result;
  }, [data?.sentence]);

  const translationParagraphs = useMemo<string[]>(() => {
    if (!translation) return [];
    return translation
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  }, [translation]);

  return (
    <Box w="100%" minH="100vh" display="flex" flexDirection="column" alignItems="center">
      {loading ? (
        <Flex justify="center" align="center" h="100vh">
          <Spinner size="xl" />
        </Flex>
      ) : data ? (
        <Box w="100%" maxW={readingMode === 'grid' ? '1100px' : '760px'} px={[4, 8]} pt={10} pb={20}>
          {/* Title block */}
          <Box as="header" mb={8}>
            <Text
              fontSize="11px"
              textTransform="uppercase"
              letterSpacing="0.18em"
              color={isDark ? 'gray.500' : 'gray.400'}
              fontFamily='"IBM Plex Sans", system-ui, sans-serif'
              mb={3}
            >
              {chapterLabel}
              {book ? ` · ${book.titleZh}` : ''}
            </Text>
            {book && (
              <>
                <Text
                  as="h1"
                  fontFamily='"Spectral", Georgia, serif'
                  fontSize={['22px', '30px']}
                  fontWeight={500}
                  fontStyle="italic"
                  lineHeight={1.2}
                  letterSpacing="-0.01em"
                  mb={2}
                >
                  {book.title}
                </Text>
                <Text
                  fontSize="13px"
                  color={isDark ? 'gray.500' : 'gray.400'}
                  fontFamily='"IBM Plex Sans", system-ui, sans-serif'
                >
                  {book.author}
                </Text>
              </>
            )}
          </Box>

          {/* Chinese text — per paragraph, with matched translations */}
          {readingMode === 'flow' ? (
            <Box>
              {paragraphs.map((para, i) => (
                <Box key={i}>
                  <MandarinSentence
                    user_language={user_language}
                    sentence={para}
                    dictionary={data.dictionary}
                    noBottomMargin
                  />
                  {translationParagraphs[i] && (
                    <Box
                      mt={3}
                      mb={6}
                      pl={4}
                      borderLeftWidth={2}
                      borderLeftColor={isDark ? 'gray.600' : 'gray.300'}
                    >
                      <Text
                        fontFamily='"Spectral", Georgia, serif'
                        fontStyle="italic"
                        fontSize="16px"
                        lineHeight={1.65}
                        color={isDark ? 'gray.400' : 'gray.600'}
                      >
                        {translationParagraphs[i]}
                      </Text>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Box>
              <Text
                fontSize="12px"
                color={isDark ? 'gray.500' : 'gray.400'}
                mb={4}
                fontFamily='"IBM Plex Sans", sans-serif'
                fontStyle="italic"
              >
                Vocab grid · every word as a study card. Best for vocabulary
                review, not flowing reading.
              </Text>
              {paragraphs.map((para, i) => (
                <Box
                  key={i}
                  mb={6}
                  pb={5}
                  borderBottomWidth={i < paragraphs.length - 1 ? 1 : 0}
                  borderBottomColor={isDark ? 'gray.700' : 'gray.200'}
                >
                  <VocabGrid
                    sentence={para}
                    dictionary={data.dictionary}
                    user_language={user_language}
                  />
                  {translationParagraphs[i] && (
                    <Text
                      mt={3}
                      fontFamily='"Spectral", Georgia, serif'
                      fontStyle="italic"
                      fontSize="15px"
                      lineHeight={1.55}
                      color={isDark ? 'gray.400' : 'gray.600'}
                    >
                      {translationParagraphs[i]}
                    </Text>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Chapter end mark */}
          <Text
            textAlign="center"
            mt={10}
            color={isDark ? 'gray.600' : 'gray.400'}
            fontFamily='"IBM Plex Sans", sans-serif'
            fontSize="13px"
            letterSpacing="0.3em"
          >
            · · ·
          </Text>
        </Box>
      ) : (
        <Flex justify="center" align="center" h="100vh">
          <Text color="gray.500">Chapter not found.</Text>
        </Flex>
      )}
    </Box>
  );
}
