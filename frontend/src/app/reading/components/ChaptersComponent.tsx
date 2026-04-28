import {
  Text,
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  HStack,
  ListItem,
  OrderedList,
  VStack,
} from '@chakra-ui/react';
import { ChapterTitle } from './ChapterTitleComponent';
import Link from 'next/link';
import { Chapter } from '../types';
import { Dispatch, SetStateAction } from 'react';

export const Chapters = (props: {
  chapters: Chapter[][];
  activePage: number;
  setAccordionIndex: Dispatch<SetStateAction<number | number[]>>;
  accordionIndex: number | number[];
  currentChapterOrder?: number;
}) => {
  return (
    <OrderedList styleType="none" mt={3} aria-label="chapters container">
      <Accordion
        variant="outline"
        allowToggle
        index={props.accordionIndex}
        onChange={props.setAccordionIndex}
      >
        <>
          {props.chapters[props.activePage].map((chapter, i) => (
            <ListItem
              pl={['3rem', '2rem']}
              ml={chapter.number.length === 1 ? '1rem' : undefined}
              key={i}
            >
              <HStack ml={['2rem', '0rem']}>
                {chapter.subchapters ? (
                  <AccordionItem>
                    <AccordionButton>
                      <ChapterTitle chapter={chapter} />
                    </AccordionButton>

                    <AccordionPanel mb="1rem">
                      <VStack alignItems="left" pl="3rem">
                        {chapter.subchapters.map((subchapter, i) => (
                          <Link
                            href={`/reading/${subchapter.book_slug}/${subchapter.chapter_order}`}
                            key={i}
                          >
                            <Text
                              _hover={{ textDecoration: 'underline' }}
                              color={
                                subchapter.chapter_order ===
                                props.currentChapterOrder
                                  ? 'gray'
                                  : undefined
                              }
                            >
                              {subchapter.name}
                            </Text>
                          </Link>
                        ))}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                ) : (
                  <ChapterTitle
                    chapter={chapter}
                    isCurrentChapter={
                      chapter.chapter_order === props.currentChapterOrder
                    }
                  />
                )}
              </HStack>
            </ListItem>
          ))}
        </>
      </Accordion>
    </OrderedList>
  );
};
