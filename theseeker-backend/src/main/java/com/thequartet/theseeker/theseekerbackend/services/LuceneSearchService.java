package com.thequartet.theseeker.theseekerbackend.services;

import com.thequartet.theseeker.theseekerbackend.entities.Document;
import lombok.RequiredArgsConstructor;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.queryparser.classic.MultiFieldQueryParser;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LuceneSearchService {

    private static final Logger log = LoggerFactory.getLogger(LuceneSearchService.class);

    private static final Map<String, Float> BOOSTS = Map.of(
            "title", 10.0f,
            "content", 1.0f
    );

    private final Analyzer analyzer;
    private final IndexWriter indexWriter;
    private final SearcherManager searcherManager;

    public void addDocument(Document doc) {
        try {
            org.apache.lucene.document.Document luceneDoc = new org.apache.lucene.document.Document();
            luceneDoc.add(new StringField("id", String.valueOf(doc.getId()), Field.Store.YES));
            luceneDoc.add(new TextField("content", safe(doc.getContent()), Field.Store.YES));
            luceneDoc.add(new TextField("title", safe(doc.getTitle()), Field.Store.YES));
            luceneDoc.add(new StringField("url", safe(doc.getUrl()), Field.Store.YES));

            indexWriter.addDocument(luceneDoc);
            indexWriter.commit();
            searcherManager.maybeRefreshBlocking();
        } catch (IOException e) {
            throw new IllegalStateException("Error indexing document", e);
        }
    }

    public List<Document> search(String q) {
        if (q == null || q.isBlank()) {
            return List.of();
        }

        IndexSearcher searcher = null;
        try {
            searcher = searcherManager.acquire();

            MultiFieldQueryParser queryParser = new MultiFieldQueryParser(
                    new String[]{"title", "content"},
                    analyzer,
                    BOOSTS
            );
            queryParser.setDefaultOperator(QueryParser.Operator.OR);

            Query query = parseQueryWithEscapeFallback(queryParser, q);
            TopDocs topDocs = searcher.search(query, 10);

            List<Document> results = new ArrayList<>(topDocs.scoreDocs.length);
            for (ScoreDoc scoreDoc : topDocs.scoreDocs) {
                org.apache.lucene.document.Document luceneDoc = searcher.storedFields().document(scoreDoc.doc);
                results.add(new Document(
                        Integer.parseInt(luceneDoc.get("id")),
                        luceneDoc.get("title"),
                        luceneDoc.get("url"),
                        luceneDoc.get("content")
                ));
            }
            return results;
        } catch (IOException e) {
            throw new IllegalStateException("Error searching Lucene index", e);
        } finally {
            if (searcher != null) {
                try {
                    searcherManager.release(searcher);
                } catch (IOException e) {
                    log.warn("Failed to release Lucene searcher", e);
                }
            }
        }
    }

    private Query parseQueryWithEscapeFallback(MultiFieldQueryParser parser, String rawQuery) {
        try {
            return parser.parse(rawQuery);
        } catch (ParseException firstParseException) {
            String escaped = QueryParser.escape(rawQuery);
            try {
                return parser.parse(escaped);
            } catch (ParseException secondParseException) {
                throw new IllegalArgumentException("Invalid query syntax", secondParseException);
            }
        }
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
