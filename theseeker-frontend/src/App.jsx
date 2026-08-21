import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import SearchResults from './components/SearchResults';
import About from './components/About';
import Documentation from './components/Documentation';
import ApiTesterPage from './components/ApiTesterPage';
import { useDarkMode } from './hooks/useDarkMode';
import { useSearchResults } from './hooks/useSearchResults';

function MainSearchApp({ darkMode, toggleDarkMode }) {
  const {
    queryFromUrl,
    isResultsView,
    results,
    meta,
    isLoading,
    handleSearch,
    handleBack
  } = useSearchResults();

  return isResultsView ? (
    <SearchResults
      query={queryFromUrl}
      results={results}
      meta={meta}
      isLoading={isLoading}
      onSearch={handleSearch}
      onBack={handleBack}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    />
  ) : (
    <Home 
      onSearch={handleSearch} 
      darkMode={darkMode} 
      toggleDarkMode={toggleDarkMode} 
    />
  );
}

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <Routes>
      <Route path="/" element={<MainSearchApp darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/about" element={<About darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/docs" element={<Documentation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/test-api" element={<ApiTesterPage darkMode={darkMode} />} />
    </Routes>
  );
}

export default App;