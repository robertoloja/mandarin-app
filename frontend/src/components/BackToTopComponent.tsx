import React, { useEffect, useState } from 'react';
import { IconButton, Box } from '@chakra-ui/react';
import { IoArrowUpCircleOutline } from 'react-icons/io5';

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

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
    <Box
      position="fixed"
      bottom={[null, '6rem']}
      top={['3rem', null]}
      right={['1rem', '2.5%']}
      zIndex="1000"
    >
      <IconButton
        aria-label="Back to top"
        icon={<IoArrowUpCircleOutline size="lg" color="#ccc" />}
        size="lg"
        opacity={isVisible ? '1' : '0'}
        isRound
        onClick={scrollToTop}
        boxShadow="0px 0px 3px rgba(50, 50, 50, 0.8)"
        transition="opacity 0.2s ease"
      />
    </Box>
  );
};

export default BackToTop;
