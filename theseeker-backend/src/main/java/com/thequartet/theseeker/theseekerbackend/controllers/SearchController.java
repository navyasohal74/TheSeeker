package com.thequartet.theseeker.theseekerbackend.controllers;

import com.thequartet.theseeker.theseekerbackend.controllers.dto.FailedSearchRecordRequest;
import com.thequartet.theseeker.theseekerbackend.controllers.dto.FailedSearchRecordResponse;
import com.thequartet.theseeker.theseekerbackend.entities.ApiSearchResponse;
import com.thequartet.theseeker.theseekerbackend.entities.ApiSearchResult;
import com.thequartet.theseeker.theseekerbackend.entities.Document;
import com.thequartet.theseeker.theseekerbackend.entities.SearchResponse;
import com.thequartet.theseeker.theseekerbackend.repositories.FailedSearchRepository;
import com.thequartet.theseeker.theseekerbackend.services.DynamicSearchService;
import com.thequartet.theseeker.theseekerbackend.services.FailedSearchService;
import com.thequartet.theseeker.theseekerbackend.services.LuceneSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SearchController {

    private final LuceneSearchService luceneEngine;
    private final DynamicSearchService dynamicSearchService;
    private final FailedSearchRepository failedSearchRepository;
    private final FailedSearchService failedSearchService;

    @GetMapping("/search")
    public ResponseEntity<SearchResponse> searchLucene(@RequestParam String q) {
        long startTime = System.nanoTime();

        List<Document> results = luceneEngine.search(q);

        long endTime = System.nanoTime();

        SearchResponse response = new SearchResponse(results, calculateTime(startTime, endTime));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search/apis")
    public ResponseEntity<ApiSearchResponse> searchApis(@RequestParam String q) throws IOException {
        long startTime = System.nanoTime();

        List<ApiSearchResult> results = dynamicSearchService.searchApiDocumentsWithAuthority(q).stream()
                .map(hit -> new ApiSearchResult(
                        hit.document().getApiName(),
                        hit.document().getDescription(),
                        hit.document().getAuthType(),
                        hit.document().getUrl(),
                        hit.document().getUpvotes(),
                        hit.score()
                ))
                .toList();

        long endTime = System.nanoTime();

        ApiSearchResponse response = new ApiSearchResponse(results, calculateTime(startTime, endTime));
        return ResponseEntity.ok(response);
    }

    private double calculateTime(long startTime, long endTime) {
        return (endTime - startTime) / 1_000_000.0;
    }

    @GetMapping("/search/suggest")
    public ResponseEntity<List<String>> getSuggestions(@RequestParam String q) {
        try {
            return ResponseEntity.ok(dynamicSearchService.getAutocompleteSuggestions(q));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/trending-resolutions")
    public ResponseEntity<List<String>> getTrendingFixes() {
        return ResponseEntity.ok(failedSearchRepository.findTop5ResolvedSearches());
    }

    @PostMapping("/search/failed")
    public ResponseEntity<FailedSearchRecordResponse> recordFailedSearch(@RequestBody FailedSearchRecordRequest request) {
        try {
            FailedSearchService.FailedSearchUpsertResult result = failedSearchService.recordFailedSearch(
                    request == null ? null : request.query()
            );

            FailedSearchRecordResponse response = new FailedSearchRecordResponse(
                    result.failedSearch().getSearchString(),
                    result.failedSearch().getStatus().name(),
                    result.created()
            );

            return result.created()
                    ? ResponseEntity.status(HttpStatus.CREATED).body(response)
                    : ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        }
    }

}
