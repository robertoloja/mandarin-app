'use client'

import { useState } from "react";
import { 
  Box,
  Input,
  Button,
  Center,
  Progress,
} from "@chakra-ui/react"
import {
  ProgressCircleRing,
  ProgressCircleRoot,
} from "@/components/ui/progress-circle"

import { MandoBotAPI } from "@/utils/api";
import { ChineseDictionary, MandarinSentenceType } from "@/utils/types";
import MandarinSentence from "@/components/MandarinSentence";
import Translation from "@/components/Translation";


export default function Home() {
  const [isLoading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [sentence, setSentence] = useState({
    translation: '',
    dictionary: {} as ChineseDictionary,
    sentence: [],
  } as MandarinSentenceType)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)

    await MandoBotAPI.segment(inputValue)
      .then(response => { setSentence(response) })
      .finally(() => { setLoading(false) })
  }

  return (
    <Box h="100%">
      <form onSubmit={handleSubmit}>
        <Input 
          type="text" 
          placeholder="Enter Mandarin text" 
          value={inputValue} 
          onChange={handleInputChange} 
          mt={10}
        />

        <Button type="submit" colorScheme="teal" m={2}>
          Submit
        </Button>
      </form>

      {isLoading ? 
        <Center>
          <ProgressCircleRoot value={null} size="md">
            <ProgressCircleRing cap="round" />
          </ProgressCircleRoot>
        </Center> 
        :
        <Box h="100%">
          <MandarinSentence
            sentence={sentence.sentence}
            translation={sentence.translation}
            dictionary={sentence.dictionary}
          />

          {/* {sentence.sentence.length !== 0 ? <Translation text={sentence.translation} /> : null} */}
        </Box>
      }
    </Box>
  );
}
