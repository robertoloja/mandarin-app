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

export default function ProjectSupportCard() {
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
        Support This Project
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
          If mandoBot is useful to you, please consider supporting the project
          with a monthly subscription. Doing so provides several benefits:
        </Text>

        <Center>
          <VStack>
            <HStack>
              <Heading __css={styles.heading[colorMode]} size="sm">
                $2 / month
              </Heading>
              <KoFiButton />
            </HStack>
            <Box p={3} mb={5} __css={styles.lightBox[colorMode]}>
              <OrderedList p={4}>
                <ListItem __css={styles.heading[colorMode]}>
                  <b>Increased Segmentation Limit</b>
                </ListItem>
                <UnorderedList mb={3}>
                  <ListItem>
                    Project supporters can segment sentences of up to 1,000
                    characters
                  </ListItem>
                  <ListItem>Free users are limited to 200 characters</ListItem>
                </UnorderedList>

                <ListItem __css={styles.heading[colorMode]}>
                  <b>Always the best available translation</b>
                </ListItem>
                <UnorderedList mb={3}>
                  <ListItem>
                    Project supporter translations always use DeepL, the
                    best-in-class translation system
                  </ListItem>
                  <ListItem>
                    Free users&apos; translations are performed by Argos
                    Translate
                  </ListItem>
                </UnorderedList>

                <ListItem __css={styles.heading[colorMode]}>
                  <b>
                    Advance Access to Reading Room and Prioritized Suggestions
                  </b>
                </ListItem>
                <UnorderedList>
                  <ListItem>
                    Project Supporters receive access to chapters as soon as
                    they are created, and can request specific texts to be added
                  </ListItem>
                  <ListItem>
                    Free users access new texts once all chapters are finished
                  </ListItem>
                </UnorderedList>
              </OrderedList>
            </Box>
          </VStack>
        </Center>
        <Text mb={2}>
          MandoBot is built and maintained by a single developer on a shoestring
          budget. While every optimization is used to maintain good performance,
          free hosting can only go so far. If you experience any issues at all,
          please{' '}
          <Link href="mailto:mandobotserver@gmail.com">
            <u>contact me</u>
          </Link>
          , or{' '}
          <Link
            href="https://forms.gle/j89uiVM2xv3CeK7HA"
            target="_blank"
            rel="noopener noreferrer"
          >
            <u>fill out a bug report</u>
          </Link>
          , and it will be addressed as soon as possible.
        </Text>
        <Text>
          You may cancel your subscription at any time, and if a subscription is
          cancelled within 5 days of the most recent payment, a refund will be
          provided.
        </Text>
      </Box>
    </Box>
  );
}
