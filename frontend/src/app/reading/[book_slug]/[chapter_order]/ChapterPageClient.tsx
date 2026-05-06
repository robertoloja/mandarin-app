'use client';

import { useSelector } from 'react-redux';
import { Flex } from '@chakra-ui/react';
import MandarinSentence from '@/components/MandarinSentenceComponent';
import Translation from '@/components/TranslationComponent';
import { RootState } from '@/utils/store/store';

export default function ChapterPageClient({ initialData }: { initialData: any }) {
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );

  return (
    <Flex direction="column" w="100%" h="100%" p={4}>
      {initialData && (
        <>
          <MandarinSentence
            user_language={user_language}
            sentence={initialData.sentence}
            dictionary={initialData.dictionary}
          />
          <Translation translations={initialData.translation ?? {}} />
        </>
      )}
    </Flex>
  );
}
