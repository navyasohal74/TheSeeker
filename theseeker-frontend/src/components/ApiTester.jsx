import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const ApiTester = ({ defaultUrl = 'https://jsonplaceholder.typicode.com/posts/1' }) => {
  const [url, setUrl] = useState(defaultUrl);
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}');
  const [queryParams, setQueryParams] = useState([{ id: Date.now(), key: '', value: '', description: '', isEnabled: true }]);
  
  const [activeTab, setActiveTab] = useState('params'); // 'params' or 'body'
  
  const [response, setResponse] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  useEffect(() => {
    // Sync URL query string to queryParams state initially or when defaultUrl changes completely
    try {
      const urlObj = new URL(defaultUrl);
      const params = [];
      urlObj.searchParams.forEach((value, key) => {
        params.push({ id: Date.now() + Math.random(), key, value, description: '', isEnabled: true });
      });
      if (params.length > 0) {
        // Ensure there's always one empty row at the end
        setQueryParams([...params, { id: Date.now() + Math.random(), key: '', value: '', description: '', isEnabled: true }]);
      }
    } catch (e) {
      // invalid url, ignore
    }
  }, [defaultUrl]);

  const handleParamChange = (id, field, newValue) => {
    const updatedParams = queryParams.map(p => p.id === id ? { ...p, [field]: newValue } : p);
    setQueryParams(updatedParams);
    
    // Automatically add a new row if the last row is being typed in
    const lastParam = updatedParams[updatedParams.length - 1];
    if (lastParam && (lastParam.key || lastParam.value)) {
      setQueryParams([...updatedParams, { id: Date.now(), key: '', value: '', description: '', isEnabled: true }]);
    }
  };

  const removeParam = (id) => {
    if (queryParams.length === 1) return; // Keep at least one row
    setQueryParams(queryParams.filter(p => p.id !== id));
  };

  const handleTestApi = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setStatusCode(null);
    setResponseTime(null);

    const startTime = performance.now();

    try {
      let finalUrl = url;
      // Append enabled query parameters
      const validParams = queryParams.filter(p => p.isEnabled && p.key.trim() !== '');
      if (validParams.length > 0) {
        try {
          const urlObj = new URL(url);
          validParams.forEach(p => urlObj.searchParams.set(p.key, p.value));
          finalUrl = urlObj.toString();
        } catch (e) {
          // If URL is not valid absolute URL, fallback to simple string concatenation
          const queryString = new URLSearchParams(
            validParams.reduce((acc, p) => ({ ...acc, [p.key]: p.value }), {})
          ).toString();
          finalUrl = url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;
        }
      }

      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      };

      if (method !== 'GET' && method !== 'HEAD') {
        try {
          // Validate JSON before sending
          if (requestBody.trim()) {
            JSON.parse(requestBody);
            options.body = requestBody;
          }
        } catch (jsonErr) {
          throw new Error('Invalid JSON format in Request Body');
        }
      }

      const res = await fetch(finalUrl, options);
      const endTime = performance.now();
      
      setStatusCode(res.status);
      setResponseTime(Math.round(endTime - startTime));

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setResponse(data);
      } else {
        const textData = await res.text();
        setResponse(textData);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch. CORS restrictions might apply.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (code) => {
    if (!code) return 'bg-gray-200 text-gray-700';
    if (code >= 200 && code < 300) return 'bg-green-100 text-green-700 border-green-200';
    if (code >= 300 && code < 400) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (code >= 400 && code < 500) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getMethodColor = (m) => {
    switch (m) {
      case 'GET': return 'text-blue-600 bg-blue-50';
      case 'POST': return 'text-green-600 bg-green-50';
      case 'PUT': return 'text-orange-600 bg-orange-50';
      case 'PATCH': return 'text-yellow-600 bg-yellow-50';
      case 'DELETE': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden font-sans">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          API Sandbox
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Request Builder */}
        <form onSubmit={handleTestApi} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className={`appearance-none w-full sm:w-32 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors cursor-pointer ${getMethodColor(method)} dark:bg-gray-700 dark:text-gray-200`}
              >
                {methods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter API Endpoint URL (e.g., https://api.example.com/data)"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  Send
                </>
              )}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mt-6 relative">
            <button
              type="button"
              onClick={() => setActiveTab('params')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'params' 
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Query Params
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('body')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'body' 
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Body 
              {method === 'GET' || method === 'HEAD' ? <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400">Dimmed</span> : null}
            </button>
          </div>

          <div className="mt-4">
            {activeTab === 'params' && (
              <div className="animate-fadeIn animate-in fade-in duration-200 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-xs font-semibold text-gray-600 dark:text-gray-300 tracking-wider">
                  <div className="p-3 border-r border-gray-200 dark:border-gray-700 flex justify-center w-10"></div>
                  <div className="p-3 border-r border-gray-200 dark:border-gray-700">Key</div>
                  <div className="p-3 border-r border-gray-200 dark:border-gray-700">Value</div>
                  <div className="p-3 border-r border-gray-200 dark:border-gray-700">Description</div>
                  <div className="p-3"></div>
                </div>
                
                <div className="max-h-[250px] overflow-y-auto">
                  {queryParams.map((param, index) => (
                    <div key={param.id} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-0 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-colors">
                      <div className="p-2 border-r border-gray-100 dark:border-gray-700/50 flex justify-center items-start w-10 pt-3">
                        <input
                          type="checkbox"
                          checked={param.isEnabled}
                          onChange={(e) => handleParamChange(param.id, 'isEnabled', e.target.checked)}
                          className="w-3.5 h-3.5 mt-0.5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                        />
                      </div>
                      <div className="border-r border-gray-100 dark:border-gray-700/50">
                        <input
                          type="text"
                          value={param.key}
                          onChange={(e) => handleParamChange(param.id, 'key', e.target.value)}
                          placeholder="Key"
                          className="w-full h-full p-2.5 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-indigo-500 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-gray-700 transition-colors"
                        />
                      </div>
                      <div className="border-r border-gray-100 dark:border-gray-700/50">
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => handleParamChange(param.id, 'value', e.target.value)}
                          placeholder="Value"
                          className="w-full h-full p-2.5 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-indigo-500 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-gray-700 transition-colors"
                        />
                      </div>
                      <div className="border-r border-gray-100 dark:border-gray-700/50">
                        <input
                          type="text"
                          value={param.description}
                          onChange={(e) => handleParamChange(param.id, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full h-full p-2.5 bg-transparent border-none focus:ring-1 focus:ring-inset focus:ring-indigo-500 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-gray-700 transition-colors"
                        />
                      </div>
                      <div className="p-2 flex justify-center items-start pt-2.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => removeParam(param.id)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Remove row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'body' && (
              <div className={`animate-fadeIn animate-in fade-in duration-200 relative ${(method === 'GET' || method === 'HEAD') ? 'opacity-50' : ''}`}>
                {(method === 'GET' || method === 'HEAD') && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 rounded-lg backdrop-blur-[1px]">
                    <span className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full text-sm shadow-sm border border-gray-200 dark:border-gray-700">Body not allowed for GET requests</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Content-Type: application/json</span>
                </div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  disabled={method === 'GET' || method === 'HEAD'}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
                  rows={5}
                  spellCheck={false}
                />
              </div>
            )}
          </div>
        </form>

        {/* Response Area */}
        <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Response</h3>
            
            {statusCode && (
              <div className="flex items-center gap-3 text-sm font-mono">
                <span className={`px-2.5 py-1 rounded-md border font-medium ${getStatusColor(statusCode)}`}>
                  Status {statusCode}
                </span>
                {responseTime !== null && (
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    {responseTime} ms
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 min-h-[150px]">
             {isLoading ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <svg className="animate-spin h-8 w-8 text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                 <span className="text-sm animate-pulse">Sending request...</span>
               </div>
             ) : error ? (
               <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/10 h-full flex items-start gap-3">
                 <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <div>
                   <h4 className="font-semibold">Request Failed</h4>
                   <p className="text-sm mt-1">{error}</p>
                 </div>
               </div>
             ) : response ? (
               <pre className="p-4 w-full h-full overflow-auto text-sm font-mono text-gray-800 dark:text-gray-200 max-h-[400px]">
                 {typeof response === 'object' 
                   ? JSON.stringify(response, null, 2) 
                   : response}
               </pre>
             ) : (
               <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                 Enter a URL and click Send to see the response
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTester;