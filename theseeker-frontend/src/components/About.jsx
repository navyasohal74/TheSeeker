import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Terminal } from 'lucide-react';

const About = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className={`min-h-screen overflow-x-hidden font-sans antialiased transition-colors duration-300 relative ${
      darkMode ? 'bg-theseeker-dark-bg text-gray-100' : 'bg-theseeker-cream text-theseeker-dark'
    }`}>
      {/* Navbar Minimal */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-md border-b transition-colors duration-300 ${
        darkMode 
          ? 'bg-theseeker-dark-surface/80 border-theseeker-dark-border' 
          : 'bg-white/80 border-theseeker-light-blue/20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <ArrowLeft className={`w-5 h-5 ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-black'} transition-colors pl-0`} />
              <span className={`font-bold text-xl ${darkMode ? 'text-theseeker-dark-blue' : 'text-theseeker-blue'}`}>
                TheSeeker
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link
                to="/test-api"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  darkMode 
                    ? 'text-indigo-400 hover:text-indigo-300 hover:bg-gray-800' 
                    : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <Terminal className="h-4 w-4" />
                Test API
              </Link>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                  darkMode 
                    ? 'bg-theseeker-dark-surface border border-theseeker-dark-border hover:bg-theseeker-dark-border/80 text-gray-300' 
                    : 'bg-white border border-theseeker-light-blue hover:bg-theseeker-light-blue/20 text-gray-600'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 pt-32 pb-16 leading-relaxed relative z-10">
        <div className="mb-12 text-center sm:text-left">
          <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 ${darkMode ? 'text-white' : 'text-theseeker-dark'}`}>About TheSeeker</h1>
          <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Revolutionizing how we discover information on the web.
          </p>
        </div>

        <div className={`mb-8 p-8 sm:p-10 rounded-3xl border transition-all duration-300 ${
          darkMode ? 'bg-theseeker-dark-surface border-theseeker-dark-border shadow-lg shadow-black/20' : 'bg-white border-theseeker-light-blue/30 shadow-xl shadow-theseeker-light-blue/10'
        }`}>
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-theseeker-dark-light' : 'text-theseeker-dark'}`}>Our Mission</h2>
          <p className={`text-lg mb-6 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            TheSeeker is a cutting-edge, intelligent search engine designed for developers, researchers, and everyday users. By harnessing the power of modern natural language processing and lightning-fast scraping, TheSeeker gives you highly relevant results in milliseconds.
          </p>
          <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Our mission is to help people sift through the growing noise on the internet by giving them answers directly, bypassing ads and irrelevant SEO spam.
          </p>
        </div>

        <div className={`mb-8 p-8 sm:p-10 rounded-3xl border transition-all duration-300 ${
          darkMode ? 'bg-theseeker-dark-surface border-theseeker-dark-border shadow-lg shadow-black/20' : 'bg-white border-theseeker-light-blue/30 shadow-xl shadow-theseeker-light-blue/10'
        }`}>
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-theseeker-dark-light' : 'text-theseeker-dark'}`}>Features</h2>
          <ul className={`list-none space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {[
              "Lightning Fast Natural Language Parsing",
              "Semantic context awareness",
              "Privacy-first search pipeline",
              "Minimalist, distraction-free interface",
              "Light/Dark fluid theme matching"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-theseeker-dark-blue' : 'bg-theseeker-blue'}`}></div>
                <span className="text-lg">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`p-8 sm:p-10 rounded-3xl border transition-all duration-300 ${
          darkMode ? 'bg-theseeker-dark-surface border-theseeker-dark-border shadow-lg shadow-black/20' : 'bg-white border-theseeker-light-blue/30 shadow-xl shadow-theseeker-light-blue/10'
        }`}>
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-theseeker-dark-light' : 'text-theseeker-dark'}`}>The Author</h2>
          <p className={`text-lg mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Built with precision by Jaiveer. Follow the open-source developments and explore the repository on my GitHub.
          </p>
          
          <a
            href="https://github.com/Jaiveer2004"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 ${
              darkMode
                ? 'bg-linear-to-r from-theseeker-dark-blue to-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'bg-linear-to-r from-theseeker-blue to-blue-600 text-white shadow-lg shadow-blue-500/30'
            }`}
          >
            Visit GitHub
          </a>
        </div>
      </main>
    </div>
  );
};

export default About;