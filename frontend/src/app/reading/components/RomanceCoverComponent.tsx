'use client';

import { Box, VStack, Text } from '@chakra-ui/react';
import { Cinzel, Yuji_Mai } from 'next/font/google';

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

export default function RomanceCoverComponent() {
  return (
    <Box>
      <VStack>
        <Text fontSize="4rem" className={yujiMai.className}>
          三國演義
        </Text>
        <Text fontSize="1rem" className={cinzel.className}>
          Romance of the Three Kingdoms
        </Text>
      </VStack>
    </Box>
  );
}
