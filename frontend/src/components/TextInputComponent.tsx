'use client';

import { RootState } from '@/utils/store/store';
import {
  Container,
  HStack,
  Input,
  Tag,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { RefObject, useState } from 'react';
import { useSelector } from 'react-redux';
import { MAX_LENGTH, MAX_LENGTH_FREE } from 'constant_variables';
import Link from 'next/link';
import localization, { UserLanguage } from '@/localization/main';

export default function TextInput(props: {
  inputRef: RefObject<HTMLInputElement | null>;
  user_language: UserLanguage
}) {
  const [charCount, setCharCount] = useState(0);
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const [previousText, setPreviousText] = useState('');
  const user = useSelector((state: RootState) => state.auth.username);

  const handleTextChange = () => {
    if (props.inputRef.current) {
      const input = props.inputRef.current.value;
      if (!user && input.length > MAX_LENGTH_FREE) {
        setPopoverIsOpen(true);
        props.inputRef.current.value = previousText;
      } else if (user && input.length > MAX_LENGTH) {
        props.inputRef.current.value = previousText;
      } else {
        setPreviousText(input);
        setPopoverIsOpen(false);
      }
      setCharCount(props.inputRef.current.value.length);
    }
  };
  const percentLoaded = useSelector(
    (state: RootState) => state.loading.percentLoaded,
  );
  return (
    <HStack>
      <Input
        name="sentence-input"
        type="text"
        placeholder={localization.home_page.placeholder_text[props.user_language]}
        ref={props.inputRef}
        mb="0"
        ml="8px"
        onChange={handleTextChange}
        mt={percentLoaded < 100 ? '0' : '0.25rem'}
      />
      <Container w="4rem" m="0" p="0">
        <Popover
          isOpen={popoverIsOpen}
          onOpen={() => setPopoverIsOpen(true)}
          onClose={() => setPopoverIsOpen(false)}
        >
          <PopoverTrigger>
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
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody>
              <Text>
                {localization.home_page.info[1][props.user_language] + ' ' + MAX_LENGTH_FREE + ' ' + 
                localization.home_page.info[2][props.user_language] + ' '}
                <Link
                  href="/about#support"
                  aria-label="subscription information link"
                >
                  <u>{localization.home_page.info.link_text[props.user_language]}</u>
                </Link>
              </Text>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Container>
    </HStack>
  );
}
