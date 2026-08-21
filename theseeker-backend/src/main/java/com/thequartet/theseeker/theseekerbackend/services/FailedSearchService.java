package com.thequartet.theseeker.theseekerbackend.services;

import com.thequartet.theseeker.theseekerbackend.entities.FailedSearch;
import com.thequartet.theseeker.theseekerbackend.repositories.FailedSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FailedSearchService {

    private static final int MAX_QUERY_LENGTH = 512;

    private final FailedSearchRepository failedSearchRepository;

    @Transactional
    public FailedSearchUpsertResult recordFailedSearch(String rawQuery) {
        String normalizedQuery = normalizeAndValidate(rawQuery);

        FailedSearch existing = failedSearchRepository.findBySearchString(normalizedQuery);
        if (existing != null) {
            return new FailedSearchUpsertResult(ensurePending(existing), false);
        }

        FailedSearch failedSearch = new FailedSearch();
        failedSearch.setSearchString(normalizedQuery);
        failedSearch.setStatus(FailedSearch.SearchStatus.PENDING);
        failedSearch.setResolvedAt(null);

        try {
            return new FailedSearchUpsertResult(failedSearchRepository.save(failedSearch), true);
        } catch (DataIntegrityViolationException raceConditionInsert) {
            // Handles duplicate insert races for same search_string.
            FailedSearch winner = failedSearchRepository.findBySearchString(normalizedQuery);
            if (winner == null) {
                throw raceConditionInsert;
            }
            return new FailedSearchUpsertResult(ensurePending(winner), false);
        }
    }

    private FailedSearch ensurePending(FailedSearch failedSearch) {
        if (failedSearch.getStatus() == FailedSearch.SearchStatus.PENDING && failedSearch.getResolvedAt() == null) {
            return failedSearch;
        }

        failedSearch.setStatus(FailedSearch.SearchStatus.PENDING);
        failedSearch.setResolvedAt(null);
        return failedSearchRepository.save(failedSearch);
    }

    private String normalizeAndValidate(String rawQuery) {
        if (rawQuery == null) {
            throw new IllegalArgumentException("query must not be null");
        }

        String normalized = rawQuery.trim().replaceAll("\\s+", " ");
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("query must not be blank");
        }

        if (normalized.length() > MAX_QUERY_LENGTH) {
            throw new IllegalArgumentException("query must not exceed 512 characters");
        }

        return normalized;
    }

    public record FailedSearchUpsertResult(FailedSearch failedSearch, boolean created) {
    }
}

