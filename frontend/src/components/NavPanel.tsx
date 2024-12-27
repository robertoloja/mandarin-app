import React from "react";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  VStack,
  Link,
  DrawerCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  defineStyle,
  defineStyleConfig,
} from '@chakra-ui/react';
import { ChatIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';

const noBorder = defineStyle({
  container: {
    border: '0',
  }
})

defineStyleConfig({
  variants: { noBorder },
})

function NavPanel(props: {
  isOpen: boolean,
  onClose: () => void,
}) {
  return (
    <Drawer
      isOpen={props.isOpen}
      placement='left'
      onClose={props.onClose}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />

        <DrawerBody>
          <VStack
            spacing="2rem"
            marginTop="10rem"
            marginLeft="5rem"
            alignItems="left"
          >
            <Link fontSize="xl">
              <ChatIcon marginRight="0.5rem" />
              live chat
            </Link>
            <Link fontSize="xl">
              <EditIcon marginRight="0.5rem" />
              insert text
            </Link>

            <Accordion allowToggle variant="noBorder">
              <AccordionItem>
                <AccordionButton padding="0.5rem 0" _hover={{ bg: 'white' }} border="0">
                  <ViewIcon margin="0 0.5rem" />
                  <Link fontSize="xl" paddingRight="0.5rem">
                    reading list
                  </Link>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <Link marginLeft="1rem">Three Kingdoms</Link>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer >
  )
}

export default NavPanel;