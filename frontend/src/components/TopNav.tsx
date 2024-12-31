'use client';
import React, { useRef } from 'react';
import {
  // useDisclosure,
  IconButton,
  defineStyle,
  defineStyleConfig,
  HStack,
  useColorMode,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { IoMoon, IoSunny } from 'react-icons/io5';
// import NavPanel from "./NavPanel";

function TopNav() {
  // const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const btnRef = useRef<HTMLButtonElement>(null);

  const buttonStyle = defineStyle({
    border: '0',
    fontColor: 'blue',
    background: 'white',
  });

  defineStyleConfig({
    variants: { buttonStyle },
  });

  return (
    <HStack
      justifyContent="space-between"
      boxShadow="1px 1px 1px 0 rgba(0, 0, 0, 0.3)"
      // borderBottom="solid 1px black"
      position="sticky"
      top="0"
      zIndex="100"
      w="100%"
      h="2.5rem"
      backgroundColor={colorMode === 'light' ? 'white' : 'gray.800'}
    >
      <IconButton
        aria-label="Open Navigation"
        icon={<HamburgerIcon boxSize="2rem" color="#468DA4" />}
        ref={btnRef}
        colorScheme="blue"
        variant="buttonStyle"
        style={{ marginLeft: '0.5rem' }}
        // onClick={onOpen}
      />
      <IconButton
        aria-label="Change color mode"
        icon={colorMode === 'light' ? <IoMoon /> : <IoSunny />}
        onClick={toggleColorMode}
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        mr="2rem"
      />

      {/* <NavPanel isOpen={isOpen} onClose={onClose} /> */}
    </HStack>
  );
}

export default TopNav;
