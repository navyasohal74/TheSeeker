package com.thequartet.theseeker.theseekerbackend.entities;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SearchResponse {
    private List<Document> results;
    private double executionTime;
}
