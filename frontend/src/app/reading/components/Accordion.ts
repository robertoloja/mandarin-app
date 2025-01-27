import { accordionAnatomy as parts } from '@chakra-ui/anatomy';
import {
  createMultiStyleConfigHelpers,
  defineStyle,
} from '@chakra-ui/styled-system';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle({
  container: defineStyle({
    _focus: {
      boxShadow: 'outline',
    },
  }),
});

const outline = definePartsStyle(() => {
  return {
    container: {
      border: 'none',
    },
    button: {
      _focus: {
        color: 'blue.100',
      },
      p: 0,
    },
    panel: {
      padding: 0,
    },
  };
});

const variants = {
  outline,
};

export const accordionTheme = defineMultiStyleConfig({
  baseStyle,
  variants,
  defaultProps: {
    size: 'sm',
    variant: 'outline',
  },
});
