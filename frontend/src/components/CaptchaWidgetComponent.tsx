'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { setCaptchaWidgetElement } from '@/utils/captcha';

/**
 * Hosts the single Friendly Captcha widget for the whole app.
 *
 * It is mounted once, app-wide, and starts solving as soon as it appears, so a
 * proof of work is usually ready before the reader submits anything. Both the
 * /segment pass and the account forms draw their solutions from this one widget.
 */
export default function CaptchaWidgetComponent() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCaptchaWidgetElement(container.current);
    return () => setCaptchaWidgetElement(null);
  }, []);

  return (
    <Box
      ref={container}
      className="frc-captcha"
      display="flex"
      justifyContent="center"
      px={4}
      py={2}
      aria-label="captcha"
    />
  );
}
