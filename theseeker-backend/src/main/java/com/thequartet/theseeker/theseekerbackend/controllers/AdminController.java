package com.thequartet.theseeker.theseekerbackend.controllers;

import com.thequartet.theseeker.theseekerbackend.entities.ApiDocument;
import com.thequartet.theseeker.theseekerbackend.services.ApiCrawlerService;
import com.thequartet.theseeker.theseekerbackend.services.DynamicSearchService;
import com.thequartet.theseeker.theseekerbackend.services.LuceneIngestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {
    private final ApiCrawlerService crawlerService;
    private final LuceneIngestionService ingestionService;
    private final DynamicSearchService searchService;

    @GetMapping("/seed-database")
    public ResponseEntity<String> seedDatabase() {
        log.warn("Manual database seed triggered...");
        try {
            // 1. Fetch the "Firehose" data (Passing null triggers the Get-All mode)
            List<ApiDocument> bulkData = crawlerService.fetchFromDirectories(null);

            // 2. Load it into the Apache Lucene Index using our Upsert logic
            if (!bulkData.isEmpty()) {
                ingestionService.feedToEngine(bulkData);
                return ResponseEntity.ok("Success! Seeded the database with " + bulkData.size() + " APIs.");
            } else {
                return ResponseEntity.badRequest().body("Crawler returned 0 results. Check your internet connection or target URLs.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Fatal error during seeding: " + e.getMessage());
        }
    }

    @GetMapping("/view-index")
    public ResponseEntity<List<ApiDocument>> viewIndex(@RequestParam(defaultValue = "100") int limit) {
        try {
            List<ApiDocument> apis = searchService.getAllIngestedApis(limit);
            return ResponseEntity.ok(apis);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
