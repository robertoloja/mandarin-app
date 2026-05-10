'use client';
import { VStack } from '@chakra-ui/react';
import { UserLanguage } from '@/localization/main';
import FirstVisitCard from '@/components/FirstVisitCardComponent';
import NewsCard from '@/components/NewsCardComponent';

function WelcomeCard({ user_language }: { user_language: UserLanguage }) {
  return (
    <VStack spacing={4} w="100%" minH="40vh" justify="center">
      <FirstVisitCard user_language={user_language} />
      <NewsCard user_language={user_language} />
    </VStack>
  );
}

export default WelcomeCard;
