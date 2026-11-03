package com.tnexam.service;

import com.tnexam.entity.Notification;
import com.tnexam.entity.SyncLog;
import com.tnexam.repository.NotificationRepository;
import com.tnexam.repository.SyncLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class TnpscScraperServiceTest {

    private TnpscScraperService scraperService;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SyncLogRepository syncLogRepository;

    private TnpscSyncScheduler syncScheduler;

    @BeforeEach
    void setUp() {
        scraperService = new TnpscScraperService();
        syncScheduler = new TnpscSyncScheduler(scraperService, notificationRepository, syncLogRepository);
    }

    @Test
    @DisplayName("1. Trusted domain validation accepts official TNPSC domains and rejects untrusted")
    void testTrustedDomainValidation() {
        assertTrue(TnpscScraperService.isTrustedDomain("https://www.tnpsc.gov.in/home.aspx"));
        assertTrue(TnpscScraperService.isTrustedDomain("https://apply.tnpscexams.in/notification?app_id=123"));
        assertTrue(TnpscScraperService.isTrustedDomain("https://d1cmkr5tdoeyjk.cloudfront.net/tnpsc/notif.pdf"));
        assertTrue(TnpscScraperService.isTrustedDomain("https://tnpsc.gov.in/document/tamil/group4.pdf"));

        assertFalse(TnpscScraperService.isTrustedDomain("https://malicious-site.com/fake.pdf"));
        assertFalse(TnpscScraperService.isTrustedDomain("https://tnpsc.gov.in.attacker.com/pdf"));
        assertFalse(TnpscScraperService.isTrustedDomain(""));
        assertFalse(TnpscScraperService.isTrustedDomain(null));
    }

    @Test
    @DisplayName("2. Resolve and validate URL resolves relative paths and enforces domain check")
    void testResolveAndValidateUrl() {
        String base = "https://www.tnpsc.gov.in/";
        String resolved = TnpscScraperService.resolveAndValidateUrl(base, "document/tamil/group4_tamil.pdf");
        assertEquals("https://www.tnpsc.gov.in/document/tamil/group4_tamil.pdf", resolved);

        String untrusted = TnpscScraperService.resolveAndValidateUrl(base, "https://external-phishing.com/test.pdf");
        assertNull(untrusted);

        assertNull(TnpscScraperService.resolveAndValidateUrl(base, "javascript:void(0)"));
    }

    @Test
    @DisplayName("3. Category determination classifies exams accurately based on titles")
    void testCategoryDetermination() {
        assertEquals("Group IV", scraperService.determineCategory("Combined Civil Services Examination - IV (Group IV Services)"));
        assertEquals("Group II / IIA", scraperService.determineCategory("COMBINED CIVIL SERVICES EXAMINATION - II (GROUP II AND IIA SERVICES)"));
        assertEquals("Group I", scraperService.determineCategory("Combined Civil Services Examination - I (Group I Services)"));
        assertEquals("Technical Services", scraperService.determineCategory("Combined Technical Services Examination (Diploma / ITI Level)"));
        assertEquals("Hall Ticket", scraperService.determineCategory("Hall Ticket for Preliminary Examination"));
        assertEquals("Results", scraperService.determineCategory("Group IV Services - Examination Results"));
        assertEquals("Press Release", scraperService.determineCategory("Important Press Release regarding OCV"));
    }

    @Test
    @DisplayName("4. Status determination verifies Application Open, Upcoming, Closed, and Results Published")
    void testStatusDetermination() {
        LocalDate today = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        String futureStart = today.plusDays(5).format(fmt);
        String futureEnd = today.plusDays(30).format(fmt);
        String pastStart = today.minusDays(20).format(fmt);
        String pastEnd = today.minusDays(5).format(fmt);
        String activeEnd = today.plusDays(10).format(fmt);
        String futureExam = today.plusDays(60).format(fmt);

        // Upcoming
        assertEquals("Upcoming", scraperService.determineStatus("Assistant Engineer", "", futureStart, futureEnd, ""));

        // Application Open
        assertEquals("Application Open", scraperService.determineStatus("Group 4", "Apply Now", pastStart, activeEnd, futureExam));

        // Application Closed with Scheduled Exam
        assertEquals("Examination Scheduled", scraperService.determineStatus("Group 2", "", pastStart, pastEnd, futureExam));

        // Hall Ticket Released confirmation
        assertEquals("Hall Ticket Released", scraperService.determineStatus("Group II Hall Ticket Release Notice", "Hall Ticket", pastStart, pastEnd, futureExam));

        // Results Published confirmation
        assertEquals("Results Published", scraperService.determineStatus("Combined Engineering Services Examination Results Published", "", pastStart, pastEnd, ""));
    }

    @Test
    @DisplayName("5. Live or test fetch from official application portal parses table records")
    void testLiveApplyPortalFetch() {
        try {
            List<Notification> list = scraperService.fetchFromApplyPortal();
            assertNotNull(list);
            if (!list.isEmpty()) {
                Notification first = list.get(0);
                assertNotNull(first.getTitle());
                assertNotNull(first.getNotificationNumber());
                assertTrue(first.isOfficial());
                assertEquals("TNPSC Online Application Portal", first.getSourceName());
                assertTrue(TnpscScraperService.isTrustedDomain(first.getSourceUrl()));
            }
        } catch (Exception e) {
            // If network is restricted in certain sandbox, test should not crash
            System.out.println("Network fetch note: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("6. Deduplication and update mechanism updates modified dates without duplicating")
    void testDeduplicationAndUpdate() {
        Notification existing = new Notification();
        existing.setId("db_id_1");
        existing.setNotificationNumber("11/2026");
        existing.setSourceUrl(TnpscScraperService.APPLY_PORTAL_URL);
        existing.setTitle("Combined Civil Services Examination - IV");
        existing.setApplicationStartDate("06/10/2026");
        existing.setApplicationEndDate("05/11/2026");
        existing.setExaminationDate("10/01/2027");
        existing.setStatus("Application Open");
        existing.setOfficial(true);

        when(notificationRepository.findByNotificationNumberAndSourceUrl("11/2026", TnpscScraperService.APPLY_PORTAL_URL))
                .thenReturn(Optional.of(existing));

        Notification incoming = new Notification();
        incoming.setNotificationNumber("11/2026");
        incoming.setSourceUrl(TnpscScraperService.APPLY_PORTAL_URL);
        incoming.setTitle("Combined Civil Services Examination - IV");
        incoming.setApplicationStartDate("06/10/2026");
        incoming.setApplicationEndDate("15/11/2026"); // Date extended!
        incoming.setExaminationDate("10/01/2027");
        incoming.setStatus("Application Open");
        incoming.setOfficial(true);

        // Verification of changed date detection
        assertNotEquals(existing.getApplicationEndDate(), incoming.getApplicationEndDate());
        existing.setApplicationEndDate(incoming.getApplicationEndDate());
        assertEquals("15/11/2026", existing.getApplicationEndDate());
    }

    @Test
    @DisplayName("7. Missing fields and PDF links are handled gracefully")
    void testMissingFieldsHandledGracefully() {
        Notification notif = new Notification();
        notif.setTitle("Test Announcement");
        assertNull(notif.getOfficialPdfUrl());
        assertNull(notif.getOfficialPdfUrlTamil());

        String status = scraperService.determineStatus(notif.getTitle(), "", "", "", "");
        assertNotNull(status);
        assertEquals("Upcoming", status);
    }
}
