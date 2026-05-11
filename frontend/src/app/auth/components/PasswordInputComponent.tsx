import localization, { UserLanguage } from '@/localization/main';
import { Box, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { useState } from 'react';
import { FONT_SANS, FONT_SIZE_SMALL, FONT_SIZE_UI } from '@/theme';

export default function PasswordInputComponent(props: {
  handlePasswordChange: (event: any) => void;
  placeHolderText?: string;
  invalid?: boolean;
  user_language: UserLanguage;
}) {
  const [show, setShow] = useState(false);
  const loc = localization.login_page;

  return (
    <InputGroup>
      <Input
        pr="5rem"
        type={show ? 'text' : 'password'}
        placeholder={props.placeHolderText || loc.password[props.user_language]}
        onChange={props.handlePasswordChange}
        fontFamily={FONT_SANS}
        fontSize={FONT_SIZE_UI}
        borderRadius="8px"
        border="1px solid"
        borderColor={props.invalid ? 'red.400' : 'borderDefault'}
        bg="bgCanvas"
        _placeholder={{ color: 'fgSubtle', fontFamily: FONT_SANS }}
        _focus={{ borderColor: 'fgSubtle', boxShadow: 'none', outline: 'none' }}
        _hover={{ borderColor: 'borderEmphasis' }}
        transition="border-color 0.14s"
        aria-label="password input"
      />
      <InputRightElement width="4.5rem">
        <Box
          as="button"
          type="button"
          onClick={() => setShow(!show)}
          fontFamily={FONT_SANS}
          fontSize={FONT_SIZE_SMALL}
          fontWeight={500}
          color="fgMuted"
          cursor="pointer"
          _hover={{ color: 'fgBody' }}
          transition="color 0.14s"
          aria-label="show password button"
        >
          {show ? loc.hide[props.user_language] : loc.show[props.user_language]}
        </Box>
      </InputRightElement>
    </InputGroup>
  );
}
