import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Terminal, Code, Database } from 'lucide-react';

const Documentation = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className={`min-h-screen font-sans antialiased overflow-x-hidden transition-colors duration-300 relative ${
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
                TheSeeker Documentation
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
      <main className="max-w-3xl mx-auto px-4 pt-28 pb-12 leading-relaxed">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Documentation</h1>
          <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Explore the inner workings of TheSeeker architecture and API.
          </p>
        </div>

        <section className={`mb-12 p-6 rounded-2xl border ${
          darkMode ? 'bg-theseeker-dark-surface border-theseeker-dark-border shadow-lg shadow-black/20' : 'bg-white border-theseeker-light-blue/30 shadow-xl shadow-theseeker-light-blue/10'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-theseeker-dark-blue/20' : 'bg-theseeker-blue/10'}`}>
              <Terminal className={`w-6 h-6 ${darkMode ? 'text-theseeker-dark-blue' : 'text-theseeker-blue'}`} />
            </div>
            <h2 className="text-2xl font-bold">Getting Started</h2>
          </div>
          
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            TheSeeker relies on our proprietary backend engine to search effectively. When developing locally, ensure the backend is running.
          </p>
          <pre className={`p-4 rounded-xl text-sm overflow-x-auto ${darkMode ? 'bg-[#1a1b1e] text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
            <code>
{`# Install dependencies
npm install

# Run the development server
npm run dev`}
            </code>
          </pre>
        </section>

        <section className={`mb-12 p-6 rounded-2xl border ${
          darkMode ? 'bg-theseeker-dark-surface border-theseeker-dark-border shadow-lg shadow-black/20' : 'bg-white border-theseeker-light-blue/30 shadow-xl shadow-theseeker-light-blue/10'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-theseeker-dark-blue/20' : 'bg-theseeker-blue/10'}`}>
              <Code className={`w-6 h-6 ${darkMode ? 'text-theseeker-dark-blue' : 'text-theseeker-blue'}`} />
            </div>
            <h2 className="text-2xl font-bold">API Integration</h2>
          </div>
          
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            You can interact programmatically with TheSeeker using REST APIs. See our endpoint for direct fetching.
          </p>
          
          <div className={`mb-4 p-4 rounded-xl border ${darkMode ? 'bg-[#1a1b1e] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`inline-block px-2 py-1 rounded text-xs font-mono font-bold mr-3 ${darkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700'}`}>GET</span>
            <code className={darkMode ? 'text-gray-300' : 'text-gray-800'}>/api/search?q={"{query}"}</code>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Returns an array of search results and metadata matching the query string.
          </p>
        </section>

        <section className={`mb-12 p-6 rounded-2xl border ${
          darkMode ? 'bg-theseeker-dark-surface border-theseeker-dark-border shadow-lg shadow-black/20' : 'bg-white border-theseeker-light-blue/30 shadow-xl shadow-theseeker-light-blue/10'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-theseeker-dark-blue/20' : 'bg-theseeker-blue/10'}`}>
              <Database className={`w-6 h-6 ${darkMode ? 'text-theseeker-dark-blue' : 'text-theseeker-blue'}`} />
            </div>
            <h2 className="text-2xl font-bold">Architecture</h2>
          </div>
          
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            The frontend is powered by React with Vite and styled via TailwindCSS. Our fluid dark mode system hooks natively to Tailwind configurations (`theseeker-dark`, `theseeker-blue`).
          </p>
        </section>

        <div className="mt-8 text-center sm:text-left">
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Need more help? <a href="https://github.com/Jaiveer2004" target="_blank" rel="noopener noreferrer" className={`font-medium ${darkMode ? 'text-theseeker-dark-blue hover:underline' : 'text-theseeker-blue hover:underline'}`}>File an issue</a> on GitHub.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Documentation;