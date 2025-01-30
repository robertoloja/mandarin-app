import { MandarinSentenceClass } from '@/app/MandarinSentenceClass';
import { SentenceHistoryType } from '@/utils/types';
import { IconButton } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { IoTrashOutline } from 'react-icons/io5';

export const DeleteButton = (props: {
  historyItem: SentenceHistoryType;
  resetHistory: () => void;
}) => {
  const router = useRouter();

  const deleteFromHistory = (historyItem: SentenceHistoryType) => {
    const historySentence = new MandarinSentenceClass(
      '',
      historyItem.segments,
      historyItem.dictionary,
      historyItem.translation,
      historyItem.shareURL,
    );
    historySentence.deleteFromHistory();
    props.resetHistory();
    router.refresh();
  };
  return (
    <IconButton
      aria-label="Delete sentence"
      icon={<IoTrashOutline />}
      zIndex={10}
      transition="background-color 0.3s ease"
      _hover={{ bg: 'rgba(200, 60, 60, 1)' }}
      onClick={(e) => {
        e.preventDefault();
        deleteFromHistory(props.historyItem);
      }}
    />
  );
};
