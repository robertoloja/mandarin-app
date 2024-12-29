'use client'

import { useState, useEffect } from "react";
import { 
  Box,
  Input,
  Button,
  Center,
  Progress,
} from "@chakra-ui/react"

import { MandoBotAPI } from "@/utils/api";
import { MandarinSentenceType } from "@/utils/types";
import MandarinSentence from "@/components/MandarinSentence";
import Translation from "@/components/Translation";
import ProgressBar from "@/components/ProgressBar"


export default function Home() {
  const emptySentence: MandarinSentenceType = {
    translation: '',
    dictionary: {},
    sentence: [],
  }
  const [isLoading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [sentence, setSentence] = useState(emptySentence)
  const [percentage_done, setPercentageDone] = useState(0)
  const [isAtTop, setIsAtTop] = useState(true)

  useEffect(() => {
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

          {sentence.sentence.length !== 0 ? <Translation text={sentence.translation} /> : null}
        </Box>
    </Box>
  );
}
