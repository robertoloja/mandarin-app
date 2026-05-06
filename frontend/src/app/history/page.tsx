'use client';
import { Box, Center, Flex, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { SentenceHistoryType } from '@/utils/types';
import SentenceHistoryCard from './components/SentenceHistoryCardComponent';
import localization from '@/localization/main';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';

export default function HistoryPage() {
  const [fullHistory, setSentences] = useState<SentenceHistoryType[]>([]);
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );

  useEffect(() => {
    document.title = 'mandoBot - History';
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
            <Text>
              {localization.sentence_history.no_history_found[user_language]}
            </Text>
          </Center>
        )}
      </Flex>
    </Box>
  );
}
