'use client';
import { Flex, VStack } from '@chakra-ui/react';
import { UserLanguage } from '@/localization/main';
import FirstVisitCard from '@/components/FirstVisitCardComponent';
import NewsCard from '@/components/NewsCardComponent';

function WelcomeCard({
  isReturningUser,
  user_language,
}: {
  isReturningUser: boolean;
  user_language: UserLanguage;
}) {
  return (
    <Flex align="center" justify="center" h="100%" minH="40vh">
      <VStack spacing={4} w="100%">
        {!isReturningUser && <FirstVisitCard user_language={user_language} />}
        <NewsCard user_language={user_language} />
      </VStack>
    </Flex>
  );
}

export default WelcomeCard;
