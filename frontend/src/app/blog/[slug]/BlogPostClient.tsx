'use client';

import NextLink from 'next/link';
import { Box, Link, Text } from '@chakra-ui/react';
import BlogProse from '@/components/BlogProseComponent';
import {
  FONT_SANS,
  FONT_SERIF,
  FONT_SIZE_LABEL,
  FONT_SIZE_SUBHEAD,
  FONT_SIZE_UI,
} from '@/theme';

export default function BlogPostClient({
  title,
  author,
  dateLabel,
  dateISO,
  body,
}: {
  title: string;
  author: string;
  dateLabel: string;
  /** Machine-readable date for the <time> element. */
  dateISO: string;
  body: string;
}) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" px={[4, 8]} pt={10} pb={20}>
      <Box maxW="42rem" w="100%">
        <Link
          as={NextLink}
          href="/blog"
          fontFamily={FONT_SANS}
          fontSize={FONT_SIZE_LABEL}
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="fgMuted"
          _hover={{ color: 'fgPrimary' }}
          display="inline-block"
          mb={8}
        >
          ← Writing
        </Link>

        <Box
          as="article"
          border="1px solid"
          borderColor="borderDefault"
          borderRadius="12px"
          px={[5, 8]}
          py={[6, 8]}
        >
          <Text as="time" dateTime={dateISO} display="block" fontFamily={FONT_SANS} fontSize={FONT_SIZE_LABEL} letterSpacing="0.08em" textTransform="uppercase" color="fgSubtle" mb={3}>
            {dateLabel}
          </Text>

          <Text as="h1" fontFamily={FONT_SERIF} fontSize={FONT_SIZE_SUBHEAD} fontWeight={600} color="fgPrimary" lineHeight={1.3} mb={3}>
            {title}
          </Text>

          <Text
            as="p"
            rel="author"
            fontFamily={FONT_SANS}
            fontSize={FONT_SIZE_UI}
            color="fgMuted"
            mb={8}
          >
            By {author}
          </Text>

          <BlogProse>{body}</BlogProse>
        </Box>
      </Box>
    </Box>
  );
}
