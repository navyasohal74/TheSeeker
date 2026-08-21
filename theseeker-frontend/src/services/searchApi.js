import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const FAILED_SEARCH_DEDUPE_WINDOW_MS = 60_000;
const recentlyReportedFailedSearches = new Map();

const normalizeQuery = (query) => (query || '').trim();

const shouldReportFailedSearch = (query) => {
  const now = Date.now();
  const lastReportedAt = recentlyReportedFailedSearches.get(query);

  if (lastReportedAt && now - lastReportedAt < FAILED_SEARCH_DEDUPE_WINDOW_MS) {
    return false;
  }

  recentlyReportedFailedSearches.set(query, now);
  return true;
};

export async function recordFailedSearch(query) {
  const trimmedQuery = normalizeQuery(query);
  if (!trimmedQuery) {
    return null;
  }

  const response = await axios.post(
    `${API_BASE_URL}/api/search/failed`,
    { query: trimmedQuery },
    { headers: { 'Content-Type': 'application/json' } }
  );

  return response.data;
}

export async function fetchSearchResults(query) {
  const trimmedQuery = normalizeQuery(query);

  const response = await axios.get(`${API_BASE_URL}/api/search/apis`, {
    params: { q: trimmedQuery }
  });

  const results = response.data.results || [];

  if (trimmedQuery && results.length === 0 && shouldReportFailedSearch(trimmedQuery)) {
    void recordFailedSearch(trimmedQuery).catch((error) => {
      if (import.meta.env.DEV) {
        console.error('Failed to report unsuccessful query:', error);
      }
    });
  }

  return {
    results,
    meta: {
      time: response.data.timeTakenMs,
      engine: response.data.engine || ''
    }
  };
}

export async function fetchSuggestions(query) {
  const trimmedQuery = normalizeQuery(query);
  if (!trimmedQuery) return [];

  const response = await axios.get(`${API_BASE_URL}/api/search/suggest`, {
    params: { q: trimmedQuery }
  });
  return Array.isArray(response.data) ? response.data : (response.data.suggestions || response.data.results || []);
}

export const __failedSearchReportingForTests = {
  reset() {
    recentlyReportedFailedSearches.clear();
  }
};