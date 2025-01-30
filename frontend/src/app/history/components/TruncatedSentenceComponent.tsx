import { ReactNode } from 'react';
import { Text } from '@chakra-ui/react';

interface StringChildrenProps {
  children: ReactNode;
}

export const TruncatedSentence: React.FC<StringChildrenProps> = ({
  children,
}) => {
  return (
    <Text
      noOfLines={2}
      maxWidth="20rem"
      minWidth="5rem"
      fontSize="sm"
      height="2.6rem"
      marginTop="0.5rem"
      marginBottom="0.5rem"
      textAlign="center"
      cursor="pointer"
      zIndex={5}
    >
      {children}
    </Text>
  );
};
