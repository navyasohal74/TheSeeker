package com.thequartet.theseeker.theseekerbackend.controllers.dto;

public record FailedSearchRecordResponse(
        String query,
        String status,
        boolean created
) {
}

