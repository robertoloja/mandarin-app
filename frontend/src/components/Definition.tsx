import { 
  Text, 
  VStack, 
  HStack,
  DialogHeader,
  DialogTitle,
  Center,
  DialogBody,
  DialogContent,
  DialogRoot
} from '@chakra-ui/react';
import Hanzi from './Hanzi';

function Definition(props: {
  dialogOpen: boolean,
  word: string,
  definitions: string[],
  character_definitions: Record<string, {english: string, pinyin: string, simplified: string}>,
  key: number,
}) {
  return (
    <DialogRoot
      size="cover" 
      placement="center"
      scrollBehavior="inside"
      open={props.dialogOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Center>
              {props.word}
            </Center>
          </DialogTitle>
          {props.definitions.map((definition, index) => 
            <Text textAlign="center" key={index}>
              {definition}
            </Text>
          )}
        </DialogHeader>

        <DialogBody>
          {props.word.split('').length !== 1 ? 
            <VStack align="start">
              {props.word.split('').map((hanzi, index) => (
                <HStack key={index}>
                  <Hanzi
                    hanzi={hanzi}
                    pinyin={props.character_definitions[hanzi].pinyin}
                  />
                  <Text>
                    {props.character_definitions[hanzi].english}
                  </Text>
                </HStack>
              ))}
            </VStack>
          : undefined}
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}

export default Definition;