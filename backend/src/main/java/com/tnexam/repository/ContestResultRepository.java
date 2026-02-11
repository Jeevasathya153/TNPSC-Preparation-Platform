package com.tnexam.repository;

import com.tnexam.model.ContestResult;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContestResultRepository extends MongoRepository<ContestResult, String> {
    
    // Find results by contest
    List<ContestResult> findByContestIdOrderByScoreDescTimeTakenSecondsAsc(String contestId);
    
    // Find results by user
    List<ContestResult> findByUserIdOrderBySubmittedAtDesc(String userId);
    
    // Find result by user and contest (to check if already participated)
    Optional<ContestResult> findByUserIdAndContestId(String oduserId, String contestId);
    
    // Check if user has already participated
    boolean existsByUserIdAndContestId(String userId, String contestId);
    
    // Find top performers for a contest (ordered by score desc, then time asc)
    List<ContestResult> findTop10ByContestIdOrderByScoreDescTimeTakenSecondsAsc(String contestId);
    
    // Find all results for a contest type
    List<ContestResult> findByContestTypeOrderByScoreDescTimeTakenSecondsAsc(String contestType);
    
    // Count participants for a contest
    long countByContestId(String contestId);
    
    // Find user's results by contest type
    List<ContestResult> findByUserIdAndContestTypeOrderBySubmittedAtDesc(String userId, String contestType);
}
