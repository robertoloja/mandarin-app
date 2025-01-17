'use client';

import { Box, Heading, VStack } from '@chakra-ui/react';
import { Cinzel, Yuji_Mai } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400'],
});

const yujiMai = Yuji_Mai({
  subsets: ['latin'],
  weight: ['400'],
});

export default function RomanceCoverComponent() {
  return (
    <Box>
      <VStack>
        <Heading size="4xl" className={yujiMai.className}>
          三國演義
        </Heading>
        <Heading size="sm" className={cinzel.className}>
          Romance of the Three Kingdoms
        </Heading>
      </VStack>
    </Box>
  );
}
