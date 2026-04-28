'use client';

import localization from '@/localization/main';
import { RootState } from '@/utils/store/store';
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
import { useSelector } from 'react-redux';

export default function TextMenuButton() {
  const { colorMode } = useColorMode();
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );

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
          <Center>{localization.top_nav.text_options[user_language]}</Center>
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
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );

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
    <Grid templateColumns="1fr 1fr" templateRows="repeat(4, 1fr)" my={5}>
      <GridItem rowSpan={2} colSpan={1} borderBottom="1px solid gray">
        <Text textAlign="center">
          {localization.top_nav.pronunciation[user_language]}
        </Text>
      </GridItem>

      <GridItem rowSpan={1} colSpan={1}>
        <HStack justify="center" mb={3}>
          <Text>{localization.top_nav.off[user_language]}</Text>
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
          <Text>{localization.top_nav.on[user_language]}</Text>
        </HStack>
      </GridItem>

      <GridItem rowSpan={1} colSpan={1} borderBottom="1px solid gray">
        <HStack mb={5}>
          <Text textAlign="right">
            {localization.top_nav.size[user_language]}
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
        <Text textAlign="center">
          {localization.top_nav.definitions[user_language]}
        </Text>
      </GridItem>

      <GridItem rowSpan={1} colSpan={1} mt={6}>
        <HStack justify="center" mb={3}>
          <Text>{localization.top_nav.off[user_language]}</Text>
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
          <Text>{localization.top_nav.on[user_language]}</Text>
        </HStack>
      </GridItem>

      <GridItem colSpan={1}>
        <HStack>
          <Text textAlign="right">
            {localization.top_nav.size[user_language]}
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
