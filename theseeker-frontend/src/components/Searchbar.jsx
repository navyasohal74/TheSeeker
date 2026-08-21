import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, Camera } from 'lucide-react';
import { fetchSuggestions } from '../services/searchApi';

const SearchBar = ({ onSearch }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBarRef = useRef(null);
  const inputRef = useRef(null);

  const handleBtnClick = (engine, overrideInput) => {
    const query = overrideInput || input;
    if (query.trim()) {
      setShowSuggestions(false);
      onSearch(query, engine);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    let timer = null;

    if (input.trim().length === 0) return;

    const fetchSugg = async () => {
      try {
        const results = await fetchSuggestions(input);
        if (!isCancelled) {
          console.log("Suggestions fetched:", results);
          setSuggestions(results);
          setShowSuggestions(true);
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
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full mt-20">
      {/* Logo */}
      <div className="text-7xl font-bold mb-8 select-none tracking-tighter">
        <span className="text-blue-500">H</span><span className="text-red-500">m</span><span className="text-yellow-500">m</span><span className="text-blue-500">.</span><span className="text-green-500">.</span><span className="text-red-500">.</span>
      </div>

      {/* Input Group */}
      <div className="w-full max-w-[584px] px-4 relative" ref={searchBarRef}>
        <div className={`flex items-center border border-gray-200 px-5 py-3 hover:shadow-md focus-within:shadow-md transition-shadow bg-white z-10 relative ${showSuggestions && suggestions.length > 0 ? 'rounded-t-2xl border-b-transparent' : 'rounded-full'}`}>
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            className="flex-grow outline-none text-lg bg-transparent"
            value={input}
            onChange={handleInputChange}
            onFocus={() => {
              if (input.trim() && suggestions.length > 0) setShowSuggestions(true);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleBtnClick('lucene')}
            placeholder="Search our 2026 Index..."
          />
          <Mic className="h-5 w-5 text-blue-500 mr-3 cursor-pointer" />
          <Camera className="h-5 w-5 text-blue-500 cursor-pointer" />
        </div>
        
        {/* Dropdown Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-[95%] left-4 right-4 bg-white border border-gray-200 border-t-0 rounded-b-2xl shadow-md z-50 overflow-hidden pt-1 pb-3">
            {suggestions.map((sugg, index) => (
              <div 
                key={index}
                className="px-5 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-3 text-gray-700 font-medium"
                onClick={() => {
                  setInput(sugg);
                  handleBtnClick('lucene', sugg);
                }}
              >
                <Search className="h-4 w-4 text-gray-400" />
                <span>{sugg}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Engine Selection Buttons */}
      <div className="mt-8 flex gap-3">
        <button onClick={() => handleBtnClick('manual')} className="bg-gray-50 border border-transparent hover:border-gray-300 px-4 py-2 rounded text-sm text-gray-700">Manual (Phase 1)</button>
        <button onClick={() => handleBtnClick('lucene')} className="bg-gray-50 border border-transparent hover:border-gray-300 px-4 py-2 rounded text-sm text-gray-700">Lucene 10.4 (Phase 2)</button>
        <button onClick={() => handleBtnClick('elastic')} className="bg-gray-50 border border-transparent hover:border-gray-300 px-4 py-2 rounded text-sm text-gray-700">Elastic 9.2 (Phase 3)</button>
      </div>
      
    </div>
  );
};

export default SearchBar;