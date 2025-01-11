'use client';

import { RootState } from '@/utils/store/store';
import { Progress, Center } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

export default function ProgressBar() {
  const percentLoaded = useSelector(
    (state: RootState) => state.loading.percentLoaded,
  );
  return percentLoaded < 100 ? (
    <>
      <Center
        m="0"
        position="sticky"
        top="2.5rem" // Dependent on TopNav height
        left={0}
        right={0}
        zIndex={1}
        width="100%"
      >
        {percentLoaded === 0 ? (
          <Progress
            w="100%"
            colorScheme="blue"
            hasStripe
            isIndeterminate
            overflow="hidden"
            zIndex="1000"
            size="xs"
          />
        ) : (
          <Progress
            w="100%"
            colorScheme="blue"
            hasStripe
            size="xs"
            overflow="hidden"
            zIndex="1000"
            value={percentLoaded}
          />
        )}
      </Center>
    </>
  ) : null;
}
