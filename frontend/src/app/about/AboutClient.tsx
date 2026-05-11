'use client';

import { Box } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';
import ServerStatusComponent from './components/ServerStatusComponent';
import ProjectSupportCard from './components/ProjectSupportCardComponent';
import { PrivacyPolicyCard } from './components/PrivacyPolicyCardComponent';

export default function AboutClient() {
  const user_language = useSelector((state: RootState) => state.settings.user_language);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" px={[4, 8]} pt={10} pb={20}>
      <ServerStatusComponent user_language={user_language} />
      <ProjectSupportCard user_language={user_language} />
      <PrivacyPolicyCard user_language={user_language} />
    </Box>
  );
}
