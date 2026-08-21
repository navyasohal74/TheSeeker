package com.thequartet.theseeker.theseekerbackend.entities;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiSearchResult {
    private String apiName;
    private String description;
    private String authType;
    private String url;
    private int upvotes;
    private float score;
}
