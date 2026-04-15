import localization, { UserLanguage } from '@/localization/main';
import { Button, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { useState } from 'react';

export default function PasswordInputComponent(props: {
  handlePasswordChange: (event: any) => void;
  placeHolderText?: string;
  invalid?: boolean;
  user_language: UserLanguage;
}) {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  return (
    <InputGroup>
      <Input
        pr="4.5rem"
        type={show ? 'text' : 'password'}
        placeholder={props.placeHolderText || localization.login_page.password[props.user_language]}
        onChange={props.handlePasswordChange}
        border={props.invalid ? '1px solid red' : undefined}
        transition="border 0.2s ease"
        aria-label="password input"
      />
      <InputRightElement width="4.5rem">
        <Button
          mr="0.4rem"
          h="1.75rem"
          size="sm"
          onClick={handleClick}
          aria-label="show password button"
        >
          {show ? localization.account_settings.hide[props.user_language] : localization.account_settings.show[props.user_language]}
        </Button>
      </InputRightElement>
    </InputGroup>
  );
}
