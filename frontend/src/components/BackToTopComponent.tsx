import React, { useEffect, useState } from 'react';
import { IconButton, useColorMode } from '@chakra-ui/react';
import { IoArrowUpOutline } from 'react-icons/io5';

export default function BackToTop(props: { iconSize: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const { colorMode } = useColorMode();

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <>
      {isVisible && (
        <IconButton
          aria-label="Back to top"
          mr={1}
          icon={<IoArrowUpOutline size={props.iconSize + 5} />}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          onClick={scrollToTop}
        />
      )}{' '}
    </>
  );
}
