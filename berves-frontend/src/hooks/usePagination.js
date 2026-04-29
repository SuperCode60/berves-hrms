import { useState } from 'react';
export const usePagination = (initialPage = 1, initialPerPage = 15) => {
  const [page,    setPage]    = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const reset = () => setPage(1);
  return { page, setPage, perPage, setPerPage, reset };
};
