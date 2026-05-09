'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import Word from './WordComponent';
import { MandarinWordType, ChineseDictionary } from '@/utils/types';
import { UserLanguage } from '@/localization/main';

interface MandarinSentenceProps {
  sentence: MandarinWordType[];
  dictionary?: ChineseDictionary;
  user_language: UserLanguage;
  noBottomMargin?: boolean;
}

function MandarinSentence(props: MandarinSentenceProps) {
  const pronunciation = useSelector(
    (state: RootState) => state.settings.pronunciation,
  );
  const pronunciationFontSize = useSelector(
    (state: RootState) => state.settings.pronunciationFontSize,
  );
  const height = useSelector(
    (state: RootState) => state.sentence.translationPanelHeight,
  );

  const showRuby = pronunciationFontSize !== 0;
  const lineHeight = showRuby ? (pronunciation === 'zhuyin' ? 4.5 : 4) : 3;

  return (
    <div
      style={{
        width: '100%',
        marginBottom: props.noBottomMargin ? 0 : `${height}px`,
      }}
      aria-label="mandarin sentence"
    >
      <p
        style={{
          margin: 0,
          textAlign: 'justify',
          lineHeight,
          fontFamily: '"Noto Serif SC", serif',
        }}
      >
        {props.sentence.map((word, index) => (
          <Word
            word={word}
            pronunciation={
              pronunciation === 'pinyin' ? word.pinyin : word.zhuyin
            }
            definitions={word.definitions[props.user_language]}
            user_language={props.user_language}
            dictionary={props.dictionary}
            key={index}
          />
        ))}
      </p>
    </div>
  );
}

export default MandarinSentence;
