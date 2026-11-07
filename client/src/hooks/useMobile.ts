import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 768px)';

const useMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(
    () => window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);

    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () =>
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
  }, []);

  return { isMobile };
};

export default useMobile;
