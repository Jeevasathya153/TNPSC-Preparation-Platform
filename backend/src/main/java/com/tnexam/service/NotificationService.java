package com.tnexam.service;

import com.tnexam.entity.Notification;
import com.tnexam.entity.User;
import com.tnexam.repository.NotificationRepository;
import com.tnexam.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

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
        if (notification.getUpdatedAt() == null) {
            notification.setUpdatedAt(LocalDateTime.now());
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

    // Official TNPSC Notifications Querying with Search, Filters and Sorting
    public List<Notification> getOfficialNotifications(String category, String status, String search, String sort) {
        List<Notification> list = notificationRepository.findByIsOfficialTrue();

        // 1. Search Filter
        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            list = list.stream().filter(n ->
                    (n.getTitle() != null && n.getTitle().toLowerCase().contains(q)) ||
                    (n.getNotificationNumber() != null && n.getNotificationNumber().toLowerCase().contains(q)) ||
                    (n.getDescription() != null && n.getDescription().toLowerCase().contains(q))
            ).collect(Collectors.toList());
        }

        // 2. Category Filter
        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) {
            String cat = category.trim().toLowerCase();
            list = list.stream().filter(n ->
                    n.getCategory() != null && n.getCategory().toLowerCase().contains(cat)
            ).collect(Collectors.toList());
        }

        // 3. Status Filter
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("all")) {
            String st = status.trim().toLowerCase();
            list = list.stream().filter(n ->
                    n.getStatus() != null && n.getStatus().toLowerCase().replace(" ", "").contains(st.replace(" ", ""))
            ).collect(Collectors.toList());
        }

        // 4. Sort
        Comparator<Notification> comparator = (a, b) -> {
            LocalDate dateA = TnpscScraperService.parseDate(a.getPublishedDate());
            LocalDate dateB = TnpscScraperService.parseDate(b.getPublishedDate());

            if (dateA != null && dateB != null) {
                return dateB.compareTo(dateA); // Newest first
            }
            if (dateA != null) return -1;
            if (dateB != null) return 1;

            LocalDateTime timeA = a.getCreatedAt() != null ? a.getCreatedAt() : LocalDateTime.MIN;
            LocalDateTime timeB = b.getCreatedAt() != null ? b.getCreatedAt() : LocalDateTime.MIN;
            return timeB.compareTo(timeA);
        };

        if ("oldest".equalsIgnoreCase(sort)) {
            comparator = comparator.reversed();
        } else if ("closing_soon".equalsIgnoreCase(sort)) {
            comparator = (a, b) -> {
                LocalDate dateA = TnpscScraperService.parseDate(a.getApplicationEndDate());
                LocalDate dateB = TnpscScraperService.parseDate(b.getApplicationEndDate());
                if (dateA != null && dateB != null) {
                    return dateA.compareTo(dateB);
                }
                if (dateA != null) return -1;
                if (dateB != null) return 1;
                return 0;
            };
        }

        list.sort(comparator);
        return list;
    }

    public List<Notification> getLatestOfficialNotifications(int limit) {
        List<Notification> all = getOfficialNotifications(null, null, null, "newest");
        return all.stream().limit(Math.max(limit, 1)).collect(Collectors.toList());
    }

    public Notification markAsReviewed(String id) {
        Optional<Notification> opt = notificationRepository.findById(id);
        if (opt.isPresent()) {
            Notification n = opt.get();
            n.setReviewed(true);
            n.setUpdatedAt(LocalDateTime.now());
            return notificationRepository.save(n);
        }
        return null;
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
            String.format("Hello %s! Official TNPSC notifications are synced live in the Notifications section.", userName));
        notification.setIcon("👋");
        createNotification(notification);
    }

    // Helper method to create default exam announcement notifications
    public void createDefaultExamNotifications(String userId) {
        // Now obsolete: Official notifications are fetched dynamically from official TNPSC portals
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
