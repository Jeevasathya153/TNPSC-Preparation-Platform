package com.tnexam.repository;

import com.tnexam.entity.SyncLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SyncLogRepository extends MongoRepository<SyncLog, String> {
    Optional<SyncLog> findTopByOrderBySyncTimeDesc();
    List<SyncLog> findTop10ByOrderBySyncTimeDesc();
}

