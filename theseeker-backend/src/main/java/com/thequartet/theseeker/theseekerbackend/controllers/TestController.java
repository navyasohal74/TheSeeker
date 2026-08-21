package com.thequartet.theseeker.theseekerbackend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/test-backend")
    public String testBackend() {
        return "Backend is running.";
    }

    @GetMapping("/test-conntection")
    public String testConnection() {
        return "Backend is connected with frontend...";
    }

}
