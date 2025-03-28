'use client';
import styles from '@/themes';
import { MandoBotAPI } from '@/utils/api';
import { clearError, setError } from '@/utils/store/errorSlice';
import { RootState, store } from '@/utils/store/store';
import {
  Center,
  Heading,
  Image,
  Text,
  VStack,
  Flex,
  Box,
  useColorMode,
  HStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
} from 'react-icons/io5';
import { useSelector } from 'react-redux';

export default function ServerStatusComponent() {
  const { colorMode } = useColorMode();
  const [localDateTime, setLastUpdate] = useState('-');
  const [translationBackend, setBackend] = useState('-');
  const [responseTime, setResponseTime] = useState(-1);
  const [serverStatus, setServerStatus] = useState(false);

  useEffect(() => {
    MandoBotAPI.status()
      .then((response) => {
        store.dispatch(clearError());
        const isoUpdateTime = new Date(response.updated_at);
        const localTime = isoUpdateTime.toLocaleTimeString(undefined, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        });
        setLastUpdate(`${localTime}`);
        setResponseTime(response.mandobot_response_time);
        setBackend(response.translation_backend);
        setServerStatus(true);
      })
      .catch(() => {
        setServerStatus(false);
        store.dispatch(
          setError('Server currently unreachable. Please try again soon.'),
        );
      });
  }, []);

  return (
    <Box justifyContent="center">
      <HStack justifyContent="center">
        <Heading
          size="md"
          textAlign="center"
          mb={1}
          __css={styles.heading[colorMode]}
        >
          Server Status
        </Heading>
        <ServerStatusPopover serverStatus={serverStatus} />
      </HStack>

      <Box display="flex" justifyContent="center">
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          justify="center"
          justifyContent="center"
          alignItems="center"
          p={4}
          gap={4}
          mt={3}
          width="fit-content"
          border={
            colorMode === 'light' ? '1px solid #468DA4' : '1px solid #1e282c'
          }
          borderRadius={8}
          boxShadow="1px 1px 2px rgba(0, 0, 0, 0.5)"
          backgroundColor={colorMode === 'light' ? '#B8EEFF' : '#333c40'}
          boxSizing="border-box"
        >
          <Box m={2} p={5} __css={styles.lightBox[colorMode]}>
            <VStack>
              <Heading
                size="sm"
                whiteSpace="nowrap"
                __css={styles.heading[colorMode]}
              >
                Average First Response Time
              </Heading>
              <Text fontSize="lg">
                {Math.trunc(responseTime * 100) / 100} seconds
              </Text>
              <Text fontSize="sm" whiteSpace="nowrap">
                Last Update: {localDateTime}
              </Text>
            </VStack>
          </Box>

          <Box m={2} p={5} __css={styles.lightBox[colorMode]}>
            <VStack mb={3} mx={2}>
              <HStack>
                <Heading
                  size="sm"
                  whiteSpace="nowrap"
                  __css={styles.heading[colorMode]}
                >
                  Current Translation Backend
                </Heading>
                {serverStatus && translationBackend == 'argos' && (
                  <InformationPopover />
                )}
              </HStack>
              {serverStatus ? <TranslationBackendComponent /> : <Text>-</Text>}
            </VStack>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

const ServerStatusPopover = (props: { serverStatus: boolean }) => {
  return (
    <>
      {props.serverStatus ? (
        <Popover>
          <PopoverTrigger>
            <IoCheckmarkCircleOutline
              color="green"
              size={22}
              cursor="pointer"
            />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody boxShadow="1px 1px 2px rgba(0, 0, 0, 0.8)">
              <Center>Everything is working!</Center>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ) : (
        <Popover>
          <PopoverTrigger>
            <IoAlertCircleOutline color="red" size={22} cursor="pointer" />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody boxShadow="1px 1px 2px rgba(0, 0, 0, 0.8)">
              <Center>
                The segmentation server is currently unreachable. Please check
                your internet connection, and try again soon.{' '}
              </Center>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

const InformationPopover = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <IoInformationCircleOutline size={22} cursor="pointer" />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody boxShadow="1px 1px 2px rgba(0, 0, 0, 0.5)">
          <Text mb={3}>
            While Argos Translate is a very good open-source project, it can
            sometimes make egregious mistakes when translating Mandarin (such as
            rendering &quot;京&quot; as &quot;Kyoto&quot;).
          </Text>
          <Text>
            Users at the Project Backer level always have access to{' '}
            <Link href="https://www.deepl.com">
              <u>DeepL</u>
            </Link>
            , the best publicly available translation engine.
          </Text>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const TranslationBackendComponent = () => {
  const username = useSelector((state: RootState) => state.auth.username);
  return (
    <Link
      href={
        username ? 'https://www.deepl.com' : 'https://www.argosopentech.com/'
      }
    >
      <Center>
        <Image
          alt="Translator logo"
          src={username ? '/deepl_logo.svg' : 'argos_translate_logo.png'}
          boxSize={10}
        />
        <Text ml={2} _hover={{ textDecoration: 'underline' }}>
          {username ? 'DeepL' : 'Argos Translate'}
        </Text>
      </Center>
    </Link>
  );
};
