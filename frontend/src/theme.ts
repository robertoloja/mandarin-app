import { extendTheme } from '@chakra-ui/react';
import { accordionTheme } from './app/reading/components/Accordion';

export const FONT_SANS = '"IBM Plex Sans", system-ui, sans-serif';
export const FONT_SERIF = '"Spectral", Georgia, serif';
export const FONT_CHINESE = '"Noto Serif SC", serif';

// Reading room accent — oklch, not a Chakra scale value
export const ACCENT_DARK = 'oklch(0.82 0.13 70)';
export const ACCENT_LIGHT = 'oklch(0.55 0.15 60)';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: true,
  },
  fonts: {
    body: FONT_SANS,
    heading: FONT_SERIF,
  },
  styles: {
    global: {
      'html, body': {
        overflowX: 'hidden',
      },
      body: {
        bg: 'bgPage',
        color: 'fgBody',
      },
    },
  },
  semanticTokens: {
    colors: {
      // Surfaces
      bgPage:    { default: 'gray.50',   _dark: '#0D1117' },
      bgCanvas:  { default: 'white',     _dark: 'gray.900' },
      bgSubtle:  { default: 'gray.100',  _dark: 'gray.800' },
      bgActive:  { default: 'white',     _dark: 'gray.700' },
      // Borders
      borderDefault:   { default: 'gray.200', _dark: 'gray.700' },
      borderSubtle:    { default: 'gray.100', _dark: 'gray.700' },
      borderEmphasis:  { default: 'gray.300', _dark: 'gray.600' },
      // Text
      fgPrimary: { default: 'gray.800', _dark: 'gray.100' },
      fgBody:    { default: 'gray.600', _dark: 'gray.300' },
      fgMuted:   { default: 'gray.500', _dark: 'gray.400' },
      fgSubtle:  { default: 'gray.400', _dark: 'gray.500' },
      fgLink:    { default: 'blue.600', _dark: 'blue.300' },
    },
  },
  components: { Accordion: accordionTheme },
});

export default theme;
