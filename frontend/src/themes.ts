import { SystemStyleObject } from '@chakra-ui/react';

interface Styles {
  vstack: Record<'light' | 'dark', SystemStyleObject>;
  lightBox: Record<'light' | 'dark', SystemStyleObject>;
  darkBox: Record<'light' | 'dark', SystemStyleObject>;
  heading: Record<'light' | 'dark', SystemStyleObject>;
}

export const styles: Styles = {
  vstack: {
    light: {
      backgroundColor: '#85E2FF',
      border: 'solid 1px #468DA4',
    },
    dark: {
      backgroundColor: '#495255',
      border: 'solid 1px #282828',
    },
  },

  darkBox: {
    light: {
      borderRadius: 8,
      border: '1px solid #468DA4',
      backgroundColor: '#B8EEFF',
      boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)',
    },
    dark: {
      borderRadius: 8,
      border: '1px solid #1e282c',
      backgroundColor: '#333c40',
      boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)',
    },
  },

  lightBox: {
    light: {
      borderRadius: 8,
      border: '1px solid #468DA4',
      backgroundColor: '#85E2FF',
      boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)',
    },
    dark: {
      borderRadius: 8,
      border: '1px solid #1e282c',
      backgroundColor: '#495255',
      boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)',
    },
  },

  heading: {
    light: {
      textShadow: '1px 1px 1px rgba(0, 0, 0, 0.2)',
    },
    dark: {
      textShadow: '1px 1px 1px #222',
    },
  },
};

export default styles;
