import React, { useEffect, useState } from 'react';
import { CircularProgress, Center, Input, Button } from '@chakra-ui/react'

import './App.css';
import MandarinSentence from './components/MandarinSentence';
import { MandoBotAPI } from './apis/mandoBotAPI';
import TopNav from './components/TopNav';
import Translation from './components/Translation';
import { MandarinSentenceType, MandarinWordType, ChineseDictionary } from './types';

function App() {
  const emptySentence: MandarinSentenceType = {
    translation: '',
    dictionary: {},
    sentence: [],
  }
  const [loading, setLoading] = useState(false);
  const [sentence, setSentence] = useState(emptySentence);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    await MandoBotAPI.segment(inputValue)
      .then((response) => { setSentence(response) })
      .finally(() => setLoading(false));
  };

  return (
    <div className="App">
      <TopNav />
      <br></br>
      <br></br>
      <form onSubmit={handleSubmit}>
      <Input 
        type="text" 
        placeholder="Enter text" 
        value={inputValue} 
        onChange={handleInputChange} 
        mb={4} // Adds margin-bottom for spacing
      />
      <Button type="submit" colorScheme="teal">
        Submit
      </Button>
    </form>
      {loading ? (<Center><CircularProgress isIndeterminate color='green.300' /></Center>) : (
        <div>
          <MandarinSentence
            sentence={sentence.sentence}
            translation={sentence.translation}
            dictionary={sentence.dictionary}
          />
          <Translation text={sentence.translation} />
        </div>
      )}
    </div>
  );
}

export default App;