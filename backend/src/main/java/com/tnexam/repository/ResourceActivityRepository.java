package com.tnexam.repository;

import com.tnexam.model.ResourceActivity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceActivityRepository extends MongoRepository<ResourceActivity, String> {
    List<ResourceActivity> findByUserId(String userId);
    List<ResourceActivity> findByUserIdOrderByLastAccessedAtDesc(String userId);
    Optional<ResourceActivity> findByUserIdAndResourceId(String userId, String resourceId);
    List<ResourceActivity> findByUserIdAndResourceType(String userId, String resourceType);
    long countByUserId(String userId);
    long countByUserIdAndCompleted(String userId, boolean completed);
}
