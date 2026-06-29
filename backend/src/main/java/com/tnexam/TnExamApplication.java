package com.tnexam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TnExamApplication {

    public static void main(String[] args) {
        SpringApplication.run(TnExamApplication.class, args);
    }
}
