import React, { useRef } from "react";
import {
  useDisclosure,
  IconButton,
  defineStyle,
  defineStyleConfig,
  HStack,
} from '@chakra-ui/react'
import { HamburgerIcon } from "@chakra-ui/icons";
import NavPanel from "./NavPanel";

function TopNav() {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      boxShadow="2px 2px 2px 0 rgba(0, 0, 0, 0.3)"
      borderBottom="solid 1px black"
      position="fixed"
      zIndex="100"
      backgroundColor="white"
      maxW='100%'
      w='100%'
    >
      <IconButton
        aria-label="Open Navigation"
        icon={<HamburgerIcon boxSize='2rem' color="#468DA4" />}
        ref={btnRef}
        colorScheme='blue'
        variant="buttonStyle"
        style={{ marginLeft: '0.5rem' }}
        onClick={onOpen}
      /> 

      <NavPanel isOpen={isOpen} onClose={onClose} />
    </HStack>
  )
}

export default TopNav;