'use client';

import { useState } from 'react';
import { Box, Input, Button, Text, HStack } from '@chakra-ui/react';

import MandarinSentence from '@/components/MandarinSentence';
import Translation from '@/components/Translation';
import ProgressBar from '@/components/ProgressBar';
import AccurateTimer from '@/utils/timer';

import {
  MandarinSentenceType,
  MandarinWordType,
  ChineseDictionary,
  SegmentResponseType,
} from '@/utils/types';
import { MandoBotAPI } from '@/utils/api';

export default function Home() {
  const emptySentence: MandarinSentenceType = {
    translation: '',
    sentence: [] as MandarinWordType[],
  };

  const [sentence, setSentence] = useState(
    emptySentence as MandarinSentenceType,
  );
  const [dictionary, setDictionary] = useState({} as ChineseDictionary);
  const [percentage_done, setPercentageDone] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setLoading] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleMessage = (message: SegmentResponseType) => {
    // Since the input (might be) batched before being sent, this ensures
    // the more recent batches do not override previous batches.
    setSentence((previousSentence) => ({
      translation: previousSentence.translation + ' ' + message.translation,
      sentence: [...previousSentence.sentence, ...message.sentence],
    }));
    setDictionary((previousDictionary) => ({
      ...previousDictionary,
      ...message.dictionary,
    }));
  };

  const BATCH_REQUESTS = process.env.NODE_ENV !== 'development';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setSentence(emptySentence);
    setPercentageDone(0);
    if (inputValue == '') {
      return;
    }
    setLoading(true);
    const timer = new AccurateTimer();
    timer.start();

    if (BATCH_REQUESTS) {
      // Batch input by sentence, to speed up initial response time from server.
      const sentencesToProcess = inputValue.split(/(?<=[。？！.?!])/);

      for (const sentenceToProcess of sentencesToProcess) {
        await MandoBotAPI.segment(sentenceToProcess).then(
          (response: SegmentResponseType) => {
            handleMessage(response);
          },
        );

        setPercentageDone(
          (prev) =>
            prev +
            Math.floor((sentenceToProcess.length / inputValue.length) * 100),
        );
      }
    } else {
      await MandoBotAPI.segment(inputValue).then(
        (response: SegmentResponseType) => {
          setSentence(emptySentence);
          handleMessage(response);
        },
      );
    }
    setLoading(false);
    timer.stop();
    console.log(timer.getElapsedTime());
  };

  return (
    <Box h="100%">
      {isLoading ? <ProgressBar progress_percent={percentage_done} /> : null}

      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Enter Mandarin text to translate and segment"
          value={inputValue}
          onChange={handleInputChange}
          mb="0"
          mt={isLoading ? '0' : '0.25rem'}
        />

        <HStack>
          <Button type="submit" colorScheme="teal" m={2}>
            Submit
          </Button>

          {isLoading ? (
            <Text color="gray.600" textAlign="center" w="60%">
              {percentage_done == 0
                ? 'Segmentation and translation can take several minutes.'
                : 'Your results will load one sentence at a time.'}
            </Text>
          ) : null}
        </HStack>
      </form>

      <Box h="100%">
        <MandarinSentence
          sentence={sentence.sentence}
          translation={sentence.translation}
          dictionary={dictionary}
        />

        {sentence.sentence.length !== 0 ? (
          <Translation text={sentence.translation} />
        ) : null}
      </Box>
    </Box>
  );
}
