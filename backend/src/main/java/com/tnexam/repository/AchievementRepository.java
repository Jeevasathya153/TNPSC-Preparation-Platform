package com.tnexam.repository;

import com.tnexam.model.Achievement;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface AchievementRepository extends MongoRepository<Achievement, String> {
    Optional<Achievement> findByUserId(String userId);
}
