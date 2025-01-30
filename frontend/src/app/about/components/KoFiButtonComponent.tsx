import { HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';

export const KoFiButton = () => {
  const color = '#00b4f7';

  return (
    <Link
      title={'Support this project'}
      style={{ backgroundColor: color, borderRadius: '5px' }}
      href="https://ko-fi.com/N4N618ZZ1N"
      target="_blank"
      rel="noopener noreferrer"
    >
      <HStack shadow="1px 1px 1px rgba(0, 0, 0, 0.5)" borderRadius={6}>
        <Text
          fontWeight="bold"
          fontSize={14}
          px={2}
          py={1}
          color="white"
          textShadow="1px 1px 1px rgba(50, 50, 50, 0.2)"
        >
          Support
        </Text>
      </HStack>
    </Link>
  );
};
