package com.tnexam.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "sync_logs")
public class SyncLog {
    
    @Id
    private String id;
    private LocalDateTime syncTime;
    private String status; // "SUCCESS", "PARTIAL", "FAILED"
    private int totalFetched;
    private int newInserted;
    private int updatedCount;
    private int duplicatesSkipped;
    private List<String> errorMessages = new ArrayList<>();
    private String summary;
    private String triggerType; // "AUTOMATIC_SCHEDULE", "MANUAL_ADMIN"

    public SyncLog() {
        this.syncTime = LocalDateTime.now();
        this.status = "SUCCESS";
        this.triggerType = "AUTOMATIC_SCHEDULE";
    }

    public SyncLog(String status, String triggerType) {
        this.syncTime = LocalDateTime.now();
        this.status = status;
        this.triggerType = triggerType;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public LocalDateTime getSyncTime() { return syncTime; }
    public void setSyncTime(LocalDateTime syncTime) { this.syncTime = syncTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getTotalFetched() { return totalFetched; }
    public void setTotalFetched(int totalFetched) { this.totalFetched = totalFetched; }

    public int getNewInserted() { return newInserted; }
    public void setNewInserted(int newInserted) { this.newInserted = newInserted; }

    public int getUpdatedCount() { return updatedCount; }
    public void setUpdatedCount(int updatedCount) { this.updatedCount = updatedCount; }

    public int getDuplicatesSkipped() { return duplicatesSkipped; }
    public void setDuplicatesSkipped(int duplicatesSkipped) { this.duplicatesSkipped = duplicatesSkipped; }

    public List<String> getErrorMessages() { return errorMessages; }
    public void setErrorMessages(List<String> errorMessages) { this.errorMessages = errorMessages; }

    public void addErrorMessage(String message) {
        if (this.errorMessages == null) this.errorMessages = new ArrayList<>();
        this.errorMessages.add(message);
    }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getTriggerType() { return triggerType; }
    public void setTriggerType(String triggerType) { this.triggerType = triggerType; }
}

