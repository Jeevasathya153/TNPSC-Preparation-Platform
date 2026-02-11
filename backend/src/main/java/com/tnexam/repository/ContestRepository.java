package com.tnexam.repository;

import com.tnexam.model.Contest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContestRepository extends MongoRepository<Contest, String> {
    
    // Find active contest by type
    Optional<Contest> findByContestTypeAndIsActiveTrue(String contestType);
    
    // Find daily contest by date
    Optional<Contest> findByContestTypeAndContestDate(String contestType, LocalDate contestDate);
    
    // Find weekly contest by week number and year
    Optional<Contest> findByContestTypeAndWeekNumberAndYear(String contestType, int weekNumber, int year);
    
    // Find all contests by type
    List<Contest> findByContestTypeOrderByCreatedAtDesc(String contestType);
    
    // Find recent contests
    List<Contest> findTop10ByOrderByCreatedAtDesc();
    
    // Find active contests
    List<Contest> findByIsActiveTrueOrderByCreatedAtDesc();
    
    // Check if contest exists for today
    boolean existsByContestTypeAndContestDate(String contestType, LocalDate contestDate);
    
    // Check if weekly contest exists
    boolean existsByContestTypeAndWeekNumberAndYear(String contestType, int weekNumber, int year);
}
