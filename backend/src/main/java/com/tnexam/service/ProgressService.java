package com.tnexam.service;

import com.tnexam.model.Result;
import com.tnexam.model.ResourceActivity;
import com.tnexam.repository.ResultRepository;
import com.tnexam.repository.ResourceActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ProgressService {

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private ResourceActivityRepository resourceActivityRepository;

    public Map<String, Object> getUserProgress(String userId) {
        System.out.println("=== ProgressService.getUserProgress ===");
        System.out.println("Fetching results for userId: " + userId);
        
        List<Result> userResults = resultRepository.findByUserId(userId);
        System.out.println("Found " + userResults.size() + " results");
        
        List<ResourceActivity> userActivities = resourceActivityRepository.findByUserId(userId);
        System.out.println("Found " + userActivities.size() + " activities");
        
        Map<String, Object> progress = new HashMap<>();
        progress.put("userId", userId);
        progress.put("totalQuizzes", userResults.size());
        progress.put("resourcesAccessed", userActivities.size());
        progress.put("completedResources", userActivities.stream().filter(ResourceActivity::isCompleted).count());
        
        // Calculate unique subjects from both quizzes and resources
        Set<String> subjects = new HashSet<>();
        userResults.forEach(r -> {
            if (r.getSubject() != null) subjects.add(r.getSubject());
        });
        userActivities.forEach(a -> {
            if (a.getSubject() != null) subjects.add(a.getSubject());
        });
        progress.put("subjectsCovered", subjects.size());
        
        if (userResults.isEmpty()) {
            progress.put("averageScore", 0);
            progress.put("testsTaken", 0);
        } else {
            double totalScore = 0;
            for (Result result : userResults) {
                totalScore += (result.getScore() / (double) result.getTotalMarks()) * 100;
            }
            
            double avgScore = totalScore / userResults.size();
            progress.put("averageScore", Math.round(avgScore * 100.0) / 100.0);
            progress.put("testsTaken", userResults.stream().filter(r -> r.getQuizTitle() != null && r.getQuizTitle().contains("Test")).count());
        }
        
        // Recent activities (both quizzes and resources)
        List<Map<String, Object>> recentActivities = new ArrayList<>();
        
        // Add recent quiz results
        userResults.stream()
            .sorted((a, b) -> b.getCompletedAt().compareTo(a.getCompletedAt()))
            .limit(5)
            .forEach(r -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", "quiz");
                activity.put("title", r.getQuizTitle());
                activity.put("subject", r.getSubject());
                activity.put("score", (r.getScore() * 100.0) / r.getTotalMarks());
                activity.put("date", r.getCompletedAt().toString());
                recentActivities.add(activity);
            });
        
        // Add recent resource activities
        userActivities.stream()
            .sorted((a, b) -> b.getLastAccessedAt().compareTo(a.getLastAccessedAt()))
            .limit(5)
            .forEach(a -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", "resource");
                activity.put("title", a.getResourceTitle());
                activity.put("subject", a.getSubject());
                activity.put("resourceType", a.getResourceType());
                activity.put("completed", a.isCompleted());
                activity.put("date", a.getLastAccessedAt().toString());
                recentActivities.add(activity);
            });
        
        progress.put("recentActivities", recentActivities);
        
        return progress;
    }

    public Map<String, Object> getTopicWiseProgress(String userId) {
        List<Result> userResults = resultRepository.findByUserId(userId);
        
        Map<String, Map<String, Object>> topicProgress = new HashMap<>();
        
        for (Result result : userResults) {
            String subject = result.getSubject() != null ? result.getSubject() : "General";
            
            topicProgress.putIfAbsent(subject, new HashMap<>());
            Map<String, Object> subjectData = topicProgress.get(subject);
            
            int testCount = (Integer) subjectData.getOrDefault("testCount", 0);
            double totalScore = ((Number) subjectData.getOrDefault("totalScore", 0.0)).doubleValue();
            double totalMarks = ((Number) subjectData.getOrDefault("totalMarks", 0.0)).doubleValue();
            
            // Add current result to totals
            testCount = testCount + 1;
            totalScore = totalScore + result.getScore();
            totalMarks = totalMarks + result.getTotalMarks();
            
            subjectData.put("testCount", testCount);
            subjectData.put("totalScore", totalScore);
            subjectData.put("totalMarks", totalMarks);
            
            // Calculate percentage after adding current result
            if (totalMarks > 0) {
                double percent = (totalScore / totalMarks) * 100;
                subjectData.put("percentage", Math.round(percent * 100.0) / 100.0);
            } else {
                subjectData.put("percentage", 0.0);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("topicWise", topicProgress);
        return result;
    }

    public void syncUserProgress(String userId, Map<String, Object> progressData) {
        // Placeholder for syncing progress data from client
        // In production, update MongoDB with the synced progress
    }
}
