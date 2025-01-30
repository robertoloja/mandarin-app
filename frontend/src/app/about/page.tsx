'use client';

import ServerStatusComponent from '@/app/about/components/ServerStatusComponent';
import { Box, Flex } from '@chakra-ui/react';
import ProjectSupportCard from './components/ProjectSupportCardComponent';
import { PrivacyPolicyCard } from './components/PrivacyPolicyCardComponent';

export default function AboutPage() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      width="100vw"
      overflowX="hidden"
    >
      <Flex
        justifyContent="center"
        direction={{ base: 'column', lg: 'row' }}
        align="center"
        alignItems={{ base: 'center', lg: 'flex-start' }}
        justify="center"
        p={4}
        m={[2, 10]}
        gap={4}
        maxWidth="100vw"
        boxSizing="border-box"
        wrap="wrap"
      >
        <ServerStatusComponent />
        <ProjectSupportCard />
        <PrivacyPolicyCard />
      </Flex>
    </Box>
  );
}
