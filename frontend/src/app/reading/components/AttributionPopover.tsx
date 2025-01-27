'use client';

import {
  Box,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { IoInformationCircleOutline } from 'react-icons/io5';

interface AttributionProps {
  text: string;
  image: string;
}

export default function AttributionPopover({ text, image }: AttributionProps) {
  return (
    <Box m={2}>
      <Popover>
        <PopoverTrigger>
          <IoInformationCircleOutline size={25} cursor="pointer" />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverBody boxShadow="1px 1px 2px rgba(0, 0, 0, 0.5)">
            <Text mb={3}>{text}</Text>
            <Text>{image}</Text>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
}
