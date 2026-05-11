import { Text, Box, Center } from '@chakra-ui/react';
import { KoFiButton } from './KoFiButtonComponent';
import Link from 'next/link';
import localization, { UserLanguage } from '@/localization/main';
import {
  FONT_SANS,
  FONT_SERIF,
  FONT_SIZE_LABEL,
  FONT_SIZE_UI,
  FONT_SIZE_BODY,
  FONT_SIZE_SUBHEAD,
} from '@/theme';

function Divider() {
  return <Box borderBottom="1px solid" borderColor="borderSubtle" my={4} />;
}

export default function ProjectSupportCard({
  user_language,
}: {
  user_language: UserLanguage;
}) {
  const loc = localization.about_status.support_this_project;
  const content = loc.content;

  return (
    <Box
      id="support"
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
        {loc.title[user_language]}
      </Text>

      <Text
        fontFamily={FONT_SANS}
        fontSize={FONT_SIZE_BODY}
        color="fgBody"
        lineHeight={1.7}
        mb={4}
      >
        {content.intro[user_language]}
      </Text>

      <Center>
        <Box display="flex" alignItems="center" gap={3} mb={4}>
          <Text
            fontFamily={FONT_SERIF}
            fontSize={FONT_SIZE_SUBHEAD}
            fontWeight={500}
            fontStyle="italic"
            color="fgPrimary"
          >
            {content.amount[user_language]}
          </Text>
          <KoFiButton user_language={user_language} />
        </Box>
      </Center>

      <Box
        border="1px solid"
        borderColor="borderDefault"
        borderRadius="10px"
        bg="bgSubtle"
        px={5}
        py={4}
        mb={4}
      >
        {([1, 2, 3] as const).map((n, i) => (
          <Box key={n}>
            {i > 0 && <Divider />}
            <Text
              fontFamily={FONT_SANS}
              fontSize={FONT_SIZE_UI}
              fontWeight={600}
              color="fgPrimary"
              mb={1}
            >
              {n}. {content[n].title[user_language]}
            </Text>
            <Text
              fontFamily={FONT_SANS}
              fontSize={FONT_SIZE_UI}
              color="fgBody"
              lineHeight={1.6}
              mb="2px"
            >
              · {content[n].bullet_point1[user_language]}
            </Text>
            <Text
              fontFamily={FONT_SANS}
              fontSize={FONT_SIZE_UI}
              color="fgBody"
              lineHeight={1.6}
            >
              · {content[n].bullet_point2[user_language]}
            </Text>
          </Box>
        ))}
      </Box>

      <Text
        fontFamily={FONT_SANS}
        fontSize={FONT_SIZE_BODY}
        color="fgBody"
        lineHeight={1.7}
        mb={2}
      >
        {content.end_text1[1][user_language]}
        <Link href="mailto:mandobotserver@gmail.com">
          <Text
            as="span"
            color="fgLink"
            _hover={{ textDecoration: 'underline' }}
          >
            {content.end_text1.link_1[user_language]}
          </Text>
        </Link>
        {content.end_text1[2][user_language]}
        <Link
          href="https://forms.gle/j89uiVM2xv3CeK7HA"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Text
            as="span"
            color="fgLink"
            _hover={{ textDecoration: 'underline' }}
          >
            {content.end_text1.link_2[user_language]}
          </Text>
        </Link>
        {content.end_text1[3][user_language]}
      </Text>
      <Text
        fontFamily={FONT_SANS}
        fontSize={FONT_SIZE_BODY}
        color="fgBody"
        lineHeight={1.7}
      >
        {content.end_text2[user_language]}
      </Text>
    </Box>
  );
}
