import React from 'react';
import Hanzi from './Hanzi';
import Definition from './Definition'
import { ChineseDictionary, MandarinWordType } from '../types';
import { Text, Card, HStack, Center, CardBody, CardFooter } from '@chakra-ui/react';

function Word(props: {
  word: MandarinWordType,
  pronunciation: string,
  definitions: string[],
  dictionary: ChineseDictionary,
  isOpen: boolean,
  onClick: () => void,
}) {
  // TODO: Account for numbers, quoted words (i.e. 《曹詩》), and compound words (e.g. 軍事將領)
  const punctuation = props.word.word === props.pronunciation;

  return (
    <Card
      variant="unstyled"
      backgroundColor="#B8EEFF"
      margin="0.1rem"
      marginBottom="0.5rem"
      padding="0.2rem"
      border="1px solid #468DA4"
      borderRadius="0"
      boxShadow="2px 2px 2px rgba(0, 0, 0, 0.25)"
      onClick={props.onClick}
    >
      {props.isOpen && !punctuation ?
        <Definition
          word={props.word.word} 
          definitions={props.definitions}
          character_definitions={props.dictionary}
          onClick={props.onClick}/> 
        
        : null}

      <CardBody>
        <Center>
          <HStack spacing="0.1rem">
            {props.word.word.split('').map((char, index) =>
              <Hanzi
                hanzi={char}
                key={index}
                pinyin={props.pronunciation.split(' ')[index]}
              />
            )}
          </HStack>
        </Center>
      </CardBody>

      {!punctuation ?
        <Center>
          <CardFooter>
            <Text
              noOfLines={2}
              maxWidth="10rem"
              minWidth="5rem"
              fontSize="sm"
              height="2.6rem"
              marginTop="0.5rem"
              marginBottom="0.5rem"
            >
              {props.definitions.join('; ')}
            </Text>
          </CardFooter>
        </Center>
        : null}
    </Card>
  );
}

export default Word;