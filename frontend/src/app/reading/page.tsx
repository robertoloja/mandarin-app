'use client';

import { Flex } from '@chakra-ui/react';
import ReadingCoverComponent from './components/ReadingCoverComponent';
import { Chapter, ReadingProps } from './types';

export default function ReadingPage() {
  const chapters_1: Chapter[] = [
    {
      number: '一',
      title: 'Oath in the Peach Garden',
      subchapters: [
        { name: 'Poem', link: 'wSE4FONhWj' },
        { name: 'Great Teacher', link: 'hErMG8iNOo' },
        { name: 'Yellow Turbans', link: 'RMY5TrW0T6' },
        { name: 'Meetings', link: 'MbGAhlo54Y' },
        { name: 'Oath', link: 'Q7GnxMzcNw' },
        { name: "Liu Bei's Triumphs", link: '59Yb0VElht' }, //machine
        { name: 'placeholder', link: 'S6c9Ie5ZkS' }, //machine
      ],
    },
    { number: '二', title: "Zhang Fei's Anger" },
    { number: '三', title: 'Dong Zhuo' },
    { number: '四', title: 'The Fall of Han' },
    { number: '五', title: 'The Rise of Cao Cao' },
  ];
  const chapters_2: Chapter[] = [
    { number: '六', title: 'The Palace Fire' },
    { number: '七', title: 'Fight at the Pan River' },
    { number: '八', title: 'Interlinked Stratagems' },
    { number: '九', title: "Attack on Chang'an" },
    { number: '十', title: "Cao Cao's Revenge" },
  ];
  const chapters_3: Chapter[] = [
    { number: '十一', title: "Cao Cao's Defeat" },
    { number: '十二', title: 'Cao Cao and Lü Bu' },
    { number: '十三', title: "The Emperor's Rescue" },
    { number: '十四', title: 'Cao Cao and the Emperor' },
    { number: '十五', title: 'An Oath, Remembered' },
  ];

  const romance: ReadingProps = {
    mandarinTitle: '三國演義',
    titleLink: 'HiCM26DDHH',
    englishTitle: 'Romance of the Three Kingdoms',
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
    englishTitle: 'Diary of a Madman',
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
    >
      <ReadingCoverComponent {...diary} />
      <ReadingCoverComponent {...romance} />
    </Flex>
  );
}
