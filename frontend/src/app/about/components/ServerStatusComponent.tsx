'use client';

import { MandoBotAPI } from '@/utils/api';
import { clearError, setError } from '@/utils/store/errorSlice';
import { RootState, store } from '@/utils/store/store';
import {
  Box,
  Image,
  Text,
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
import localization, { UserLanguage } from '@/localization/main';
import {
  FONT_SANS,
  FONT_SERIF,
  FONT_SIZE_LABEL,
  FONT_SIZE_UI,
  FONT_SIZE_BODY,
  FONT_SIZE_SUBHEAD,
} from '@/theme';

function Divider() {
  return <Box borderBottom="1px solid" borderColor="borderSubtle" />;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" gap={4} py="10px">
      <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgBody" whiteSpace="nowrap">
        {label}
      </Text>
      {children}
    </Box>
  );
}

const ServerStatusIcon = ({
  serverStatus,
  user_language,
}: {
  serverStatus: boolean;
  user_language: UserLanguage;
}) => {
  const loc = localization.about_status.server_status;
  return (
    <Popover placement="top">
      <PopoverTrigger>
        <Box as="span" cursor="pointer" lineHeight={0}>
          {serverStatus ? (
            <IoCheckmarkCircleOutline color="#45bb78" size={18} />
          ) : (
            <IoAlertCircleOutline color="#f07070" size={18} />
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent
        w="fit-content"
        maxW="220px"
        borderRadius="10px"
        border="1px solid"
        borderColor="borderDefault"
        bg="bgCanvas"
        _focus={{ outline: 'none' }}
        px={3}
        py={2}
      >
        <PopoverArrow bg="bgCanvas" />
        <PopoverBody p={0}>
          <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgBody">
            {serverStatus
              ? loc.checkmark[user_language]
              : loc.popover_server_error[user_language]}
          </Text>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const ArgosInfoPopover = ({ user_language }: { user_language: UserLanguage }) => {
  const loc = localization.about_status.server_status;
  return (
    <Popover placement="top">
      <PopoverTrigger>
        <Box as="span" cursor="pointer" lineHeight={0}>
          <IoInformationCircleOutline size={16} color="currentColor" />
        </Box>
      </PopoverTrigger>
      <PopoverContent
        w="fit-content"
        maxW="260px"
        borderRadius="10px"
        border="1px solid"
        borderColor="borderDefault"
        bg="bgCanvas"
        _focus={{ outline: 'none' }}
        px={3}
        py={2}
      >
        <PopoverArrow bg="bgCanvas" />
        <PopoverBody p={0}>
          <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgBody" mb={2}>
            {loc.popup[1][user_language]}
          </Text>
          <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgBody">
            {loc.popup[2][user_language]}
            <Link href="https://www.deepl.com">
              <Text as="span" textDecoration="underline">{loc.popup.link[user_language]}</Text>
            </Link>
            {loc.popup[3][user_language]}
          </Text>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const TranslationBackendDisplay = ({ backend }: { backend: string }) => {
  const username = useSelector((state: RootState) => state.auth.username);
  const href = username ? 'https://www.deepl.com' : 'https://www.argosopentech.com/';
  const src = username ? '/deepl_logo.svg' : 'argos_translate_logo.png';
  const label = username ? 'DeepL' : 'Argos Translate';

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      <Box display="flex" alignItems="center" gap={2} _hover={{ opacity: 0.8 }}>
        <Image alt="Translator logo" src={src} boxSize="20px" />
        <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgBody">
          {label}
        </Text>
      </Box>
    </Link>
  );
};

export default function ServerStatusComponent({
  user_language,
}: {
  user_language: UserLanguage;
}) {
  const [localDateTime, setLastUpdate] = useState('-');
  const [translationBackend, setBackend] = useState('-');
  const [responseTime, setResponseTime] = useState(-1);
  const [serverStatus, setServerStatus] = useState(false);
  const loc = localization.about_status.server_status;

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
        setLastUpdate(localTime);
        setResponseTime(response.mandobot_response_time);
        setBackend(response.translation_backend);
        setServerStatus(true);
      })
      .catch(() => {
        setServerStatus(false);
        store.dispatch(setError(loc.server_unreachable_error[user_language]));
      });
  }, []);

  return (
    <Box maxW="2xl" w="100%" border="1px solid" borderColor="borderDefault" borderRadius="12px" bg="bgCanvas" px={[6, 8]} py={6} mb={4}>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_LABEL} textTransform="uppercase" letterSpacing="0.14em" color="fgMuted">
          {loc.server_status[user_language]}
        </Text>
        <ServerStatusIcon serverStatus={serverStatus} user_language={user_language} />
      </Box>

      <Row label={loc.response_time[user_language]}>
        <Box display="flex" alignItems="baseline" gap={1}>
          <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_SUBHEAD} color="fgPrimary">
            {responseTime >= 0 ? Math.trunc(responseTime * 100) / 100 : '—'}
          </Text>
          <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgMuted">
            {loc.seconds[user_language]}
          </Text>
        </Box>
      </Row>
      <Divider />
      <Row label={loc.backend[user_language]}>
        <Box display="flex" alignItems="center" gap={2}>
          {serverStatus ? (
            <TranslationBackendDisplay backend={translationBackend} />
          ) : (
            <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_UI} color="fgMuted">—</Text>
          )}
          {serverStatus && translationBackend === 'argos' && (
            <ArgosInfoPopover user_language={user_language} />
          )}
        </Box>
      </Row>
      <Box mt={3}>
        <Text fontFamily={FONT_SANS} fontSize={FONT_SIZE_BODY} color="fgSubtle">
          {loc.last_update[user_language]} {localDateTime}
        </Text>
      </Box>
    </Box>
  );
}
