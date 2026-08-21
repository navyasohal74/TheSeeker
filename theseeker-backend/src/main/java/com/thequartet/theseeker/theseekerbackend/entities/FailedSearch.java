package com.thequartet.theseeker.theseekerbackend.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name="failed_searches")
public class FailedSearch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 512)
    private String searchString;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private SearchStatus status = SearchStatus.PENDING;

    private LocalDateTime resolvedAt;

    public enum SearchStatus { PENDING, RESOLVED }

}