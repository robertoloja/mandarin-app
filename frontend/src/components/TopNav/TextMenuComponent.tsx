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

export default function TextMenu() {
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
  const [definitionFontSize, setDefinitionFontSize] = useState(12);
  const [pronunciationFontSize, setPronunciationFontSize] = useState(12);
  const [showPronunciation, togglePronunciation] = useState(true);
  const [showDefinition, toggleDefinition] = useState(true);

  const getFontSize = () => {
    return {
      pronunciationFontSize:
        Number(localStorage.getItem('pronunciationFontSize')) || 12,
      definitionFontSize:
        Number(localStorage.getItem('definitionFontSize')) || 12,
    };
  };

  const setFontSize = (
    pronunciationFontSize: number | null,
    definitionFontSize: number | null,
  ) => {
    if (pronunciationFontSize != null) {
      localStorage.setItem('pronunciationFontSize', `${pronunciationFontSize}`);
    }

    if (definitionFontSize != null) {
      if (definitionFontSize !== 0) setDefinitionFontSize(definitionFontSize);

      localStorage.setItem('definitionFontSize', `${definitionFontSize}`);
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'definitionFontSize',
          newValue: String(definitionFontSize),
        }),
      );
    }
  };
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
          <Text>on</Text>
          <Switch
            onChange={() => {
              setFontSize(0, 0);
            }}
          />
          <Text>off</Text>
        </HStack>
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <HStack>
          <Text width="50%" textAlign="right">
            size:
          </Text>
          <NumberInput
            defaultValue={getFontSize().pronunciationFontSize}
            min={10}
            max={20}
            size="sm"
            w="5rem"
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
              if (showDefinition) {
                console.log('foo');
                toggleDefinition(false);
                setFontSize(null, 0);
              } else {
                toggleDefinition(true);
                setFontSize(null, definitionFontSize);
                console.log('bar');
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
            defaultValue={getFontSize().definitionFontSize}
            min={10}
            max={20}
            size="sm"
            w="5rem"
            onChange={(e) => {
              setFontSize(0, Number(e));
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
