import React, { useEffect, useState } from 'react';
import { IconButton } from '@chakra-ui/react';
import { IoArrowUpOutline } from 'react-icons/io5';

export default function BackToTop(props: { iconSize: number }) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          icon={<IoArrowUpOutline size={props.iconSize + 5} />}
          bg="bgSubtle"
          border="1px solid"
          borderColor="borderDefault"
          h="30px"
          minW="30px"
          _hover={{ borderColor: 'borderEmphasis' }}
          onClick={scrollToTop}
        />
      )}
    </>
  );
}
