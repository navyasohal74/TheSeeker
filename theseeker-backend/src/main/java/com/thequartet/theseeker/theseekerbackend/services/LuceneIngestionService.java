package com.thequartet.theseeker.theseekerbackend.services;

import java.io.IOException;
import java.util.List;

import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.NumericDocValuesField;
import org.apache.lucene.document.StoredField;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.SearcherManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.thequartet.theseeker.theseekerbackend.entities.ApiDocument;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LuceneIngestionService {

    private static final Logger log = LoggerFactory.getLogger(LuceneIngestionService.class);

    private final IndexWriter indexWriter;
    private final SearcherManager searcherManager;

    public void feedToEngine(List<ApiDocument> apiDataList) {
        try {

            for (ApiDocument api : apiDataList) {
                Document doc = new Document();

                doc.add(new TextField("apiName", api.getApiName(), Field.Store.YES));
                doc.add(new StringField("apiName_exact", api.getApiName(), Field.Store.YES));
                doc.add(new TextField("description", api.getDescription(), Field.Store.YES));
                doc.add(new TextField("authType", api.getAuthType(), Field.Store.YES));
                doc.add(new StringField("url", api.getUrl() == null ? "" : api.getUrl(), Field.Store.YES));

                doc.add(new NumericDocValuesField("authority_score", api.getUpvotes()));
                doc.add(new StoredField("authority_score_display", api.getUpvotes()));

                Term uniqueIdentifier = new Term("url", api.getUrl());
                indexWriter.updateDocument(uniqueIdentifier, doc);
            }

            indexWriter.commit();
            searcherManager.maybeRefreshBlocking();
            log.info("Lucene index updated successfully with {} API docs.", apiDataList.size());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to update Lucene index", e);
        }
    }
}
