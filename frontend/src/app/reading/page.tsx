'use client';

import { Flex } from '@chakra-ui/react';
import ReadingCoverComponent from './components/ReadingCoverComponent';

export default function ReadingPage() {
  const chapters_1 = [
    [
      '一',
      'Oath in the Peach Garden',
      'wSE4FONhWj',
      'hErMG8iNOo',
      'RMY5TrW0T6',
      'MbGAhlo54Y',
      'Q7GnxMzcNw',
      '59Yb0VElht',
      'S6c9Ie5ZkS',
    ],
    ['二', "Zhang Fei's Anger"],
    ['三', 'Dong Zhuo'],
    ['四', 'Fall of Han'],
    ['五', 'The Rise of Cao Cao'],
  ];
  const chapters_2 = [
    ['六', 'The Palace Fire'],
    ['七', 'Fight at the Pan River'],
    ['八', 'Interlinked Stratagems'],
    ['九', "Attack on Chang'an"],
    ['十', "Cao Cao's Revenge"],
  ];
  const chapters_3 = [
    ['十一', "Cao Cao's Defeat"],
    ['十二', 'Cao Cao and Lü Bu'],
    ['十三', "The Emperor's Rescue"],
    ['十四', 'Cao Cao and the Emperor'],
    ['十五', 'An Oath, Remembered'],
  ];

  const romance = {
    mandarinTitle: '三國演義',
    titleLink: 'HiCM26DDHH',
    englishTitle: 'Romance of the Three Kingdoms',
    chapters: [chapters_1, chapters_2, chapters_3],
    background: 'romance-cover.jpg',
  };

  const chap1 = [
    ['零', 'Two Brothers', 'njxoalFOGc'],
    ['一', 'A Very Good Moon', 'e8PZ8KFE5Y'],
    ['二', 'No Moonlight Whatsoever', 'IlzDKJkIWL'],
    ['三', "Couldn't Fall Asleep"],
    ['四', 'Sat Quietly for a While', 'xTIybS2MU9'],
  ];
  const chap2 = [
    ['五', 'A Step Back', 'YlfLF2_Whw'],
    ['六', 'Pitch Black', 'NUw5_ruh3H'],
    ['七', 'Their Methods'],
    ['八', 'Somebody Came', 'mHOt29iUOn'],
    ['九', 'They Want to Eat People', '-GdH2hZ0h_'],
  ];
  const chap3 = [
    ['十', 'Early in the Morning', 'YwexFVjfJ_'],
    ['十一', 'The Sun Has Not Come Out', 'y1YXd7xxo2'],
    ['十二', 'I Cannot Think About It', 'rPqZ4_WGFo'],
    ['十三', 'Perhaps...', 'wl2tMdK8X1'],
  ];

  const diary = {
    mandarinTitle: '狂人日記',
    titleLink: 'oslPMkaKBS',
    englishTitle: 'Diary of a Madman',
    chapters: [chap1, chap2, chap3],
    background: 'lu-xun.jpg',
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
