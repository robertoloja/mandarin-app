'use client';

import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { RootState, useAppDispatch } from '@/utils/store/store';
import { Box, Input, Button, Text, HStack } from '@chakra-ui/react';

import {
  clearMandarinSentence,
  appendToMandarinSentence,
  clearMandarinDictionary,
  appendToMandarinDictionary,
  setLoading,
  setShareLink,
} from '@/utils/store/mandarinSentenceSlice';
import MandarinSentence from '@/components/MandarinSentence';
import Translation from '@/components/Translation';
import ProgressBar from '@/components/ProgressBar';
import AccurateTimer from '@/utils/timer';
import { emptySentence, SegmentResponseType } from '@/utils/types';
import { MandoBotAPI } from '@/utils/api';

export default function Home() {
  const dispatch = useAppDispatch();
  const share_id = useSearchParams().get('share_id') || '';

  const mandarinSentence = useSelector(
    (state: RootState) => state.mandarinSentence.mandarinSentence,
  );
  const mandarinDictionary = useSelector(
    (state: RootState) => state.mandarinSentence.mandarinDictionary,
  );

  const isLoading = useSelector(
    (state: RootState) => state.mandarinSentence.isLoading,
  );

  const [percentageDone, setPercentageDone] = useState(0);
  const inputRef = useRef<HTMLInputElement>('');

  const handleMessage = (message: SegmentResponseType) => {
    dispatch(
      appendToMandarinSentence({
        translation: message.translation,
        sentence: message.sentence,
      }),
    );
    dispatch(appendToMandarinDictionary(message.dictionary));
  };

  useEffect(() => {
    if (share_id !== '') {
      MandoBotAPI.shared(share_id).then((response: SegmentResponseType) => {
        handleMessage(response);
        dispatch(setShareLink(share_id));
      });
    }
  }, []);

  const BATCH_REQUESTS = true; //process.env.NODE_ENV !== 'development';

  const resetState = () => {
    dispatch(clearMandarinSentence());
    dispatch(clearMandarinDictionary());
    dispatch(setLoading(false));
    dispatch(setShareLink(''));
    setPercentageDone(0);
    setShareLink('');
    history.pushState(null, '', '/');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetState();
    const inputValue = inputRef.current.value;

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
          handleMessage(response);
        },
      );
    }

    dispatch(setLoading(false));

    if (typeof window !== 'undefined') {
      timer.stop();
      console.log(timer.getElapsedTime());
    }
  };
  useEffect(() => {
    // TODO: Wait, why is this here?
    if (!isLoading && mandarinSentence !== emptySentence && share_id === '') {
      getShareLink();
    }
  }, [mandarinSentence, isLoading]);

  const getShareLink = async () => {
    // TODO: Should not create a new link if the sentence is the same.
    const dataToSend = {
      translation: mandarinSentence.translation,
      sentence: mandarinSentence.sentence,
      dictionary: mandarinDictionary,
    };

    await MandoBotAPI.share(dataToSend).then((response: string) => {
      dispatch(setShareLink(response));
    });
  };

  return (
    <Box h="100%">
      {isLoading ? <ProgressBar progress_percent={percentageDone} /> : null}

      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Enter Mandarin text to translate and segment"
          // value={inputValue}
          // onChange={handleInputChange}
          ref={inputRef}
          mb="0"
          mt={isLoading ? '0' : '0.25rem'}
        />

        <HStack>
          <Button type="submit" colorScheme="teal" m={2}>
            Submit
          </Button>

          {isLoading ? (
            <Text color="gray.600" textAlign="center" w="60%">
              {percentageDone == 0
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
