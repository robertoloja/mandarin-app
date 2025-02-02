'use client';
import {
  Center,
  HStack,
  IconButton,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import { IoClipboardOutline, IoShareSocialOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';

import { RootState } from '@/utils/store/store';

export default function ShareButton(props: {
  iconSize: number;
  shareLink?: string;
  defaultStyles?: boolean;
}) {
  const isBrowser = () => typeof window !== 'undefined';
  const percentLoaded = useSelector(
    (state: RootState) => state.loading.percentLoaded,
  );
  const shareLink = useSelector((state: RootState) => state.sentence.shareLink);
  const { colorMode } = useColorMode();

  const copiedToast = useToast();
  const id = 'toast';

  const copyShareLink = () => {
    navigator.clipboard.writeText(
      isBrowser()
        ? `${window.location.origin}/?share_id=${props.shareLink ? props.shareLink : shareLink}`
        : '',
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
          aria-label="share segmentation"
          isDisabled={props.shareLink ? false : shareLink == ''}
          isLoading={percentLoaded < 100}
          icon={<IoShareSocialOutline size={props.iconSize + 2} />}
          bg={
            props.defaultStyles
              ? undefined
              : colorMode === 'light'
                ? 'white'
                : 'gray.800'
          }
        />
      </PopoverTrigger>
      <PopoverContent boxShadow="1px 1px 2px rgba(0, 0, 0, 0.5)">
        <PopoverArrow />
        <PopoverHeader>
          <Center>Share Segmented Sentence</Center>
        </PopoverHeader>
        <PopoverBody>
          <HStack>
            <Input
              type="text"
              value={
                isBrowser()
                  ? `${window.location.origin}/?share_id=${props.shareLink ? props.shareLink : shareLink}`
                  : ''
              }
              focusBorderColor="blue.500"
              cursor="text"
              userSelect="text"
              onChange={() => null}
              aria-label="share link"
            />
            <IconButton
              aria-label="copy link to clipboard"
              icon={<IoClipboardOutline />}
              onClick={copyShareLink}
            />
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
