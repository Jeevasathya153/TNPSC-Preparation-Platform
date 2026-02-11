package com.tnexam.controller;

import com.tnexam.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/progress")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:5173"})
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserProgress(@PathVariable String userId) {
        System.out.println("==============================================");
        System.out.println("=== ProgressController.getUserProgress ===");
        System.out.println("Requested userId: " + userId);
        try {
            Map<String, Object> progress = progressService.getUserProgress(userId);
            System.out.println("Progress data: " + progress);
            System.out.println("==============================================");
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            System.out.println("==============================================");
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching progress: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user/{userId}/topic-wise")
    public ResponseEntity<?> getUserTopicProgress(@PathVariable String userId) {
        try {
            Map<String, Object> topicProgress = progressService.getTopicWiseProgress(userId);
            return ResponseEntity.ok(topicProgress);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching topic progress: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/user/{userId}/sync")
    public ResponseEntity<?> syncProgress(@PathVariable String userId, @RequestBody Map<String, Object> progressData) {
        try {
            progressService.syncUserProgress(userId, progressData);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Progress synced successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error syncing progress: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
