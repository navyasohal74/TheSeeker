import { useState, useEffect, useRef } from 'react';
import { Moon, Search, Sun, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchSuggestions } from '../../services/searchApi';

function SearchResultsHeader({ query, onQueryChange, onSubmit, onLogoClick, darkMode, toggleDarkMode }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;
    let timer = null;

    if (query.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSugg = async () => {
      try {
        const results = await fetchSuggestions(query);
        if (!isCancelled) {
          setSuggestions(results);
          if (document.activeElement.type === 'text') {
            setShowSuggestions(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    };

    timer = setTimeout(() => {
      fetchSugg();
    }, 300);

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target) &&
          mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl ${darkMode ? 'border-gray-800/80 bg-[#0f1115]/80' : 'border-gray-200/80 bg-white/90'}`}>
      <div className="mx-auto flex h-[76px] w-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
        {/* Left: Logo */}
        <div className="flex shrink-0 items-center justify-start sm:w-1/4">
          <button
            type="button"
            onClick={onLogoClick}
            className={`text-2xl sm:text-[26px] font-bold tracking-tight transition-opacity hover:opacity-80 ${darkMode ? 'text-white' : 'text-slate-900'}`}
            aria-label="Go to homepage"
          >
            TheSeeker<span className={darkMode ? 'text-blue-500' : 'text-blue-600'}>.</span>
          </button>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={(e) => { e.preventDefault(); setShowSuggestions(false); onSubmit(e); }} className="flex-1 max-w-[650px] mx-auto hidden sm:block relative" ref={searchContainerRef}>
          <div className={`flex w-full items-center border px-3 py-2 shadow-[0_2px_8px_rgb(0,0,0,0.04)] transition-all duration-300 ${
            showSuggestions && suggestions.length > 0 ? 'rounded-t-2xl border-b-transparent' : 'rounded-3xl'
          } ${darkMode ? 'border-gray-700 bg-gray-900/50 hover:bg-gray-800 hover:border-gray-600 focus-within:border-blue-500/50 focus-within:bg-gray-900 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-gray-300 bg-gray-50/50 hover:bg-white hover:border-gray-400 focus-within:bg-white focus-within:border-blue-500 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.1)]'}`}>
            <input
              type="text"
              value={query}
              onChange={(event) => { onQueryChange(event.target.value); }}
              onFocus={() => { if (query.trim() && suggestions.length > 0) setShowSuggestions(true); }}
              placeholder="Search APIs, endpoints, and docs..."
              className={`h-9 w-full bg-transparent px-3 text-[15px] outline-none ${darkMode ? 'text-gray-100 placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'}`}
              aria-label="Search query"
            />
            <button
              type="submit"
              className={`rounded-full p-2 transition-all duration-200 ${darkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
          {/* Dropdown Suggestions Desktop */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute top-[100%] left-0 right-0 border-t-0 rounded-b-2xl shadow-xl z-50 overflow-hidden pb-2 ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-300'}`}>
              {suggestions.map((sugg, index) => (
                <div 
                  key={index}
                  className={`px-4 py-2 cursor-pointer flex items-center gap-3 text-[14px] transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => {
                    onQueryChange(sugg);
                    setShowSuggestions(false);
                    // Create a synthetic event or just call onSubmit with the sugg if possible, 
                    // but the wrapper search results component uses the query state directly on submit.
                    // We'll call onQueryChange then trigger a submit.
                    setTimeout(() => {
                      const form = searchContainerRef.current;
                      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }, 0);
                  }}
                >
                  <Search className={`h-3 w-3 shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className="truncate">{sugg}</span>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center justify-end sm:w-1/4 gap-3">
          <Link
            to="/test-api"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ring-1 shadow-sm ${
              darkMode 
                ? 'bg-[linear-gradient(to_bottom,theme(colors.gray.800),theme(colors.gray.900))] text-indigo-400 ring-gray-700/50 hover:ring-indigo-500/50 hover:text-indigo-300' 
                : 'bg-[linear-gradient(to_bottom,#fff,#f8fafc)] text-indigo-600 ring-gray-200/80 hover:ring-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
            }`}
            aria-label="Test API"
          >
            <Terminal className="h-4 w-4" />
            Test API
          </Link>
          
          <button
            type="button"
            onClick={toggleDarkMode}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 hover:rotate-12 hover:scale-105 active:scale-95 ${darkMode ? 'border-gray-700 bg-gray-800 text-yellow-400 hover:border-gray-600 shadow-sm' : 'border-gray-200 bg-white text-slate-700 hover:border-gray-300 shadow-sm hover:shadow-md'}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>
      
      {/* Mobile search bar visible only on small screens */}
      <div className="sm:hidden px-4 pb-3 border-t border-transparent relative" ref={mobileSearchContainerRef}>
        <form onSubmit={(e) => { e.preventDefault(); setShowSuggestions(false); onSubmit(e); }} className="flex-1 w-full relative">
           <div className={`flex w-full items-center border px-3 py-1 shadow-sm transition-all duration-300 ${
             showSuggestions && suggestions.length > 0 ? 'rounded-t-2xl border-b-transparent' : 'rounded-2xl'
           } ${darkMode ? 'border-gray-700 bg-gray-900/50 focus-within:border-blue-500/50' : 'border-gray-300 bg-gray-50 focus-within:border-blue-500'}`}>
            <input
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onFocus={() => { if (query.trim() && suggestions.length > 0) setShowSuggestions(true); }}
              placeholder="Search..."
              className={`h-9 w-full bg-transparent px-2 text-[14px] outline-none ${darkMode ? 'text-gray-100 placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'}`}
            />
            <button type="submit" className={`p-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              <Search className="h-4 w-4" />
            </button>
          </div>
          {/* Dropdown Suggestions Mobile */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute top-[100%] left-0 right-0 border-t-0 rounded-b-2xl shadow-xl z-[60] overflow-hidden pb-2 ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-300'}`}>
              {suggestions.map((sugg, index) => (
                <div 
                  key={index}
                  className={`px-4 py-2 cursor-pointer flex items-center gap-3 text-[14px] transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => {
                    onQueryChange(sugg);
                    setShowSuggestions(false);
                    setTimeout(() => {
                      const form = mobileSearchContainerRef.current?.querySelector('form');
                      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }, 0);
                  }}
                >
                  <Search className={`h-3 w-3 shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className="truncate">{sugg}</span>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
    </header>
  );
}

export default SearchResultsHeader;
