'use client';
import {
  Card,
  CardBody,
  Divider,
  Heading,
  Link,
  Text,
  VStack,
  HStack,
  Image,
  useColorMode,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import styles from '@/themes';
import localization, { UserLanguage } from '@/localization/main';

function NewsCard({ user_language }: { user_language: UserLanguage }) {
  const { colorMode } = useColorMode();
  const items = localization.home_page.news_items;

  return (
    <Card mx={[2, 4, 16]} maxW="2xl" w="100%" __css={styles.darkBox[colorMode]}>
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
          <Heading as="h1" size="sm" textAlign="center">
            {localization.home_page.news_heading[user_language]}
          </Heading>
        </HStack>
        <VStack align="stretch" spacing={0} p="2rem">
          {items.map((item, index) => (
            <VStack key={index} align="stretch" spacing={2}>
              {index > 0 && <Divider my={4} />}
              <Heading as="h2" size="sm">
                {item.heading[user_language]}
              </Heading>
              <Text fontSize="xs" color="gray.500">
                {item.date[user_language]}
              </Text>
              <Text as="div">
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
                  {item.body[user_language]}
                </ReactMarkdown>
              </Text>
              <Text fontSize="sm" fontStyle="italic" textAlign="right">
                — {item.author}
              </Text>
            </VStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
}

export default NewsCard;
