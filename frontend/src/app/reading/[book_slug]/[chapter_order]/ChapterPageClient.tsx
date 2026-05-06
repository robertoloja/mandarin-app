'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Flex, Spinner } from '@chakra-ui/react';
import MandarinSentence from '@/components/MandarinSentenceComponent';
import Translation from '@/components/TranslationComponent';
import { RootState } from '@/utils/store/store';
import { MandoBotAPI } from '@/utils/api';

export default function ChapterPageClient({ initialData }: { initialData: any }) {
  const params = useParams();
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (!data && params.book_slug && params.chapter_order) {
      MandoBotAPI.readingRoomChapter(
        params.book_slug as string,
        Number(params.chapter_order),
      )
        .then(setData)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <Flex direction="column" w="100%" h="100%" p={4}>
      {loading ? (
        <Flex justify="center" align="center" h="100%">
          <Spinner size="xl" />
        </Flex>
      ) : data && (
        <>
          <MandarinSentence
            user_language={user_language}
            sentence={data.sentence}
            dictionary={data.dictionary}
          />
          <Translation translations={data.translation ?? {}} />
        </>
      )}
    </Flex>
  );
}
