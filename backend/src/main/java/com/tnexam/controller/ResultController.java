package com.tnexam.controller;

import com.tnexam.entity.Result;
import com.tnexam.service.ResultService;
import com.tnexam.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/results")
public class ResultController {
    
    private final ResultService resultService;
    private final NotificationService notificationService;

    public ResultController(ResultService resultService, NotificationService notificationService) {
        this.resultService = resultService;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Result>> getAllResults() {
        return ResponseEntity.ok(resultService.getAllResults());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResultById(@PathVariable String id) {
        Optional<Result> result = resultService.getResultById(id);
        if (result.isPresent()) {
            return ResponseEntity.ok(result.get());
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("message", "Result not found");
        return ResponseEntity.badRequest().body(error);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Result>> getResultsByUserId(@PathVariable String userId) {
        List<Result> results = resultService.getResultsByUserId(userId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<Result>> getResultsByQuizId(@PathVariable String quizId) {
        return ResponseEntity.ok(resultService.getResultsByQuizId(quizId));
    }

    @GetMapping("/contest/{contestType}")
    public ResponseEntity<List<Result>> getResultsByContestType(@PathVariable String contestType) {
        List<Result> results = resultService.getResultsByContestType(contestType);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/user/{userId}/average")
    public ResponseEntity<?> getUserAverageScore(@PathVariable String userId) {
        double average = resultService.getUserAverageScore(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("averageScore", average);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> submitResult(@RequestBody Result result) {
        Result savedResult = resultService.submitQuizResult(result);
        
        // Create notification for quiz completion
        if (savedResult.getUserId() != null) {
            notificationService.createQuizCompletionNotification(
                savedResult.getUserId(), 
                savedResult.getQuizTitle(), 
                savedResult.getScore(), 
                savedResult.getTotalMarks()
            );
        }
        
        return ResponseEntity.ok(savedResult);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResult(@PathVariable String id) {
        resultService.deleteResult(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Result deleted successfully");
        return ResponseEntity.ok(response);
    }

    // Check if user has participated in daily contest
    @GetMapping("/contest/{contestType}/has-participated-today/{userId}")
    public ResponseEntity<?> hasParticipatedToday(@PathVariable String userId, @PathVariable String contestType) {
        boolean participated = resultService.hasParticipatedToday(userId, contestType);
        return ResponseEntity.ok(participated);
    }

    // Check if user has participated in weekly contest
    @GetMapping("/contest/{contestType}/has-participated-this-week/{userId}")
    public ResponseEntity<?> hasParticipatedThisWeek(@PathVariable String userId, @PathVariable String contestType) {
        boolean participated = resultService.hasParticipatedThisWeek(userId, contestType);
        return ResponseEntity.ok(participated);
    }

    @GetMapping("/contest/{contestType}/daily-leaderboard")
    public ResponseEntity<List<Result>> getDailyLeaderboard(@PathVariable String contestType) {
        return ResponseEntity.ok(resultService.getDailyLeaderboard(contestType));
    }

    @GetMapping("/contest/{contestType}/weekly-leaderboard")
    public ResponseEntity<List<Result>> getWeeklyLeaderboard(@PathVariable String contestType) {
        return ResponseEntity.ok(resultService.getWeeklyLeaderboard(contestType));
    }
}
