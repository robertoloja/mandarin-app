import styles from '@/themes';
import { Text, Box, Heading, useColorMode } from '@chakra-ui/react';

export const PrivacyPolicyCard = () => {
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
