package com.tnexam.controller;

import com.tnexam.model.ResourceActivity;
import com.tnexam.service.ResourceActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/resource-activities")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:5173"})
public class ResourceActivityController {

    @Autowired
    private ResourceActivityService resourceActivityService;

    @PostMapping
    public ResponseEntity<?> trackResourceActivity(@RequestBody ResourceActivity activity) {
        try {
            ResourceActivity saved = resourceActivityService.trackResourceAccess(activity);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error tracking resource activity: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserActivities(@PathVariable String userId) {
        try {
            List<ResourceActivity> activities = resourceActivityService.getUserActivities(userId);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching activities: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user/{userId}/type/{resourceType}")
    public ResponseEntity<?> getUserActivitiesByType(
            @PathVariable String userId, 
            @PathVariable String resourceType) {
        try {
            List<ResourceActivity> activities = 
                resourceActivityService.getUserActivitiesByType(userId, resourceType);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching activities: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<?> getUserResourceStats(@PathVariable String userId) {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalResourcesAccessed", resourceActivityService.getUserTotalResourcesAccessed(userId));
            stats.put("completedResources", resourceActivityService.getUserCompletedResources(userId));
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching stats: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteActivity(@PathVariable String id) {
        try {
            resourceActivityService.deleteActivity(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Activity deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error deleting activity: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
