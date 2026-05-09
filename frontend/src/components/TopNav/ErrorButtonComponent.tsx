'use client';
import {
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  useColorMode,
} from '@chakra-ui/react';
import { RootState } from '@/utils/store/store';
import { IoWarningOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';

export default function ErrorButton(props: { iconSize: number }) {
  const { colorMode } = useColorMode();
  const errorMessage = useSelector((state: RootState) => state.errors.error);

  return (
    <>
      {errorMessage && (
        <Popover>
          <PopoverTrigger>
            <IconButton
              aria-label="Error message"
              icon={
                <IoWarningOutline
                  color="rgba(200, 60, 60, 1)"
                  size={props.iconSize + 5}
                />
              }
              bg="transparent"
              border="1px solid"
              borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
              h="30px"
              minW="30px"
            />
          </PopoverTrigger>
          <PopoverArrow />
          <PopoverContent boxShadow="1px 1px 2px rgba(0, 0, 0, 0.5)">
            <PopoverHeader>Server Error</PopoverHeader>
            <PopoverBody>{errorMessage}</PopoverBody>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
