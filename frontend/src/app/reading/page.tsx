'use client';

import { Flex } from '@chakra-ui/react';
import ReadingCoverComponent from './components/ReadingCoverComponent';
import { Chapter, ReadingProps } from './types';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import localization from '@/localization/main';

export default function ReadingPage() {
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );
  const romance_localization =
    localization.reading_room.romance_of_the_three_kingdoms;
  const diary_localization = localization.reading_room.diary_of_a_madman;
  const chapters_1: Chapter[] = [
    {
      number: '一',
      title: romance_localization.book_1.title[user_language],
      subchapters: [
        {
          name: romance_localization.book_1.chapter_1[user_language],
          book_slug: 'romance-of-the-three-kingdoms',
          chapter_order: 0,
        },
        {
          name: romance_localization.book_1.chapter_2[user_language],
          book_slug: 'romance-of-the-three-kingdoms',
          chapter_order: 1,
        },
        {
          name: romance_localization.book_1.chapter_3[user_language],
          book_slug: 'romance-of-the-three-kingdoms',
          chapter_order: 2,
        },
        {
          name: romance_localization.book_1.chapter_4[user_language],
          book_slug: 'romance-of-the-three-kingdoms',
          chapter_order: 3,
        },
        {
          name: romance_localization.book_1.chapter_5[user_language],
          book_slug: 'romance-of-the-three-kingdoms',
          chapter_order: 4,
        },
        {
          name: romance_localization.book_1.chapter_6[user_language],
          book_slug: 'romance-of-the-three-kingdoms',
          chapter_order: 5,
        },
        {
          name: romance_localization.book_1.chapter_7[user_language],
          book_slug: 'romance-of-the-three-kingdoms',
          chapter_order: 6,
        },
      ],
    },
    { number: '二', title: romance_localization.book_2[user_language] },
    { number: '三', title: romance_localization.book_3[user_language] },
    { number: '四', title: romance_localization.book_4[user_language] },
    { number: '五', title: romance_localization.book_5[user_language] },
  ];
  const chapters_2: Chapter[] = [
    { number: '六', title: romance_localization.book_6[user_language] },
    { number: '七', title: romance_localization.book_7[user_language] },
    { number: '八', title: romance_localization.book_8[user_language] },
    { number: '九', title: romance_localization.book_9[user_language] },
    { number: '十', title: romance_localization.book_10[user_language] },
  ];
  const chapters_3: Chapter[] = [
    { number: '十一', title: romance_localization.book_11[user_language] },
    { number: '十二', title: romance_localization.book_12[user_language] },
    { number: '十三', title: romance_localization.book_13[user_language] },
    { number: '十四', title: romance_localization.book_14[user_language] },
    { number: '十五', title: romance_localization.book_15[user_language] },
  ];
  const romance: ReadingProps = {
    mandarinTitle: '三國演義',
    titleLink: 'HiCM26DDHH',
    title: romance_localization.title[user_language],
    chapters: [chapters_1, chapters_2, chapters_3],
    background: 'romance-cover.jpg',
    attribution: {
      image: '',
      text: romance_localization.popover[user_language],
    },
  };

  const chap1: Chapter[] = [
    {
      number: '零',
      title: diary_localization.chapter_1[user_language],
      book_slug: 'diary-of-a-madman',
      chapter_order: 0,
    },
    {
      number: '一',
      title: diary_localization.chapter_2[user_language],
      book_slug: 'diary-of-a-madman',
      chapter_order: 1,
    },
    {
      number: '二',
      title: diary_localization.chapter_3[user_language],
      book_slug: 'diary-of-a-madman',
      chapter_order: 2,
    },
    {
      number: '三',
      title: diary_localization.chapter_4[user_language],
      book_slug: 'diary-of-a-madman',
      chapter_order: 3,
    },
    {
      number: '四',
      title: diary_localization.chapter_5[user_language],
      book_slug: 'diary-of-a-madman',
      chapter_order: 4,
    },
  ];
  const chap2: Chapter[] = [
    {
      number: '五',
      title: diary_localization.chapter_6[user_language],
      book_slug: 'diary-of-a-madman',
      chapter_order: 5,
    },
    {
      number: '六',
      title: diary_localization.chapter_7[user_language],
      book_slug: 'diary-of-a-madman',
      chapter_order: 6,
    },
    {
      number: '七',
      title: diary_localization.chapter_8[user_language],
      book_slug: 'diary-of-a-madman',
      chapter_order: 7,
    },
    {
      number: '八',
      title: diary_localization.chapter_9[user_language],
      book_slug: 'diary-of-a-madman',
      chapter_order: 8,
    },
    {
      number: '九',
      title: diary_localization.chapter_10[user_language],
      book_slug: 'diary-of-a-madman',
      chapter_order: 9,
    },
  ];
  const chap3: Chapter[] = [
    {
      number: '十',
      title: diary_localization.chapter_11[user_language],
      book_slug: 'diary-of-a-madman',
      chapter_order: 10,
    },
    {
      number: '十一',
      title: diary_localization.chapter_12[user_language],
      book_slug: 'diary-of-a-madman',
      chapter_order: 11,
    },
    {
      number: '十二',
      title: diary_localization.chapter_13[user_language],
      book_slug: 'diary-of-a-madman',
      chapter_order: 12,
    },
    {
      number: '十三',
      title: diary_localization.chapter_14[user_language],
      book_slug: 'diary-of-a-madman',
      chapter_order: 13,
    },
  ];
  const diary = {
    mandarinTitle: '狂人日記',
    titleLink: 'oslPMkaKBS',
    title: diary_localization.title[user_language],
    chapters: [chap1, chap2, chap3],
    background: 'lu-xun.jpg',
    attribution: {
      image: '',
      text: diary_localization.popover[user_language],
    },
  };

  return (
    <Flex
      align="stretch"
      w="100%"
      h="100%"
      px={['0', '5%']}
      flexWrap="wrap"
      overflow="hidden"
      justifyContent="center"
      aria-label="text container"
    >
      <ReadingCoverComponent {...diary} />
      <ReadingCoverComponent {...romance} />
    </Flex>
  );
}
