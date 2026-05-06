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
import { useState } from 'react';
import { IoTextOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { setDefinitionFontSize, setPronunciationFontSize } from '@/utils/store/settingsSlice';
import { store } from '@/utils/store/store';

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
  const definitionFontSize = useSelector(
    (state: RootState) => state.settings.definitionFontSize,
  );
  const pronunciationFontSize = useSelector(
    (state: RootState) => state.settings.pronunciationFontSize,
  );
  const [showPronunciation, togglePronunciation] = useState(pronunciationFontSize !== 0);
  const [showDefinition, toggleDefinition] = useState(definitionFontSize !== 0);
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );

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
              if (showPronunciation) {
                togglePronunciation(false);
                store.dispatch(setPronunciationFontSize(0));
              } else {
                togglePronunciation(true);
                store.dispatch(setPronunciationFontSize(pronunciationFontSize || 15));
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
              store.dispatch(setPronunciationFontSize(Number(e)));
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
              if (showDefinition) {
                toggleDefinition(false);
                store.dispatch(setDefinitionFontSize(0));
              } else {
                toggleDefinition(true);
                store.dispatch(setDefinitionFontSize(definitionFontSize || 15));
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
              store.dispatch(setDefinitionFontSize(Number(e)));
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
