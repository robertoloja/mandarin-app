'use client';

import NextLink from 'next/link';
import { Box, Text } from '@chakra-ui/react';
import { FONT_SANS, FONT_SERIF, FONT_SIZE_LABEL, FONT_SIZE_PROSE, FONT_SIZE_SUBHEAD } from '@/theme';

export type BlogIndexEntry = {
  slug: string;
  title: string;
  description: string;
  dateLabel: string;
};

export default function BlogIndexClient({ posts }: { posts: BlogIndexEntry[] }) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" px={[4, 8]} pt={10} pb={20}>
      <Box maxW="42rem" w="100%">
        <Text as="h1" fontFamily={FONT_SERIF} fontSize={FONT_SIZE_SUBHEAD} fontWeight={500} fontStyle="italic" color="fgPrimary" mb={8}>
          Writing
        </Text>

        {posts.length === 0 ? (
          <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_PROSE} color="fgMuted">
            Nothing published yet.
          </Text>
        ) : (
          <Box display="flex" flexDirection="column" gap={6}>
            {posts.map((post) => (
              <Box
                key={post.slug}
                as={NextLink}
                href={`/blog/${post.slug}`}
                border="1px solid"
                borderColor="borderDefault"
                borderRadius="12px"
                bg="bgCanvas"
                px={[5, 6]}
                py={5}
                transition="border-color 0.14s"
                _hover={{ borderColor: 'borderEmphasis' }}
                aria-label={`Read: ${post.title}`}
              >
                <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_LABEL} letterSpacing="0.08em" textTransform="uppercase" color="fgSubtle" mb={2}>
                  {post.dateLabel}
                </Text>
                <Text fontFamily={FONT_SERIF} fontSize={FONT_SIZE_SUBHEAD} fontWeight={600} color="fgPrimary" mb={2}>
                  {post.title}
                </Text>
                <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_PROSE} color="fgBody" lineHeight={1.7}>
                  {post.description}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
