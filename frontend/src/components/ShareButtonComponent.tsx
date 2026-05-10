'use client';
import {
  Box,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  useToast,
} from '@chakra-ui/react';
import { IoClipboardOutline, IoShareSocialOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';

import { RootState } from '@/utils/store/store';
import { FONT_SANS } from '@/theme';

export default function ShareButton(props: {
  iconSize: number;
  shareLink?: string;
  defaultStyles?: boolean;
}) {
  const isBrowser = () => typeof window !== 'undefined';
  const shareLink = useSelector((state: RootState) => state.sentence.shareLink);
  const copiedToast = useToast();
  const id = 'toast';

  const resolvedLink = props.shareLink ?? shareLink;
  const fullUrl = isBrowser()
    ? `${window.location.origin}/?share_id=${resolvedLink}`
    : '';

  const copyShareLink = () => {
    navigator.clipboard.writeText(fullUrl);
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
    <Popover placement="bottom-end" offset={[0, 4]}>
      <PopoverTrigger>
        <IconButton
          aria-label="Share segmented sentence"
          icon={<IoShareSocialOutline size={props.iconSize} />}
          bg={props.defaultStyles ? undefined : 'bgSubtle'}
          border={props.defaultStyles ? undefined : '1px solid'}
          borderColor={props.defaultStyles ? undefined : 'borderDefault'}
          h={props.defaultStyles ? undefined : '30px'}
          minW={props.defaultStyles ? undefined : '30px'}
          _hover={props.defaultStyles ? undefined : { borderColor: 'borderEmphasis' }}
        />
      </PopoverTrigger>
      <PopoverContent
        width="280px"
        borderRadius="10px"
        border="1px solid"
        borderColor="borderDefault"
        bg="bgCanvas"
        boxShadow="lg"
        _focus={{ outline: 'none' }}
        px={4}
        py={3}
      >
        <PopoverArrow bg="bgCanvas" />
        <PopoverBody p={0}>
          <Box
            fontFamily={FONT_SANS}
            fontSize="10px"
            textTransform="uppercase"
            letterSpacing="0.14em"
            color="fgSubtle"
            mb={2}
          >
            Share
          </Box>
          <Box
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Text
              fontFamily={FONT_SANS}
              fontSize="12px"
              color="fgMuted"
              flex={1}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              bg="bgSubtle"
              border="1px solid"
              borderColor="borderDefault"
              borderRadius="6px"
              px={2}
              py="5px"
            >
              {fullUrl}
            </Text>
            <IconButton
              aria-label="Copy link to clipboard"
              icon={<IoClipboardOutline size={14} />}
              onClick={copyShareLink}
              bg="bgSubtle"
              border="1px solid"
              borderColor="borderDefault"
              h="30px"
              minW="30px"
              flexShrink={0}
              _hover={{ borderColor: 'borderEmphasis' }}
            />
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
