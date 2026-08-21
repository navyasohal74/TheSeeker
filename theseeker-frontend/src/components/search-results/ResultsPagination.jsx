function ResultsPagination({ pages, currentPage, darkMode }) {
  return (
    <nav aria-label="Search results pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm">
      <button
        type="button"
        className={`rounded-full border px-4 py-2 shadow-sm transition-colors ${darkMode ? 'border-theseeker-dark-border bg-theseeker-dark-surface text-gray-300 hover:border-theseeker-dark-blue hover:text-theseeker-dark-blue' : 'border-theseeker-light-blue/40 bg-white text-theseeker-dark/70 hover:border-theseeker-blue hover:text-theseeker-blue'}`}
      >
        Previous
      </button>

      {pages.map((page) => {
        const isCurrent = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            aria-current={isCurrent ? 'page' : undefined}
            className={
              isCurrent
                ? `${darkMode ? 'rounded-full border border-theseeker-dark-blue bg-theseeker-dark-blue px-4 py-2 font-medium text-white shadow-sm' : 'rounded-full border border-theseeker-blue bg-theseeker-blue px-4 py-2 font-medium text-white shadow-sm'}`
                : `${darkMode ? 'rounded-full border border-theseeker-dark-border bg-theseeker-dark-surface px-4 py-2 text-gray-300 shadow-sm transition-colors hover:border-theseeker-dark-blue hover:text-theseeker-dark-blue' : 'rounded-full border border-theseeker-light-blue/40 bg-white px-4 py-2 text-theseeker-dark/70 shadow-sm transition-colors hover:border-theseeker-blue hover:text-theseeker-blue'}`
            }
          >
            {page}
          </button>
        );
      })}

      <span className={`px-2 ${darkMode ? 'text-gray-500' : 'text-theseeker-dark/50'}`}>...</span>

      <button
        type="button"
        className={`rounded-full border px-4 py-2 shadow-sm transition-colors ${darkMode ? 'border-theseeker-dark-border bg-theseeker-dark-surface text-gray-300 hover:border-theseeker-dark-blue hover:text-theseeker-dark-blue' : 'border-theseeker-light-blue/40 bg-white text-theseeker-dark/70 hover:border-theseeker-blue hover:text-theseeker-blue'}`}
      >
        Next
      </button>
    </nav>
  );
}

export default ResultsPagination;