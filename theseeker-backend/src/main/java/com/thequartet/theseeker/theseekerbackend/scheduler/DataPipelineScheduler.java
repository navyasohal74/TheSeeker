package com.thequartet.theseeker.theseekerbackend.scheduler;

import com.thequartet.theseeker.theseekerbackend.entities.ApiDocument;
import com.thequartet.theseeker.theseekerbackend.entities.FailedSearch;
import com.thequartet.theseeker.theseekerbackend.repositories.FailedSearchRepository;
import com.thequartet.theseeker.theseekerbackend.services.GitHubIntegrationService;
import com.thequartet.theseeker.theseekerbackend.services.LuceneIngestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataPipelineScheduler {

    private final LuceneIngestionService indexer;
    private final GitHubIntegrationService githubService;
    private final FailedSearchRepository failedRepo;

    @Scheduled(cron = "${app.scheduler.failed-search-cron:0 */2 * * * *}")
    public void executeMasterPipeline() throws Exception {
        log.info("Starting failed-search retry pipeline...");
        List<ApiDocument> masterDataList = new ArrayList<>();


        List<FailedSearch> pendingSearches = failedRepo.findByStatus(FailedSearch.SearchStatus.PENDING);
        if (pendingSearches.isEmpty()) {
            log.debug("Skipping retry pipeline: no PENDING failed searches found.");
            return;
        }

        log.info("Found {} pending failed searches to retry.", pendingSearches.size());

        for (FailedSearch pending : pendingSearches) {
            List<ApiDocument> newlyFoundApis = githubService.fetchApisFromGithub(pending.getSearchString());
            if (!newlyFoundApis.isEmpty()) {
                masterDataList.addAll(newlyFoundApis);

                pending.setStatus(FailedSearch.SearchStatus.RESOLVED);
                pending.setResolvedAt(LocalDateTime.now());
                failedRepo.save(pending);
            }
        }

        if (!masterDataList.isEmpty()) {
            indexer.feedToEngine(masterDataList);
            log.info("Retry pipeline complete. Indexed {} recovered API documents.", masterDataList.size());
            return;
        }

        log.info("Retry pipeline complete. No APIs recovered from pending failed searches.");
    }
}
