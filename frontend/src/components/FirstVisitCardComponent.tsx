'use client';
import { Box, HStack, Image, Text, useColorMode } from '@chakra-ui/react';
import { IoCloseOutline } from 'react-icons/io5';
import { useState, useEffect } from 'react';
import localization, { UserLanguage } from '@/localization/main';
import { FONT_SANS, FONT_SERIF } from '@/theme';
import AppMarkdown from '@/components/AppMarkdown';

const STORAGE_KEY = 'welcomeCardDismissed';

function FirstVisitCard({ user_language }: { user_language: UserLanguage }) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  if (dismissed === null || dismissed) return null;

  return (
    <Box
      position="relative"
      maxW="2xl"
      w="100%"
      border="1px solid"
      borderColor="borderDefault"
      borderRadius="12px"
      bg="bgCanvas"
      px={[6, 8]}
      py={6}
    >
      <Box
        as="button"
        position="absolute"
        top={3}
        right={3}
        onClick={dismiss}
        color="fgSubtle"
        _hover={{ color: 'fgMuted' }}
        lineHeight={0}
      >
        <IoCloseOutline size={18} />
      </Box>
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
        <AppMarkdown>{localization.home_page.welcome_new[user_language]}</AppMarkdown>
      </Text>
    </Box>
  );
}

export default FirstVisitCard;
