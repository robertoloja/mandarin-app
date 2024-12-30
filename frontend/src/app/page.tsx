'use client'

import { useState } from "react";
import { 
  Box,
  Input,
  Button,
  Center,
} from "@chakra-ui/react"

import MandarinSentence from "@/components/MandarinSentence";
import Translation from "@/components/Translation";
import ProgressBar from "@/components/ProgressBar"
import { MandarinSentenceType } from "@/utils/types";
import { MandoBotAPI } from "@/utils/api";


export default function Home() {
  const emptySentence: MandarinSentenceType = {
    translation: '',
    dictionary: {},
    sentence: [],
  }

  const [percentage_done, setPercentageDone] = useState(0)
  const [sentence, setSentence] = useState(emptySentence)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setLoading] = useState(false)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleMessage = (message: MandarinSentenceType) => {
    // Since the input is batched before being sent, this ensures
    // the more recent batches do not override previous batches.
    setSentence(previousSentence => ({
      translation: previousSentence.translation + ' ' + message.translation,
      dictionary: {},
      sentence: [...previousSentence.sentence, ...message.sentence],
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    setSentence(emptySentence)
    setPercentageDone(0)
    if (inputValue == '') { return }
    setLoading(true)
  
    // Batch input by sentence, to speed up initial response time from server.
    const sentencesToProcess = inputValue.split(/(?<=[。？！.?!])/)
  
    for (const sentenceToProcess of sentencesToProcess) {
      await MandoBotAPI.segment(sentenceToProcess)
        .then((response: MandarinSentenceType) => {
          handleMessage(response)
        })

      setPercentageDone(prev =>
        prev + Math.floor(sentenceToProcess.length / inputValue.length * 100)
      )
    }
    setLoading(false)
    console.log(JSON.stringify(sentence))
  }

  return (
    <Box h="100%">
      {isLoading ?
        <ProgressBar progress_percent={percentage_done} />
      : null}

      <form onSubmit={handleSubmit}>
        <Input 
          type="text" 
          placeholder="Enter Mandarin text" 
          value={inputValue} 
          onChange={handleInputChange} 
          mb="0"
          mt={isLoading ? '0' : '0.25rem'}
        />

        <Button type="submit" colorScheme="teal" m={2}>
          Submit
        </Button>
      </form>

        <Box h="100%">
          <MandarinSentence
            sentence={sentence.sentence}
            translation={sentence.translation}
            dictionary={sentence.dictionary}
          />

          {sentence.sentence.length !== 0 ? 
            <Translation text={sentence.translation} />
            : null
          }
        </Box>
    </Box>
  );
}
