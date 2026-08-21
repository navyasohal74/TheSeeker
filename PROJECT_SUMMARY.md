# TheSeeker — Project Summary

Last scanned: 2026-06-26T23:12:35+05:30

This document summarizes TheSeeker project: architecture, frontend and backend flows, important components, data flow, endpoints, configuration, and developer run notes.

---

## High-level description

TheSeeker is an API discovery and documentation search application. It crawls public API directories, normalizes and indexes API metadata into a Lucene index, and exposes search and suggestion endpoints. A React frontend provides an interactive search UI with typeahead suggestions, results pagination, a lightweight API integration generator, and telemetry for failed queries.


## Architecture overview

- Frontend: React (Vite) single-page app (theseeker-frontend). Handles search UI, suggestion UX, failed-search reporting, and small integration-testing pages.
- Backend: Spring Boot microservice (theseeker-backend). Responsible for crawling external API sources, building and maintaining a Lucene index, serving search/suggest APIs, scheduling retry pipelines for failed queries, and generating integration code snippets.
- Storage: Lucene index on disk (FSDirectory). Some lightweight persistence for failed-search records via JPA repository (FailedSearchRepository).


## Frontend (theseeker-frontend)

Key files and behavior
- package.json: Vite + React 19 app using axios for HTTP calls.
- Entry: src/main.jsx mounts React Router and App.
- App.jsx: Routes:
  - `/` (Home) — initial landing and search bar
  - `/about` — about page
  - `/docs` — documentation viewer
  - `/test-api` — API integration tester
- Main UX flow
  1. User types in SearchBar (src/components/Searchbar.jsx). Input is debounced (300ms) and suggestions fetched via GET /api/search/suggest.
  2. SearchBar supports selecting an engine (manual, Lucene, Elastic — UI only; backend uses Lucene/DynamicSearch by default). On Enter or engine click, it calls onSearch.
  3. useSearchResults (src/hooks/useSearchResults.js) reads and sets query via URL search params (`q`) and calls fetchSearchResults (services/searchApi.js) which requests `/api/search/apis`.
  4. Results rendered by SearchResults -> ResultCard. Meta information includes engine and time taken.
  5. If a query yields zero results, frontend posts the failed query to POST `/api/search/failed` (with dedupe client-side to avoid spamming: 60s window).

Important frontend modules
- src/services/searchApi.js: wraps axios; exposes fetchSearchResults, fetchSuggestions, recordFailedSearch. Uses env var VITE_API_BASE_URL (import.meta.env.VITE_API_BASE_URL).
- src/hooks/useSearchResults.js: coordinates URL state, loading, and calls to fetchSearchResults.
- src/components: Searchbar, SearchResults, ApiTester (integration generator UI), Documentation pages.

