package com.thequartet.theseeker.theseekerbackend.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiDocument {
    private String apiName;
    private String description;
    private String authType;
    private String url;
    private int upvotes;
}
