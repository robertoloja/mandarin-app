'use client';

import { Box } from '@chakra-ui/react';
import { Highlight, type PrismTheme } from 'prism-react-renderer';

/**
 * Token colours resolve to Chakra CSS variables rather than literal hex values.
 *
 * That means the highlighted markup is byte-identical in light and dark mode -
 * the colours swap in CSS - so nothing here depends on knowing the colour mode
 * at render time, and the prerendered HTML always matches what the browser
 * hydrates. The palette itself lives in theme.ts with every other colour.
 */
const chakraPrismTheme: PrismTheme = {
  plain: { color: 'var(--chakra-colors-codeFg)', backgroundColor: 'transparent' },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: 'var(--chakra-colors-codeComment)', fontStyle: 'italic' } },
    { types: ['keyword', 'builtin', 'boolean', 'important'], style: { color: 'var(--chakra-colors-codeKeyword)' } },
    { types: ['string', 'char', 'attr-value', 'regex'], style: { color: 'var(--chakra-colors-codeString)' } },
    { types: ['number', 'constant', 'symbol'], style: { color: 'var(--chakra-colors-codeNumber)' } },
    { types: ['function', 'attr-name'], style: { color: 'var(--chakra-colors-codeFunction)' } },
    { types: ['class-name', 'maybe-class-name', 'tag', 'selector'], style: { color: 'var(--chakra-colors-codeClass)' } },
    { types: ['punctuation', 'operator'], style: { color: 'var(--chakra-colors-codePunctuation)' } },
    { types: ['deleted'], style: { color: 'var(--chakra-colors-codeNumber)' } },
    { types: ['inserted'], style: { color: 'var(--chakra-colors-codeString)' } },
  ],
};

export default function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  return (
    <Highlight code={code} language={language} theme={chakraPrismTheme}>
      {({ tokens, getLineProps, getTokenProps }) => {
        // Wide enough for the largest line number, so the gutter does not jitter.
        const gutterWidth = `${String(tokens.length).length}ch`;

        return (
          <Box
            as="pre"
            bg="bgSubtle"
            border="1px solid"
            borderColor="borderDefault"
            borderRadius="8px"
            px={4}
            py={3}
            mb="1.15em"
            overflowX="auto"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="0.8rem"
            lineHeight={1.7}
          >
            <Box as="code" display="block">
              {tokens.map((line, i) => (
                <Box {...getLineProps({ line })} key={i} display="flex" gap={4}>
                  <Box
                    as="span"
                    // Excluded from selection so copying the block does not
                    // drag the line numbers along with the code.
                    userSelect="none"
                    aria-hidden="true"
                    flex="none"
                    minW={gutterWidth}
                    textAlign="right"
                    color="codeComment"
                    opacity={0.65}
                  >
                    {i + 1}
                  </Box>
                  <Box
                    as="span"
                    flex="1"
                    minW={0}
                    // Long lines wrap instead of scrolling; the flex column
                    // keeps continuations aligned under the code, not the gutter.
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                  >
                    {line.map((token, key) => (
                      <span {...getTokenProps({ token })} key={key} />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );
      }}
    </Highlight>
  );
}
