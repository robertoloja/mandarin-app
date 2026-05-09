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

  const isDark = colorMode === 'dark';
  return (
    <>
      {isVisible && (
        <IconButton
          aria-label="Back to top"
          icon={<IoArrowUpOutline size={props.iconSize + 5} />}
          bg="transparent"
          border="1px solid"
          borderColor={isDark ? 'gray.700' : 'gray.200'}
          h="30px"
          minW="30px"
          _hover={{ borderColor: isDark ? 'gray.600' : 'gray.300' }}
          onClick={scrollToTop}
        />
      )}
    </>
  );
}
