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
  useToast,
} from '@chakra-ui/react';
import { IoClipboardOutline, IoShareSocialOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';

import { RootState } from '@/utils/store/store';

export default function ShareButton(props: { iconSize: number }) {
  const isBrowser = () => typeof window !== 'undefined';
  const sentenceIsLoading = useSelector(
    (state: RootState) => state.mandarinSentence.isLoading,
  );
  const shareLink = useSelector(
    (state: RootState) => state.mandarinSentence.shareLink,
  );
  const { colorMode } = useColorMode();

  const copiedToast = useToast();
  const id = 'toast';
  const copyShareLink = () => {
    navigator.clipboard.writeText(
      isBrowser() ? `${window.location.origin}/?share_id=${shareLink}` : '',
    );
    if (!copiedToast.isActive(id)) {
      copiedToast({
        id,
        title: 'Copied!',
        position: 'top-right',
        isClosable: true,
        duration: 2000,
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          aria-label="Share segmentation"
          isDisabled={shareLink == ''}
          isLoading={sentenceIsLoading}
          icon={<IoShareSocialOutline size={props.iconSize + 2} />}
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
              value={
                isBrowser()
                  ? `${window.location.origin}/?share_id=${shareLink}`
                  : ''
              }
              focusBorderColor="blue.500"
              cursor="text"
              userSelect="text"
              onChange={() => null}
            />
            {/* TODO: Should copy to clipboard when clicked */}
            <IconButton
              aria-label="Copy link to clipboard"
              icon={<IoClipboardOutline />}
              onClick={copyShareLink}
            />
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
