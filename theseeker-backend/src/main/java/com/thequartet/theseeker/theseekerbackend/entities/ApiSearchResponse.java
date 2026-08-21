package com.thequartet.theseeker.theseekerbackend.entities;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ApiSearchResponse {
    private List<ApiSearchResult> results;
    private double executionTime;
}
