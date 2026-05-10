'use client';
import { Link, Text } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';

// Shared Chakra-styled renderer for all ReactMarkdown instances in the app.
const mdComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  p: ({ children }) => <Text mb="1em">{children}</Text>,
  strong: ({ children }) => (
    <Text as="strong" fontWeight={600} color="fgPrimary">
      {children}
    </Text>
  ),
  em: ({ children }) => <Text as="em" fontStyle="italic">{children}</Text>,
  a: ({ href, children }) => (
    <Link href={href} color="fgLink" textDecoration="underline">
      {children}
    </Link>
  ),
};

export default function AppMarkdown({ children }: { children: string }) {
  return <ReactMarkdown components={mdComponents}>{children}</ReactMarkdown>;
}
