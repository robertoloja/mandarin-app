'use client';

import styles, { bgColor } from '@/themes';
import { Box, VStack, Text, Center } from '@chakra-ui/react';
import { Cinzel, Yuji_Mai } from 'next/font/google';
import Link from 'next/link';
import { useState } from 'react';
import AttributionPopover from './AttributionPopover';
import { ReadingProps } from '../types';
import { NavArrows } from './NavArrowsComponent';
import { Chapters } from './ChaptersComponent';

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
  const [activePage, setActivePage] = useState(0);
  const [accordionIndex, setAccordionIndex] = useState<number | number[]>(-1);
  const heightModifier = () => {
    if (
      accordionIndex !== -1 &&
      typeof accordionIndex === 'number' &&
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
      __css={styles.darkBox.dark}
    >
      <AttributionPopover text={attribution.text} image={attribution.image} />

      {/* Right-side solid panel with gradient */}
      <Box
        position="absolute"
        top={['14rem', '0']}
        right="0"
        height="100%"
        width={['100%', '23rem']}
        bg={bgColor.front.dark}
        opacity={['100%', '97%']}
        textColor="rgb(231, 231, 230)"
        _before={{
          content: '""',
          position: 'absolute',
          top: '0',
          left: '-40%',
          height: '100%',
          width: '40%',
          bgGradient: `linear(to-l, ${bgColor.front.dark}, rgba(73,82,85, 0))`,
        }}
      >
        <Box
          p="1"
          height="100%"
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          __css={styles.lightBox.dark}
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
                  aria-label="mandarin heading"
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
                aria-label="english heading"
              >
                {englishTitle}
              </Text>
            </VStack>
          </Center>

          <Chapters
            accordionIndex={accordionIndex}
            chapters={chapters}
            setAccordionIndex={setAccordionIndex}
            activePage={activePage}
          />
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
