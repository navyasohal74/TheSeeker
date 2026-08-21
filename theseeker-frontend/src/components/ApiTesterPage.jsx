import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ApiTester from './ApiTester';

const ApiTesterPage = ({ darkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Extract URL from query params
  const searchParams = new URLSearchParams(location.search);
  const targetUrl = searchParams.get('url') || 'https://jsonplaceholder.typicode.com/posts/1';

  return (
    <div className={`min-h-screen font-sans antialiased overflow-x-hidden transition-colors duration-300 relative ${
      darkMode ? 'bg-theseeker-dark-bg text-gray-100' : 'bg-theseeker-cream text-theseeker-dark'
    }`}>
      {/* Navbar Minimal */}
      <nav className={`sticky top-0 w-full z-50 backdrop-blur-md border-b transition-colors duration-300 ${
        darkMode 
          ? 'bg-theseeker-dark-surface/80 border-theseeker-dark-border' 
          : 'bg-white/80 border-theseeker-light-blue/20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 group focus:outline-none">
              <ArrowLeft className={`w-5 h-5 ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-black'} transition-colors pl-0`} />
              <span className={`font-bold text-xl ${darkMode ? 'text-theseeker-dark-blue' : 'text-theseeker-blue'} group-hover:underline`}>
                Back to results
              </span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Testing Studio</h1>
          <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Test and debug API endpoints dynamically.</p>
        </div>
        
        <ApiTester defaultUrl={targetUrl} />
      </div>
    </div>
  );
};

export default ApiTesterPage;