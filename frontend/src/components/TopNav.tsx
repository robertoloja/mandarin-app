'use client'
import React, { useRef } from "react";
import {
  // useDisclosure,
  IconButton,
  defineStyle,
  defineStyleConfig,
  HStack,
} from '@chakra-ui/react'
import { HamburgerIcon } from "@chakra-ui/icons";
// import NavPanel from "./NavPanel";

function TopNav() {
  // const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  const buttonStyle = defineStyle({
    border: '0',
    fontColor: 'blue',
    background: 'white',
  })

  defineStyleConfig({
    variants: { buttonStyle },
  })

  return (
    <HStack
      justifyContent="flex-start"
      boxShadow="1px 1px 1px 0 rgba(0, 0, 0, 0.3)"
      // borderBottom="solid 1px black"
      position="sticky"
      top="0"
      zIndex="100"
      backgroundColor="white"
      w='100%'
      h='2.5rem'
    >
      <IconButton
        aria-label="Open Navigation"
        icon={<HamburgerIcon boxSize='2rem' color="#468DA4" />}
        ref={btnRef}
        colorScheme='blue'
        variant="buttonStyle"
        style={{ marginLeft: '0.5rem' }}
        // onClick={onOpen}
      /> 

      {/* <NavPanel isOpen={isOpen} onClose={onClose} /> */}
    </HStack>
  )
}

export default TopNav;