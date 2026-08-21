package com.thequartet.theseeker.theseekerbackend.repositories;

import com.thequartet.theseeker.theseekerbackend.entities.FailedSearch;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FailedSearchRepository extends JpaRepository<FailedSearch, Long> {
    FailedSearch findBySearchString(String searchString);

    // Find all pending searches:
    List<FailedSearch> findByStatus(FailedSearch.SearchStatus status);

    @Query("SELECT f.searchString FROM FailedSearch f WHERE f.status = :status ORDER BY f.resolvedAt DESC")
    List<String> findResolvedSearchesByStatus(@Param("status") FailedSearch.SearchStatus status, Pageable pageable);

    default List<String> findTop5ResolvedSearches() {
        return findResolvedSearchesByStatus(FailedSearch.SearchStatus.RESOLVED, PageRequest.of(0, 5));
    }
}
