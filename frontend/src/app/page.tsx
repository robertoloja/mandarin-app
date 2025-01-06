'use client';

import { useState } from 'react';
import { Box, Input, Button, Text, HStack } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../utils/store/store';
import {
  clearMandarinSentence,
  appendToMandarinSentence,
  clearMandarinDictionary,
  appendToMandarinDictionary,
  setLoading,
} from '@/utils/store/mandarinSentenceSlice';

import MandarinSentence from '@/components/MandarinSentence';
import Translation from '@/components/Translation';
import ProgressBar from '@/components/ProgressBar';

import AccurateTimer from '@/utils/timer';
import { SegmentResponseType } from '@/utils/types';
import { MandoBotAPI } from '@/utils/api';

export default function Home() {
  const dispatch = useAppDispatch();

  const mandarinSentence = useSelector(
    (state: RootState) => state.mandarinSentence.mandarinSentence,
  );
  const mandarinDictionary = useSelector(
    (state: RootState) => state.mandarinSentence.mandarinDictionary,
  );

  const isLoading = useSelector(
    (state: RootState) => state.mandarinSentence.isLoading,
  );

  const [percentage_done, setPercentageDone] = useState(0);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleMessage = (message: SegmentResponseType) => {
    dispatch(
      appendToMandarinSentence({
        translation: message.translation,
        sentence: message.sentence,
      }),
    );
    dispatch(appendToMandarinDictionary(message.dictionary));
  };

  const BATCH_REQUESTS = true; //process.env.NODE_ENV !== 'development';

  const resetState = () => {
    dispatch(clearMandarinSentence());
    dispatch(clearMandarinDictionary());
    dispatch(setLoading(false));
    setPercentageDone(0);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetState();

    if (inputValue == '') {
      return;
    }
    dispatch(setLoading(true));
    const timer = new AccurateTimer();
    timer.start();

    if (BATCH_REQUESTS && inputValue.length > 100) {
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
          resetState();
          handleMessage(response);
        },
      );
    }
    dispatch(setLoading(false));
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
          sentence={mandarinSentence.sentence}
          translation={mandarinSentence.translation}
          dictionary={mandarinDictionary}
        />

        {mandarinSentence.sentence.length !== 0 ? (
          <Translation text={mandarinSentence.translation} />
        ) : null}
      </Box>
    </Box>
  );
}
