'use client';

import {
  Center,
  HStack,
  IconButton,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  useColorMode,
} from '@chakra-ui/react';
import { IoClipboardOutline, IoShareSocialOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';

import { RootState } from '@/utils/store/store';

export default function ShareButton() {
  const sentenceIsLoading = useSelector(
    (state: RootState) => state.mandarinSentence.isLoading,
  );
  const mandarinSentence = useSelector(
    (state: RootState) => state.mandarinSentence.mandarinSentence,
  );
  const shareLink = useSelector(
    (state: RootState) => state.mandarinSentence.shareLink,
  );
  const { colorMode } = useColorMode();

  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          aria-label="Share segmentation"
          isDisabled={shareLink.length == 0}
          isLoading={sentenceIsLoading}
          icon={<IoShareSocialOutline />}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Center>Share Segmented Sentence</Center>
        </PopoverHeader>
        <PopoverBody>
          <HStack>
            <Input
              type="text"
              value={shareLink}
              focusBorderColor="blue.500"
              cursor="text"
              userSelect="text"
            />
            <IconButton
              aria-label="Copy link to clipboard"
              icon={<IoClipboardOutline />}
            />
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
