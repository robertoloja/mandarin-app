'use client';

import { Button, Container, Heading, Input } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const handleSubmit = () => {};

  const urlRegisterId = useSearchParams().get('register_id') || '';
  useEffect(() => {}, []);

  return (
    <Container>
      <Heading>Register</Heading>
      <form onSubmit={handleSubmit}>
        <Input type="text" placeholder="E-Mail" required disabled />
        <Input type="text" placeholder="Username" required />
        <Input type="text" placeholder="Password" required />
        <Button type="submit">Register</Button>
      </form>
    </Container>
  );
}
