import { Yuji_Mai, Goudy_Bookletter_1911 } from 'next/font/google';
import { Chapter } from '../types';
import { HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';

const goudy = Goudy_Bookletter_1911({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

const yujiMai = Yuji_Mai({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

export const ChapterTitle = (props: {
  chapter: Chapter;
  isCurrentChapter?: boolean;
}) => {
  const isDisabled = props.chapter.chapter_order === undefined && !props.chapter.subchapters;
  return (
    <HStack
      py="0.5rem"
      textColor={props.isCurrentChapter || isDisabled ? 'gray' : undefined}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
    >
      <Text
        fontSize={['1rem', '0.9rem']}
        className={yujiMai.className}
        textShadow={['1px 1px 1px rgba(20, 20, 20, 0.5)']}
      >
        {props.chapter.number}
      </Text>
      <Text
        fontSize="1.2rem"
        className={goudy.className}
        _hover={{ textDecoration: 'underline' }}
        textShadow={['1px 1px 1px rgba(20, 20, 20, 0.5)']}
      >
        {props.chapter.chapter_order !== undefined ? (
          <Link
            href={`/reading/${props.chapter.book_slug}/${props.chapter.chapter_order}`}
          >
            {props.chapter.title}
          </Link>
        ) : (
          props.chapter.title
        )}
      </Text>
    </HStack>
  );
};
