import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import localization from '@/localization/main';
import { Chapter, ReadingProps } from '../types';

export function useReadingBooks(): Record<string, ReadingProps> {
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );
  const romance_loc = localization.reading_room.romance_of_the_three_kingdoms;
  const diary_loc = localization.reading_room.diary_of_a_madman;

  const romance_chapters_1: Chapter[] = [
    {
      number: '一',
      title: romance_loc.book_1.title[user_language],
      subchapters: [
        { name: romance_loc.book_1.chapter_1[user_language], book_slug: 'romance-of-the-three-kingdoms', chapter_order: 0 },
        { name: romance_loc.book_1.chapter_2[user_language], book_slug: 'romance-of-the-three-kingdoms', chapter_order: 1 },
        { name: romance_loc.book_1.chapter_3[user_language], book_slug: 'romance-of-the-three-kingdoms', chapter_order: 2 },
        { name: romance_loc.book_1.chapter_4[user_language], book_slug: 'romance-of-the-three-kingdoms', chapter_order: 3 },
        { name: romance_loc.book_1.chapter_5[user_language], book_slug: 'romance-of-the-three-kingdoms', chapter_order: 4 },
        { name: romance_loc.book_1.chapter_6[user_language], book_slug: 'romance-of-the-three-kingdoms', chapter_order: 5 },
        { name: romance_loc.book_1.chapter_7[user_language], book_slug: 'romance-of-the-three-kingdoms', chapter_order: 6 },
      ],
    },
    {
      number: '二',
      title: romance_loc.book_2.title[user_language],
      subchapters: [
        { name: romance_loc.book_2.chapter_1[user_language], book_slug: 'romance-of-the-three-kingdoms', chapter_order: 7 },
        { name: romance_loc.book_2.chapter_2[user_language], book_slug: 'romance-of-the-three-kingdoms', chapter_order: 8 },
        { name: romance_loc.book_2.chapter_3[user_language], book_slug: 'romance-of-the-three-kingdoms', chapter_order: 9 },
        { name: romance_loc.book_2.chapter_4[user_language], book_slug: 'romance-of-the-three-kingdoms', chapter_order: 10 },
        { name: romance_loc.book_2.chapter_5[user_language], book_slug: 'romance-of-the-three-kingdoms', chapter_order: 11 },
        { name: romance_loc.book_2.chapter_6[user_language], book_slug: 'romance-of-the-three-kingdoms', chapter_order: 12 },
        { name: romance_loc.book_2.chapter_7[user_language], book_slug: 'romance-of-the-three-kingdoms', chapter_order: 13 },
      ],
    },
    { number: '三', title: romance_loc.book_3[user_language] },
    { number: '四', title: romance_loc.book_4[user_language] },
    { number: '五', title: romance_loc.book_5[user_language] },
  ];
  const romance_chapters_2: Chapter[] = [
    { number: '六', title: romance_loc.book_6[user_language] },
    { number: '七', title: romance_loc.book_7[user_language] },
    { number: '八', title: romance_loc.book_8[user_language] },
    { number: '九', title: romance_loc.book_9[user_language] },
    { number: '十', title: romance_loc.book_10[user_language] },
  ];
  const romance_chapters_3: Chapter[] = [
    { number: '十一', title: romance_loc.book_11[user_language] },
    { number: '十二', title: romance_loc.book_12[user_language] },
    { number: '十三', title: romance_loc.book_13[user_language] },
    { number: '十四', title: romance_loc.book_14[user_language] },
    { number: '十五', title: romance_loc.book_15[user_language] },
  ];
  const romance: ReadingProps = {
    mandarinTitle: '三國演義',
    titleLink: 'HiCM26DDHH',
    title: romance_loc.title[user_language],
    chapters: [romance_chapters_1, romance_chapters_2, romance_chapters_3],
    background: 'romance-cover.jpg',
    attribution: { image: '', text: romance_loc.popover[user_language] },
  };

  const diary_chap1: Chapter[] = [
    { number: '零', title: diary_loc.chapter_1[user_language], book_slug: 'diary-of-a-madman', chapter_order: 0 },
    { number: '一', title: diary_loc.chapter_2[user_language], book_slug: 'diary-of-a-madman', chapter_order: 1 },
    { number: '二', title: diary_loc.chapter_3[user_language], book_slug: 'diary-of-a-madman', chapter_order: 2 },
    { number: '三', title: diary_loc.chapter_4[user_language], book_slug: 'diary-of-a-madman', chapter_order: 3 },
    { number: '四', title: diary_loc.chapter_5[user_language], book_slug: 'diary-of-a-madman', chapter_order: 4 },
  ];
  const diary_chap2: Chapter[] = [
    { number: '五', title: diary_loc.chapter_6[user_language], book_slug: 'diary-of-a-madman', chapter_order: 5 },
    { number: '六', title: diary_loc.chapter_7[user_language], book_slug: 'diary-of-a-madman', chapter_order: 6 },
    { number: '七', title: diary_loc.chapter_8[user_language], book_slug: 'diary-of-a-madman', chapter_order: 7 },
    { number: '八', title: diary_loc.chapter_9[user_language], book_slug: 'diary-of-a-madman', chapter_order: 8 },
    { number: '九', title: diary_loc.chapter_10[user_language], book_slug: 'diary-of-a-madman', chapter_order: 9 },
  ];
  const diary_chap3: Chapter[] = [
    { number: '十', title: diary_loc.chapter_11[user_language], book_slug: 'diary-of-a-madman', chapter_order: 10 },
    { number: '十一', title: diary_loc.chapter_12[user_language], book_slug: 'diary-of-a-madman', chapter_order: 11 },
    { number: '十二', title: diary_loc.chapter_13[user_language], book_slug: 'diary-of-a-madman', chapter_order: 12 },
    { number: '十三', title: diary_loc.chapter_14[user_language], book_slug: 'diary-of-a-madman', chapter_order: 13 },
  ];
  const diary: ReadingProps = {
    mandarinTitle: '狂人日記',
    titleLink: 'oslPMkaKBS',
    title: diary_loc.title[user_language],
    chapters: [diary_chap1, diary_chap2, diary_chap3],
    background: 'lu-xun.jpg',
    attribution: { image: '', text: diary_loc.popover[user_language] },
  };

  return {
    'diary-of-a-madman': diary,
    'romance-of-the-three-kingdoms': romance,
  };
}
