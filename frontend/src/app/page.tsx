'use client'

import { useState, useEffect } from "react";
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
  const [isAtTop, setIsAtTop] = useState(true)

  useEffect(() => {
    // Progress bar stays at the top when scrolling
    const handleScroll = () => {
      setIsAtTop(window.scrollY === 0)
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
          mb="0"
        />

        {isLoading ?
          <Center 
            m="0"
            position={isAtTop ? "relative" : "fixed"}
            top="0"
            left={0}
            right={0}
            zIndex={1}
            width="100%"
          >
            <ProgressBar 
              progress_percent={percentage_done}
              isAtTop={isAtTop} />
          </Center>
        : null}

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
