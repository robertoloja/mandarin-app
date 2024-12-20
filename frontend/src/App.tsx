import React, { useEffect, useState } from 'react';
import { CircularProgress, Center } from '@chakra-ui/react'

import './App.css';
import MandarinSentence from './components/MandarinSentence';
import { MandoBotAPI } from './apis/mandoBotAPI';
import TopNav from './components/TopNav';

// FOR TESTING
import { MandarinSentenceType, MandarinWordType, ChineseDictionary } from './types';

const dictionary: ChineseDictionary = {
  word: {
    english: "english",
    pinyin: "pinyin",
    simplified: "simplified",
  }
}

const word: MandarinWordType = {
  word: "word",
  pinyin: "pinyin",
  definitions: ["definition"],
  dictionary: dictionary,
}

const testsentence: MandarinSentenceType = {
  translation: "translation",
  dictionary: dictionary,
  sentence: [word]
}
// END TESTING

function App() {
  const emptySentence: MandarinSentenceType = {
    translation: '',
    dictionary: {},
    sentence: [],
  }
  const [loading, setLoading] = useState(true);
  const [sentence, setSentence] = useState(emptySentence);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      await MandoBotAPI.segment()
        .then((response) => { setSentence(response) })
        .finally(() => setLoading(false));
    }
    fetchData();
  }, [])

  return (
    <div className="App">
      <TopNav />
      {loading ? (<Center><CircularProgress isIndeterminate color='green.300' /></Center>) : (
        <MandarinSentence
          sentence={sentence.sentence}
          translation={sentence.translation}
          dictionary={sentence.dictionary}
        />
      )}
    </div>
  );
}

export default App;