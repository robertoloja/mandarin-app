'use client';
import { Box, HStack, Image, Link, Text, useColorMode } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import localization, { UserLanguage } from '@/localization/main';
import { FONT_SANS, FONT_SERIF } from '@/theme';

function FirstVisitCard({ user_language }: { user_language: UserLanguage }) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Box
      mx={[2, 4, 16]}
      maxW="2xl"
      w="100%"
      border="1px solid"
      borderColor="borderDefault"
      borderRadius="12px"
      bg="bgCanvas"
      px={[6, 8]}
      py={6}
    >
      <HStack spacing={3} align="center" mb={5}>
        <Image
          src="/jie.svg"
          alt="解"
          h="28px"
          flexShrink={0}
          filter={isDark ? 'invert(1)' : undefined}
        />
        <Text
          fontFamily={FONT_SERIF}
          fontSize={['16px', '18px']}
          fontWeight={500}
          fontStyle="italic"
          lineHeight={1.3}
          color="fgPrimary"
        >
          {localization.home_page.heading[user_language]}
        </Text>
      </HStack>
      <Text
        as="div"
        fontFamily={FONT_SANS}
        fontSize="14px"
        lineHeight={1.7}
        color="fgBody"
      >
        <ReactMarkdown
          components={{
            p: ({ children }) => <Text mb="1em">{children}</Text>,
            strong: ({ children }) => (
              <Text as="strong" fontWeight={600} color="fgPrimary">
                {children}
              </Text>
            ),
            em: ({ children }) => <Text as="em" fontStyle="italic">{children}</Text>,
            a: ({ href, children }) => (
              <Link href={href} color="fgLink" textDecoration="underline">
                {children}
              </Link>
            ),
          }}
        >
          {localization.home_page.welcome_new[user_language]}
        </ReactMarkdown>
      </Text>
    </Box>
  );
}

export default FirstVisitCard;
