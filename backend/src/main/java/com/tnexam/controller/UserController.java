package com.tnexam.controller;

import com.tnexam.model.User;
import com.tnexam.model.Result;
import com.tnexam.service.UserService;
import com.tnexam.service.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:5173"})
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ResultService resultService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        Optional<User> user = userService.getUserById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("message", "User not found");
        return ResponseEntity.badRequest().body(error);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.getUserByEmail(email);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("message", "User not found");
        return ResponseEntity.badRequest().body(error);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User userDetails) {
        User updatedUser = userService.updateUser(id, userDetails);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("message", "User not found");
        return ResponseEntity.badRequest().body(error);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/stats/{userId}")
    public ResponseEntity<?> getUserStats(@PathVariable String userId) {
        try {
            List<Result> results = resultService.getResultsByUserId(userId);
            
            int testsCompleted = results.size();
            double averageScore = 0.0;
            int totalStudyHours = 0;
            
            if (!results.isEmpty()) {
                double totalPercentage = 0.0;
                for (Result result : results) {
                    if (result.getTotalMarks() > 0) {
                        totalPercentage += (result.getScore() * 100.0) / result.getTotalMarks();
                    }
                }
                averageScore = totalPercentage / results.size();
            }
            
            // Calculate study hours (estimate: 30 minutes per quiz)
            totalStudyHours = (testsCompleted * 30) / 60;
            
            // Calculate streak (simplified - count recent results)
            int currentStreak = Math.min(results.size(), 7);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("testsCompleted", testsCompleted);
            stats.put("averageScore", String.format("%.0f%%", averageScore));
            stats.put("studyHours", totalStudyHours);
            stats.put("currentStreak", currentStreak + " days");
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching user stats: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    @GetMapping("/achievements/{userId}")
    public ResponseEntity<?> getUserAchievements(@PathVariable String userId) {
        try {
            List<Result> results = resultService.getResultsByUserId(userId);
            List<Map<String, Object>> achievements = new ArrayList<>();
            
            // Achievement 1: First Step - Complete first quiz
            if (results.size() >= 1) {
                Map<String, Object> achievement = new HashMap<>();
                achievement.put("id", 1);
                achievement.put("name", "First Step");
                achievement.put("description", "Completed your first quiz");
                achievement.put("icon", "🎯");
                achievement.put("unlocked", true);
                achievements.add(achievement);
            }
            
            // Achievement 2: Quick Learner - Score 80%+ in 5 quizzes
            long highScores = results.stream()
                .filter(r -> r.getTotalMarks() > 0 && (r.getScore() * 100.0 / r.getTotalMarks()) >= 80)
                .count();
            
            if (highScores >= 5) {
                Map<String, Object> achievement = new HashMap<>();
                achievement.put("id", 2);
                achievement.put("name", "Quick Learner");
                achievement.put("description", "Scored 80%+ in 5 quizzes");
                achievement.put("icon", "⚡");
                achievement.put("unlocked", true);
                achievements.add(achievement);
            }
            
            // Achievement 3: Consistent - Complete 7 quizzes
            if (results.size() >= 7) {
                Map<String, Object> achievement = new HashMap<>();
                achievement.put("id", 3);
                achievement.put("name", "Consistent");
                achievement.put("description", "Completed 7 quizzes");
                achievement.put("icon", "🏆");
                achievement.put("unlocked", true);
                achievements.add(achievement);
            }
            
            // Achievement 4: Master - Complete 10+ quizzes
            if (results.size() >= 10) {
                Map<String, Object> achievement = new HashMap<>();
                achievement.put("id", 4);
                achievement.put("name", "Master");
                achievement.put("description", "Completed 10+ quizzes");
                achievement.put("icon", "👑");
                achievement.put("unlocked", true);
                achievements.add(achievement);
            }
            
            // Achievement 5: Perfect Score - Get 100% in any quiz
            boolean hasPerfectScore = results.stream()
                .anyMatch(r -> r.getTotalMarks() > 0 && r.getScore() == r.getTotalMarks());
            
            if (hasPerfectScore) {
                Map<String, Object> achievement = new HashMap<>();
                achievement.put("id", 5);
                achievement.put("name", "Perfect Score");
                achievement.put("description", "Achieved 100% in a quiz");
                achievement.put("icon", "💯");
                achievement.put("unlocked", true);
                achievements.add(achievement);
            }
            
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching achievements: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
