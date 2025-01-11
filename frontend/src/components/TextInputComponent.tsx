'use client';

import { RootState } from '@/utils/store/store';
import { Container, HStack, Input, Tag } from '@chakra-ui/react';
import { RefObject, useState } from 'react';
import { useSelector } from 'react-redux';
import { MAX_LENGTH_FREE } from 'Constants';

export default function TextInput(props: {
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const [charCount, setCharCount] = useState(0);
  const handleTextChange = () => {
    if (props.inputRef.current) {
      const input = props.inputRef.current.value;
      if (input.length >= MAX_LENGTH_FREE)
        props.inputRef.current.value = input.slice(0, MAX_LENGTH_FREE);
      setCharCount(props.inputRef.current.value.length);
    }
  };
  const percentLoaded = useSelector(
    (state: RootState) => state.loading.percentLoaded,
  );
  return (
    <HStack>
      <Input
        type="text"
        placeholder="Enter Mandarin text to translate and segment"
        ref={props.inputRef}
        mb="0"
        ml="8px"
        onChange={handleTextChange}
        mt={percentLoaded < 100 ? '0' : '0.25rem'}
      />
      <Container w="4rem" m="0" p="0">
        <Tag
          cursor="help"
          transition="background-color 0.5s ease"
          bg={
            charCount > MAX_LENGTH_FREE - 20 && charCount < MAX_LENGTH_FREE
              ? 'orange.500'
              : charCount == MAX_LENGTH_FREE
                ? 'red.500'
                : undefined
          }
        >
          {charCount}
        </Tag>
      </Container>
    </HStack>
  );
}
