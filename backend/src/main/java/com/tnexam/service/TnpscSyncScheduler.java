package com.tnexam.service;

import com.tnexam.entity.Notification;
import com.tnexam.entity.SyncLog;
import com.tnexam.repository.NotificationRepository;
import com.tnexam.repository.SyncLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TnpscSyncScheduler {

    private static final Logger logger = LoggerFactory.getLogger(TnpscSyncScheduler.class);

    private final TnpscScraperService scraperService;
    private final NotificationRepository notificationRepository;
    private final SyncLogRepository syncLogRepository;

    public TnpscSyncScheduler(TnpscScraperService scraperService,
                              NotificationRepository notificationRepository,
                              SyncLogRepository syncLogRepository) {
        this.scraperService = scraperService;
        this.notificationRepository = notificationRepository;
        this.syncLogRepository = syncLogRepository;
    }

    /**
     * Automatic scheduled synchronization every 30 minutes (1,800,000 ms).
     * Runs 5 seconds after startup to ensure fresh data immediately.
     */
    @Scheduled(fixedRateString = "${tnpsc.sync.rate:1800000}", initialDelay = 5000)
    public void runScheduledSync() {
        logger.info("Executing scheduled automatic TNPSC official sync...");
        syncAll("AUTOMATIC_SCHEDULE");
    }

    /**
     * Triggers manual synchronization.
     */
    public SyncLog triggerManualSync() {
        logger.info("Executing manual admin TNPSC official sync...");
        return syncAll("MANUAL_ADMIN");
    }

    /**
     * Main sync logic across all official sources.
     */
    public synchronized SyncLog syncAll(String triggerType) {
        SyncLog log = new SyncLog("SUCCESS", triggerType);
        int totalFetched = 0;
        int newInserted = 0;
        int updatedCount = 0;
        int duplicatesSkipped = 0;

        List<Notification> fetchedNotifications = new ArrayList<>();

        // 1. Fetch from Application Portal (Primary structured data)
        try {
            List<Notification> applyPortalList = scraperService.fetchFromApplyPortal();
            fetchedNotifications.addAll(applyPortalList);
            logger.info("Fetched {} notifications from apply.tnpscexams.in", applyPortalList.size());
        } catch (Exception e) {
            String err = "Error fetching from apply portal: " + e.getMessage();
            logger.error(err, e);
            log.addErrorMessage(err);
        }

        // 2. Fetch from Main Portal (tnpsc.gov.in)
        try {
            List<Notification> mainPortalList = scraperService.fetchFromMainPortal();
            fetchedNotifications.addAll(mainPortalList);
            logger.info("Fetched {} announcements from main portal", mainPortalList.size());
        } catch (Exception e) {
            String err = "Error fetching from main portal: " + e.getMessage();
            logger.error(err, e);
            log.addErrorMessage(err);
        }

        // 3. Fetch from Home Page Events
        try {
            List<Notification> homeEvents = scraperService.fetchFromHomePageEvents();
            fetchedNotifications.addAll(homeEvents);
            logger.info("Fetched {} events from home page", homeEvents.size());
        } catch (Exception e) {
            String err = "Error fetching from home page events: " + e.getMessage();
            logger.warn(err);
            log.addErrorMessage(err);
        }

        // 4. Fetch from Press Releases
        try {
            List<Notification> pressReleases = scraperService.fetchPressReleases();
            fetchedNotifications.addAll(pressReleases);
            logger.info("Fetched {} press releases", pressReleases.size());
        } catch (Exception e) {
            String err = "Error fetching press releases: " + e.getMessage();
            logger.warn(err);
            log.addErrorMessage(err);
        }

        totalFetched = fetchedNotifications.size();

        // Save or update in MongoDB with stable duplicate prevention
        for (Notification incoming : fetchedNotifications) {
            try {
                Optional<Notification> existingOpt = findExistingNotification(incoming);

                if (existingOpt.isPresent()) {
                    Notification existing = existingOpt.get();
                    boolean hasChanges = false;

                    // Compare fields to see if official data has updated
                    if (!Objects.equals(existing.getApplicationStartDate(), incoming.getApplicationStartDate())) {
                        existing.setApplicationStartDate(incoming.getApplicationStartDate());
                        hasChanges = true;
                    }
                    if (!Objects.equals(existing.getApplicationEndDate(), incoming.getApplicationEndDate())) {
                        existing.setApplicationEndDate(incoming.getApplicationEndDate());
                        hasChanges = true;
                    }
                    if (!Objects.equals(existing.getExaminationDate(), incoming.getExaminationDate())) {
                        existing.setExaminationDate(incoming.getExaminationDate());
                        hasChanges = true;
                    }
                    if (!Objects.equals(existing.getStatus(), incoming.getStatus())) {
                        existing.setStatus(incoming.getStatus());
                        hasChanges = true;
                    }
                    if (incoming.getOfficialPdfUrl() != null && !incoming.getOfficialPdfUrl().isBlank()
                            && !Objects.equals(existing.getOfficialPdfUrl(), incoming.getOfficialPdfUrl())) {
                        existing.setOfficialPdfUrl(incoming.getOfficialPdfUrl());
                        hasChanges = true;
                    }
                    if (incoming.getOfficialPdfUrlTamil() != null && !incoming.getOfficialPdfUrlTamil().isBlank()
                            && !Objects.equals(existing.getOfficialPdfUrlTamil(), incoming.getOfficialPdfUrlTamil())) {
                        existing.setOfficialPdfUrlTamil(incoming.getOfficialPdfUrlTamil());
                        hasChanges = true;
                    }
                    if (incoming.getOfficialNotificationUrl() != null && !incoming.getOfficialNotificationUrl().isBlank()
                            && !Objects.equals(existing.getOfficialNotificationUrl(), incoming.getOfficialNotificationUrl())) {
                        existing.setOfficialNotificationUrl(incoming.getOfficialNotificationUrl());
                        hasChanges = true;
                    }

                    if (hasChanges) {
                        existing.setUpdatedAt(LocalDateTime.now());
                        notificationRepository.save(existing);
                        updatedCount++;
                    } else {
                        duplicatesSkipped++;
                    }
                } else {
                    // New official announcement
                    incoming.setCreatedAt(LocalDateTime.now());
                    incoming.setUpdatedAt(LocalDateTime.now());
                    incoming.setOfficial(true);
                    notificationRepository.save(incoming);
                    newInserted++;
                }
            } catch (Exception ex) {
                logger.error("Error persisting official notification {}: {}", incoming.getTitle(), ex.getMessage());
                log.addErrorMessage("Persist error: " + ex.getMessage());
            }
        }

        // Set status
        if (!log.getErrorMessages().isEmpty()) {
            log.setStatus(newInserted > 0 || updatedCount > 0 || duplicatesSkipped > 0 ? "PARTIAL" : "FAILED");
        } else {
            log.setStatus("SUCCESS");
        }

        log.setTotalFetched(totalFetched);
        log.setNewInserted(newInserted);
        log.setUpdatedCount(updatedCount);
        log.setDuplicatesSkipped(duplicatesSkipped);
        log.setSummary(String.format("Synced %d announcements: %d new inserted, %d updated, %d skipped duplicates",
                totalFetched, newInserted, updatedCount, duplicatesSkipped));

        syncLogRepository.save(log);
        logger.info("TNPSC sync completed: {}", log.getSummary());

        return log;
    }

    /**
     * Resolves existing notification by stable identifiers:
     * 1) Notification number + source URL, or Notification number alone.
     * 2) Exact title + source URL.
     */
    private Optional<Notification> findExistingNotification(Notification incoming) {
        String notifNo = incoming.getNotificationNumber();
        String sourceUrl = incoming.getSourceUrl();
        String title = incoming.getTitle();

        if (notifNo != null && !notifNo.isBlank()) {
            Optional<Notification> byNumAndSource = notificationRepository.findByNotificationNumberAndSourceUrl(notifNo, sourceUrl);
            if (byNumAndSource.isPresent()) return byNumAndSource;

            Optional<Notification> byNum = notificationRepository.findByNotificationNumber(notifNo);
            if (byNum.isPresent()) return byNum;
        }

        if (sourceUrl != null && title != null) {
            Optional<Notification> bySourceAndTitle = notificationRepository.findBySourceUrlAndTitle(sourceUrl, title);
            if (bySourceAndTitle.isPresent()) return bySourceAndTitle;
        }

        return Optional.empty();
    }

    /**
     * Returns the latest sync log.
     */
    public Optional<SyncLog> getLastSyncLog() {
        return syncLogRepository.findTopByOrderBySyncTimeDesc();
    }

    /**
     * Returns recent sync logs.
     */
    public List<SyncLog> getRecentSyncLogs() {
        return syncLogRepository.findTop10ByOrderBySyncTimeDesc();
    }
}

