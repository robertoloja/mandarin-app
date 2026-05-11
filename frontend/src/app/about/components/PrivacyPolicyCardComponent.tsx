import localization, { UserLanguage } from '@/localization/main';
import { Text, Box } from '@chakra-ui/react';
import { FONT_SANS, FONT_SERIF, FONT_SIZE_LABEL, FONT_SIZE_UI, FONT_SIZE_BODY, FONT_SIZE_SUBHEAD } from '@/theme';

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontFamily={FONT_SERIF}
      fontSize={FONT_SIZE_SUBHEAD}
      fontWeight={500}
      fontStyle="italic"
      color="fgPrimary"
      mb={3}
    >
      {children}
    </Text>
  );
}

function Divider() {
  return <Box borderBottom="1px solid" borderColor="borderSubtle" my={5} />;
}

export const PrivacyPolicyCard = ({ user_language }: { user_language: UserLanguage }) => {
  const loc = localization.about_status;
  const tou = loc.terms_of_use.content;

  return (
    <Box
      id="policies"
      maxW="2xl"
      w="100%"
      border="1px solid"
      borderColor="borderDefault"
      borderRadius="12px"
      bg="bgCanvas"
      px={[6, 8]}
      py={6}
      mb={4}
    >
      <Text
        fontFamily={FONT_SANS}
        fontSize={FONT_SIZE_LABEL}
        textTransform="uppercase"
        letterSpacing="0.14em"
        color="fgMuted"
        mb={4}
      >
        {loc.privacy_policy.title[user_language]}
      </Text>
      <SectionHeading>{loc.privacy_policy.title[user_language]}</SectionHeading>
      <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_BODY} color="fgBody" lineHeight={1.7}>
        {loc.privacy_policy.content[user_language]}
      </Text>

      <Divider />

      <SectionHeading>{loc.terms_of_use.title[user_language]}</SectionHeading>
      <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_BODY} color="fgBody" lineHeight={1.7} mb={3}>
        {tou.intro[user_language]}
      </Text>
      {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((n) => (
        <Text key={n} fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgBody" lineHeight={1.7} mb={2}>
          {n}. {tou[n][user_language]}
        </Text>
      ))}
    </Box>
  );
};
