package com.tnexam.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {
    
    @Id
    private String id;
    private String userId; // Nullable for global official notifications
    private String type;   // e.g. "OFFICIAL_TNPSC", "QUIZ_RESULT", "ACHIEVEMENT", "WELCOME"
    private String title;
    private String message;
    private String description;
    private boolean read;
    private String icon;

    // Official TNPSC Specific Fields
    private String notificationNumber;     // e.g. "11/2026"
    private String category;               // e.g. "Group IV", "Group II / IIA", "Technical Services", etc.
    private String publishedDate;          // e.g. "06/10/2026" or ISO
    private String applicationStartDate;   // e.g. "06/10/2026"
    private String applicationEndDate;     // e.g. "05/11/2026"
    private String paymentLastDate;        // e.g. "05/11/2026"
    private String examinationDate;        // e.g. "10/01/2027"
    private String officialNotificationUrl;// Link to apply or official announcement page
    private String officialPdfUrl;         // English or default official PDF link
    private String officialPdfUrlTamil;    // Tamil PDF link if available
    private String sourceUrl;              // The exact page URL fetched from
    private String sourceName;             // e.g. "TNPSC Online Application Portal" / "TNPSC Official Portal"
    private String status;                 // Upcoming, Application Open, Application Closed, Examination Scheduled, Hall Ticket Released, Results Published
    private boolean isNew;                 // Recently published indicator
    private boolean isOfficial;            // true for official scraped TNPSC records
    private boolean isReviewed;            // Admin reviewed status
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Notification() {
        this.read = false;
        this.isOfficial = false;
        this.isReviewed = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Notification(String userId, String type, String title, String message) {
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.description = message;
        this.read = false;
        this.isOfficial = false;
        this.isReviewed = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message != null ? message : description; }
    public void setMessage(String message) { 
        this.message = message; 
        if (this.description == null) this.description = message;
    }

    public String getDescription() { return description != null ? description : message; }
    public void setDescription(String description) { 
        this.description = description; 
        if (this.message == null) this.message = description;
    }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getNotificationNumber() { return notificationNumber; }
    public void setNotificationNumber(String notificationNumber) { this.notificationNumber = notificationNumber; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPublishedDate() { return publishedDate; }
    public void setPublishedDate(String publishedDate) { this.publishedDate = publishedDate; }

    public String getApplicationStartDate() { return applicationStartDate; }
    public void setApplicationStartDate(String applicationStartDate) { this.applicationStartDate = applicationStartDate; }

    public String getApplicationEndDate() { return applicationEndDate; }
    public void setApplicationEndDate(String applicationEndDate) { this.applicationEndDate = applicationEndDate; }

    public String getPaymentLastDate() { return paymentLastDate; }
    public void setPaymentLastDate(String paymentLastDate) { this.paymentLastDate = paymentLastDate; }

    public String getExaminationDate() { return examinationDate; }
    public void setExaminationDate(String examinationDate) { this.examinationDate = examinationDate; }

    public String getOfficialNotificationUrl() { return officialNotificationUrl; }
    public void setOfficialNotificationUrl(String officialNotificationUrl) { this.officialNotificationUrl = officialNotificationUrl; }

    public String getOfficialPdfUrl() { return officialPdfUrl; }
    public void setOfficialPdfUrl(String officialPdfUrl) { this.officialPdfUrl = officialPdfUrl; }

    public String getOfficialPdfUrlTamil() { return officialPdfUrlTamil; }
    public void setOfficialPdfUrlTamil(String officialPdfUrlTamil) { this.officialPdfUrlTamil = officialPdfUrlTamil; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getSourceName() { return sourceName; }
    public void setSourceName(String sourceName) { this.sourceName = sourceName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isNew() { return isNew; }
    public void setNew(boolean aNew) { isNew = aNew; }

    public boolean isOfficial() { return isOfficial; }
    public void setOfficial(boolean official) { isOfficial = official; }

    public boolean isReviewed() { return isReviewed; }
    public void setReviewed(boolean reviewed) { isReviewed = reviewed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
