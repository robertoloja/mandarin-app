import { SystemStyleObject } from '@chakra-ui/react';

interface Styles {
  card: Record<'light' | 'dark', SystemStyleObject>;
  vstack: Record<'light' | 'dark', SystemStyleObject>;
}

const styles: Styles = {
  card: {
    light: {
      border: '1px solid #468DA4',
      backgroundColor: '#B8EEFF',
      boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.25)',
      borderRadius: '4',
    },
    dark: {
      border: '1px solid #1e282c',
      backgroundColor: '#333c40',
      boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.25)',
      borderRadius: '4',
    },
  },
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
};

export default styles;
