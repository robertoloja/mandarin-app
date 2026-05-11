'use client';

import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  IconButton,
  Text,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import {
  IoListOutline,
  IoCloseOutline,
  IoChevronDownOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useReadingBooks } from '@/app/reading/hooks/useReadingBooks';
import { Chapter } from '@/app/reading/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import localization from '@/localization/main';
import { ACCENT_DARK, ACCENT_LIGHT, FONT_SANS, FONT_SERIF, FONT_CHINESE, FONT_SIZE_MICRO, FONT_SIZE_LABEL, FONT_SIZE_SMALL, FONT_SIZE_UI, FONT_SIZE_BODY } from '@/theme';

function ChapterRow({
  chapter,
  currentChapterOrder,
  currentBookSlug,
  onClose,
  isDark,
  notYetAvailableLabel,
}: {
  chapter: Chapter;
  currentChapterOrder?: number;
  currentBookSlug?: string;
  onClose: () => void;
  isDark: boolean;
  notYetAvailableLabel: string;
}) {
  const isAvailable =
    chapter.book_slug !== undefined && chapter.chapter_order !== undefined;
  const isCurrent =
    isAvailable &&
    chapter.book_slug === currentBookSlug &&
    chapter.chapter_order === currentChapterOrder;
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;

  const inner = (
    <Box
      display="block"
      w="100%"
      px={4}
      pl="14px"
      py="9px"
      borderLeft={`2px solid ${isCurrent ? accent : 'transparent'}`}
      bg={isCurrent ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)') : 'transparent'}
      cursor={isAvailable ? 'pointer' : 'not-allowed'}
      title={!isAvailable ? notYetAvailableLabel : undefined}
      _hover={isAvailable ? { bg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' } : undefined}
    >
      <Box display="flex" alignItems="baseline" gap={2}>
        <Text
          fontFamily={FONT_SANS}
          fontSize={FONT_SIZE_SMALL}
          color={!isAvailable ? 'borderEmphasis' : 'fgSubtle'}
          minW="22px"
          sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {chapter.number}
        </Text>
        <Text
          fontFamily={FONT_SANS}
          fontSize={FONT_SIZE_UI}
          fontWeight={isCurrent ? 600 : 400}
          color={
            !isAvailable ? 'borderEmphasis' : isCurrent ? 'fgPrimary' : 'fgBody'
          }
          lineHeight={1.35}
        >
          {chapter.title}
        </Text>
      </Box>
    </Box>
  );

  if (isAvailable) {
    return (
      <Link
        href={`/reading/${chapter.book_slug}/${chapter.chapter_order}`}
        onClick={onClose}
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

function SubchapterRow({
  name,
  bookSlug,
  chapterOrder,
  currentChapterOrder,
  currentBookSlug,
  onClose,
  isDark,
  isAvailable,
}: {
  name: string;
  bookSlug: string;
  chapterOrder: number;
  currentChapterOrder?: number;
  currentBookSlug?: string;
  onClose: () => void;
  isDark: boolean;
  isAvailable: boolean;
}) {
  const isCurrent =
    isAvailable && bookSlug === currentBookSlug && chapterOrder === currentChapterOrder;
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;

  const inner = (
    <Box
      pl="38px"
      pr={4}
      py="7px"
      borderLeft={`2px solid ${isCurrent ? accent : 'transparent'}`}
      bg={isCurrent ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)') : 'transparent'}
      cursor={isAvailable ? undefined : 'not-allowed'}
      _hover={isAvailable ? { bg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' } : undefined}
    >
      <Text
        fontFamily={FONT_SANS}
        fontSize={FONT_SIZE_UI}
        fontWeight={isCurrent ? 600 : 400}
        color={!isAvailable ? 'borderEmphasis' : isCurrent ? 'fgPrimary' : 'fgMuted'}
        lineHeight={1.35}
        noOfLines={1}
      >
        {name}
      </Text>
    </Box>
  );

  if (isAvailable) {
    return (
      <Link href={`/reading/${bookSlug}/${chapterOrder}`} onClick={onClose}>
        {inner}
      </Link>
    );
  }
  return inner;
}

function GroupHeader({
  chapter,
  isExpanded,
  onToggle,
  isDark,
}: {
  chapter: Chapter;
  isExpanded: boolean;
  onToggle: () => void;
  isDark: boolean;
}) {
  return (
    <Box
      as="button"
      w="100%"
      display="flex"
      alignItems="center"
      gap={2}
      px={4}
      pl="14px"
      py="9px"
      borderLeft="2px solid transparent"
      cursor="pointer"
      onClick={onToggle}
      _hover={{ bg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
    >
      <Text
        fontFamily={FONT_SANS}
        fontSize={FONT_SIZE_SMALL}
        color="fgSubtle"
        minW="22px"
        sx={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {chapter.number}
      </Text>
      <Text
        fontFamily={FONT_SANS}
        fontSize={FONT_SIZE_UI}
        color="fgBody"
        lineHeight={1.35}
        flex={1}
        textAlign="left"
      >
        {chapter.title}
      </Text>
      <Box color="fgSubtle" flexShrink={0}>
        {isExpanded ? (
          <IoChevronDownOutline size={13} />
        ) : (
          <IoChevronForwardOutline size={13} />
        )}
      </Box>
    </Box>
  );
}

export default function TableOfContentsButton({
  iconSize,
}: {
  iconSize: number;
}) {
  const pathname = usePathname();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const books = useReadingBooks();
  const isDark = colorMode === 'dark';
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );
  const loc = localization.top_nav;

  const parts = pathname.split('/');
  const isChapterPage = parts[1] === 'reading' && parts.length >= 4;
  const bookSlug = isChapterPage ? parts[2] : undefined;
  const currentChapterOrder = isChapterPage ? parseInt(parts[3]) : undefined;
  const readingProps = bookSlug ? books[bookSlug] : null;

  const allChapters = readingProps?.chapters.flat() ?? [];

  const findExpandedIdx = () =>
    allChapters.findIndex((c) =>
      c.subchapters?.some(
        (s) => s.book_slug === bookSlug && s.chapter_order === currentChapterOrder,
      ),
    );

  const [expandedIdx, setExpandedIdx] = useState(findExpandedIdx);

  useEffect(() => {
    onClose();
    setExpandedIdx(findExpandedIdx());
  }, [pathname]);

  if (!readingProps) return null;

  const totalDirect =
    allChapters.filter((c) => c.book_slug).length +
    allChapters.flatMap((c) => c.subchapters ?? []).filter((s) => s.chapter_order <= 10).length;

  const currentIdx = allChapters.reduce((acc, c) => {
    if (c.book_slug === bookSlug && c.chapter_order === currentChapterOrder)
      return acc + 1;
    const sub = (c.subchapters ?? []).findIndex(
      (s) => s.book_slug === bookSlug && s.chapter_order === currentChapterOrder,
    );
    if (sub !== -1) return acc + sub + 1;
    return acc;
  }, 0);

  return (
    <>
      <IconButton
        aria-label="Table of contents"
        icon={<IoListOutline size={iconSize + 3} />}
        bg="bgSubtle"
        border="1px solid"
        borderColor="borderDefault"
        h="30px"
        minW="30px"
        _hover={{ borderColor: 'borderEmphasis' }}
        onClick={onOpen}
      />

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay bg="blackAlpha.300" />
        <DrawerContent
          bg="bgCanvas"
          borderLeft="1px solid"
          borderColor="borderDefault"
          maxW="280px"
        >
          <DrawerBody p={0} display="flex" flexDirection="column">
            {/* Header */}
            <Box
              px={5}
              pt={5}
              pb={4}
              borderBottom="1px solid"
              borderColor="borderSubtle"
              flexShrink={0}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={3}
              >
                <Text
                  fontFamily={FONT_SANS}
                  fontSize={FONT_SIZE_MICRO}
                  textTransform="uppercase"
                  letterSpacing="0.14em"
                  color="fgSubtle"
                >
                  {loc.reading[user_language]}
                </Text>
                <Box
                  as="button"
                  onClick={onClose}
                  color="fgSubtle"
                  _hover={{ color: 'fgPrimary' }}
                  mt="-2px"
                >
                  <IoCloseOutline size={18} />
                </Box>
              </Box>
              <Text
                fontFamily={FONT_SERIF}
                fontStyle="italic"
                fontSize="1.0625rem"
                fontWeight={500}
                color="fgPrimary"
                lineHeight={1.25}
                mb={1}
              >
                {readingProps.title}
              </Text>
              <Text
                fontFamily={FONT_CHINESE}
                fontSize={FONT_SIZE_BODY}
                color="fgMuted"
                mb={2}
              >
                {readingProps.mandarinTitle}
              </Text>

              {currentIdx > 0 && (
                <Box mt={3} display="flex" alignItems="center" gap={2}>
                  <Box
                    flex={1}
                    h="3px"
                    bg="borderDefault"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      h="100%"
                      w={`${(currentIdx / totalDirect) * 100}%`}
                      bg={isDark ? ACCENT_DARK : ACCENT_LIGHT}
                      borderRadius="full"
                    />
                  </Box>
                  <Text
                    fontFamily={FONT_SANS}
                    fontSize={FONT_SIZE_LABEL}
                    color="fgSubtle"
                    whiteSpace="nowrap"
                  >
                    {currentIdx} / {totalDirect}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Chapter list */}
            <Box flex={1} overflowY="auto" py={2}>
              <Text
                fontFamily={FONT_SANS}
                fontSize={FONT_SIZE_MICRO}
                textTransform="uppercase"
                letterSpacing="0.14em"
                color="fgSubtle"
                px={5}
                pt={2}
                pb={1.5}
              >
                {loc.chapters[user_language]}
              </Text>

              {allChapters.map((chapter, i) => {
                if (chapter.subchapters) {
                  const isExpanded = expandedIdx === i;
                  return (
                    <Box key={i}>
                      <GroupHeader
                        chapter={chapter}
                        isExpanded={isExpanded}
                        onToggle={() => setExpandedIdx(isExpanded ? -1 : i)}
                        isDark={isDark}
                      />
                      {isExpanded &&
                        chapter.subchapters.map((sub, j) => (
                          <SubchapterRow
                            key={j}
                            name={sub.name}
                            bookSlug={sub.book_slug}
                            chapterOrder={sub.chapter_order}
                            currentChapterOrder={currentChapterOrder}
                            currentBookSlug={bookSlug}
                            onClose={onClose}
                            isDark={isDark}
                            isAvailable={sub.chapter_order <= 10}
                          />
                        ))}
                    </Box>
                  );
                }

                return (
                  <ChapterRow
                    key={i}
                    chapter={chapter}
                    currentChapterOrder={currentChapterOrder}
                    currentBookSlug={bookSlug}
                    onClose={onClose}
                    isDark={isDark}
                    notYetAvailableLabel={loc.not_yet_available[user_language]}
                  />
                );
              })}
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
