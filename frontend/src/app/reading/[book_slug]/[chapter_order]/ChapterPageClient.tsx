'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Flex } from '@chakra-ui/react';
import MandarinSentence from '@/components/MandarinSentenceComponent';
import Translation from '@/components/TranslationComponent';
import { appendToMandarinDictionary } from '@/utils/store/mandarinSentenceSlice';
import { MandoBotAPI } from '@/utils/api';
import { RootState } from '@/utils/store/store';
import { useParams } from 'next/navigation';

export default function ChapterPageClient() {
  const dispatch = useDispatch();
  const params = useParams();
  const [chapterData, setChapterData] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );

  useEffect(() => {
    const book_slug = params.book_slug as string;
    const chapter_order = parseInt(params.chapter_order as string, 10);
    MandoBotAPI.readingRoomChapter(book_slug, chapter_order).then((data) => {
      dispatch(appendToMandarinDictionary(data.dictionary));
      setChapterData(data);
      setReady(true);
    });
  }, [dispatch, params]);

  return (
    <Flex direction="column" w="100%" h="100%" p={4}>
      {ready && chapterData && (
        <>
          <MandarinSentence
            user_language={user_language}
            sentence={chapterData.sentence}
            dictionary={chapterData.dictionary}
          />
          <Translation translations={chapterData.translation ?? {}} />
        </>
      )}
    </Flex>
  );
}
