'use client';
import { Box, Text, VStack } from '@chakra-ui/react';
import localization, { UserLanguage } from '@/localization/main';
import AppMarkdown from '@/components/AppMarkdown';
import { FONT_SANS, FONT_SERIF, FONT_SIZE_LABEL, FONT_SIZE_UI, FONT_SIZE_BODY, FONT_SIZE_SUBHEAD } from '@/theme';

function NewsItem({
  item,
  user_language,
  isFirst,
}: {
  item: (typeof localization.home_page.news_items)[number];
  user_language: UserLanguage;
  isFirst: boolean;
}) {
  return (
    <Box>
      {!isFirst && (
        <Box borderTopWidth={1} borderColor="borderSubtle" mb={5} />
      )}
      <Text
        fontFamily={FONT_SERIF}
        fontSize={FONT_SIZE_SUBHEAD}
        fontWeight={500}
        fontStyle="italic"
        lineHeight={1.3}
        color="fgPrimary"
        mb={1}
      >
        {item.heading[user_language]}
      </Text>
      <Text
        fontFamily={FONT_SANS}
        fontSize={FONT_SIZE_LABEL}
        textTransform="uppercase"
        letterSpacing="0.10em"
        color="fgMuted"
        mb={3}
      >
        {item.date[user_language]}
      </Text>
      <Text
        as="div"
        fontFamily={FONT_SANS}
        fontSize={FONT_SIZE_BODY}
        lineHeight={1.7}
        color="fgBody"
        mb={3}
      >
        <AppMarkdown>{item.body[user_language]}</AppMarkdown>
      </Text>
      <Text
        fontFamily={FONT_SANS}
        fontSize={FONT_SIZE_UI}
        fontStyle="italic"
        color="fgMuted"
        textAlign="right"
      >
        — {item.author}
      </Text>
    </Box>
  );
}

function NewsCard({ user_language }: { user_language: UserLanguage }) {
  const items = localization.home_page.news_items;

  return (
    <Box
      maxW="2xl"
      w="100%"
      border="1px solid"
      borderColor="borderDefault"
      borderRadius="12px"
      bg="bgCanvas"
      px={[6, 8]}
      py={6}
    >
      <Text
        fontFamily={FONT_SANS}
        fontSize={FONT_SIZE_LABEL}
        textTransform="uppercase"
        letterSpacing="0.18em"
        color="fgMuted"
        mb={5}
      >
        {localization.home_page.news_heading[user_language]}
      </Text>
      <VStack align="stretch" spacing={5}>
        {items.map((item, index) => (
          <NewsItem
            key={index}
            item={item}
            user_language={user_language}
            isFirst={index === 0}
          />
        ))}
      </VStack>
    </Box>
  );
}

export default NewsCard;
