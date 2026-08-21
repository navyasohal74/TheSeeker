package com.thequartet.theseeker.theseekerbackend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thequartet.theseeker.theseekerbackend.entities.ApiDocument;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class GitHubIntegrationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ApiDocument> fetchApisFromGithub(String failedSearchQuery) {
        List<ApiDocument> priorityApis = new ArrayList<>();

        try {
            String githubApiUrl = "https://api.github.com/search/repositories?q="
                    + failedSearchQuery + "+api&sort=stars&order=desc&per_page=3";

            // Call Github:
            String jsonResponses = restTemplate.getForObject(githubApiUrl, String.class);

            // Parse JSON Tree:
            JsonNode root = objectMapper.readTree(jsonResponses);
            JsonNode items = root.path("items");

            for (JsonNode item : items) {
                 String name = item.path("name").asText("");
                String desc = item.path("description").asText("");
                String url = item.path("url").asText("");
                int stars = item.path("stargazers_count").asInt();
                
                priorityApis.add(
                        ApiDocument.builder()
                                .apiName(name)
                                .description(desc)
                                .authType("GitHub Repo / Varies")
                                .url(url)
                                .upvotes(stars)
                                .build()
                );
            }

            log.info("Successfully pulled {} repositories from GitHub for: {}", priorityApis.size(), failedSearchQuery);

        } catch (Exception e) {
            log.error("Failed to fetch from Github for query: {}", failedSearchQuery);
            e.printStackTrace();
        }

        return priorityApis;
    }

}
