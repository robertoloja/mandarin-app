'use client'

import { useState } from "react";
import { 
  Box,
  Input,
  Button,
  Center,
  CircularProgress,
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

  let taskId = ''

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleMessage = (data: {message: MandarinSentenceType}) => {
    setSentence(previousSentence => ({
      translation: previousSentence.translation + ' ' + data.message.translation,
      dictionary: {},
      sentence: [...previousSentence.sentence, ...data.message.sentence],
    }))
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
              eventSource.close();
              setLoading(false);
            } else {
              console.error("SSE Error:", error);
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
        />

        <Button type="submit" colorScheme="teal" m={2}>
          Submit
        </Button>
      </form>

      {isLoading ? 
        <Center>
          <CircularProgress
            isIndeterminate 
            color='green.300'
            position="fixed"
            zIndex={1000}
            size="10rem"
            pt="5rem"
          />
        </Center> 
        : null}
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
