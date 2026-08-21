import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Copy, ExternalLink, Sparkles, Globe } from 'lucide-react';
import IntegrationModal from '../IntegrationModal';

const toTitleCase = (value) => value
  .replace(/[-_]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/\b\w/g, (char) => char.toUpperCase());

const getDomainAndPath = (url) => {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, '');
    const paths = parsed.pathname.split('/').filter(Boolean);
    return { domain, paths };
  } catch {
    return { domain: url, paths: [] };
  }
};

const titleFromUrl = (url) => {
  if (!url || url === '#') {
    return '';
  }

  try {
    const parsedUrl = new URL(url);
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    const lastSegment = segments.at(-1) || parsedUrl.hostname.replace(/^www\./, '');
    const withoutExtension = lastSegment.replace(/\.[a-z0-9]+$/i, '');
    return toTitleCase(decodeURIComponent(withoutExtension));
  } catch {
    return '';
  }
};

const isPlaceholderTitle = (value) => {
  const normalized = (value || '').trim().toLowerCase();
  return normalized === 'untitled' || normalized === 'no title' || normalized === 'n/a';
};

const deriveTitle = (result) => {
  const candidates = [
    result.title,
    result.name,
    result.documentTitle,
    result.pageTitle,
    result.heading,
    result.metaTitle
  ];

  for (const candidate of candidates) {
    const normalized = (candidate || '').trim();
    if (normalized && !isPlaceholderTitle(normalized)) {
      return normalized;
    }
  }

  const snippetSource = (result.content || result.description || '').trim();
  const firstLine = snippetSource.split('\n').map((line) => line.trim()).find(Boolean) || '';
  if (firstLine && firstLine.length <= 80 && !firstLine.endsWith('.')) {
    return firstLine;
  }

  const fromUrl = titleFromUrl(result.url);
  if (fromUrl) {
    return fromUrl;
  }

  return 'Search result';
};

function ResultCard({ result, darkMode }) {
  const navigate = useNavigate();
  const title = deriveTitle(result);
  const url = result.url || '#';
  const snippet = result.content || result.description || '';
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!url || url === '#') {
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Unable to copy URL:', error);
    }
  };

  const hasLongSnippet = snippet.length > 200;
  const { domain } = getDomainAndPath(url);

  return (
    <article className={`group relative flex flex-col p-5 rounded-2xl border transition-all duration-300 
      ${darkMode 
        ? 'border-gray-800/80 bg-gray-900/30 hover:bg-gray-800/50 hover:border-gray-700/80 shadow-[0_4px_20px_rgb(0,0,0,0.2)]' 
        : 'border-transparent bg-white/70 hover:bg-white hover:border-gray-200 shadow-sm hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)]'}`}>
      
      {/* Top row: Favicon + URL Breadcrumbs & Copy Button */}
      <div className={`mb-2.5 flex items-center justify-between text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="flex items-center gap-3 truncate">
          <div className={`flex items-center justify-center w-7 h-7 rounded-sm shrink-0 ${darkMode ? 'bg-gray-800/80 ring-1 ring-gray-700/50' : 'bg-gray-100/80 ring-1 ring-gray-200/60'}`}>
            <Globe className="w-3.5 h-3.5 opacity-70" />
          </div>
          <div className="flex flex-col justify-center truncate">
            <span className={`text-[13px] font-medium leading-none ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              {domain}
            </span>
            <div className="flex items-center gap-1.5 truncate text-[11px] mt-1">
              <span className={`truncate leading-none ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                 {url}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`opacity-0 group-hover:opacity-100 focus:opacity-100 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium transition-all duration-200 ${copied
            ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20'
            : darkMode
              ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          }`}
          aria-label={copied ? 'Copied URL' : 'Copy link'}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline sm:text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`mb-2.5 inline-block text-[20px] font-semibold leading-snug hover:underline decoration-2 underline-offset-[3px] 
          ${darkMode ? 'text-blue-400 decoration-blue-500/30' : 'text-[#1a0dab] decoration-[#1a0dab]/30'}`}
      >
         {title}
      </a>

      <div className="flex-1 relative overflow-hidden transition-all duration-300">
        <p className={`text-[14px] leading-[1.65] font-[400] ${darkMode ? 'text-gray-300/90' : 'text-[#4d5156]'} ${expanded ? '' : 'line-clamp-2'}`}>
          {snippet}
        </p>
      </div>
      
      {/* Buttons row */}
      <div className="mt-4 pt-1 flex items-center justify-between">
        {hasLongSnippet ? (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={`inline-flex items-center gap-1 text-[13px] font-medium transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
          >
            {expanded ? 'Show less' : 'Read more'} {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        ) : <div />}

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-[7px] text-[13px] font-semibold transition-all duration-300 ring-1 shadow-sm ${darkMode ? 'bg-[linear-gradient(to_bottom,theme(colors.gray.800),theme(colors.gray.900))] text-indigo-400 ring-gray-700/50 hover:ring-indigo-500/50 hover:text-indigo-300 hover:shadow-indigo-500/10' : 'bg-[linear-gradient(to_bottom,#fff,#f8fafc)] text-indigo-600 ring-gray-200/80 hover:ring-indigo-200 hover:bg-indigo-50 hover:shadow-indigo-500/10'}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Integration
          </button>
        </div>
      </div>

      <IntegrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apiDetails={{ name: title, url: url }}
        darkMode={darkMode}
      />
    </article>
  );
}

export default ResultCard;