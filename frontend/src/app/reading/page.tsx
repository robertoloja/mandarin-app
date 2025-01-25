'use client';

import { Flex } from '@chakra-ui/react';
import ReadingCoverComponent from './components/ReadingCoverComponent';

export default function ReadingPage() {
  const chapters_1 = [
    ['一', 'Oath in the Peach Garden', 'wSE4FONhWj', 'ArFsAP9TMb'],
    ['二', "Zhang Fei's Anger"],
    ['三', 'Dong Zhuo'],
    ['四', 'Fall of Han'],
    ['五', 'The Rise of Cao Cao'],
  ];
  const chapters_2 = [
    ['六', 'The Palace Fire'],
    ['七', 'Fight at the Pan River'],
    ['八', 'Interlinked Stratagems'],
    ['九', 'Fight at the Pan River'],
    ['十', 'Fight at the Pan River'],
  ];
  const chapters_3 = [
    ['十一', 'Fight at the Pan River'],
    ['十二', 'Fight at the Pan River'],
    ['十三', 'Fight at the Pan River'],
    ['十四', 'Fight at the Pan River'],
    ['十五', 'Fight at the Pan River'],
  ];

  const romance = {
    mandarinTitle: '三國演義',
    titleLink: 'HiCM26DDHH',
    englishTitle: 'Romance of the Three Kingdoms',
    chapters: [chapters_1, chapters_2, chapters_3],
    background: 'romance-cover.jpg',
  };

  const chap1 = [
    ['一', 'Very Good Moon', 'rXMx5WVp7T'],
    ['二', 'No Moonlight Whatsoever'],
    ['三', "Couldn't Fall Asleep"],
    ['四', 'Sat Quietly for a While'],
    ['五', 'A Step Back'],
  ];
  const chap2 = [
    ['六', 'Pitch Black'],
    ['七', 'Their Methods'],
    ['八', 'Somebody Came'],
    ['九', 'They Want to Eat People'],
    ['十', 'Early in the Morning'],
  ];
  const chap3 = [
    ['十一', 'The Sun Has Not Come Out'],
    ['十二', 'I Cannot Think About It'],
    ['十三', 'Perhaps...'],
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
      <ReadingCoverComponent {...romance} />
      <ReadingCoverComponent {...diary} />
    </Flex>
  );
}
