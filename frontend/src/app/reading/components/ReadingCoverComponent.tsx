'use client';

import styles from '@/themes';
import {
  Box,
  VStack,
  Text,
  useColorMode,
  Center,
  ListItem,
  OrderedList,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from '@chakra-ui/react';
import { Cinzel, Yuji_Mai } from 'next/font/google';
import Link from 'next/link';
import { useState } from 'react';
import AttributionPopover from './AttributionPopover';
import { Chapter, ReadingProps } from '../types';

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

export default function ReadingCoverComponent({
  mandarinTitle,
  titleLink,
  englishTitle,
  chapters,
  background,
  attribution,
}: ReadingProps) {
  const { colorMode } = useColorMode();
  const [activePage, setActivePage] = useState(0);
  const [accordionIndex, setAccordionIndex] = useState<number | number[]>(-1);
  const heightModifier = () => {
    if (
      accordionIndex !== -1 &&
      chapters[activePage][accordionIndex].subchapters
    ) {
      return chapters[activePage][accordionIndex].subchapters.length * 2;
    }
    return 16;
  };
  return (
    <Box
      position="relative"
      width={['98%', '96%', '40rem']}
      height={
        accordionIndex !== -1
          ? [`${heightModifier() + 35}rem`, `${heightModifier() + 25}rem`]
          : ['35rem', '25rem']
      }
      borderRadius={8}
      overflow="hidden"
      backgroundImage={background}
      backgroundSize={['contain', 'cover']}
      backgroundPosition={['top', 'left']}
      m={[1, 4]}
      mt="4"
      transition="height 0.2s ease"
      __css={styles.darkBox[colorMode]}
    >
      <AttributionPopover text={attribution.text} image={attribution.image} />

      {/* Right-side solid panel with gradient */}
      <Box
        position="absolute"
        top={['14rem', '0']}
        right="0"
        height="100%"
        width={['100%', '23rem']}
        bg={colorMode == 'light' ? '#85E2FF' : '#495255'}
        opacity={['100%', '97%']}
        _before={{
          content: '""',
          position: 'absolute',
          top: '0',
          left: '-40%',
          height: '100%',
          width: '40%',
          bgGradient:
            colorMode == 'light'
              ? 'linear(to-l, #85E2FF, rgba(133,226,255, 0))'
              : 'linear(to-l, #495255, rgba(73,82,85, 0))',
        }}
      >
        <Box
          p="1"
          height="100%"
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          __css={styles.lightBox[colorMode]}
          border="none"
          shadow="none"
        >
          <Center>
            <VStack>
              <Link href={`/?share_id=${titleLink}`}>
                <Text
                  mt={['-4.8rem', -5]}
                  fontSize="5rem"
                  className={yujiMai.className}
                  textShadow={['3px 3px 5px rgba(20, 20, 20, 1)']}
                  _hover={{ textDecoration: 'underline' }}
                >
                  {mandarinTitle}
                </Text>
              </Link>
              <Text
                mt={['-1.5rem', -5]}
                fontWeight="extrabold"
                fontSize="1.2rem"
                className={cinzel.className}
                textShadow={['3px 3px 5px rgba(20, 20, 20, 1)']}
              >
                {englishTitle}
              </Text>
            </VStack>
          </Center>

          <OrderedList styleType="none" mt={3}>
            <Accordion
              variant="outline"
              allowToggle
              index={accordionIndex}
              onChange={setAccordionIndex}
            >
              <>
                {chapters[activePage].map((chapter, i) => (
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
                                  href={`/?share_id=${subchapter.link}`}
                                  key={i}
                                >
                                  <Text
                                    _hover={{ textDecoration: 'underline' }}
                                  >
                                    {subchapter.name}
                                  </Text>
                                </Link>
                              ))}
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      ) : (
                        <ChapterTitle chapter={chapter} />
                      )}
                    </HStack>
                  </ListItem>
                ))}
              </>
            </Accordion>
          </OrderedList>
        </Box>
      </Box>
      <NavArrows
        activePage={activePage}
        chapters={chapters}
        setActivePage={setActivePage}
        setAccordionIndex={setAccordionIndex}
      />
    </Box>
  );
}

const ChapterTitle = (props: { chapter: Chapter }) => {
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

const NavArrows = (props: {
  activePage: number;
  chapters: Chapter[][];
  setActivePage: (activePage: number) => void;
  setAccordionIndex: (num: number) => void;
}) => {
  return (
    <HStack>
      {props.activePage > 0 && (
        <Text
          position="absolute"
          bottom={['1rem', '1.5rem']}
          right={['78%', '18rem']}
          cursor="pointer"
          textShadow={['1px 1px 1px rgba(20, 20, 20, 0.8)']}
          _hover={{ textDecoration: 'underline' }}
          onClick={() => {
            props.setActivePage(props.activePage - 1);
            props.setAccordionIndex(-1);
          }}
        >
          Previous 上
        </Text>
      )}
      {props.activePage < props.chapters.length - 1 && (
        <Text
          position="absolute"
          bottom={['1rem', '1.5rem']}
          right={['1rem']}
          cursor="pointer"
          textShadow={['1px 1px 1px rgba(20, 20, 20, 0.8)']}
          _hover={{ textDecoration: 'underline' }}
          onClick={() => {
            props.setActivePage(props.activePage + 1);
            props.setAccordionIndex(-1);
          }}
        >
          下 Next
        </Text>
      )}
    </HStack>
  );
};
