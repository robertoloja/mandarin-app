import localization, { UserLanguage } from '@/localization/main';
import styles from '@/themes';
import { Text, Box, Heading, useColorMode } from '@chakra-ui/react';

export const PrivacyPolicyCard = ({user_language}: {user_language: UserLanguage}) => {
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
         {localization.about_status.privacy_policy.title[user_language]}
        </Heading>
        <Text mb={4}>
          {localization.about_status.privacy_policy.content[user_language]}
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
          {localization.about_status.terms_of_use.title[user_language]}
        </Heading>
        <Text mb={2}>
          {localization.about_status.terms_of_use.content.intro[user_language]}
        </Text>
        <Text mb={2}>
          1. {localization.about_status.terms_of_use.content[1][user_language]}
        </Text>
        <Text mb={2}>
        2. {localization.about_status.terms_of_use.content[2][user_language]}
        </Text>
        <Text mb={2}>
          3. {localization.about_status.terms_of_use.content[3][user_language]}
        </Text>
        <Text mb={2}>
          4. {localization.about_status.terms_of_use.content[4][user_language]}
        </Text>
        <Text mb={2}>
          5. {localization.about_status.terms_of_use.content[5][user_language]}
        </Text>
        <Text mb={2}>
          6. {localization.about_status.terms_of_use.content[6][user_language]}
        </Text>
        <Text mb={2}>
          7. {localization.about_status.terms_of_use.content[7][user_language]}
        </Text>
        <Text>
          8. {localization.about_status.terms_of_use.content[8][user_language]}
        </Text>
      </Box>
    </Box>
  );
};
