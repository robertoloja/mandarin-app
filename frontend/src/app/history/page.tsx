'use client';

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Flex,
  Heading,
  IconButton,
  StackDivider,
  Text,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { IoTrashOutline } from 'react-icons/io5';

import { ChineseDictionary, MandarinSentenceType } from '@/utils/types';
import {
  appendToMandarinSentence,
  appendToMandarinDictionary,
  clearMandarinDictionary,
  clearMandarinSentence,
  setShareLink,
} from '@/utils/store/mandarinSentenceSlice';
import { useAppDispatch } from '@/components/LoginTest';
import { useRouter } from 'next/navigation';

type SentenceHistory = {
  shareLink: string;
  dictionary: ChineseDictionary;
  sentence: MandarinSentenceType;
};

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
    console.log(router);
    router.push('/');
  };

  const deleteFromHistory = (sentenceHistory: SentenceHistory) => {
    //TODO: filter the full history by shareLink
  };

  return (
    <Flex
      w="100%"
      h="100%"
      px={['0', '5%']}
      flexWrap="wrap"
      mb={['45vh', '20vh']}
      overflow="hidden"
      m="2rem"
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
              colorMode === 'light' ? '1px solid #468DA4' : '1px solid #1e282c'
            }
            borderRadius="4"
            boxShadow="1px 1px 1px rgba(0, 0, 0, 0.25)"
            width="25vh"
            key={index}
            cursor="pointer"
            onClick={() => viewSentence(historyItem)}
          >
            <CardHeader>
              <Center>
                <Heading size="md">Sentence {index + 1}</Heading>
              </Center>
            </CardHeader>

            <CardBody p="1rem">
              <VStack divider={<StackDivider />}>
                <Text noOfLines={2}>
                  {unpackSentence(historyItem).sentence}
                </Text>
                <Text noOfLines={2}>
                  {unpackSentence(historyItem).translation}
                </Text>
              </VStack>
            </CardBody>
            <CardFooter>
              <IconButton
                aria-label="Delete sentence"
                icon={<IoTrashOutline />}
              />
            </CardFooter>
          </Card>
        ))
      ) : (
        <Text>No history found</Text>
      )}
    </Flex>
  );
}
