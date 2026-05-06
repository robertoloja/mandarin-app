'use client';
import {
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Image,
  Link,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
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
      <Card
        mx={[2, 4, 16]}
        maxW="2xl"
        w="100%"
        __css={styles.darkBox[colorMode]}
      >
        <CardBody>
          <HStack p="2rem" pb="0" spacing={3} align="center">
            <Image
              src="/jie.svg"
              alt="解"
              height="3rem"
              mx="1rem"
              filter={
                colorMode === 'dark'
                  ? 'invert(1) drop-shadow(1px 1px 0px rgba(0,0,0,0.6))'
                  : 'drop-shadow(1px 1px 0px rgba(0,0,0,0.3))'
              }
            />
            <Heading
              as="h1"
              size="sm"
              textAlign="center"
              filter={
                colorMode === 'dark'
                  ? 'drop-shadow(1px 1px 0px rgba(0,0,0,0.6))'
                  : 'drop-shadow(1px 1px 0px rgba(0,0,0,0.3))'
              }
            >
              {localization.home_page.heading[user_language]}
            </Heading>
          </HStack>
          <Text p="2rem" as="div">
            <ReactMarkdown
              components={{
                p: ({ children }) => <Text mb="1em">{children}</Text>,
                strong: ({ children }) => (
                  <Text as="strong" fontWeight="bold">
                    {children}
                  </Text>
                ),
                em: ({ children }) => (
                  <Text as="em" fontStyle="italic">
                    {children}
                  </Text>
                ),
                a: ({ href, children }) => (
                  <Link href={href} textDecoration="underline">
                    {children}
                  </Link>
                ),
              }}
            >
              {isReturningUser
                ? localization.home_page.welcome_returning[user_language]
                : localization.home_page.welcome_new[user_language]}
            </ReactMarkdown>
          </Text>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default WelcomeCard;
