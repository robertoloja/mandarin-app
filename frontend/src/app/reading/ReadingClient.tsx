'use client';

import { Flex } from '@chakra-ui/react';
import ReadingCoverComponent from './components/ReadingCoverComponent';
import { useReadingBooks } from './hooks/useReadingBooks';

export default function ReadingClient() {
  const books = useReadingBooks();

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
      <ReadingCoverComponent {...books['diary-of-a-madman']} />
      <ReadingCoverComponent {...books['romance-of-the-three-kingdoms']} />
    </Flex>
  );
}
