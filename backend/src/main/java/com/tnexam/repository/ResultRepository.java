
package com.tnexam.repository;

import com.tnexam.model.Result;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResultRepository extends MongoRepository<Result, String> {
    List<Result> findByUserId(String userId);
    List<Result> findByQuizId(String quizId);
    List<Result> findByContestType(String contestType);
    List<Result> findByDifficulty(String difficulty);

    // For daily leaderboard (results completed after a certain date)
    List<Result> findByContestTypeAndCompletedAtAfter(String contestType, java.time.LocalDateTime after);

    // For weekly leaderboard (results completed between two dates)
    List<Result> findByContestTypeAndCompletedAtBetween(String contestType, java.time.LocalDateTime start, java.time.LocalDateTime end);

    // Check if user has participated in daily contest
    boolean existsByUserIdAndContestTypeAndCompletedAtAfter(String userId, String contestType, java.time.LocalDateTime after);

    // Check if user has participated in weekly contest
    boolean existsByUserIdAndContestTypeAndCompletedAtBetween(String userId, String contestType, java.time.LocalDateTime start, java.time.LocalDateTime end);
}
