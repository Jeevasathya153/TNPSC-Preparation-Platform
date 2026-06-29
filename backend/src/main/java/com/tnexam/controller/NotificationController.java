package com.tnexam.controller;

import com.tnexam.entity.Notification;
import com.tnexam.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String userId) {
        long count = notificationService.getUnreadCount(userId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNotificationById(@PathVariable String id) {
        Optional<Notification> notification = notificationService.getNotificationById(id);
        if (notification.isPresent()) {
            return ResponseEntity.ok(notification.get());
        }
        Map<String, String> error = new HashMap<>();
        error.put("message", "Notification not found");
        return ResponseEntity.badRequest().body(error);
    }

    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody Notification notification) {
        Notification created = notificationService.createNotification(notification);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        Notification updated = notificationService.markAsRead(id);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        Map<String, String> error = new HashMap<>();
        error.put("message", "Notification not found");
        return ResponseEntity.badRequest().body(error);
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable String userId) {
        notificationService.markAllAsRead(userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification deleted successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> deleteAllUserNotifications(@PathVariable String userId) {
        notificationService.deleteAllUserNotifications(userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications deleted successfully");
        return ResponseEntity.ok(response);
    }

    // Create default exam notifications for a user
    @PostMapping("/user/{userId}/default-notifications")
    public ResponseEntity<?> createDefaultNotifications(@PathVariable String userId) {
        notificationService.createDefaultExamNotifications(userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Default exam notifications created successfully");
        return ResponseEntity.ok(response);
    }

    // Create custom exam date notification (admin use)
    @PostMapping("/exam-announcement")
    public ResponseEntity<?> createExamAnnouncement(
            @RequestParam String userId,
            @RequestParam String examName,
            @RequestParam String examDate,
            @RequestParam String applicationDeadline) {
        notificationService.createExamDateNotification(userId, examName, examDate, applicationDeadline);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Exam announcement notification created");
        return ResponseEntity.ok(response);
    }

    // Create deadline reminder notification (admin use)
    @PostMapping("/deadline-reminder")
    public ResponseEntity<?> createDeadlineReminder(
            @RequestParam String userId,
            @RequestParam String examName,
            @RequestParam String deadline) {
        notificationService.createDeadlineReminder(userId, examName, deadline);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Deadline reminder notification created");
        return ResponseEntity.ok(response);
    }

    // Broadcast exam announcement to all users (admin use)
    @PostMapping("/broadcast/exam-announcement")
    public ResponseEntity<?> broadcastExamAnnouncement(
            @RequestParam String examName,
            @RequestParam String examDate,
            @RequestParam String applicationDeadline) {
        notificationService.broadcastExamAnnouncement(examName, examDate, applicationDeadline);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Exam announcement broadcast to all users");
        return ResponseEntity.ok(response);
    }

    // Broadcast deadline reminder to all users (admin use)
    @PostMapping("/broadcast/deadline-reminder")
    public ResponseEntity<?> broadcastDeadlineReminder(
            @RequestParam String examName,
            @RequestParam String deadline) {
        notificationService.broadcastDeadlineReminder(examName, deadline);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Deadline reminder broadcast to all users");
        return ResponseEntity.ok(response);
    }
}
