package com.thequartet.theseeker.theseekerbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TheseekerBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(TheseekerBackendApplication.class, args);
    }

}
