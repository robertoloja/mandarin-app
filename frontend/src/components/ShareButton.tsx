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
import { useState } from 'react';

import { RootState } from '@/utils/store/store';
import { MandoBotAPI } from '@/utils/api';

export default function ShareButton() {
  const sentenceIsLoading = useSelector(
    (state: RootState) => state.mandarinSentence.isLoading,
  );
  const mandarinSentence = useSelector(
    (state: RootState) => state.mandarinSentence.mandarinSentence,
  );
  const dictionary = useSelector(
    (state: RootState) => state.mandarinSentence.mandarinDictionary,
  );
  const { colorMode } = useColorMode();
  const [shareUrl, setShareUrl] = useState('');

  const getShareLink = async () => {
    const dataToSend = {
      translation: mandarinSentence.translation,
      sentence: mandarinSentence.sentence,
      dictionary: dictionary,
    };

    await MandoBotAPI.share(dataToSend).then((response: string) => {
      setShareUrl(response);
    });
  };

  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          aria-label="Share segmentation"
          isDisabled={mandarinSentence.sentence.length == 0}
          isLoading={sentenceIsLoading}
          icon={<IoShareSocialOutline />}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          onClick={getShareLink}
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
            <Input isReadOnly={true} type="text" value={shareUrl} />
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
