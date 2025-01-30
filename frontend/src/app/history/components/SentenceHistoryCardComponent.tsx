import { MandarinSentenceClass } from '@/app/MandarinSentenceClass';
import ShareButton from '@/components/ShareButtonComponent';
import styles from '@/themes';
import { SentenceHistoryType } from '@/utils/types';
import {
  Text,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Container,
  Heading,
  Spacer,
  StackDivider,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { TruncatedSentence } from './TruncatedSentenceComponent';
import { DeleteButton } from './DeleteButtonComponent';

export default function SentenceHistoryCard(props: {
  index: number;
  historyItem: SentenceHistoryType;
  resetHistory: () => void;
}) {
  const router = useRouter();
  const { colorMode } = useColorMode();

  const unpackSentence = (sentenceHistory: SentenceHistoryType) => {
    return {
      sentence: sentenceHistory.segments.map((x) => x.word).join(''),
      translation: sentenceHistory.translation,
      date: sentenceHistory.date,
    };
  };

  const viewSentence = (historyItem: SentenceHistoryType) => {
    const historySentence = new MandarinSentenceClass(
      '',
      historyItem.segments,
      historyItem.dictionary,
      historyItem.translation,
      historyItem.shareURL,
    );
    historySentence.setActive();
    router.push('/');
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  };

  return (
    <Card
      margin="0.1rem"
      marginBottom="0.5rem"
      padding="0.6rem"
      __css={styles.darkBox[colorMode]}
      key={props.index}
      w="20rem"
    >
      <Container onClick={() => viewSentence(props.historyItem)}>
        <CardHeader my="0.5rem" cursor="pointer">
          <VStack>
            <Heading size="md">
              {new Date(props.historyItem.date).toLocaleString(
                undefined,
                dateOptions,
              )}
            </Heading>
            <Text>
              {new Date(props.historyItem.date).toLocaleString(
                undefined,
                timeOptions,
              )}
            </Text>
          </VStack>
        </CardHeader>

        <CardBody
          p="0.5rem"
          mb="0.5rem"
          cursor="pointer"
          __css={styles.lightBox[colorMode]}
        >
          <VStack divider={<StackDivider />}>
            <TruncatedSentence>
              {unpackSentence(props.historyItem).sentence}
            </TruncatedSentence>

            <TruncatedSentence>
              {unpackSentence(props.historyItem).translation}
            </TruncatedSentence>
          </VStack>
        </CardBody>
      </Container>

      <CardFooter>
        <DeleteButton
          historyItem={props.historyItem}
          resetHistory={props.resetHistory}
        />

        <Spacer />

        <ShareButton
          iconSize={15}
          shareLink={props.historyItem.shareURL}
          defaultStyles={true}
        />
      </CardFooter>
    </Card>
  );
}
