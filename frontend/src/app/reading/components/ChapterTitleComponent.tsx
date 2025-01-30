import { Cinzel, Yuji_Mai } from 'next/font/google';
import { Chapter } from '../types';
import { HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

const yujiMai = Yuji_Mai({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

export const ChapterTitle = (props: { chapter: Chapter }) => {
  return (
    <HStack
      py="0.5rem"
      textColor={
        props.chapter.link || props.chapter.subchapters ? undefined : 'gray'
      }
      cursor={
        props.chapter.link || props.chapter.subchapters
          ? 'pointer'
          : 'not-allowed'
      }
    >
      {/* List Number */}
      <Text
        fontSize={['1rem', '0.9rem']}
        className={yujiMai.className}
        textShadow={['1px 1px 1px rgba(20, 20, 20, 0.5)']}
      >
        {props.chapter.number}
      </Text>
      {/* English Chapter Title */}
      <Text
        fontSize="1rem"
        className={cinzel.className}
        _hover={{ textDecoration: 'underline' }}
        textShadow={['1px 1px 1px rgba(20, 20, 20, 0.5)']}
      >
        {props.chapter.link ? (
          <Link href={`/?share_id=${props.chapter.link}`}>
            {props.chapter.title}
          </Link>
        ) : (
          `${props.chapter.title}`
        )}
      </Text>
    </HStack>
  );
};
