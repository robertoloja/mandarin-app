'use client'

import { Progress, Center } from '@chakra-ui/react'

export default function ProgressBar( props: {
  progress_percent: number,
  }) {

  return (
    <Center 
      m="0"
      position="sticky"
      top="2.5rem" // Dependent on TopNav height
      left={0}
      right={0}
      zIndex={1}
      width="100%"
    >
      {props.progress_percent == 0 ? 
        <Progress
          w="100%"
          colorScheme='blue'
          hasStripe
          isIndeterminate
          overflow="hidden"
          zIndex='1000'
          size='xs' />
        :
        <Progress
          w="100%"
          colorScheme='blue'
          hasStripe
          size='xs'
          overflow="hidden"
          zIndex='1000'
          value={props.progress_percent} />
      }
    </Center>
  )
}