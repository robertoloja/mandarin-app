import { HStack, Text } from '@chakra-ui/react';
import { Chapter } from '../types';
import localization from '@/localization';

export const NavArrows = (props: {
  activePage: number;
  chapters: Chapter[][];
  setActivePage: (activePage: number) => void;
  setAccordionIndex: (num: number) => void;
  user_language: 'en' | 'de';
}) => {
  const user_language = props.user_language;
  return (
    <HStack textColor="rgb(231, 231, 230)">
      {props.activePage > 0 && (
        <Text
          aria-label="previous page"
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
          {localization.reading_room.previous[user_language]} 上
        </Text>
      )}
      {props.activePage < props.chapters.length - 1 && (
        <Text
          aria-label="next page"
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
          下 {localization.reading_room.next[user_language]}
        </Text>
      )}
    </HStack>
  );
};
