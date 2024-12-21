import React, { useState } from 'react';
import { CircularProgress, Center, Input, Button, FormControl, Box } from '@chakra-ui/react'

import './App.css';

import MandarinSentence from './components/MandarinSentence';
import Translation from './components/Translation';
// import TopNav from './components/TopNav';

import { MandarinSentenceType } from './types';
import { MandoBotAPI } from './apis/mandoBotAPI';

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
    <Box h="100%">
      {/* <TopNav /> */}

      <FormControl p={5}>
        <Input 
          type="text" 
          placeholder="Enter Mandarin text" 
          value={inputValue} 
          onChange={handleInputChange} 
          mt={10}
        />

        <Button type="submit" colorScheme="teal" onClick={handleSubmit} m={2}>
          Submit
        </Button>
      </FormControl>

      {loading ? (<Center><CircularProgress isIndeterminate color='green.300' /></Center>) : (
        <Box h="100%">
          <MandarinSentence
            sentence={sentence.sentence}
            translation={sentence.translation}
            dictionary={sentence.dictionary}
          />

          {sentence.sentence.length !== 0 ? 
            <Translation text={sentence.translation} /> : null}
        </Box>
      )}
    </Box>
  );
}

export default App;