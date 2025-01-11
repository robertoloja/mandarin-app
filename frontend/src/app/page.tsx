'use client';
import { Box, Input, Button, Text, HStack } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MandarinSentenceClass } from './MandarinSentenceClass';
import MandarinSentence from '@/components/MandarinSentence';
import Translation from '@/components/Translation';
import ProgressBar from '@/components/ProgressBar';
import { SegmentResponseType } from '@/utils/types';
import { RootState } from '@/utils/store/store';
import { MandoBotAPI } from '@/utils/api';

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const percentLoaded = useSelector(
    (state: RootState) => state.loading.percentLoaded,
  );
  const mandarinSentence = useSelector(
    (state: RootState) => state.sentence.mandarinSentence,
  );

  const urlShareId = useSearchParams().get('share_id') || '';
  useEffect(() => {
    if (urlShareId !== '') {
      MandoBotAPI.shared(urlShareId).then((response: SegmentResponseType) => {
        const sharedSentenced = new MandarinSentenceClass(
          '',
          response.sentence,
          response.dictionary,
          response.translation,
          urlShareId,
        );
        sharedSentenced.setActive();
        if (inputRef.current) inputRef.current.value = sharedSentenced.mandarin;
      });
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    let inputValue = '';

    if (inputRef.current && inputRef.current.value !== '') {
      inputValue = inputRef.current.value;
    }
    const mandarinClassInstance = new MandarinSentenceClass(inputValue);
    mandarinClassInstance.populate();
  };

  return (
    <Box h="100%">
      <ProgressBar />
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Enter Mandarin text to translate and segment"
          ref={inputRef}
          mb="0"
          mt={percentLoaded < 100 ? '0' : '0.25rem'}
        />
        <HStack>
          <Button
            type="submit"
            colorScheme="teal"
            m={2}
            isDisabled={percentLoaded < 100}
          >
            Submit
          </Button>
          {percentLoaded < 100 && (
            <Text color="gray.600" textAlign="center" w="60%">
              {percentLoaded == 0
                ? 'Segmentation and translation can take several minutes.'
                : 'Your results will load one sentence at a time.'}
            </Text>
          )}
        </HStack>
      </form>
      <Box h="100%">
        <MandarinSentence
          sentence={mandarinSentence.segments}
          translation={mandarinSentence.translation}
          dictionary={mandarinSentence.dictionary}
        />
        {mandarinSentence.segments.length !== 0 && (
          <Translation text={mandarinSentence.translation} />
        )}
      </Box>
    </Box>
  );
}
