'use client';

import { Flex } from '@chakra-ui/react';
import ReadingCoverComponent from './components/ReadingCoverComponent';
import { Chapter, ReadingProps } from './types';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import localization from '@/localization/main';

export default function ReadingPage() {
  const user_language = useSelector((state: RootState) => state.settings.user_language);
  const romance_localization = localization.reading_room.romance_of_the_three_kingdoms;
  const chapters_1: Chapter[] = [
    {
      number: '一',
      title: romance_localization.book_1.title[user_language],
      subchapters: [
        { name: romance_localization.book_1.chapter_1[user_language], link: 'wSE4FONhWj' },
        { name: romance_localization.book_1.chapter_2[user_language], link: 'hErMG8iNOo' },
        { name: romance_localization.book_1.chapter_3[user_language], link: 'RMY5TrW0T6' },
        { name: romance_localization.book_1.chapter_4[user_language], link: 'MbGAhlo54Y' },
        { name: romance_localization.book_1.chapter_5[user_language], link: 'Q7GnxMzcNw' },
        { name: romance_localization.book_1.chapter_6[user_language], link: '59Yb0VElht' },
        { name: romance_localization.book_1.chapter_7[user_language], link: 'S6c9Ie5ZkS' },
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
      image: `Cover image from 三国演义, published 1957 by 上海人民美术出. Painting by 刘锡永 and 徐正平.`,
      text: `Translation by Wikisource, presented here under the Creative Commons 
      Attribution-ShareAlike 2.0 Generic license. 
      https://en.wikisource.org/wiki/Translation:Romance_of_the_Three_Kingdoms`,
    },
  };

  const chap1: Chapter[] = [
    { number: '零', title: 'Two Brothers', link: 'njxoalFOGc' },
    { number: '一', title: 'A Very Good Moon', link: 'e8PZ8KFE5Y' },
    {
      number: '二',
      title: 'No Moonlight Whatsoever',
      link: 'IlzDKJkIWL',
    },
    { number: '三', title: "Couldn't Fall Asleep", link: 'hOu4JeH5lZ' },
    {
      number: '四',
      title: 'Sat Quietly for a While',
      link: 'xTIybS2MU9',
    },
  ];
  const chap2: Chapter[] = [
    { number: '五', title: 'A Step Back', link: 'YlfLF2_Whw' },
    { number: '六', title: 'Pitch Black', link: 'NUw5_ruh3H' },
    { number: '七', title: 'Their Methods', link: '9d2ulbbTOg' },
    { number: '八', title: 'Somebody Came', link: 'mHOt29iUOn' },
    { number: '九', title: 'They Want to Eat People', link: '-GdH2hZ0h_' },
  ];
  const chap3: Chapter[] = [
    { number: '十', title: 'Early in the Morning', link: 'YwexFVjfJ_' },
    { number: '十一', title: 'The Sun Has Not Come Out', link: 'y1YXd7xxo2' },
    { number: '十二', title: 'I Cannot Think About It', link: 'rPqZ4_WGFo' },
    { number: '十三', title: 'Perhaps...', link: 'wl2tMdK8X1' },
  ];
  const diary = {
    mandarinTitle: '狂人日記',
    titleLink: 'oslPMkaKBS',
    title: 'Diary of a Madman',
    chapters: [chap1, chap2, chap3],
    background: 'lu-xun.jpg',
    attribution: {
      image: `Cover image is 永不休战 by 汤小铭, published in 1973.`,
      text: `Translation by Wikisource, presented here under the Creative Commons 
      Attribution-ShareAlike 2.0 Generic license. 
      https://en.m.wikisource.org/wiki/Translation:Call_to_Arms_(Lu_Xun)/A_Madman%27s_Diary`,
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
