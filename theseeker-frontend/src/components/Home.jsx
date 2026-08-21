import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Mic, Moon, Sun, X, Sparkles, Code, Globe, Zap, ArrowRight, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { fetchSuggestions } from '../services/searchApi';

const Home = ({ onSearch, darkMode, toggleDarkMode }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const transcriptRef = useRef({ final: '', interim: '' });
  const silenceTimeoutRef = useRef(null);
  
  const [init, setInit] = useState(false);
  const searchContainerRef = useRef(null);

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
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Example search queries to show underneath
  const exampleQueries = [
    "Authentication API for React",
    "Latest machine learning models",
    "Weather API with free tier",
    "Payment gateway integration"
  ];

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: darkMode ? "#6B9BD8" : "#8FABD4",
        },
        links: {
          color: darkMode ? "#6B9BD8" : "#8FABD4",
          distance: 150,
          enable: true,
          opacity: 0.3,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: false,
          speed: 1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 60,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 },
        },
      },
      detectRetina: true,
    }),
    [darkMode]
  );

  // Function to play audio feedback
  const playSound = (frequency, duration) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration);
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const playStartSound = () => {
    // Play ascending tone (start listening)
    playSound(600, 0.1);
    setTimeout(() => playSound(800, 0.1), 100);
  };

  const playStopSound = () => {
    // Play descending tone (stop listening)
    playSound(800, 0.1);
    setTimeout(() => playSound(600, 0.1), 100);
  };

  const handleSearchTrigger = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleVoiceSearch = () => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || 
                              window.webkitSpeechRecognition || 
                              window.mozSpeechRecognition;
    
    if (!SpeechRecognition) {
      const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      
      if (isFirefox) {
        alert('Voice search is not supported in Firefox yet.\n\nPlease use Chrome, Edge, or Safari for voice search functionality.');
      } else {
        alert('Sorry, your browser doesn\'t support voice search.\n\nSupported browsers: Chrome, Edge, Safari');
      }
      return;
    }

    // Open modal and reset transcripts
    setIsModalOpen(true);
    setLiveTranscript('');
    setFinalTranscript('');
    transcriptRef.current = { final: '', interim: '' };
    setIsListening(true);

    // Clear any existing timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    // Play start listening sound
    playStartSound();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    // Configuration for real-time transcription
    recognition.continuous = true;  // Keep listening for continuous speech
    recognition.lang = 'en-US';
    recognition.interimResults = true;  // Show interim results (real-time)
    recognition.maxAlternatives = 1;

    // Real-time transcription updates
    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      // Clear any existing silence timeout since user is speaking
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      // Update live transcript (interim results)
      if (interim) {
        setLiveTranscript(interim);
        transcriptRef.current.interim = interim;
      }
      
      // Update final transcript
      if (final) {
        setFinalTranscript(prev => {
          const newFinal = prev + final;
          transcriptRef.current.final = newFinal;
          return newFinal;
        });
        setLiveTranscript('');
        transcriptRef.current.interim = '';
      }

      // Set timeout to stop after 1.5 seconds of silence
      silenceTimeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.error('Error stopping recognition:', e);
          }
        }
      }, 1500);
    };

    // When speech starts
    recognition.onspeechstart = () => {
      setIsListening(true);
    };

    // Error handling
    recognition.onerror = (event) => {
      setIsListening(false);
      
      // Clear timeout on error
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      
      switch(event.error) {
        case 'no-speech':
          // Silently close modal if no speech after timeout
          closeVoiceModal();
          break;
        case 'audio-capture':
          alert('No microphone found. Please ensure a microphone is connected and you have granted permission.');
          closeVoiceModal();
          break;
        case 'not-allowed':
          alert('Microphone permission denied. Please allow microphone access in your browser settings.');
          closeVoiceModal();
          break;
        case 'aborted':
          // User cancelled, no alert needed
          closeVoiceModal();
          break;
        default:
          console.error('Voice search error:', event.error);
          closeVoiceModal();
      }
    };

    // When recognition ends (cleanup)
    recognition.onend = () => {
      setIsListening(false);
      
      // Clear timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      
      // Play stop listening sound
      playStopSound();
      
      // Auto-search if we have transcription
      setTimeout(() => {
        const fullTranscript = (transcriptRef.current.final + ' ' + transcriptRef.current.interim).trim();
        if (fullTranscript) {
          setQuery(fullTranscript);
          onSearch(fullTranscript);
        }
        closeVoiceModal();
      }, 500);
    };

    // Start recognition
    try {
      recognition.start();
    } catch (error) {
      setIsListening(false);
      console.error('Voice recognition error:', error);
      alert('Failed to start voice recognition. Please try again.');
      closeVoiceModal();
    }
  };

  const closeVoiceModal = () => {
    // Clear any pending silence timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    // Stop recognition if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch {
        // Already stopped
      }
    }
    
    setIsModalOpen(false);
    setIsListening(false);
    setLiveTranscript('');
    setFinalTranscript('');
    transcriptRef.current = { final: '', interim: '' };
  };

  return (
    <div className={`flex flex-col min-h-screen overflow-x-hidden transition-colors duration-300 relative ${darkMode ? 'bg-theseeker-dark-bg' : 'bg-theseeker-cream'}`}>
      
      {/* Particles Background */}
      {init && (
        <Particles
          id="tsparticles"
          options={particlesOptions}
          className="absolute inset-0 z-0 pointer-events-none"
        />
      )}

      {/* Top Right Actions */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-50 flex items-center gap-3">
        <Link
          to="/test-api"
          className={`hidden sm:flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md ${
            darkMode 
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20' 
              : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
          }`}
          aria-label="Test API"
        >
          <Terminal className="h-4 w-4" />
          Test API
        </Link>
        <button
          onClick={toggleDarkMode}
          className={`p-2 sm:p-3 flex items-center justify-center rounded-full transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 ${
            darkMode 
              ? 'bg-theseeker-dark-surface border border-theseeker-dark-border hover:bg-theseeker-dark-border' 
              : 'bg-white border border-theseeker-light-blue hover:bg-theseeker-light-blue/20'
          }`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
          ) : (
            <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-theseeker-blue" />
          )}
        </button>
      </div>

      {/* Spacer for top */}
      <div className="h-6 sm:h-16 relative z-10"></div>

      {/* Center Search Area */}
      <main className="grow flex flex-col items-center justify-center px-4 sm:px-6 -mt-6 sm:-mt-16 w-full relative z-10">
        
        {/* Decorative Badge Above Logo */}
        <div className={`mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium animate-fade-in-up shadow-sm transition-all ${
          darkMode 
            ? 'border-theseeker-dark-border bg-theseeker-dark-surface/50 text-theseeker-dark-blue backdrop-blur-md' 
            : 'border-theseeker-light-blue/40 bg-white/50 text-theseeker-blue backdrop-blur-md'
        }`}>
          <Sparkles className="h-4 w-4" />
          <span>The Next Generation API Explorer</span>
        </div>

        {/* The Logo: theseeker.. text */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 mb-6 sm:mb-10 md:mb-12">
          {/* theseeker.. text */}
          <div className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold select-none tracking-tight ${
            darkMode ? 'text-theseeker-dark-light' : 'text-theseeker-dark'
          }`}>
            TheSeeker<span className={darkMode ? 'text-theseeker-dark-blue' : 'text-theseeker-blue'}></span>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="w-full max-w-2xl flex items-start gap-2 sm:gap-3 relative" ref={searchContainerRef}>
          <div className="w-full sm:grow relative group">
            <div className={`flex items-center rounded-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 transition-all duration-200 w-full ${
              showSuggestions && suggestions.length > 0 
                ? 'rounded-b-none border-b-transparent' 
                : ''
            } ${
              darkMode
                ? 'bg-theseeker-dark-surface border border-theseeker-dark-border hover:border-theseeker-dark-blue focus-within:border-theseeker-dark-blue hover:shadow-md focus-within:shadow-lg'
                : 'bg-white border border-theseeker-light-blue hover:border-theseeker-blue focus-within:border-theseeker-blue hover:shadow-md focus-within:shadow-lg'
            }`}>
              <Search className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 md:mr-4 shrink-0 ${darkMode ? 'text-theseeker-dark-blue' : 'text-theseeker-blue'}`} />
              <input
                type="text"
                className={`w-full min-w-0 outline-none text-sm sm:text-base md:text-lg bg-transparent ${
                  darkMode ? 'text-theseeker-dark-light placeholder-gray-500' : 'text-theseeker-dark placeholder-gray-400'
                }`}
                placeholder="Search the web..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (query.trim() && suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()}
                autoFocus
              />
              <div className="flex gap-2 sm:gap-3 md:gap-4 items-center">
                <Mic 
                  onClick={handleVoiceSearch}
                  className={`h-4 w-4 sm:h-5 sm:w-5 cursor-pointer transition-all ${
                    isListening 
                      ? 'text-red-500 animate-pulse scale-110' 
                      : darkMode 
                        ? 'text-gray-400 hover:text-theseeker-dark-blue hover:scale-110' 
                        : 'text-theseeker-light-blue hover:text-theseeker-blue hover:scale-110'
                  }`} 
                  title={isListening ? "Listening..." : "Search by voice"} 
                />
              </div>
            </div>

            {/* Dropdown Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className={`absolute top-[100%] left-0 right-0 border-t-0 rounded-b-3xl shadow-xl z-50 overflow-hidden pb-3 ${
                darkMode ? 'bg-theseeker-dark-surface border border-theseeker-dark-border' : 'bg-white border border-theseeker-light-blue/50'
              }`}>
                {suggestions.map((sugg, index) => (
                  <div 
                    key={index}
                    className={`px-5 py-3 cursor-pointer flex items-center gap-3 font-medium transition-colors ${
                      darkMode ? 'text-gray-300 hover:bg-theseeker-dark-border' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setQuery(sugg);
                      setShowSuggestions(false);
                      onSearch(sugg);
                    }}
                  >
                    <Search className={`h-4 w-4 shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className="truncate">{sugg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Search Button - Outside the bar (Desktop only) */}
          <button
            onClick={handleSearchTrigger}
            className={`hidden sm:flex p-3 md:p-4 rounded-full transition-all hover:scale-110 active:scale-95 shadow-md items-center justify-center ${
              darkMode 
                ? 'bg-theseeker-dark-blue hover:bg-theseeker-dark-blue/80 text-white' 
                : 'bg-theseeker-blue hover:bg-theseeker-blue/80 text-white'
            }`}
            aria-label="Search"
            title="Search"
          >
            <Search className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {/* Floating suggestion pills near the bottom */}
        <div className="w-full max-w-3xl mt-10 md:mt-12 text-center relative z-10">
          <p className={`text-xs uppercase tracking-wider font-semibold mb-4 opacity-70 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Trending searches
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {exampleQueries.map((exQuery) => (
              <button
                key={exQuery}
                onClick={() => { setQuery(exQuery); onSearch(exQuery); }}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200 border ${
                  darkMode 
                    ? 'border-theseeker-dark-border/60 bg-theseeker-dark-surface/40 text-gray-300 hover:border-theseeker-dark-blue hover:text-white hover:bg-theseeker-dark-blue/10 backdrop-blur-sm' 
                    : 'border-theseeker-light-blue/30 bg-white/40 text-gray-600 hover:border-theseeker-blue hover:text-theseeker-blue hover:bg-theseeker-light-blue/10 backdrop-blur-sm'
                }`}
              >
                {exQuery}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Voice Search Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={closeVoiceModal}>
          <div 
            className={`rounded-2xl shadow-2xl p-8 w-full max-w-lg transform transition-all ${
              darkMode ? 'bg-theseeker-dark-surface border-2 border-theseeker-dark-border' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeVoiceModal}
              className={`absolute top-4 right-4 p-2 rounded-full transition-all hover:scale-110 ${
                darkMode ? 'hover:bg-theseeker-dark-border' : 'hover:bg-gray-100'
              }`}
            >
              <X className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>

            {/* Microphone Icon */}
            <div className="flex flex-col items-center mb-6">
              <div className={`p-6 rounded-full mb-4 ${
                isListening 
                  ? 'bg-red-500 animate-pulse' 
                  : darkMode 
                    ? 'bg-theseeker-dark-blue' 
                    : 'bg-theseeker-blue'
              }`}>
                <Mic className="h-12 w-12 text-white" />
              </div>
              <p className={`text-lg font-medium ${
                darkMode ? 'text-theseeker-dark-light' : 'text-theseeker-dark'
              }`}>
                {isListening ? 'Listening...' : 'Processing...'}
              </p>
              <p className={`text-sm mt-2 ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {isListening ? 'Speak now' : 'Searching'}
              </p>
            </div>

            {/* Live Transcription Display */}
            <div className={`min-h-24 max-h-48 overflow-y-auto p-4 rounded-lg ${
              darkMode ? 'bg-theseeker-dark-bg' : 'bg-gray-50'
            }`}>
              <p className={`text-xl text-center ${
                darkMode ? 'text-theseeker-dark-light' : 'text-theseeker-dark'
              }`}>
                {finalTranscript}
                {finalTranscript && liveTranscript && ' '}
                <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                  {liveTranscript}
                </span>
              </p>
              {!finalTranscript && !liveTranscript && (
                <p className={`text-center ${
                  darkMode ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Start speaking to see your text here...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`text-xs sm:text-sm mt-8 ${
        darkMode
          ? 'bg-linear-to-r from-theseeker-dark-surface to-theseeker-dark-border/30 text-gray-400 border-t-2 border-theseeker-dark-border'
          : 'bg-linear-to-r from-white to-theseeker-light-blue/10 text-gray-600 border-t-2 border-theseeker-light-blue/40'
      }`}>
        <div className="px-4 sm:px-8 py-3 border-b border-theseeker-light-blue/30">
          <span className={`font-bold ${darkMode ? 'text-theseeker-dark-blue' : 'text-theseeker-blue'}`}>TheSeeker</span> <span className={`font-medium ${darkMode ? 'text-theseeker-dark-blue' : 'text-theseeker-light-blue'}`}>v1.0</span>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap justify-between px-4 sm:px-8 py-3 gap-2 sm:gap-0">
          <div className="flex flex-wrap gap-x-4 sm:gap-x-6 py-1">
            <Link to="/about" className={`font-medium transition-colors ${
              darkMode ? 'text-gray-400 hover:text-theseeker-dark-blue' : 'text-theseeker-dark/70 hover:text-theseeker-blue'
            }`}>About</Link>
            <Link to="/docs" className={`font-medium transition-colors ${
              darkMode ? 'text-gray-400 hover:text-theseeker-dark-blue' : 'text-theseeker-dark/70 hover:text-theseeker-blue'
            }`}>Documentation</Link>
            <a href="https://github.com/Jaiveer2004" target="_blank" rel="noopener noreferrer" className={`font-medium transition-colors ${
              darkMode ? 'text-gray-400 hover:text-theseeker-dark-blue' : 'text-theseeker-dark/70 hover:text-theseeker-blue'
            }`}>GitHub</a>
          </div>
          <div className="flex flex-wrap gap-x-4 sm:gap-x-6 py-1">
            <a href="#" className={`font-medium transition-colors ${
              darkMode ? 'text-gray-400 hover:text-theseeker-dark-blue' : 'text-theseeker-dark/70 hover:text-theseeker-blue'
            }`}>Privacy</a>
            <a href="#" className={`font-medium transition-colors ${
              darkMode ? 'text-gray-400 hover:text-theseeker-dark-blue' : 'text-theseeker-dark/70 hover:text-theseeker-blue'
            }`}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;