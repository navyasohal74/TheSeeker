package com.thequartet.theseeker.theseekerbackend.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.index.Term;
import org.apache.lucene.queries.function.FunctionScoreQuery;
import org.apache.lucene.queryparser.classic.MultiFieldQueryParser;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.DoubleValuesSource;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.MatchAllDocsQuery;
import org.apache.lucene.search.PrefixQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.SearcherManager;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopDocs;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.thequartet.theseeker.theseekerbackend.entities.ApiDocument;

@Service
public class DynamicSearchService {

    private static final Logger log = LoggerFactory.getLogger(DynamicSearchService.class);

    private static final String[] SEARCH_FIELDS = {"apiName", "description", "authType"};

    private static final Map<String, Float> FIELD_BOOSTS = Map.of(
            "apiName", 3.0f,
            "description", 1.0f,
            "authType", 0.8f
    );

    private static final int DEFAULT_LIMIT = 10;

    private final SearcherManager searcherManager;
    private final Analyzer analyzer;

    public DynamicSearchService(SearcherManager searcherManager, Analyzer analyzer) {
        this.searcherManager = searcherManager;
        this.analyzer = analyzer;
    }

    public List<String> getAutocompleteSuggestions(String partialQuery) throws IOException {
        if (partialQuery == null || partialQuery.trim().isBlank()) {
            return List.of();
        }

        String[] words = partialQuery.trim().toLowerCase().split("\\s+");
        BooleanQuery.Builder booleanQueryBuilder = new BooleanQuery.Builder();
        
        for (int i = 0; i < words.length; i++) {
            if (i == words.length - 1) {
                // Evaluate the last word being typed as a prefix
                booleanQueryBuilder.add(new PrefixQuery(new Term("apiName", words[i])), BooleanClause.Occur.MUST);
            } else {
                // Exact match for fully typed words
                booleanQueryBuilder.add(new TermQuery(new Term("apiName", words[i])), BooleanClause.Occur.MUST);
            }
        }

        IndexSearcher searcher = searcherManager.acquire();
        try {
            TopDocs topDocs = searcher.search(booleanQueryBuilder.build(), 5);
            List<String> suggestions = new ArrayList<>();

            for (ScoreDoc scoreDoc : topDocs.scoreDocs) {
                org.apache.lucene.document.Document doc = searcher.storedFields().document(scoreDoc.doc);
                suggestions.add(doc.get("apiName_exact") != null ? doc.get("apiName_exact") : doc.get("apiName"));
            }
            return suggestions;
        } finally {
            searcherManager.release(searcher);
        }
    }

    public TopDocs searchWithAuthority(String queryText) throws IOException {
        if (queryText == null || queryText.isBlank()) {
            throw new IllegalArgumentException("queryText must not be blank");
        }

        IndexSearcher searcher = searcherManager.acquire();
        try {
            Query textQuery = buildTextQuery(queryText);

            DoubleValuesSource authorityBoost = DoubleValuesSource.fromField(
                    "authority_score",
                    rawValue -> Math.log1p(Math.max(rawValue, 0L))
            );

            FunctionScoreQuery finalGoogleLikeQuery = FunctionScoreQuery.boostByValue(textQuery, authorityBoost);
            return searcher.search(finalGoogleLikeQuery, DEFAULT_LIMIT);
        } finally {
            searcherManager.release(searcher);
        }
    }

