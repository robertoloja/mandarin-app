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

interface ReadingProps {
  mandarinTitle: string;
  titleLink: string;
  englishTitle: string;
  chapters: string[][][];
  background: string;
}

export default function ReadingCoverComponent({
  mandarinTitle,
  titleLink,
  englishTitle,
  chapters,
  background,
}: ReadingProps) {
  const { colorMode } = useColorMode();
  const [activePage, setActivePage] = useState(0);
  const [accordionIndex, setAccordionIndex] = useState<number | number[]>(-1);

  return (
    <Box
      position="relative"
      width={['98%', '96%', '40rem']}
      height={
        chapters[0][0].length > 3 ? ['48rem', '34rem'] : ['35rem', '25rem']
      }
      borderRadius={8}
      overflow="hidden"
      backgroundImage={background}
      backgroundSize={['contain', 'cover']}
      backgroundPosition={['top', 'left']}
      m={[1, 4]}
      mt="4"
      __css={styles.darkBox[colorMode]}
    >
      {/* Right-side solid panel with gradient */}
      <Box
        position="absolute"
        top={['35%', '0']}
        right="0"
        height={['65%', '100%']}
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
                    pl={['4rem', '2rem']}
                    ml={chapter[0].length === 1 ? '1rem' : undefined}
                    key={i}
                  >
                    <AccordionItem>
                      <AccordionButton>
                        <HStack
                          cursor={chapter[2] ? 'pointer' : 'not-allowed'}
                          textColor={chapter[2] ? undefined : 'gray'}
                        >
                          {/* List Number */}
                          <Text
                            className={yujiMai.className}
                            textShadow={['1px 1px 1px rgba(20, 20, 20, 0.5)']}
                          >
                            {chapter[0]}
                          </Text>

                          {/* English Chapter Title */}
                          <Text
                            fontSize={['1rem', '0.9rem']}
                            className={cinzel.className}
                            _hover={{ textDecoration: 'underline' }}
                            textShadow={['1px 1px 1px rgba(20, 20, 20, 0.5)']}
                          >
                            {chapter.length === 3 ? (
                              <Link href={`/?share_id=${chapter[2]}`}>
                                {chapter[1]}
                              </Link>
                            ) : (
                              `${chapter[1]}`
                            )}
                          </Text>
                        </HStack>
                      </AccordionButton>

                      {/* Sub-chapters */}
                      {chapter.length > 3 ? (
                        <AccordionPanel mb="0">
                          <VStack m="0" ml={['-7rem', '-4rem']} p="0">
                            {chapter.slice(2).map((x, i) => (
                              <Link href={`/?share_id=${x}`} key={i}>
                                <Text _hover={{ textDecoration: 'underline' }}>
                                  Sub-chapter {i + 1}
                                </Text>
                              </Link>
                            ))}
                          </VStack>
                        </AccordionPanel>
                      ) : undefined}
                    </AccordionItem>
                  </ListItem>
                ))}
              </>
            </Accordion>
          </OrderedList>
        </Box>
      </Box>
      <HStack>
        {activePage > 0 && (
          <Text
            position="absolute"
            bottom={['3rem', '1.5rem']}
            right={['78%', '18rem']}
            cursor="pointer"
            textShadow={['1px 1px 1px rgba(20, 20, 20, 0.8)']}
            _hover={{ textDecoration: 'underline' }}
            onClick={() => {
              setActivePage(activePage - 1);
              setAccordionIndex(-1);
            }}
          >
            上 Previous
          </Text>
        )}
        {activePage < chapters.length - 1 && (
          <Text
            position="absolute"
            bottom={['3rem', '1.5rem']}
            right={['1rem']}
            cursor="pointer"
            textShadow={['1px 1px 1px rgba(20, 20, 20, 0.8)']}
            _hover={{ textDecoration: 'underline' }}
            onClick={() => {
              setActivePage(activePage + 1);
              setAccordionIndex(-1);
            }}
          >
            下 Next
          </Text>
        )}
      </HStack>
    </Box>
  );
}
