import { MandarinSentenceClass } from '@/app/MandarinSentenceClass';
import ShareButton from '@/components/ShareButtonComponent';
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
  VStack,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import { useRouter } from 'next/navigation';
import { TruncatedSentence } from './TruncatedSentenceComponent';
import { DeleteButton } from './DeleteButtonComponent';

export default function SentenceHistoryCard(props: {
  index: number;
  historyItem: SentenceHistoryType;
  resetHistory: () => void;
}) {
  const router = useRouter();
  const user_language = useSelector(
    (state: RootState) => state.settings.user_language,
  );

  const getTranslations = (
    historyItem: SentenceHistoryType,
  ): Record<string, string> => {
    const item = historyItem as SentenceHistoryType & { translation?: string };
    return (
      item.translations ?? (item.translation ? { en: item.translation } : {})
    );
  };

  const unpackSentence = (sentenceHistory: SentenceHistoryType) => {
    return {
      sentence: sentenceHistory.segments.map((x) => x.word).join(''),
      translation: getTranslations(sentenceHistory)[user_language] ?? '',
      date: sentenceHistory.date,
    };
  };

  const viewSentence = (historyItem: SentenceHistoryType) => {
    const historySentence = new MandarinSentenceClass(
      '',
      historyItem.segments,
      historyItem.dictionary,
      getTranslations(historyItem),
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
      border="1px solid" borderColor="borderDefault" borderRadius="12px" bg="bgCanvas"
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
          border="1px solid" borderColor="borderDefault" borderRadius="8px" bg="bgSubtle"
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
