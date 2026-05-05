'use client';

import {
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useColorMode,
  PopoverArrow,
} from '@chakra-ui/react';
import { IoListOutline } from 'react-icons/io5';
import { usePathname } from 'next/navigation';
import { useReadingBooks } from '@/app/reading/hooks/useReadingBooks';
import ReadingCoverComponent from '@/app/reading/components/ReadingCoverComponent';

export default function TableOfContentsButton({
  iconSize,
}: {
  iconSize: number;
}) {
  const pathname = usePathname();
  const { colorMode } = useColorMode();
  const books = useReadingBooks();

  const parts = pathname.split('/');
  // pathname: /reading/[book_slug]/[chapter_order] → parts = ['', 'reading', slug, order]
  const isChapterPage = parts[1] === 'reading' && parts.length >= 4;
  const readingProps = isChapterPage ? books[parts[2]] : null;
  const currentChapterOrder = isChapterPage ? parseInt(parts[3]) : undefined;

  if (!readingProps) return null;

  return (
    <Popover placement="bottom-end" offset={[0, 4]}>
      <PopoverTrigger>
        <IconButton
          aria-label="table of contents"
          icon={<IoListOutline size={iconSize + 3} />}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
        />
      </PopoverTrigger>
      <PopoverContent
        w="fit-content"
        border="none"
        bg="transparent"
        boxShadow="none"
        p={0}
      >
        <PopoverArrow />
        <PopoverBody p={0}>
          <ReadingCoverComponent
            {...readingProps}
            currentChapterOrder={currentChapterOrder}
            noMargin
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
