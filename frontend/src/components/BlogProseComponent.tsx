'use client';

import { Box, Heading, Link, ListItem, Text, UnorderedList, OrderedList } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlockComponent';
import { FONT_SANS, FONT_SERIF, FONT_SIZE_PROSE, FONT_SIZE_SUBHEAD } from '@/theme';

/**
 * Long-form renderer for blog posts. Separate from AppMarkdown, which is tuned
 * for short card copy and only styles a handful of inline elements.
 */
const components: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  p: ({ children }) => (
    <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_PROSE} color="fgPrimary" lineHeight={1.75} mb="1.15em">
      {children}
    </Text>
  ),
  h2: ({ children }) => (
    <Heading as="h2" fontFamily={FONT_SERIF} fontSize={FONT_SIZE_SUBHEAD} fontWeight={600} color="fgPrimary" mt="2em" mb="0.6em">
      {children}
    </Heading>
  ),
  h3: ({ children }) => (
    <Heading as="h3" fontFamily={FONT_SANS} fontSize={FONT_SIZE_PROSE} fontWeight={600} color="fgPrimary" mt="1.6em" mb="0.5em">
      {children}
    </Heading>
  ),
  a: ({ href, children }) => (
    <Link href={href} color="fgLink" textDecoration="underline" isExternal={href?.startsWith('http')}>
      {children}
    </Link>
  ),
  strong: ({ children }) => (
    <Text as="strong" fontWeight={600} color="fgPrimary">
      {children}
    </Text>
  ),
  em: ({ children }) => <Text as="em" fontStyle="italic">{children}</Text>,
  ul: ({ children }) => (
    <UnorderedList fontFamily={FONT_SANS} fontSize={FONT_SIZE_PROSE} color="fgPrimary" lineHeight={1.75} mb="1.15em" pl={2} spacing={1}>
      {children}
    </UnorderedList>
  ),
  ol: ({ children }) => (
    <OrderedList fontFamily={FONT_SANS} fontSize={FONT_SIZE_PROSE} color="fgPrimary" lineHeight={1.75} mb="1.15em" pl={2} spacing={1}>
      {children}
    </OrderedList>
  ),
  li: ({ children }) => <ListItem>{children}</ListItem>,
  blockquote: ({ children }) => (
    <Box borderLeft="2px solid" borderColor="borderEmphasis" pl={4} py={1} my="1.15em" color="fgMuted" fontStyle="italic">
      {children}
    </Box>
  ),
  hr: () => <Box as="hr" borderTop="1px solid" borderColor="borderDefault" my="2em" />,
  code: ({ className, children }) => {
    const language = /language-(\w+)/.exec(className ?? '')?.[1];

    // Inline code: no language class, and no surrounding <pre>.
    if (!language) {
      return (
        <Text as="code" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="0.85em" bg="bgSubtle" border="1px solid" borderColor="borderDefault" borderRadius="4px" px="0.35em" py="0.05em" whiteSpace="pre-wrap">
          {children}
        </Text>
      );
    }

    return (
      <CodeBlock code={String(children).replace(/\n$/, '')} language={language} />
    );
  },
  pre: ({ children }) => <>{children}</>,
};

export default function BlogProse({ children }: { children: string }) {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
}
