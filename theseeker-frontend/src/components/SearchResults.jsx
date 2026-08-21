import { useState } from 'react';
import ResultCard from './search-results/ResultCard';
import SearchResultsHeader from './search-results/SearchResultsHeader';

function SearchResults({
  query: queryProp = 'api authentication',
  results = [],
  meta = { time: 0, engine: '' },
  isLoading = false,
  onSearch,
  onBack,
  darkMode,
  toggleDarkMode
}) {
  const [query, setQuery] = useState(queryProp);
  const [prevQueryProp, setPrevQueryProp] = useState(queryProp);

  if (queryProp !== prevQueryProp) {
    setPrevQueryProp(queryProp);
    setQuery(queryProp);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-theseeker-dark-bg text-theseeker-dark-light' : 'bg-theseeker-cream text-theseeker-dark'}`}>
      <SearchResultsHeader
        query={query}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
        onLogoClick={onBack}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className={`mx-auto w-full max-w-[800px] px-4 pb-12 pt-28 sm:px-6`}>
        <p className={`mb-6 text-[13px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium tracking-wide`}>
          About {results.length.toLocaleString()} results ({((meta.time || 0) / 1000).toFixed(2)} seconds){meta.engine ? ` · ${meta.engine}` : ''}
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div
              className={`mb-4 h-10 w-10 animate-spin rounded-full border-4 border-transparent border-t-current ${
                darkMode ? 'text-blue-500' : 'text-blue-600'
              }`}
            ></div>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Locating documentation...</p>
          </div>
        ) : (
          <div className="flex flex-col">
            
            <div className="w-full">
              {results.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {results.map((result, index) => (
                    <ResultCard key={result.id || result.url || `${index}-${result.title || 'result'}`} result={result} darkMode={darkMode} />
                  ))}
                </div>
              ) : (
                <div
                  className={`rounded-2xl border p-12 text-center ${
                    darkMode
                      ? 'border-theseeker-dark-border bg-theseeker-dark-surface/50 text-gray-400'
                      : 'border-transparent bg-white/50 text-theseeker-dark/60 shadow-sm'
                  }`}
                >
                  <p className="text-lg font-medium">No results found{meta.engine ? ` in the ${meta.engine} index` : ''}.</p>
                  <p className="text-sm mt-2 opacity-70">Try adjusting your search terms or exploring a different API category.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default SearchResults;
