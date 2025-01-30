'use client';
import { Box, Center, Flex, Text, useColorMode } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { SentenceHistoryType } from '@/utils/types';
import SentenceHistoryCard from './components/SentenceHistoryCardComponent';

export default function HistoryPage() {
  const [fullHistory, setSentences] = useState<SentenceHistoryType[]>([]);

  useEffect(() => {
    resetHistory();
  }, []);

  const resetHistory = () => {
    const sentenceHistory = localStorage.getItem('history');
    if (sentenceHistory) {
      setSentences(JSON.parse(sentenceHistory));
    }
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
              <SentenceHistoryCard
                index={index}
                historyItem={historyItem}
                resetHistory={resetHistory}
                key={index}
              />
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
