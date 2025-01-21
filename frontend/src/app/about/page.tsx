'use client';

import ServerStatusComponent from '@/app/about/ServerStatusComponent';
import {
  Box,
  Center,
  Flex,
  Heading,
  HStack,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import styles from '../../themes';

export default function AboutPage() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      width="100vw"
      overflowX="hidden"
    >
      <Flex
        justifyContent="center"
        direction={{ base: 'column', lg: 'row' }}
        align="center"
        alignItems={{ base: 'center', lg: 'flex-start' }}
        justify="center"
        p={4}
        m={[2, 10]}
        gap={4}
        maxWidth="100vw"
        boxSizing="border-box"
        wrap="wrap"
      >
        <ServerStatusComponent />
        <ProjectSupportCard />
        <PrivacyPolicyCard />
      </Flex>
    </Box>
  );
}

const PrivacyPolicyCard = () => {
  const { colorMode } = useColorMode();
  return (
    <Box id="policies" mt={4}>
      <Box
        __css={styles.darkBox[colorMode]}
        justifyContent="center"
        w="fit-content"
        m={2}
        p={5}
        // minWidth="30vw"
        width="100%"
        boxSizing="border-box"
      >
        <Heading
          size="sm"
          textAlign="center"
          mb={4}
          whiteSpace="nowrap"
          textShadow={
            colorMode === 'light'
              ? '1px 1px 1px rgba(0, 0, 0, 0.2)'
              : '1px 1px 1px #222'
          }
        >
          Privacy Policy
        </Heading>
        <Text mb={4}>
          This is a privacy preserving application. We collect no personal
          information or usage information, except for the user&apos;s provided
          e-mail address and the mandarin sentences entered into the
          application. User e-mail is only used to create and manage the
          account, no unsolicited e-mails are ever sent to the user, and this
          e-mail address is never shared with any third-party. Users may delete
          their accounts at any time, and any sentences entered into the app can
          be deleted at any time.
        </Text>
        <Heading
          size="sm"
          textAlign="center"
          mb={4}
          whiteSpace="nowrap"
          textShadow={
            colorMode === 'light'
              ? '1px 1px 1px rgba(0, 0, 0, 0.2)'
              : '1px 1px 1px #222'
          }
        >
          Terms of Use
        </Heading>
        <Text mb={2}>
          By using this app, you agree to these Terms of Service. Please read
          them carefully before using the service.
        </Text>
        <Text mb={2}>
          1. Use of the Service: You may use the app only for lawful purposes
          and in accordance with these Terms. By creating an account, you
          confirm that: You are at least 13 years old. You will not misuse the
          app to upload harmful, illegal, or offensive content.{' '}
        </Text>
        <Text mb={2}>
          2. User-Generated Content Ownership: You retain ownership of the
          Mandarin sentences you input into the app. Deletion: You may delete
          your content at any time via the app interface. Responsibility: You
          are solely responsible for the content you upload and its legality.
        </Text>
        <Text mb={2}>
          3. Account Responsibility: You are responsible for maintaining the
          confidentiality of your account credentials. You agree to notify us
          immediately of any unauthorized use of your account.
        </Text>
        <Text mb={2}>
          4. Data Storage and Privacy: By using the app, you consent to the
          storage of your email and user-generated content as outlined in our
          Privacy Policy. We do not claim ownership of your data but reserve the
          right to remove content that violates these Terms.
        </Text>
        <Text mb={2}>
          5. Limitation of Liability: MandoBot is provided on an
          &quot;as-is&quot; and &quot;as-available&quot; basis. We make no
          warranties of any kind regarding the service&apos;s reliability,
          availability, or suitability for your purposes. To the extent
          permitted by law, we disclaim all liability for damages resulting from
          your use of the app.
        </Text>
        <Text mb={2}>
          6. Termination: We reserve the right to suspend or terminate your
          account if you violate these Terms.
        </Text>
        <Text mb={2}>
          7. Changes to These: Terms We may update these Terms from time to
          time. Significant changes will be communicated via email or through
          the app.
        </Text>
        <Text>
          8. Contact: For questions or concerns about these Terms, contact us at
          mandobotserver@gmail.com
        </Text>
      </Box>
    </Box>
  );
};

const ProjectSupportCard = () => {
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
};

const KoFiButton = () => {
  const color = '#00b4f7';

  return (
    <Link
      title={'Support this project'}
      style={{ backgroundColor: color, borderRadius: '5px' }}
      href="https://ko-fi.com/N4N618ZZ1N"
      target="_blank"
      rel="noopener noreferrer"
    >
      <HStack shadow="1px 1px 1px rgba(0, 0, 0, 0.5)" borderRadius={6}>
        <Text
          fontWeight="bold"
          fontSize={14}
          px={2}
          py={1}
          color="white"
          textShadow="1px 1px 1px rgba(50, 50, 50, 0.2)"
        >
          Support
        </Text>
      </HStack>
    </Link>
  );
};
