'use client';
import { Box, Button, Text, HStack } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MandarinSentenceClass } from './MandarinSentenceClass';
import MandarinSentence from '@/components/MandarinSentenceComponent';
import Translation from '@/components/TranslationComponent';
import ProgressBar from '@/components/ProgressBarComponent';
import { SegmentResponseType } from '@/utils/types';
import { RootState, store } from '@/utils/store/store';
import { MandoBotAPI } from '@/utils/api';
import TextInput from '@/components/TextInputComponent';
import { updateLoading } from '@/utils/store/loadingSlice';

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
      store.dispatch(updateLoading({ percent: 0 }));
      const sharedSentence = new MandarinSentenceClass('');
      sharedSentence.setActive();

      MandoBotAPI.shared(urlShareId).then((response: SegmentResponseType) => {
        store.dispatch(updateLoading({ percent: 100 }));
        if (response.translation !== '') {
          const sharedSentenced = new MandarinSentenceClass(
            '',
            response.sentence,
            response.dictionary,
            response.translation,
            urlShareId,
          );
          sharedSentenced.setActive();
          if (inputRef.current)
            inputRef.current.value = sharedSentenced.mandarin;
        }
      });
    } else {
      if (mandarinSentence.mandarin && inputRef.current)
        inputRef.current.value = mandarinSentence.mandarin;
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
        <TextInput inputRef={inputRef} />
        <HStack>
          <Button
            type="submit"
            colorScheme="teal"
            m={2}
            isDisabled={percentLoaded < 100}
            aria-label="submit sentence"
          >
            Submit
          </Button>
          {percentLoaded < 100 && (
            <Text color="gray.600" textAlign="center" w="60%">
              {percentLoaded == 0
                ? 'Segmentation and translation can take several seconds.'
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
