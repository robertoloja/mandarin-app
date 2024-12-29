'use client'

import { Progress } from '@chakra-ui/react'

export default function ProgressBar( props: {
  progress_percent: number,
  isAtTop: boolean,
}) {
  return (
    <>
      {props.progress_percent == 0 ? 
        <Progress
          w="100%"
          colorScheme='blue'
          hasStripe
          isIndeterminate
          overflow="hidden"
          size='xs' />
        :
        <Progress
          w="100%"
          colorScheme='blue'
          hasStripe
          size={props.isAtTop ? 'xs' : 'md'}
          overflow="hidden"
          value={props.progress_percent} />
      }
    </>
  )
}