import { useEffect } from 'react';
import { useRouter } from 'next/router';

const useTitle = (title) => {
  const router = useRouter();

  useEffect(() => {
    document.title = title;
  }, [title, router.pathname]);
};

export default useTitle;