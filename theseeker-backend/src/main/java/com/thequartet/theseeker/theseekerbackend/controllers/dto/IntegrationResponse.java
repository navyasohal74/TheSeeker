package com.thequartet.theseeker.theseekerbackend.controllers.dto;

public class IntegrationResponse {

    private String markdownDocs;
    private String codeSnippet;

    public IntegrationResponse() {}

    public IntegrationResponse(String markdownDocs, String codeSnippet) {
        this.markdownDocs = markdownDocs;
        this.codeSnippet = codeSnippet;
    }

    public String getMarkdownDocs() {
        return markdownDocs;
    }

    public void setMarkdownDocs(String markdownDocs) {
        this.markdownDocs = markdownDocs;
    }

    public String getCodeSnippet() {
        return codeSnippet;
    }

    public void setCodeSnippet(String codeSnippet) {
        this.codeSnippet = codeSnippet;
    }
}