Config / Environment
- VITE_API_BASE_URL should point to backend base URL (e.g., http://localhost:8080). Provided via Vite environment variables.

Run (frontend)
- npm install
- npm run dev (starts Vite dev server)


## Backend (theseeker-backend)

Overview
- Spring Boot application (TheseekerBackendApplication) with scheduling enabled.
- Uses Apache Lucene directly to maintain an on-disk search index (configurable path `app.lucene.index-path`, default `my-search-index`).
- Provides REST endpoints under `/api` for search, suggestions, failed-search reporting, trending resolved searches, and integration generation.

Core services and responsibilities
- LuceneInfrastructureConfig
  - Beans: Directory (FSDirectory), Analyzer (StandardAnalyzer), IndexWriter, SearcherManager.
  - Index path configured via property `app.lucene.index-path`.

- LuceneIngestionService
  - Accepts ApiDocument lists and updates/commits them into Lucene index. Stores fields like apiName, description, authType, url, and an authority_score used for ranking.

- LuceneSearchService
  - Performs reading queries against fields `title` and `content` (boosts applied). Uses a MultiFieldQueryParser with fallback escaping. Returns top documents.

- ApiCrawlerService
  - ETL-style crawlers that fetch API metadata from several public sources: RapidAPI listing, FreePublicAPIs, APIs.guru. Normalizes into internal ApiDocument objects.

- DynamicSearchService (used by controllers)
  - Orchestrates search over the Lucene API index (and possibly other dynamic sources) and provides autocomplete suggestions.

- GitHubIntegrationService
  - Fetches API references from GitHub (used to recover failed searches in pipeline).

- FailedSearchService & FailedSearchRepository
  - Records queries that returned no results. Repository supports queries like find top resolved searches.

- DataPipelineScheduler
  - Scheduled job (cron: `${app.scheduler.failed-search-cron:0 */2 * * * *}`) that retries pending failed searches by invoking GitHubIntegrationService; marks found ones as RESOLVED and sends recovered ApiDocuments to LuceneIngestionService.

Controllers / Endpoints
- GET /api/search?q=... -> SearchController.searchLucene — searches Lucene (returns SearchResponse with time taken)
- GET /api/search/apis?q=... -> SearchController.searchApis — returns ApiSearchResponse (list of ApiSearchResult) used by frontend
- GET /api/search/suggest?q=... -> returns List<String> suggestions
- POST /api/search/failed -> records a failed query (request body: { query: '...' })
- GET /api/trending-resolutions -> returns top resolved failed-search strings
- GET /api/generate-integration?apiUrl=...&language=... -> IntegrationController delegates to IntegrationGenerationService to produce an integration snippet/response

Entities
- Document (id, title, url, content) — lightweight DTO for search results
- ApiDocument — richer model used for ingestion (apiName, description, authType, url, upvotes/authority)
- ApiSearchResult / ApiSearchResponse — DTOs shaped for frontend consumption
- FailedSearch — persisted search records with status (PENDING/RESOLVED)

Configuration & properties
- app.lucene.index-path — path for Lucene index
- app.scheduler.failed-search-cron — cron for scheduler
- CORS and Rest client configuration present (see CorsConfig.java, RestClientConfig.java)

Run (backend)
- Typical Spring Boot run: `mvn spring-boot:run` or run from IDE (ensure Java and Maven installed).
- Ensure application properties (application.yaml) set required values (index path, scheduler cron if desired).
- The service binds to Spring Boot default port (usually 8080) unless overridden.


## Data flow (end-to-end)

1. Ingestion: ApiCrawlerService fetches API metadata from external directories. LuceneIngestionService indexes ApiDocument entries (scheduled or called on-demand).
2. Frontend Search: User triggers search -> frontend calls GET /api/search/apis?q=... -> DynamicSearchService queries Lucene index -> results returned and rendered.
3. Suggestions: As user types, frontend calls GET /api/search/suggest?q=... -> DynamicSearchService returns autocomplete candidates.
4. Failed queries: If frontend receives zero results, it POSTs the failed query to /api/search/failed. Backend stores it as PENDING.
5. Retry Pipeline: DataPipelineScheduler periodically processes PENDING failed searches, tries to fetch matching API docs from GitHubIntegrationService, and, if found, indexes them and marks the failed search as RESOLVED.
6. Integrations: Frontend can request generated integration snippets via `/api/generate-integration` which calls IntegrationGenerationService.


## Notable implementation details & design choices

- Lucene is used directly for efficient on-disk full-text search and custom scoring (authority_score via NumericDocValues).
- The backend is designed to continuously improve results by recording failed searches and attempting to recover them asynchronously (scheduler + GitHub crawling).
- Frontend uses URL-driven state (query in search params) so searches are linkable/shareable and back/forward browser behavior is clean.
- Suggestion fetches are debounced (300ms) and the frontend deduplicates failed-search reports for 60 seconds to avoid spam.


## Developer notes & pointers

- Frontend env: set VITE_API_BASE_URL to backend URL before running.
- Lucene index path defaults to `my-search-index` relative to backend working dir — ensure write permissions.
- To debug search behavior, inspect Lucene indexer logs and DynamicSearchService code.
- The IntegrationGenerationService and GitHubIntegrationService are useful places to extend language support or additional repos.


## Where to look in code (quick map)
- Frontend:
  - theseeker-frontend/src/components — UI components (SearchBar, SearchResults, ResultCard, ApiTester)
  - theseeker-frontend/src/services/searchApi.js — HTTP wrapper + failed-search reporting
  - theseeker-frontend/src/hooks — useSearchResults, useDarkMode
  - Vite entry: theseeker-frontend/src/main.jsx

- Backend:
  - theseeker-backend/src/main/java/com/thequartet/theseeker/theseekerbackend/
    - controllers — SearchController.java, IntegrationController.java
    - services — LuceneSearchService.java, LuceneIngestionService.java, ApiCrawlerService.java, IntegrationGenerationService.java, GitHubIntegrationService.java, FailedSearchService.java, DynamicSearchService.java
    - scheduler — DataPipelineScheduler.java
    - configuration — LuceneInfrastructureConfig.java, CorsConfig.java, RestClientConfig.java
    - entities & dto — Document.java, ApiDocument.java, ApiSearchResponse, ApiSearchResult, FailedSearch


## How to extend / common enhancements

- Add ElasticSearch connector as a second engine (UI already has placeholder button) and implement a service to query Elastic.
- Improve suggestion generation using an n-gram index or phrase-based suggestions.
- Add metrics (Prometheus) and tracing for performance analysis of search endpoints.
- Introduce auth for administrative endpoints (indexing, ingestion control).


---

If any specific area should be expanded (detailed sequence diagrams, setup scripts, or run/test instructions for CI), reply with which section to expand and target OS/container preferences.

---

## Gemini onboarding prompt

System instruction for Gemini (developer assistant):

You are a high-capability code assistant being given full context to TheSeeker project. Read the entire Project Summary above and internalize the architecture, components, and developer workflows. Use this context for all follow-up tasks. Key responsibilities and rules:

- Role: Be a project-aware engineering assistant that can explain design, propose improvements, generate or modify code, write tests, and produce step-by-step run/debug instructions for frontend (React/Vite) and backend (Spring Boot + Lucene).

- Important details to retain:
  - Frontend located at theseeker-frontend (React 19, Vite). Entry: src/main.jsx. Key modules: components/Searchbar.jsx, components/SearchResults.jsx, services/searchApi.js, hooks/useSearchResults.js. Env: VITE_API_BASE_URL.
  - Backend located at theseeker-backend (Spring Boot). Uses Lucene FSDirectory at app.lucene.index-path (default my-search-index). Key services: LuceneIngestionService, LuceneSearchService, ApiCrawlerService, DynamicSearchService, GitHubIntegrationService, FailedSearchService, DataPipelineScheduler. Key controllers: SearchController, IntegrationController.
  - Endpoints: GET /api/search/apis?q=..., GET /api/search/suggest?q=..., POST /api/search/failed, GET /api/generate-integration, GET /api/trending-resolutions.
  - The system records failed searches (PENDING/RESOLVED) and runs a scheduler to recover them via GitHub scraping and re-indexing.

- How to behave when asked to help:
  1. Ask clarifying questions when scope is ambiguous (use the provided ask guidelines). Offer short multiple-choice options when feasible.
  2. When asked to change code: propose a minimal, surgical plan (1–3 steps), list files to edit, and provide exact diffs or code patches.
  3. When asked to run or test locally: provide commands for both Windows and Linux (prefer Windows paths when asked to edit repository files), required environment variables, and expected outputs.
  4. When diagnosing bugs: list tests to run, logs to inspect (backend logs, Lucene index status, frontend console), and suggested fixes.
  5. When generating integration snippets: reference the IntegrationGenerationService API and format snippets for the requested language.

- Safety and constraints:
  - Do not invent missing configuration values; always suggest defaults and ask the user to confirm when environment-specific values are required (ports, index paths, API keys).
  - Respect repository structure and make surgical changes only; propose changes before applying them.

- Useful prompts examples the user can give Gemini:
  - "Explain how the failed-search retry pipeline works step-by-step." (Expected: short numbered flow referencing DataPipelineScheduler, GitHubIntegrationService, and LuceneIngestionService.)
  - "Add Elastic as a second search engine and wire the UI button to it." (Expected: plan with files to change, API/service contract, and a small prototype patch.)
  - "Fix a search bug where queries with special characters crash the backend." (Expected: reproduce steps, unit/integration tests to add, and a fix suggestion in LuceneSearchService parseQueryWithEscapeFallback.)
  - "Create a local dev script to start frontend and backend together." (Expected: provide npm scripts, Maven command, and optional PowerShell/Bash script.)

- When replying include:
  - A 1–2 sentence summary of the answer.
  - A concise action plan (3 bullets max) when making code changes.
  - Exact file edits/patches or terminal commands when requested.

Examples of direct system-level instructions Gemini should follow without asking:
- When asked to inspect or edit code, list the exact file paths you will change, then show the diff.
- When asked to run tests or lint, show the exact commands and expected success criteria.

End of Gemini prompt.

---

*Appendix: example starter instruction to Gemini:*

"You are now the project assistant for TheSeeker. Use the Project Summary as your sole context. Start by listing five improvement suggestions prioritized by development effort, and for the top suggestion provide a 3-step implementation plan and files to edit."