package com.tnexam.controller;

import com.tnexam.entity.Notification;
import com.tnexam.entity.SyncLog;
import com.tnexam.service.NotificationService;
import com.tnexam.service.TnpscSyncScheduler;
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
    private final TnpscSyncScheduler syncScheduler;

    public NotificationController(NotificationService notificationService, TnpscSyncScheduler syncScheduler) {
        this.notificationService = notificationService;
        this.syncScheduler = syncScheduler;
    }

    // ==========================================
    // Official TNPSC Notification Endpoints
    // ==========================================

    @GetMapping("/official")
    public ResponseEntity<List<Notification>> getOfficialNotifications(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "newest") String sort) {
        return ResponseEntity.ok(notificationService.getOfficialNotifications(category, status, search, sort));
    }

    @GetMapping("/official/latest")
    public ResponseEntity<List<Notification>> getLatestOfficialNotifications(
            @RequestParam(required = false, defaultValue = "5") int limit) {
        return ResponseEntity.ok(notificationService.getLatestOfficialNotifications(limit));
    }

    @GetMapping("/official/{id}")
    public ResponseEntity<?> getOfficialNotificationById(@PathVariable String id) {
        Optional<Notification> notification = notificationService.getNotificationById(id);
        if (notification.isPresent() && notification.get().isOfficial()) {
            return ResponseEntity.ok(notification.get());
        }
        Map<String, String> error = new HashMap<>();
        error.put("message", "Official notification not found");
        return ResponseEntity.status(404).body(error);
    }

    // ==========================================
    // Synchronization & Admin Endpoints
    // ==========================================

    @PostMapping("/sync")
    public ResponseEntity<?> triggerManualSync() {
        try {
            SyncLog result = syncScheduler.triggerManualSync();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Sync failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/sync-status")
    public ResponseEntity<?> getSyncStatus() {
        Optional<SyncLog> lastLog = syncScheduler.getLastSyncLog();
        if (lastLog.isPresent()) {
            return ResponseEntity.ok(lastLog.get());
        }
        Map<String, Object> empty = new HashMap<>();
        empty.put("status", "NO_SYNC_YET");
        empty.put("message", "No synchronization has occurred yet.");
        return ResponseEntity.ok(empty);
    }

    @GetMapping("/sync-history")
    public ResponseEntity<List<SyncLog>> getSyncHistory() {
        return ResponseEntity.ok(syncScheduler.getRecentSyncLogs());
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<?> markAsReviewed(@PathVariable String id) {
        Notification updated = notificationService.markAsReviewed(id);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        Map<String, String> error = new HashMap<>();
        error.put("message", "Notification not found");
        return ResponseEntity.status(404).body(error);
    }

    // ==========================================
    // Existing Notification Endpoints (Backward Compatible)
    // ==========================================

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
        Optional<Notification> opt = notificationService.getNotificationById(id);
        if (opt.isPresent()) {
            Notification n = opt.get();
            if (n.isOfficial()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Official TNPSC notifications cannot be removed by normal users.");
                return ResponseEntity.status(403).body(error);
            }
        }
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

    // Default exam notifications for user (kept for backward compatibility)
    @PostMapping("/user/{userId}/default-notifications")
    public ResponseEntity<?> createDefaultNotifications(@PathVariable String userId) {
        notificationService.createDefaultExamNotifications(userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Default notifications handled");
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
