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

import { SentenceHistoryType } from '@/utils/types';
import { useRouter } from 'next/navigation';
import { MandarinSentenceClass } from '../MandarinSentenceClass';
import ShareButton from '@/components/ShareButtonComponent';
import styles from '@/themes';

export default function HistoryPage() {
  const router = useRouter();
  const [fullHistory, setSentences] = useState<SentenceHistoryType[]>([]);
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

  const unpackSentence = (sentenceHistory: SentenceHistoryType) => {
    return {
      sentence: sentenceHistory.segments.map((x) => x.word).join(''),
      translation: sentenceHistory.translation,
      date: sentenceHistory.date,
    };
  };

  const viewSentence = (historyItem: SentenceHistoryType) => {
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

  const deleteFromHistory = (historyItem: SentenceHistoryType) => {
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

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
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
        justifyContent="center"
      >
        {fullHistory.length > 0 ? (
          fullHistory
            .slice()
            .reverse()
            .map((historyItem, index) => (
              <Card
                margin="0.1rem"
                marginBottom="0.5rem"
                padding="0.6rem"
                __css={styles.darkBox[colorMode]}
                key={index}
                w="20rem"
              >
                <Container onClick={() => viewSentence(historyItem)}>
                  <CardHeader my="0.5rem" cursor="pointer">
                    <VStack>
                      <Heading size="md">
                        {new Date(historyItem.date).toLocaleString(
                          undefined,
                          dateOptions,
                        )}
                      </Heading>
                      <Text>
                        {new Date(historyItem.date).toLocaleString(
                          undefined,
                          timeOptions,
                        )}
                      </Text>
                    </VStack>
                  </CardHeader>

                  <CardBody
                    p="0.5rem"
                    mb="0.5rem"
                    cursor="pointer"
                    __css={styles.lightBox[colorMode]}
                  >
                    <VStack divider={<StackDivider />}>
                      <Text
                        noOfLines={2}
                        maxWidth="20rem"
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
                        maxWidth="20rem"
                        minWidth="5rem"
                        fontSize="sm"
                        height="2.6rem"
                        marginTop="0.2rem"
                        marginBottom="0.2rem"
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
                </CardFooter>
              </Card>
            ))
        ) : (
          <Center>
            <Text>No history found</Text>
          </Center>
        )}
      </Flex>
    </Box>
  );
}
