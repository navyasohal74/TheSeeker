package com.thequartet.theseeker.theseekerbackend.configuration;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.search.SearcherFactory;
import org.apache.lucene.search.SearcherManager;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Path;

@Configuration
public class LuceneInfrastructureConfig {

    @Bean(destroyMethod = "close")
    public Directory luceneDirectory(@Value("${app.lucene.index-path:my-search-index}") String indexPath) throws IOException {
        return FSDirectory.open(Path.of(indexPath));
    }

    @Bean
    public Analyzer analyzer() {
        return new StandardAnalyzer();
    }

    @Bean(destroyMethod = "close")
    public IndexWriter indexWriter(Directory directory, Analyzer analyzer) throws IOException {
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);
        return new IndexWriter(directory, config);
    }

    @Bean(destroyMethod = "close")
    public SearcherManager searcherManager(IndexWriter indexWriter) throws IOException {
        return new SearcherManager(indexWriter, new SearcherFactory());
    }
}

