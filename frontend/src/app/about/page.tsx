'use client';

import ServerStatusComponent from '@/components/ServerStatusComponent';
import {
  Box,
  Center,
  ColorModeContextType,
  Flex,
  Heading,
  HStack,
  ListItem,
  OrderedList,
  Spacer,
  Text,
  UnorderedList,
  useColorMode,
  VStack,
} from '@chakra-ui/react';

export default function AboutPage() {
  const { colorMode } = useColorMode();
  return (
    <Box
      display="flex"
      justifyContent="center"
      width="100vw"
      overflowX="hidden"
    >
      <Flex
        justifyContent="center"
        direction={{ base: 'column', lg: 'row' }}
        align="center"
        alignItems={{ base: 'center', lg: 'flex-start' }}
        justify="center"
        p={4}
        m={[2, 10]}
        gap={4}
        maxWidth="100vw"
        boxSizing="border-box"
      >
        <ServerStatusComponent />
        <ProjectSupportCard />
      </Flex>
    </Box>
  );
}

const ProjectSupportCard = () => {
  const { colorMode } = useColorMode();
  return (
    <Box>
      <Heading size="md" textAlign="center" mb={4} whiteSpace="nowrap">
        Support This Project
      </Heading>

      <Box
        justifyContent="center"
        w="fit-content"
        m={2}
        border={
          colorMode === 'light' ? '1px solid #468DA4' : '1px solid #1e282c'
        }
        p={5}
        borderRadius={8}
        backgroundColor={colorMode === 'light' ? '#B8EEFF' : '#333c40'}
        boxShadow="1px 1px 1px rgba(0, 0, 0, 0.3)"
        minWidth="30vw"
      >
        <Text mb={4}>
          If this website is useful to you, please consider supporting the
          project with a monthly subscription. Doing so provides several
          benefits:
        </Text>

        <Center>
          <VStack>
            <HStack>
              <Heading size="sm">$5 / month</Heading>
            </HStack>
            <Box
              p={3}
              mb={5}
              borderRadius={8}
              boxShadow="1px 1px 2px rgba(0, 0, 0, 0.5)"
              backgroundColor={colorMode === 'light' ? '#85E2FF' : '#495255'}
              border={
                colorMode === 'light'
                  ? '1px solid #468DA4'
                  : '1px solid #1e282c'
              }
            >
              <OrderedList p={4}>
                <ListItem>
                  <b>Increased Segmentation Limit</b>
                </ListItem>
                <UnorderedList mb={3}>
                  <ListItem>
                    Project supporters can segment sentences of up to 1,000
                    characters
                  </ListItem>
                  <ListItem>Free users are limited to 200 characters</ListItem>
                </UnorderedList>

                <ListItem>
                  <b>Always the best available translation</b>
                </ListItem>
                <UnorderedList mb={3}>
                  <ListItem>
                    Project supporter translations always use DeepL, the
                    best-in-class translation system
                  </ListItem>
                  <ListItem>
                    Free users' translations are performed by Argos Translate
                  </ListItem>
                </UnorderedList>

                <ListItem>
                  <b>
                    Advance Access to Reading Room and Prioritized Suggestions
                  </b>
                </ListItem>
                <UnorderedList>
                  <ListItem>
                    Project Supporters receive access to chapters as soon as
                    they are created, and can request specific texts to be added
                  </ListItem>
                  <ListItem>
                    Free users access new texts once all chapters are finished
                  </ListItem>
                </UnorderedList>
              </OrderedList>
            </Box>
          </VStack>
        </Center>
        <Text mb={2}>
          MandoBot is built and maintained by a single developer on a shoestring
          budget. While every optimization is used to maintain good performance,
          free hosting can only go so far. If you experience any issues at all,
          please <u>contact me</u>, or <u>fill out a bug report</u>, and it will
          be addressed as soon as possible.
        </Text>
      </Box>
    </Box>
  );
};
