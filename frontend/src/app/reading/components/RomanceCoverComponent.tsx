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
  Flex,
  textDecoration,
} from '@chakra-ui/react';
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
  const { colorMode } = useColorMode();
  const chapters = [
    ['一', 'Oath in the Peach Garden'],
    ['二', "Zhang Fei's Anger"],
    ['三', 'Dong Zhuo'],
    ['四', 'Fall of Han'],
    ['五', 'The Rise of Cao Cao'],
    ['六', 'The Palace Fire'],
    ['七', 'Fight at the Pan River'],
    ['八', 'Fight at the Pan River'],
    // ['九', 'Fight at the Pan River'],
    // ['十', 'Fight at the Pan River'],
    // ['十一', 'Fight at the Pan River'],
    // ['十二', 'Fight at the Pan River'],
    // ['十三', 'Fight at the Pan River'],
    // ['十四', 'Fight at the Pan River'],
    // ['十五', 'Fight at the Pan River'],
  ];

  return (
    <Flex
      position="relative"
      width={['98%', '96%', '47rem']}
      height={['48rem', '30rem']} // Set card height
      borderRadius={8}
      overflow="hidden"
      backgroundImage="romance-cover.jpg" // Replace with your image URL
      backgroundSize={['contain', 'cover']}
      backgroundPosition={['top', 'left']}
      m={[1, 4]}
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
              <Text
                fontSize="5rem"
                className={yujiMai.className}
                textShadow="2px 2px 2px rgba(70, 70, 70, 0.9)"
              >
                三國演義
              </Text>
              <Text
                mt={-5}
                fontWeight="extrabold"
                fontSize="1.1rem"
                className={cinzel.className}
                textShadow="1px 1px 1px rgba(50, 50, 50, 0.9)"
              >
                Romance of the Three Kingdoms
              </Text>
            </VStack>
          </Center>
          <OrderedList styleType="none" mt={4}>
            {chapters.map((chapter, i) => (
              <ListItem
                pl={['5rem', '2rem']}
                ml={chapter[0].length === 1 ? '1rem' : undefined}
                mt={3}
                key={i}
              >
                <HStack cursor="pointer">
                  <Text className={yujiMai.className}>{chapter[0]}</Text>
                  <Text
                    fontSize="0.9rem"
                    className={cinzel.className}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {chapter[1]}
                  </Text>
                </HStack>
              </ListItem>
            ))}
          </OrderedList>
        </Box>
      </Box>
    </Flex>
  );
}
