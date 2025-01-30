import { Button, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { useState } from 'react';

export default function PasswordInputComponent(props: {
  handlePasswordChange: (event: any) => void;
  placeHolderText?: string;
  invalid?: boolean;
}) {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  return (
    <InputGroup>
      <Input
        pr="4.5rem"
        type={show ? 'text' : 'password'}
        placeholder={props.placeHolderText || 'Enter password'}
        onChange={props.handlePasswordChange}
        border={props.invalid ? '1px solid red' : undefined}
        transition="border 0.2s ease"
      />
      <InputRightElement width="4.5rem">
        <Button h="1.75rem" size="sm" onClick={handleClick}>
          {show ? 'Hide' : 'Show'}
        </Button>
      </InputRightElement>
    </InputGroup>
  );
}
