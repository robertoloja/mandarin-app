'use client';

import { RootState } from '@/utils/store/store';
import {
  Box,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  Textarea,
  useColorMode,
} from '@chakra-ui/react';
import { RefObject, useState } from 'react';
import { useSelector } from 'react-redux';
import { MAX_LENGTH, MAX_LENGTH_FREE } from 'constant_variables';
import Link from 'next/link';
import localization, { UserLanguage } from '@/localization/main';

export default function TextInput(props: {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  user_language: UserLanguage;
}) {
  const [charCount, setCharCount] = useState(0);
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const [previousText, setPreviousText] = useState('');
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const user = useSelector((state: RootState) => state.auth.username);
  const percentLoaded = useSelector(
    (state: RootState) => state.loading.percentLoaded,
  );

  const nearLimit = !user && charCount > MAX_LENGTH_FREE - 20 && charCount < MAX_LENGTH_FREE;
  const atLimit = !user && charCount >= MAX_LENGTH_FREE;

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

  return (
    <Box position="relative">
      <Textarea
        name="sentence-input"
        placeholder={localization.home_page.placeholder_text[props.user_language]}
        ref={props.inputRef}
        onChange={handleTextChange}
        rows={3}
        resize="vertical"
        fontFamily='"Noto Serif SC", serif'
        fontSize="1.4rem"
        lineHeight={1.9}
        py={4}
        px={5}
        borderRadius="10px"
        border="1px solid"
        borderColor={isDark ? 'gray.700' : 'gray.200'}
        bg={isDark ? 'gray.900' : 'white'}
        color={isDark ? 'gray.100' : 'gray.800'}
        _placeholder={{
          color: isDark ? 'gray.600' : 'gray.300',
          fontFamily: '"IBM Plex Sans", sans-serif',
          fontSize: '15px',
        }}
        _focus={{
          borderColor: isDark ? 'gray.500' : 'gray.400',
          boxShadow: 'none',
          outline: 'none',
        }}
        isDisabled={percentLoaded < 100}
        w="100%"
      />

      {/* Char count */}
      <Box position="absolute" bottom={3} right={4} pointerEvents={atLimit ? 'auto' : 'none'}>
        <Popover
          isOpen={popoverIsOpen}
          onOpen={() => setPopoverIsOpen(true)}
          onClose={() => setPopoverIsOpen(false)}
          placement="top-end"
        >
          <PopoverTrigger>
            <Text
              fontFamily='"IBM Plex Sans", sans-serif'
              fontSize="11px"
              color={
                atLimit ? 'red.400' : nearLimit ? 'orange.400' : isDark ? 'gray.600' : 'gray.400'
              }
              cursor={atLimit ? 'help' : 'default'}
              userSelect="none"
            >
              {charCount}{!user ? ` / ${MAX_LENGTH_FREE}` : ''}
            </Text>
          </PopoverTrigger>
          <PopoverContent
            w="fit-content"
            maxW="280px"
            borderRadius="8px"
            border="1px solid"
            borderColor={isDark ? 'gray.700' : 'gray.200'}
            bg={isDark ? 'gray.900' : 'white'}
            boxShadow="md"
            _focus={{ outline: 'none' }}
            px={4}
            py={3}
          >
            <PopoverArrow bg={isDark ? 'gray.900' : 'white'} />
            <PopoverBody p={0}>
              <Text fontFamily='"IBM Plex Sans", sans-serif' fontSize="13px" color={isDark ? 'gray.300' : 'gray.600'}>
                {localization.home_page.info[1][props.user_language]}{' '}
                {MAX_LENGTH_FREE}{' '}
                {localization.home_page.info[2][props.user_language]}{' '}
                <Link href="/about#support" aria-label="subscription information link">
                  <Text as="span" textDecoration="underline">
                    {localization.home_page.info.link_text[props.user_language]}
                  </Text>
                </Link>
              </Text>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
    </Box>
  );
}
