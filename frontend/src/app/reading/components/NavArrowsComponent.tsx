import { HStack, Text } from '@chakra-ui/react';
import { Chapter } from '../types';

export const NavArrows = (props: {
  activePage: number;
  chapters: Chapter[][];
  setActivePage: (activePage: number) => void;
  setAccordionIndex: (num: number) => void;
}) => {
  return (
    <HStack textColor="rgb(231, 231, 230)">
      {props.activePage > 0 && (
        <Text
          position="absolute"
          bottom={['1rem', '1.5rem']}
          right={['78%', '18rem']}
          cursor="pointer"
          textShadow={['1px 1px 1px rgba(20, 20, 20, 0.8)']}
          _hover={{ textDecoration: 'underline' }}
          onClick={() => {
            props.setActivePage(props.activePage - 1);
            props.setAccordionIndex(-1);
          }}
        >
          Previous 上
        </Text>
      )}
      {props.activePage < props.chapters.length - 1 && (
        <Text
          position="absolute"
          bottom={['1rem', '1.5rem']}
          right={['1rem']}
          cursor="pointer"
          textShadow={['1px 1px 1px rgba(20, 20, 20, 0.8)']}
          _hover={{ textDecoration: 'underline' }}
          onClick={() => {
            props.setActivePage(props.activePage + 1);
            props.setAccordionIndex(-1);
          }}
        >
          下 Next
        </Text>
      )}
    </HStack>
  );
};
