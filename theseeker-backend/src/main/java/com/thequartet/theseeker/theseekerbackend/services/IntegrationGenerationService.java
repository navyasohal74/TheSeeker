package com.thequartet.theseeker.theseekerbackend.services;

import com.thequartet.theseeker.theseekerbackend.controllers.dto.IntegrationResponse;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.SearcherManager;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopDocs;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.stereotype.Service;

import org.springframework.ai.converter.BeanOutputConverter;
import java.io.IOException;
import java.util.Map;

@Service
public class IntegrationGenerationService {

    private final SearcherManager searcherManager;
    private final ChatClient chatClient;

    public IntegrationGenerationService(SearcherManager searcherManager, ChatClient.Builder chatClientBuilder) {
        this.searcherManager = searcherManager;
        this.chatClient = chatClientBuilder.build();
    }

    public IntegrationResponse generateIntegration(String apiUrl, String language) throws IOException {
        IndexSearcher searcher = null;
        try {
            searcher = searcherManager.acquire();

            TermQuery query = new TermQuery(new Term("url", apiUrl));
            TopDocs topDocs = searcher.search(query, 1);

                if (topDocs.totalHits.value() == 0) {
                return null;
            }

            Document luceneDoc = searcher.storedFields().document(topDocs.scoreDocs[0].doc);

            String retrievedUrl = luceneDoc.get("url");
            String retrievedDescription = luceneDoc.get("description");
            String retrievedHeaders = luceneDoc.get("headers");

            BeanOutputConverter<IntegrationResponse> converter = new BeanOutputConverter<>(IntegrationResponse.class);
            String format = converter.getFormat();

            String strictPrompt = """
                    You are an expert engineer. Use ONLY the provided API schema.
                    Do not invent or hallucinate endpoints. Generate two things:
                    1. A very concise Markdown README (max 3-4 sentences).
                    2. A short, production-ready code snippet in the {language} programming language to make a GET request to this API.
                    
                    IMPORTANT: Keep your entire response under 400 words. Do not include any extra conversational text or explanations. Your output MUST be a complete and valid JSON object safely avoiding token limits. Ensure the JSON is fully closed.
                    
                    API URL: {apiUrl}
                    Description: {description}
                    Headers: {headers}
                    
                    {format}
                    """;

            PromptTemplate promptTemplate = new PromptTemplate(strictPrompt);
            String promptText = promptTemplate.render(Map.of(
                    "language", language,
                    "apiUrl", retrievedUrl,
                    "description", retrievedDescription,
                     "headers", retrievedHeaders != null ? retrievedHeaders : "None",
                    "format", format
            ));

            String responseContent = chatClient.prompt()
                    .user(promptText)
                    .call()
                    .content();

            return converter.convert(responseContent);

        } finally {
            if (searcher != null) {
                searcherManager.release(searcher);
            }
        }
    }
}
