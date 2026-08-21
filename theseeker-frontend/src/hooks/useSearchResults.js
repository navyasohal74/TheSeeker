import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL, fetchSearchResults } from '../services/searchApi';

const EMPTY_SEARCH_STATE = {
  results: [],
  meta: { time: 0, engine: '' }
};

export function useSearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  const [searchData, setSearchData] = useState(() => queryFromUrl ? EMPTY_SEARCH_STATE : EMPTY_SEARCH_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [prevQuery, setPrevQuery] = useState(queryFromUrl);

  if (queryFromUrl !== prevQuery) {
    setPrevQuery(queryFromUrl);
    if (!queryFromUrl) {
      setSearchData(EMPTY_SEARCH_STATE);
    }
  }

  useEffect(() => {
    if (!queryFromUrl) {
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const data = await fetchSearchResults(queryFromUrl);
        setSearchData(data);
      } catch (error) {
        console.error('Connection Error:', error);
        alert(`Unable to connect to the backend API at ${API_BASE_URL}. Please ensure the server is running.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [queryFromUrl]);

  const handleSearch = (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setSearchParams({ q: trimmedQuery });
  };

  const handleBack = () => {
    setSearchParams({});
  };

  const isResultsView = useMemo(() => queryFromUrl.trim() !== '', [queryFromUrl]);

  return {
    queryFromUrl,
    isResultsView,
    results: searchData.results,
    meta: searchData.meta,
    isLoading,
    handleSearch,
    handleBack
  };
}