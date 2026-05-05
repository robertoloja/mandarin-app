'use client';
import { Card, CardBody, Flex, Text, useColorMode } from '@chakra-ui/react';
import styles from '@/themes';
import localization, { UserLanguage } from '@/localization/main';

function WelcomeCard({
  isReturningUser,
  user_language,
}: {
  isReturningUser: boolean;
  user_language: UserLanguage;
}) {
  const { colorMode } = useColorMode();

  return (
    <Flex align="center" justify="center" h="100%" minH="40vh">
      <Card mx={[2, 4, 16]} maxW="2xl" w="100%" __css={styles.darkBox[colorMode]}>
        <CardBody>
          <Text p="2rem">
            {isReturningUser
              ? localization.home_page.welcome_returning[user_language]
              : localization.home_page.welcome_new[user_language]}
          </Text>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default WelcomeCard;
