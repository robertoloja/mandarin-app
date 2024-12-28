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

  const handleMessage = (data: any) => {
    console.log(data)
  }
  const handleError = (error: any) => {
    console.error(error)
  }
  const getStream = () => {
    console.log("Attempting to connect to SSE...");
    const eventSource = MandoBotAPI.sse(handleMessage, handleError);
    console.log("SSE connection established.");
    eventSource.addEventListener("close", () => {
      console.log("Closing connection")
      eventSource.close()
    })
    eventSource.onerror = (error) => {
      eventSource.close()
    }
  }

  return (
    <Box h="100%">
      <Button onClick={getStream}>FOO</Button>
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
          <CircularProgress isIndeterminate color='green.300' />
        </Center> 
        :
        <Box h="100%">
          <MandarinSentence
            sentence={sentence.sentence}
            translation={sentence.translation}
            dictionary={sentence.dictionary}
          />

          {sentence.sentence.length !== 0 ? <Translation text={sentence.translation} /> : null}
        </Box>
      }
    </Box>
  );
}