    public List<ApiSearchHit> searchApiDocumentsWithAuthority(String queryText) throws IOException {
        if (queryText == null || queryText.isBlank()) {
            throw new IllegalArgumentException("queryText must not be blank");
        }

        IndexSearcher searcher = searcherManager.acquire();
        try {
            Query textQuery = buildTextQuery(queryText);

            DoubleValuesSource authorityBoost = DoubleValuesSource.fromField(
                    "authority_score",
                    rawValue -> Math.log1p(Math.max(rawValue, 0L))
            );

            FunctionScoreQuery finalGoogleLikeQuery = FunctionScoreQuery.boostByValue(textQuery, authorityBoost);
            TopDocs topDocs = searcher.search(finalGoogleLikeQuery, DEFAULT_LIMIT);

            List<ApiSearchHit> hits = new ArrayList<>(topDocs.scoreDocs.length);
            for (ScoreDoc scoreDoc : topDocs.scoreDocs) {
                org.apache.lucene.document.Document doc = searcher.storedFields().document(scoreDoc.doc);
                ApiDocument apiDocument = ApiDocument.builder()
                        .apiName(defaultString(doc.get("apiName")))
                        .description(defaultString(doc.get("description")))
                        .authType(defaultString(doc.get("authType")))
                        .url(defaultString(doc.get("url")))
                        .upvotes(parseInt(defaultString(doc.get("authority_score_display"))))
                        .build();

                hits.add(new ApiSearchHit(apiDocument, scoreDoc.score));
            }
            return hits;
        } finally {
            searcherManager.release(searcher);
        }
    }

    public List<ApiDocument> getAllIngestedApis(int limit) throws IOException {
        if (limit <= 0) {
            throw new IllegalArgumentException("limit must be greater than 0");
        }

        IndexSearcher searcher = searcherManager.acquire();
        try {
            TopDocs topDocs = searcher.search(MatchAllDocsQuery.INSTANCE, limit);
            List<ApiDocument> allApis = new ArrayList<>(topDocs.scoreDocs.length);

            for (ScoreDoc scoreDoc : topDocs.scoreDocs) {
                org.apache.lucene.document.Document doc = searcher.storedFields().document(scoreDoc.doc);

                String authType = defaultString(doc.get("authType"));
                if (authType.isBlank()) {
                    authType = "Unknown";
                }

                String upvotesRaw = doc.get("authority_score_display");
                if (upvotesRaw == null || upvotesRaw.isBlank()) {
                    upvotesRaw = doc.get("upvotes_display");
                }

                allApis.add(ApiDocument.builder()
                        .apiName(defaultString(doc.get("apiName")))
                        .description(defaultString(doc.get("description")))
                        .authType(authType)
                        .url(defaultString(doc.get("url")))
                        .upvotes(parseInt(upvotesRaw))
                        .build());
            }

            return allApis;
        } finally {
            searcherManager.release(searcher);
        }
    }

    private Query buildTextQuery(String queryText) {
        // Pre-process query to strip out common domain noise words for natural language API searches
        String cleanedQuery = queryText.replaceAll("(?i)\\b(best|top|free|api'?s?|for|the|how|to|find|a|an)\\b", " ")
                                       .replaceAll("\\s+", " ")
                                       .trim();

        // Fallback to original if stripping left the query empty
        if (cleanedQuery.isBlank()) {
            cleanedQuery = queryText;
        }

        MultiFieldQueryParser parser = new MultiFieldQueryParser(SEARCH_FIELDS, analyzer, FIELD_BOOSTS);
        // Switch to OR operator to be more forgiving with natural language queries
        parser.setDefaultOperator(QueryParser.Operator.OR);

        try {
            return parser.parse(cleanedQuery);
        } catch (ParseException parseException) {
            String escapedQuery = QueryParser.escape(cleanedQuery);
            log.warn("Failed to parse raw query. Falling back to escaped query. raw='{}'", cleanedQuery, parseException);
            try {
                return parser.parse(escapedQuery);
            } catch (ParseException escapedParseException) {
                throw new IllegalArgumentException("Invalid query syntax", escapedParseException);
            }
        }
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    private int parseInt(String value) {
        if (value == null || value.isBlank()) {
            return 0;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            log.warn("Unable to parse authority score '{}' from stored field. Falling back to 0.", value);
            return 0;
        }
    }

    public record ApiSearchHit(ApiDocument document, float score) {
    }
}
