package com.tnexam.repository;

import com.tnexam.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserId(String userId);
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndReadFalse(String userId);
    long countByUserIdAndReadFalse(String userId);

    // Official TNPSC Notifications
    List<Notification> findByIsOfficialTrueOrderByCreatedAtDesc();
    List<Notification> findByIsOfficialTrue();
    Optional<Notification> findByNotificationNumberAndSourceUrl(String notificationNumber, String sourceUrl);
    Optional<Notification> findByNotificationNumber(String notificationNumber);
    Optional<Notification> findBySourceUrlAndTitle(String sourceUrl, String title);
    Optional<Notification> findBySourceUrl(String sourceUrl);
    List<Notification> findByIsOfficialTrueAndCategoryIgnoreCase(String category);
}
