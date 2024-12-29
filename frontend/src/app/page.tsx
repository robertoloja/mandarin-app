'use client'

import { useState } from "react";
import { 
  Box,
  Input,
  Button,
  Center,
  Text,
  Progress,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react"

import { MandoBotAPI } from "@/utils/api";
import { MandarinSentenceType } from "@/utils/types";
import MandarinSentence from "@/components/MandarinSentence";
import Translation from "@/components/Translation";


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

  let taskId = ''

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleMessage = (data: {message: MandarinSentenceType, percent: number}) => {
    setSentence(previousSentence => ({
      translation: previousSentence.translation + ' ' + data.message.translation,
      dictionary: {},
      sentence: [...previousSentence.sentence, ...data.message.sentence],
    }))
    setPercentageDone(data.percent)
  }
  const handleError = (error: any) => {
    console.error(error)
  }
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSentence(emptySentence)
    setLoading(true)
  
    try {
      await MandoBotAPI.segment(inputValue)
        .then(response => { 
          taskId = response
        })
        .finally(() => {
          console.log("Attempting to connect to SSE...");
          const eventSource = MandoBotAPI.sse(taskId, handleMessage, handleError);
          console.log("SSE connection established.");

          eventSource.onerror = (error) => {
            if (error instanceof Event && error.type === "error") {
              console.log("Closing connection")
              eventSource.close()
              setLoading(false)
              setPercentageDone(0)
            } else {
              console.error("SSE Error:", error)
            }
          }
        })
    } catch (error) {
      console.error(error)
    }
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
          <Center m="0">
          {percentage_done == 0 ?
            <Progress w="100%" colorScheme="blue" hasStripe isIndeterminate size='xs' />
            :
            <Progress w="100%" colorScheme="blue" hasStripe size='xs' value={percentage_done} />
          }
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
