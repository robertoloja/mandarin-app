import styles from '@/themes';
import {
  Text,
  Box,
  Center,
  Heading,
  HStack,
  ListItem,
  OrderedList,
  UnorderedList,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import { KoFiButton } from './KoFiButtonComponent';
import Link from 'next/link';
import localization, { UserLanguage } from '@/localization/main';

export default function ProjectSupportCard({ user_language }: { user_language: UserLanguage }) {
  const { colorMode } = useColorMode();
  return (
    <Box id="support" maxW="40rem">
      <Heading
        size="md"
        textAlign="center"
        mb={4}
        whiteSpace="nowrap"
        __css={styles.heading[colorMode]}
      >
        {localization.about_status.support_this_project.title[user_language]}
      </Heading>

      <Box
        __css={styles.darkBox[colorMode]}
        justifyContent="center"
        w="fit-content"
        m={2}
        p={5}
        minWidth="30vw"
      >
        <Text mb={4}>
          {localization.about_status.support_this_project.content.intro[user_language]}
        </Text>

        <Center>
          <VStack>
            <HStack>
              <Heading __css={styles.heading[colorMode]} size="sm">
                {localization.about_status.support_this_project.content.amount[user_language]}
              </Heading>
              <KoFiButton user_language={user_language} />
            </HStack>
            <Box p={3} mb={5} __css={styles.lightBox[colorMode]}>
              <OrderedList p={4}>
                <ListItem __css={styles.heading[colorMode]}>
                  <b>{localization.about_status.support_this_project.content[1].title[user_language]}</b>
                </ListItem>
                <UnorderedList mb={3}>
                  <ListItem>
                    {localization.about_status.support_this_project.content[1].bullet_point1[user_language]}
                  </ListItem>
                  <ListItem>{localization.about_status.support_this_project.content[1].bullet_point2[user_language]}</ListItem>
                </UnorderedList>

                <ListItem __css={styles.heading[colorMode]}>
                  <b>{localization.about_status.support_this_project.content[2].title[user_language]}</b>
                </ListItem>
                <UnorderedList mb={3}>
                  <ListItem>
                    {localization.about_status.support_this_project.content[2].bullet_point1[user_language]}
                  </ListItem>
                  <ListItem>
                    {localization.about_status.support_this_project.content[2].bullet_point2[user_language]}
                  </ListItem>
                </UnorderedList>

                <ListItem __css={styles.heading[colorMode]}>
                  <b>
                    {localization.about_status.support_this_project.content[3].title[user_language]}
                  </b>
                </ListItem>
                <UnorderedList>
                  <ListItem>
                    {localization.about_status.support_this_project.content[3].bullet_point1[user_language]}
                  </ListItem>
                  <ListItem>
                    {localization.about_status.support_this_project.content[3].bullet_point2[user_language]}
                  </ListItem>
                </UnorderedList>
              </OrderedList>
            </Box>
          </VStack>
        </Center>
        <Text mb={2}>
          {localization.about_status.support_this_project.content.end_text1[1][user_language]}
          <Link href="mailto:mandobotserver@gmail.com">
            <u>{localization.about_status.support_this_project.content.end_text1.link_1[user_language]}</u>
          </Link>
            {localization.about_status.support_this_project.content.end_text1[2][user_language]}
          <Link
            href="https://forms.gle/j89uiVM2xv3CeK7HA"
            target="_blank"
            rel="noopener noreferrer"
          >
            <u>{localization.about_status.support_this_project.content.end_text1.link_2[user_language]}</u>
          </Link>
            {localization.about_status.support_this_project.content.end_text1[3][user_language]}
        </Text>
        <Text>
          {localization.about_status.support_this_project.content.end_text2[user_language]}
        </Text>
      </Box>
    </Box>
  );
}
