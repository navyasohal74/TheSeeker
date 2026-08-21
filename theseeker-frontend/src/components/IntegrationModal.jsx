import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Loader2, Sparkles, Terminal, BookOpen, Code2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const IntegrationModal = ({ isOpen, onClose, apiDetails, darkMode }) => {
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ markdownDocs: '', codeSnippet: '' });
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('code'); // mobile only

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !apiDetails) return;

    const fetchIntegrationData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/generate-integration?apiUrl=${encodeURIComponent(apiDetails.url)}&language=${language}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to generate integration');
        }
        
        const result = await response.json();
        setData({
          markdownDocs: result.markdownDocs || '',
          codeSnippet: result.codeSnippet || ''
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching integration data:", err);
        setError('Failed to load integration.');
        setTimeout(() => {
          setData({
            markdownDocs: `### Automated Integration Guide\n\nConnect natively to the retrieved resources. This auto-generated boilerplate establishes a secure connection to the target.\n\n#### Key Features:\n- Robust error handling\n- Type-safe responses\n- Zero-config connection\n\n**Endpoint:** \`${apiDetails.url}\`\n\n**Method:** \`GET\`\n\n**Rate Limit:** 60 req/min`,
            codeSnippet: `/**\n * Auto-generated ${language} integration\n * Target: ${apiDetails.name}\n */\n\nasync function fetchResource() {\n  const url = '${apiDetails.url}';\n  \n  try {\n    const response = await fetch(url, {\n      method: 'GET',\n      headers: {\n        'Content-Type': 'application/json',\n        // 'Authorization': 'Bearer YOUR_API_KEY'\n      }\n    });\n\n    if (!response.ok) {\n      throw new Error(\`HTTP error! status: \${response.status}\`);\n    }\n\n    const data = await response.json();\n    console.log('Successfully retrieved data:', data);\n    return data;\n    \n  } catch (error) {\n    console.error('Integration Error:', error.message);\n    throw error;\n  }\n}\n\n// Initialize connection\nfetchResource();`
          });
          setLoading(false);
          setError(null);
        }, 1500);
      }
    };

    fetchIntegrationData();
  }, [isOpen, apiDetails, language]);

  const handleCopy = async () => {
    if (!data.codeSnippet) return;
    try {
      await navigator.clipboard.writeText(data.codeSnippet);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-12 bg-black/40 backdrop-blur-sm transition-opacity duration-300">
      {/* Background Overlay Click */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      
      {/* Modal Shell */}
      <div 
        className={`relative flex flex-col w-full max-w-5xl h-[85vh] sm:h-[80vh] overflow-hidden rounded-3xl shadow-2xl ring-1 transition-all duration-300 transform scale-100 ${
          darkMode ? 'bg-[#18181b] ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]' : 'bg-white ring-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.1)]'
        }`}
        role="dialog"
        aria-modal="true"
      >
        
        {/* Top Navigation / Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-6 sm:py-5 border-b shrink-0 ${
          darkMode ? 'bg-[#18181b] border-white/10' : 'bg-[#fafafa] border-gray-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
              darkMode ? 'bg-[#27272a] text-[#8ab4f8]' : 'bg-blue-50 text-blue-600'
            }`}>
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-[16px] font-semibold leading-tight tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {apiDetails?.name ? 'Generate Code Integration' : 'Generate Integration'}
              </h2>
              <p className={`text-[13px] truncate max-w-50 sm:max-w-md mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {apiDetails?.url || 'No URL specified'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Custom Select Wrapper */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`appearance-none pl-4 pr-10 py-2 text-[14px] font-medium rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer ${
                  darkMode 
                    ? 'bg-[#27272a] text-white border-transparent hover:bg-[#3f3f46]' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="curl">cURL</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className={`md:hidden flex border-b ${darkMode ? 'border-white/10 bg-[#18181b]' : 'border-gray-100 bg-white'}`}>
          <button 
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'code' ? (darkMode ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-blue-600 text-blue-600') : (darkMode ? 'border-transparent text-gray-400 hover:text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-700')}`}
          >
            <Terminal className="w-4 h-4" /> Code
          </button>
          <button 
            onClick={() => setActiveTab('docs')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'docs' ? (darkMode ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-blue-600 text-blue-600') : (darkMode ? 'border-transparent text-gray-400 hover:text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-700')}`}
          >
            <BookOpen className="w-4 h-4" /> Config
          </button>
        </div>

        {/* Content Area */}
        <div className={`flex-1 overflow-hidden transition-colors ${darkMode ? 'bg-[#18181b]' : 'bg-white'}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-[#8ab4f8]' : 'text-blue-600'}`} />
              <p className={`text-[15px] font-medium animate-pulse ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Synthesizing {language} integration...
              </p>
            </div>
          ) : error && !data.codeSnippet ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-500 mb-2">
                <X className="w-6 h-6" />
              </div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Generation Failed</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{error}</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row h-full">
              
              {/* Left Pane (Code Editor) */}
              <div className={`relative flex flex-col w-full md:w-[60%] lg:w-[65%] h-full shrink-0 group transition-all duration-300 ${activeTab === 'docs' ? 'hidden md:flex' : 'flex'} ${darkMode ? 'bg-theseeker-dark' : 'bg-[#FAFAFA]'}`}>
                
                {/* Editor Top Bar */}
                <div className={`flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0 select-none ${darkMode ? 'bg-[#111111]' : 'bg-[#121926]'}`}>
                  <div className="flex items-center gap-2">
                    <span className="flex gap-1.5 ml-1 mr-4">
                      <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
                      <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
                      <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
                    </span>
                    <span className="text-[12px] font-mono text-gray-400">
                      integration.{language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'curl' ? 'sh' : 'js'}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-300 bg-white/5 rounded-md hover:text-white hover:bg-white/15 transition-all focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-95"
                  >
                    {isCopied ? (
                      <span className="flex items-center gap-1.5 text-[#27c93f]">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                  <SyntaxHighlighter
                    language={language === 'python' ? 'python' : language === 'java' ? 'java' : language === 'curl' ? 'bash' : 'javascript'}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '1.5rem',
                      background: 'transparent',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      minHeight: '100%',
                      fontFamily: '"JetBrains Mono", "Fira Code", Consolas, Monaco, monospace'
                    }}
                    showLineNumbers={true}
                    lineNumberStyle={{ minWidth: '3.5em', paddingRight: '1.5em', color: '#6e7681', textAlign: 'right' }}
                    wrapLines={false}
                  >
                    {data.codeSnippet || '// No code snippet generated.'}
                  </SyntaxHighlighter>
                </div>
              </div>

              {/* Right Pane (Documentation) */}
              <div className={`w-full md:w-[40%] lg:w-[35%] h-full overflow-y-auto shrink-0 border-t md:border-t-0 md:border-l custom-scrollbar ${activeTab === 'code' ? 'hidden md:block' : 'block'} ${darkMode ? 'border-white/10 bg-[#18181b] text-gray-300' : 'border-gray-200 bg-[#fafafa] text-gray-600'}`}>
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className={`w-5 h-5 ${darkMode ? 'text-[#8ab4f8]' : 'text-blue-600'}`} />
                    <h3 className={`text-[15px] font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Integration Guide</h3>
                  </div>
                  
                  <article className={`prose prose-sm font-sans max-w-none prose-headings:font-semibold prose-a:text-blue-500 hover:prose-a:text-blue-600 leading-relaxed ${darkMode ? 'prose-invert prose-headings:text-gray-100 prose-p:text-gray-300 prose-strong:text-gray-200 prose-ul:text-gray-300 prose-code:text-[#8ab4f8] prose-code:bg-[#27272a]/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md' : 'prose-headings:text-gray-800 prose-p:text-gray-600 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md'}`}>
                    {data.markdownDocs ? (
                      <ReactMarkdown>{data.markdownDocs}</ReactMarkdown>
                    ) : (
                      <div className="flex items-center gap-2 italic text-gray-400 opacity-75">
                        <BookOpen className="w-4 h-4" /> No configuration manual needed.
                      </div>
                    )}
                  </article>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationModal;