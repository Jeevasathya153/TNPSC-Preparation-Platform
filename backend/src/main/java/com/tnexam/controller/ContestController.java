package com.tnexam.controller;

import com.tnexam.model.Contest;
import com.tnexam.model.ContestResult;
import com.tnexam.service.ContestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/contests")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ContestController {

    @Autowired
    private ContestService contestService;

    /**
     * Get active daily contest
     */
    @GetMapping("/daily")
    public ResponseEntity<?> getDailyContest() {
        try {
            Optional<Contest> contest = contestService.getActiveDailyContest();
            if (contest.isPresent()) {
                return ResponseEntity.ok(contest.get());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "No active daily contest found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get active weekly contest
     */
    @GetMapping("/weekly")
    public ResponseEntity<?> getWeeklyContest() {
        try {
            Optional<Contest> contest = contestService.getActiveWeeklyContest();
            if (contest.isPresent()) {
                return ResponseEntity.ok(contest.get());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "No active weekly contest found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get contest by ID
     */
    @GetMapping("/{contestId}")
    public ResponseEntity<?> getContestById(@PathVariable String contestId) {
        try {
            Optional<Contest> contest = contestService.getContestById(contestId);
            if (contest.isPresent()) {
                return ResponseEntity.ok(contest.get());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Contest not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Submit contest result
     */
    @PostMapping("/{contestId}/submit")
    public ResponseEntity<?> submitContestResult(
            @PathVariable String contestId,
            @RequestBody ContestResult result) {
        try {
            result.setContestId(contestId);
            ContestResult savedResult = contestService.submitContestResult(result);
            return ResponseEntity.ok(savedResult);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get leaderboard for a contest
     */
    @GetMapping("/{contestId}/leaderboard")
    public ResponseEntity<?> getLeaderboard(@PathVariable String contestId) {
        try {
            List<ContestResult> leaderboard = contestService.getContestLeaderboard(contestId);
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get top performers for a contest
     */
    @GetMapping("/{contestId}/top-performers")
    public ResponseEntity<?> getTopPerformers(@PathVariable String contestId) {
        try {
            List<ContestResult> topPerformers = contestService.getTopPerformers(contestId);
            return ResponseEntity.ok(topPerformers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get contest statistics
     */
    @GetMapping("/{contestId}/stats")
    public ResponseEntity<?> getContestStats(@PathVariable String contestId) {
        try {
            Map<String, Object> stats = contestService.getContestStats(contestId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check if user has participated in a contest
     */
    @GetMapping("/{contestId}/check-participation/{userId}")
    public ResponseEntity<?> checkParticipation(
            @PathVariable String contestId,
            @PathVariable String userId) {
        try {
            boolean hasParticipated = contestService.hasUserParticipated(userId, contestId);
            Optional<ContestResult> result = contestService.getUserContestResult(userId, contestId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasParticipated", hasParticipated);
            if (result.isPresent()) {
                response.put("result", result.get());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get user's contest history
     */
    @GetMapping("/user/{userId}/history")
    public ResponseEntity<?> getUserContestHistory(@PathVariable String userId) {
        try {
            List<ContestResult> history = contestService.getUserContestHistory(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get user's result for a specific contest
     */
    @GetMapping("/{contestId}/user/{userId}")
    public ResponseEntity<?> getUserContestResult(
            @PathVariable String contestId,
            @PathVariable String userId) {
        try {
            Optional<ContestResult> result = contestService.getUserContestResult(userId, contestId);
            if (result.isPresent()) {
                return ResponseEntity.ok(result.get());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "User has not participated in this contest"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get recent contests
     */
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentContests() {
        try {
            List<Contest> contests = contestService.getRecentContests();
            return ResponseEntity.ok(contests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all daily contests
     */
    @GetMapping("/type/daily")
    public ResponseEntity<?> getAllDailyContests() {
        try {
            List<Contest> contests = contestService.getContestsByType("DAILY");
            return ResponseEntity.ok(contests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all weekly contests
     */
    @GetMapping("/type/weekly")
    public ResponseEntity<?> getAllWeeklyContests() {
        try {
            List<Contest> contests = contestService.getContestsByType("WEEKLY");
            return ResponseEntity.ok(contests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Manually trigger daily contest creation (for testing)
     */
    @PostMapping("/create/daily")
    public ResponseEntity<?> createDailyContest() {
        try {
            contestService.createDailyContest();
            Optional<Contest> contest = contestService.getActiveDailyContest();
            return ResponseEntity.ok(contest.orElse(null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Manually trigger weekly contest creation (for testing)
     */
    @PostMapping("/create/weekly")
    public ResponseEntity<?> createWeeklyContest() {
        try {
            contestService.createWeeklyContest();
            Optional<Contest> contest = contestService.getActiveWeeklyContest();
            return ResponseEntity.ok(contest.orElse(null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}
