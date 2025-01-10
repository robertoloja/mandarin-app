'use client';

import {
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
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
import { IoShareSocialOutline, IoTrashOutline } from 'react-icons/io5';

import { SentenceHistory } from '@/utils/types';
import {
  appendToMandarinSentence,
  appendToMandarinDictionary,
  clearMandarinDictionary,
  clearMandarinSentence,
  setShareLink,
} from '@/utils/store/mandarinSentenceSlice';
import { useAppDispatch } from '@/utils/store/store';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [fullHistory, setSentences] = useState<SentenceHistory[]>([]);
  const { colorMode } = useColorMode();

  useEffect(() => {
    const sentenceHistory = localStorage.getItem('history');
    if (sentenceHistory) {
      setSentences(JSON.parse(sentenceHistory));
    }
  }, []);

  const unpackSentence = (sentenceHistory: SentenceHistory) => {
    return {
      sentence: sentenceHistory.sentence.sentence.map((x) => x.word).join(''),
      translation: sentenceHistory.sentence.translation,
    };
  };

  const viewSentence = (historyItem: SentenceHistory) => {
    dispatch(clearMandarinDictionary());
    dispatch(clearMandarinSentence());
    dispatch(appendToMandarinSentence(historyItem.sentence));
    dispatch(appendToMandarinDictionary(historyItem.dictionary));
    dispatch(setShareLink(historyItem.shareLink));
    router.push('/');
  };

  const deleteFromHistory = (sentenceHistory: SentenceHistory) => {
    //TODO: filter the full history by shareLink
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
              borderRadius="4"
              boxShadow="1px 1px 1px rgba(0, 0, 0, 0.25)"
              key={index}
              cursor="pointer"
              onClick={() => viewSentence(historyItem)}
            >
              <CardHeader mt="2rem">
                <Center>
                  <Heading size="md">Sentence {index + 1}</Heading>
                </Center>
              </CardHeader>

              <CardBody p="1rem">
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
              <CardFooter>
                <IconButton
                  aria-label="Delete sentence"
                  icon={<IoTrashOutline />}
                  onClick={() => deleteFromHistory(historyItem)}
                />
                <Spacer />
                <IconButton
                  aria-label="Get share link"
                  icon={<IoShareSocialOutline />}
                />
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
