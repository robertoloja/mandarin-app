import {
  Center,
  Divider,
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
  VStack,
} from '@chakra-ui/react';
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
          <Switch />
          <Text>off</Text>
        </HStack>
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <HStack>
          <Text width="50%" textAlign="right">
            size:
          </Text>
          <NumberInput defaultValue={15} min={10} max={20} size="sm" w="5rem">
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
          <Text>on</Text>
          <Switch />
          <Text>off</Text>
        </HStack>
      </GridItem>

      <GridItem colSpan={1}>
        <HStack>
          <Text width="50%" textAlign="right">
            size:
          </Text>
          <NumberInput defaultValue={15} min={10} max={20} size="sm" w="5rem">
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
