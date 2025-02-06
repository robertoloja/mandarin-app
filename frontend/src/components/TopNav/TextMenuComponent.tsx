'use client';

import {
  Center,
  Grid,
  GridItem,
  HStack,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Switch,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { IoTextOutline } from 'react-icons/io5';

export default function TextMenuButton() {
  const { colorMode } = useColorMode();

  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          aria-label="text settings"
          icon={<IoTextOutline size={22} />}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
        />
      </PopoverTrigger>

      <PopoverContent>
        <PopoverArrow />
        <PopoverHeader>
          <Center>Text Options</Center>
        </PopoverHeader>
        <PopoverBody>
          <TextPreferences />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

const TextPreferences = () => {
  const [definitionFontSize, setDefinitionFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined' && localStorage) {
      return Number(localStorage.getItem('definitionFontSize'));
    }
    return 15;
  });
  const [pronunciationFontSize, setPronunciationFontSize] = useState<number>(
    () => {
      if (typeof window !== 'undefined' && localStorage)
        return Number(localStorage.getItem('pronunciationFontSize'));
      return 15;
    },
  );
  const [showPronunciation, togglePronunciation] = useState(true);
  const [showDefinition, toggleDefinition] = useState(true);

  const setFontSize = (
    value: number,
    storageKey: string,
    setter: (val: number) => void,
  ) => {
    if (value !== 0) setter(value);
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem(`${storageKey}FontSize`, `${value}`);
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: `${storageKey}FontSize`,
          newValue: String(value),
        }),
      );
    }
  };

  useEffect(() => {
    toggleDefinition(definitionFontSize !== 0);
    togglePronunciation(pronunciationFontSize !== 0);
  }, []);

  return (
    <Grid
      templateColumns="1fr 1fr"
      templateRows="repeast(4, 1fr)"
      gap={4}
      my={5}
    >
      <GridItem rowSpan={2} colSpan={1}>
        <Text textAlign="center">Pronunciation</Text>
      </GridItem>

      <GridItem rowSpan={1} colSpan={1}>
        <HStack>
          <Text>off</Text>
          <Switch
            isChecked={showPronunciation}
            onChange={() => {
              if (showPronunciation && pronunciationFontSize !== 0) {
                togglePronunciation(false);
                setFontSize(0, 'pronunciation', setPronunciationFontSize);
              } else {
                togglePronunciation(true);
                setFontSize(
                  pronunciationFontSize || 15,
                  'pronunciation',
                  setPronunciationFontSize,
                );
              }
            }}
          />
          <Text>on</Text>
        </HStack>
      </GridItem>

      <GridItem rowSpan={1} colSpan={1}>
        <HStack>
          <Text width="50%" textAlign="right">
            size:
          </Text>
          <NumberInput
            defaultValue={pronunciationFontSize || 15}
            min={10}
            max={20}
            size={['lg', 'sm']}
            w="5rem"
            onChange={(e) => {
              setFontSize(Number(e), 'pronunciation', setPronunciationFontSize);
              togglePronunciation(true);
            }}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </HStack>
      </GridItem>

      <GridItem rowSpan={2} colSpan={1} mt={6}>
        <Text textAlign="center">Definitions</Text>
      </GridItem>

      <GridItem rowSpan={1} colSpan={1} mt={6}>
        <HStack>
          <Text>off</Text>
          <Switch
            isChecked={showDefinition}
            onChange={() => {
              if (showDefinition && definitionFontSize !== 0) {
                toggleDefinition(false);
                setFontSize(0, 'definition', setDefinitionFontSize);
              } else {
                toggleDefinition(true);
                setFontSize(
                  definitionFontSize || 15,
                  'definition',
                  setDefinitionFontSize,
                );
              }
            }}
          />
          <Text>on</Text>
        </HStack>
      </GridItem>

      <GridItem colSpan={1}>
        <HStack>
          <Text width="50%" textAlign="right">
            size:
          </Text>
          <NumberInput
            defaultValue={definitionFontSize || 15}
            min={10}
            max={20}
            size={['lg', 'sm']}
            w="5rem"
            onChange={(e) => {
              setFontSize(Number(e), 'definition', setDefinitionFontSize);
              toggleDefinition(true);
            }}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </HStack>
      </GridItem>
    </Grid>
  );
};
