package com.thequartet.theseeker.theseekerbackend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thequartet.theseeker.theseekerbackend.entities.ApiDocument;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
@Slf4j
public class ApiCrawlerService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ApiDocument> fetchFromDirectories(String searchQuery) {
        List<ApiDocument> consolidatedApis = new ArrayList<>();

        log.warn("Fetching data for query: {}", (searchQuery == null ? "ALL" : searchQuery));

        consolidatedApis.addAll(fetchFromFreePublicApis(searchQuery));
        consolidatedApis.addAll(fetchFromApisGuru(searchQuery));
        consolidatedApis.addAll(fetchFromRapidApi(searchQuery));

        return consolidatedApis;
    }

    private List<ApiDocument> fetchFromRapidApi(String searchQuery) {
        List<ApiDocument> apiList = new ArrayList<>();
        try {
            log.info("Starting ETL extraction from RapidAPI...");
            String url = "https://rapidapi.com/collection/list-of-free-apis";

            // 1. Extract raw HTML/Next.js payload containing the API collection
            String response = restTemplate.getForObject(url, String.class);
            if (response == null) return apiList;

            // 2. Unescape the Next.js JSON state for easier parsing
            String normalizedPayload = response.replace("\\\"", "\"");

            // 3. Transformation Phase: Parse out the API formats matching RapidAPI's category/items structure
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile(
                    "\"name\":\"([^\"]+)\".{0,150}?\"shortDescription\":\"([^\"]+)\".{0,150}?\"slugifiedName\":\"([^\"]+)\""
            ).matcher(normalizedPayload);

            while (matcher.find()) {
                String title = matcher.group(1);
                String desc = matcher.group(2);
                String slug = matcher.group(3);
                String link = "https://rapidapi.com/category/" + slug;

                if (searchQuery != null && !searchQuery.isEmpty()) {
                    String queryLower = searchQuery.toLowerCase();
                    if (!title.toLowerCase().contains(queryLower) && !desc.toLowerCase().contains(queryLower)) {
                        continue;
                    }
                }

                // Add to standard ApiDocument format
                apiList.add(new ApiDocument(title, desc, "RapidAPI / Freemium", link, 85));
            }
            log.info("Extracted {} items from RapidAPI list.", apiList.size());
        } catch (Exception e) {
            log.error("RapidAPI ETL transformation failed: {}", e.getMessage());
        }
        return apiList;
    }

    private List<ApiDocument> fetchFromFreePublicApis(String searchQuery) {
        List<ApiDocument> apiList = new ArrayList<>();
        try {
            String url = "https://www.freepublicapis.com/api/apis";
            if (searchQuery != null && !searchQuery.isEmpty()) {
                url += "?query=" + searchQuery.replace(" ", "%20");
            }

            String jsonResponse = restTemplate.getForObject(url, String.class);
            JsonNode rootArray = objectMapper.readTree(jsonResponse);

            for (JsonNode node : rootArray) {
                String title = node.path("title").asText("");
                String desc = node.path("description").asText("");
                String link = node.path("url").asText("");
                String auth = node.path("auth").asText("Unknown");

                int baseAuthority = 50;

                apiList.add(new ApiDocument(title, desc, auth, link, baseAuthority));
            }
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
        return apiList;
    }

    private List<ApiDocument> fetchFromApisGuru(String searchQuery) {
        List<ApiDocument> apiList = new ArrayList<>();
        try {
            String url = "https://api.apis.guru/v2/list.json";
            String jsonResponse = restTemplate.getForObject(url, String.class);
            JsonNode rootObject = objectMapper.readTree(jsonResponse);

            Iterator<String> fieldNames = rootObject.fieldNames();

            while (fieldNames.hasNext()) {
                String apiName = fieldNames.next();

                JsonNode apiData = rootObject.get(apiName);

                JsonNode versions = apiData.path("versions");
                if (!versions.isEmpty()) {
                    for (JsonNode versionNode : versions) {
                        JsonNode info = versionNode.path("info");

                        String title = info.path("title").asText("");
                        String desc = info.path("description").asText("");

                        String link = "Unknown URL";
                        JsonNode origins = info.path("x-origin");
                        if (origins.isArray() && !origins.isEmpty()) {
                            link = origins.get(0).path("url").asText("Unknown URL");
                        }

                        if (searchQuery != null && !searchQuery.isEmpty()) {
                            String queryLower = searchQuery.toLowerCase();
                            if (!title.toLowerCase().contains(queryLower) && !desc.toLowerCase().contains(queryLower)) {
                                break;
                            }
                        }

                        apiList.add(new ApiDocument(title, desc, "Varies", link, 75));
                        break;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
        return apiList;
    }
}
