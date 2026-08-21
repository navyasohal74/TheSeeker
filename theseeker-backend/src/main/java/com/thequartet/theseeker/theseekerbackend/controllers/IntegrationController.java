package com.thequartet.theseeker.theseekerbackend.controllers;

import com.thequartet.theseeker.theseekerbackend.controllers.dto.IntegrationResponse;
import com.thequartet.theseeker.theseekerbackend.services.IntegrationGenerationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api")
public class IntegrationController {

    private final IntegrationGenerationService integrationGenerationService;

    public IntegrationController(IntegrationGenerationService integrationGenerationService) {
        this.integrationGenerationService = integrationGenerationService;
    }

    @GetMapping("/generate-integration")
    public ResponseEntity<IntegrationResponse> generateIntegration(
            @RequestParam String apiUrl,
            @RequestParam String language) {
        try {
            IntegrationResponse response = integrationGenerationService.generateIntegration(apiUrl, language);

            if (response == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

