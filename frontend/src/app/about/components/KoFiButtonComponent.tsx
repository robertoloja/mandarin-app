import localization, { UserLanguage } from '@/localization/main';
import { Box, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FONT_SANS, FONT_SIZE_UI } from '@/theme';

export const KoFiButton = ({ user_language }: { user_language: UserLanguage }) => {
  return (
    <Link
      href="https://ko-fi.com/N4N618ZZ1N"
      target="_blank"
      rel="noopener noreferrer"
      title={localization.about_status.support_this_project.content.alt_text[user_language]}
    >
      <Box
        display="inline-flex"
        alignItems="center"
        bg="#00b4f7"
        borderRadius="6px"
        px={3}
        py="5px"
        _hover={{ opacity: 0.88 }}
        transition="opacity 0.14s"
      >
        <Text
          fontFamily={FONT_SANS}
          fontSize={FONT_SIZE_UI}
          fontWeight={600}
          color="white"
        >
          {localization.about_status.support_this_project.content.button[user_language]}
        </Text>
      </Box>
    </Link>
  );
};
