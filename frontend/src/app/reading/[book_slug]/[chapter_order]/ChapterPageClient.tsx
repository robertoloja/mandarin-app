'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Box, Flex, Spinner, Text } from '@chakra-ui/react';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import Link from 'next/link';
import MandarinSentence from '@/components/MandarinSentenceComponent';
import { RootState } from '@/utils/store/store';
import { MandoBotAPI } from '@/utils/api';
import { MandarinWordType } from '@/utils/types';
import localization from '@/localization/main';
import { useReadingBooks } from '@/app/reading/hooks/useReadingBooks';
import { FONT_SANS, FONT_SERIF, FONT_SIZE_LABEL, FONT_SIZE_UI, FONT_SIZE_BODY, FONT_SIZE_SUBHEAD, FONT_SIZE_HANZI_SM } from '@/theme';

function ChapterNavLink({
  nav,
  label,
  direction,
}: {
  nav: { book_slug: string; chapter_order: number } | null;
  label: string;
  direction: 'prev' | 'next';
}) {
  if (!nav) return <Box />;
  return (
    <Link href={`/reading/${nav.book_slug}/${nav.chapter_order}`}>
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        color="fgMuted"
        py={3}
        px={2}
        borderRadius={6}
        _hover={{ color: 'fgPrimary', bg: 'bgSubtle' }}
        transition="all 0.14s"
      >
        {direction === 'prev' && <IoChevronBackOutline size={20} />}
        <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_BODY}>
          {label}
        </Text>
        {direction === 'next' && <IoChevronForwardOutline size={20} />}
      </Box>
    </Link>
  );
}

export default function ChapterPageClient({
  initialData,
}: {
  initialData: any;
}) {
  const params = useParams();
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);

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

  const loc = localization.reading_room;
  const books = useReadingBooks();
  const bookSlug = params.book_slug as string;
  const chapterOrder = Number(params.chapter_order);
  const book = books[bookSlug];
  const isDiary = bookSlug === 'diary-of-a-madman';
  const chapterLabel =
    isDiary && chapterOrder === 0
      ? loc.preface[user_language]
      : `${loc.chapter[user_language]} ${isDiary ? chapterOrder : chapterOrder + 1}`;

  const translation = data?.translation?.[user_language] ?? '';

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

  const navList = useMemo(() => {
    if (!book) return [];
    const list: { book_slug: string; chapter_order: number }[] = [];
    for (const ch of book.chapters.flat()) {
      if (ch.subchapters) {
        for (const sub of ch.subchapters) {
          list.push({
            book_slug: sub.book_slug,
            chapter_order: sub.chapter_order,
          });
        }
      } else if (ch.book_slug && ch.chapter_order !== undefined) {
        list.push({ book_slug: ch.book_slug, chapter_order: ch.chapter_order });
      }
    }
    return list;
  }, [book]);

  const currentNavIdx = navList.findIndex(
    (n) => n.book_slug === bookSlug && n.chapter_order === chapterOrder,
  );
  const prevNav = currentNavIdx > 0 ? navList[currentNavIdx - 1] : null;
  const nextNav =
    currentNavIdx < navList.length - 1 ? navList[currentNavIdx + 1] : null;

  return (
    <Box
      w="100%"
      minH="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      {loading ? (
        <Flex justify="center" align="center" h="100vh">
          <Spinner size="xl" />
        </Flex>
      ) : data ? (
        <Box w="100%" px={[4, 8]} pt={10} pb={20}>
          {/* Title block */}
          <Box as="header" mb={8}>
            <Text
              fontSize={FONT_SIZE_LABEL}
              textTransform="uppercase"
              letterSpacing="0.18em"
              color="fgSubtle"
              fontFamily={FONT_SANS}
              mb={3}
            >
              {chapterLabel}
              {book ? ` · ${book.mandarinTitle}` : ''}
            </Text>
            {book && (
              <>
                <Text
                  as="h1"
                  fontFamily={FONT_SERIF}
                  fontSize={[FONT_SIZE_HANZI_SM, '1.875rem']}
                  fontWeight={500}
                  fontStyle="italic"
                  lineHeight={1.2}
                  letterSpacing="-0.01em"
                  mb={2}
                >
                  {book.title}
                </Text>
                <Text
                  fontSize={FONT_SIZE_UI}
                  color="fgSubtle"
                  fontFamily={FONT_SANS}
                >
                  {book.author}
                </Text>
              </>
            )}
          </Box>

          {/* Chinese text — per paragraph, with matched translations */}
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
                    borderLeftColor="borderEmphasis"
                  >
                    <Text
                      fontFamily={FONT_SERIF}
                      fontStyle="italic"
                      fontSize={FONT_SIZE_SUBHEAD}
                      lineHeight={1.65}
                      color="fgMuted"
                    >
                      {translationParagraphs[i]}
                    </Text>
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* Chapter navigation */}
          <Box
            display="flex"
            justifyContent="space-between"
            mt={10}
            pt={8}
            borderTopWidth={1}
            borderColor="borderDefault"
          >
            <ChapterNavLink nav={prevNav} label={loc.previous[user_language]} direction="prev" />
            <ChapterNavLink nav={nextNav} label={loc.next[user_language]} direction="next" />
          </Box>
        </Box>
      ) : (
        <Flex justify="center" align="center" h="100vh">
          <Text color="gray.500">{loc.chapter_not_found[user_language]}</Text>
        </Flex>
      )}
    </Box>
  );
}
