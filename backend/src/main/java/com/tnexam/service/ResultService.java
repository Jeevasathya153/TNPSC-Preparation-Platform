
package com.tnexam.service;

import com.tnexam.model.Result;
import com.tnexam.repository.ResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class ResultService {
    // Get today's leaderboard for a contest type
    public List<Result> getDailyLeaderboard(String contestType) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return resultRepository.findByContestTypeAndCompletedAtAfter(contestType, startOfDay);
    }

    // Get this week's leaderboard for a contest type
    public List<Result> getWeeklyLeaderboard(String contestType) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.minusDays(today.getDayOfWeek().getValue() - 1); // Monday as start
        LocalDateTime startOfWeekDateTime = startOfWeek.atStartOfDay();
        LocalDateTime endOfWeekDateTime = today.with(java.time.DayOfWeek.SUNDAY).atTime(LocalTime.MAX);
        return resultRepository.findByContestTypeAndCompletedAtBetween(contestType, startOfWeekDateTime, endOfWeekDateTime);
    }

    // Check if user has already participated in daily contest
    public boolean hasParticipatedToday(String userId, String contestType) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return resultRepository.existsByUserIdAndContestTypeAndCompletedAtAfter(userId, contestType, startOfDay);
    }

    // Check if user has already participated in weekly contest
    public boolean hasParticipatedThisWeek(String userId, String contestType) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.minusDays(today.getDayOfWeek().getValue() - 1); // Monday as start
        LocalDateTime startOfWeekDateTime = startOfWeek.atStartOfDay();
        LocalDateTime endOfWeekDateTime = today.with(java.time.DayOfWeek.SUNDAY).atTime(LocalTime.MAX);
        return resultRepository.existsByUserIdAndContestTypeAndCompletedAtBetween(userId, contestType, startOfWeekDateTime, endOfWeekDateTime);
    }
    @Autowired
    private ResultRepository resultRepository;

    public Result submitQuizResult(Result result) {
        return resultRepository.save(result);
    }

    public Optional<Result> getResultById(String id) {
        return resultRepository.findById(id);
    }

    public List<Result> getResultsByUserId(String userId) {
        return resultRepository.findByUserId(userId);
    }

    public List<Result> getResultsByQuizId(String quizId) {
        return resultRepository.findByQuizId(quizId);
    }

    public List<Result> getResultsByContestType(String contestType) {
        return resultRepository.findByContestType(contestType);
    }

    public List<Result> getAllResults() {
        return resultRepository.findAll();
    }

    public void deleteResult(String id) {
        resultRepository.deleteById(id);
    }

    public double getUserAverageScore(String userId) {
        List<Result> results = resultRepository.findByUserId(userId);
        if (results.isEmpty()) return 0;
        return results.stream()
            .mapToDouble(r -> (r.getScore() * 100.0) / r.getTotalMarks())
            .average()
            .orElse(0);
    }
}
