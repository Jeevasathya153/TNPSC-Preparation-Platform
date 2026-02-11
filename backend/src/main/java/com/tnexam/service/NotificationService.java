package com.tnexam.service;

import com.tnexam.model.Notification;
import com.tnexam.model.User;
import com.tnexam.repository.NotificationRepository;
import com.tnexam.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notification> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public Optional<Notification> getNotificationById(String id) {
        return notificationRepository.findById(id);
    }

    public Notification createNotification(Notification notification) {
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(String id) {
        Optional<Notification> notification = notificationRepository.findById(id);
        if (notification.isPresent()) {
            Notification notif = notification.get();
            notif.setRead(true);
            return notificationRepository.save(notif);
        }
        return null;
    }

    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        for (Notification notif : notifications) {
            notif.setRead(true);
            notificationRepository.save(notif);
        }
    }

    public void deleteNotification(String id) {
        notificationRepository.deleteById(id);
    }

    public void deleteAllUserNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        notificationRepository.deleteAll(notifications);
    }

    // Helper method to create notification for quiz completion
    public void createQuizCompletionNotification(String userId, String quizTitle, int score, int totalMarks) {
        double percentage = (score * 100.0) / totalMarks;
        String icon = percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "📚";
        String message = String.format("You scored %d/%d (%.0f%%) in %s", score, totalMarks, percentage, quizTitle);
        
        Notification notification = new Notification(userId, "QUIZ_RESULT", "Quiz Completed!", message);
        notification.setIcon(icon);
        createNotification(notification);
    }

    // Helper method to create achievement notification
    public void createAchievementNotification(String userId, String achievementName, String description) {
        Notification notification = new Notification(userId, "ACHIEVEMENT", "New Achievement Unlocked! 🏆", 
            String.format("You've earned '%s': %s", achievementName, description));
        notification.setIcon("🏆");
        createNotification(notification);
    }

    // Helper method to create welcome notification
    public void createWelcomeNotification(String userId, String userName) {
        Notification notification = new Notification(userId, "WELCOME", "Welcome to TN Exam Prep! 👋", 
            String.format("Hello %s! Start your learning journey by taking your first quiz.", userName));
        notification.setIcon("👋");
        createNotification(notification);
    }

    // Helper method to create default exam announcement notifications
    public void createDefaultExamNotifications(String userId) {
        // TNPSC Group 4 Exam Notification
        Notification tnpscGroup4 = new Notification(userId, "EXAM_ANNOUNCEMENT", "TNPSC Group 4 Exam 2025 📢", 
            "TNPSC Group 4 examination scheduled for March 15-20, 2025. Application deadline: January 31, 2025.");
        tnpscGroup4.setIcon("📅");
        createNotification(tnpscGroup4);

        // TNPSC Group 2 Exam Notification
        Notification tnpscGroup2 = new Notification(userId, "EXAM_ANNOUNCEMENT", "TNPSC Group 2 Exam 2025 📢", 
            "TNPSC Group 2 examination scheduled for April 10-15, 2025. Application deadline: February 15, 2025.");
        tnpscGroup2.setIcon("📅");
        createNotification(tnpscGroup2);

        // TET Exam Notification
        Notification tet = new Notification(userId, "EXAM_ANNOUNCEMENT", "TN TET Exam 2025 📢", 
            "Tamil Nadu Teacher Eligibility Test (TET) scheduled for May 5-10, 2025. Application deadline: March 20, 2025.");
        tet.setIcon("📅");
        createNotification(tet);
    }

    // Helper method to create exam date notification
    public void createExamDateNotification(String userId, String examName, String examDate, String applicationDeadline) {
        Notification notification = new Notification(userId, "EXAM_ANNOUNCEMENT", 
            String.format("%s - Exam Date Announced 📅", examName), 
            String.format("Exam Date: %s | Application Deadline: %s", examDate, applicationDeadline));
        notification.setIcon("📅");
        createNotification(notification);
    }

    // Helper method to create application deadline reminder
    public void createDeadlineReminder(String userId, String examName, String deadline) {
        Notification notification = new Notification(userId, "DEADLINE_REMINDER", 
            String.format("⏰ Application Deadline Approaching - %s", examName), 
            String.format("Last date to apply: %s. Don't miss out!", deadline));
        notification.setIcon("⚠️");
        createNotification(notification);
    }

    // Broadcast exam announcement to all users
    public void broadcastExamAnnouncement(String examName, String examDate, String applicationDeadline) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            createExamDateNotification(user.getId(), examName, examDate, applicationDeadline);
        }
    }

    // Broadcast deadline reminder to all users
    public void broadcastDeadlineReminder(String examName, String deadline) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            createDeadlineReminder(user.getId(), examName, deadline);
        }
    }
}
