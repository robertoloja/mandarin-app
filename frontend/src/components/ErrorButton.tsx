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
  console.log(errorMessage);

  return (
    <>
      {errorMessage ? (
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
              bg={colorMode === 'light' ? 'white' : 'gray.800'}
              mr={2}
            />
          </PopoverTrigger>
          <PopoverArrow />
          <PopoverContent>
            <PopoverHeader>Server Error</PopoverHeader>
            <PopoverBody>{errorMessage}</PopoverBody>
          </PopoverContent>
        </Popover>
      ) : null}
    </>
  );
}
