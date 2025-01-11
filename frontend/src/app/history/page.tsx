'use client';
import {
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Container,
  Flex,
  Heading,
  IconButton,
  Spacer,
  StackDivider,
  Text,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { IoTrashOutline } from 'react-icons/io5';

import { MandarinSentenceType } from '@/utils/types';
import { useRouter } from 'next/navigation';
import { MandarinSentenceClass } from '../MandarinSentenceClass';
import ShareButton from '@/components/ShareButton';

export default function HistoryPage() {
  const router = useRouter();
  const [fullHistory, setSentences] = useState<MandarinSentenceType[]>([]);
  const { colorMode } = useColorMode();

  useEffect(() => {
    resetHistory();
  }, []);

  const resetHistory = () => {
    const sentenceHistory = localStorage.getItem('history');
    if (sentenceHistory) {
      setSentences(JSON.parse(sentenceHistory));
    }
  };

  const unpackSentence = (sentenceHistory: MandarinSentenceType) => {
    return {
      sentence: sentenceHistory.segments.map((x) => x.word).join(''),
      translation: sentenceHistory.translation,
    };
  };

  const viewSentence = (historyItem: MandarinSentenceType) => {
    const historySentence = new MandarinSentenceClass(
      '',
      historyItem.segments,
      historyItem.dictionary,
      historyItem.translation,
      historyItem.shareURL,
    );
    historySentence.setActive();
    router.push('/');
  };

  const deleteFromHistory = (historyItem: MandarinSentenceType) => {
    const historySentence = new MandarinSentenceClass(
      '',
      historyItem.segments,
      historyItem.dictionary,
      historyItem.translation,
      historyItem.shareURL,
    );
    historySentence.deleteFromHistory();
    resetHistory();
    router.refresh();
  };

  return (
    <Box h="100%" my="2rem" mx="5%">
      <Flex
        align="stretch"
        w="100%"
        h="100%"
        px={['0', '5%']}
        flexWrap="wrap"
        mb={['45vh', '20vh']}
        overflow="hidden"
      >
        {fullHistory.length > 0 ? (
          fullHistory.map((historyItem, index) => (
            <Card
              variant="unstyled"
              backgroundColor={colorMode === 'light' ? '#B8EEFF' : '#333c40'}
              margin="0.1rem"
              marginBottom="0.5rem"
              padding="0.6rem"
              border={
                colorMode === 'light'
                  ? '1px solid #468DA4'
                  : '1px solid #1e282c'
              }
              borderRadius="8"
              boxShadow="1px 1px 1px rgba(0, 0, 0, 0.25)"
              key={index}
            >
              <Container onClick={() => viewSentence(historyItem)}>
                <CardHeader mt="2rem" cursor="pointer">
                  <Center>
                    <Heading size="md">Sentence {index + 1}</Heading>
                  </Center>
                </CardHeader>

                <CardBody p="1rem" cursor="pointer">
                  <VStack divider={<StackDivider />}>
                    <Text
                      noOfLines={2}
                      maxWidth="10rem"
                      minWidth="5rem"
                      fontSize="sm"
                      height="2.6rem"
                      marginTop="0.5rem"
                      marginBottom="0.5rem"
                      textAlign="center"
                      cursor="pointer"
                      zIndex={5}
                    >
                      {unpackSentence(historyItem).sentence}
                    </Text>
                    <Text
                      noOfLines={2}
                      maxWidth="10rem"
                      minWidth="5rem"
                      fontSize="sm"
                      height="2.6rem"
                      marginTop="0.5rem"
                      marginBottom="0.5rem"
                      textAlign="center"
                    >
                      {unpackSentence(historyItem).translation}
                    </Text>
                  </VStack>
                </CardBody>
              </Container>
              <CardFooter>
                <IconButton
                  aria-label="Delete sentence"
                  icon={<IoTrashOutline />}
                  zIndex={10}
                  transition="background-color 0.3s ease"
                  _hover={{ bg: 'rgba(200, 60, 60, 1)' }}
                  onClick={(e) => {
                    e.preventDefault();
                    deleteFromHistory(historyItem);
                  }}
                />
                <Spacer />
                <ShareButton
                  iconSize={15}
                  shareLink={historyItem.shareURL}
                  defaultStyles={true}
                />
                {/* <IconButton
                  aria-label="Get share link"
                  icon={<IoShareSocialOutline />}
                /> */}
              </CardFooter>
            </Card>
          ))
        ) : (
          <Text>No history found</Text>
        )}
      </Flex>
    </Box>
  );
}
