package com.tnexam.service;

import com.tnexam.entity.Notification;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TnpscScraperService {

    private static final Logger logger = LoggerFactory.getLogger(TnpscScraperService.class);

    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    private static final int TIMEOUT_MS = 15000;

    public static final String APPLY_PORTAL_URL = "https://apply.tnpscexams.in/notification?app_id=UElZMDAwMDAwMQ%3D%3D";
    public static final String MAIN_PORTAL_URL = "https://www.tnpsc.gov.in/";
    public static final String HOME_PAGE_URL = "https://tnpsc.gov.in/home.aspx";
    public static final String PRESS_RELEASES_URL = "https://tnpsc.gov.in/English/press_releases.aspx";

    private static final DateTimeFormatter[] DATE_FORMATTERS = new DateTimeFormatter[]{
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("d/M/yyyy"),
            DateTimeFormatter.ofPattern("dd.MM.yyyy")
    };

    /**
     * Validates whether a given URL belongs to trusted TNPSC domains.
     */
    public static boolean isTrustedDomain(String url) {
        if (url == null || url.isBlank()) return false;
        try {
            URI uri = URI.create(url.trim());
            String host = uri.getHost();
            if (host == null) return false;
            host = host.toLowerCase();
            return host.equals("tnpsc.gov.in") || host.endsWith(".tnpsc.gov.in")
                    || host.equals("tnpscexams.in") || host.endsWith(".tnpscexams.in")
                    || host.equals("d1cmkr5tdoeyjk.cloudfront.net");
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Resolve a potentially relative URL against a base URL and validate its domain.
     */
    public static String resolveAndValidateUrl(String baseUrl, String relOrAbsUrl) {
        if (relOrAbsUrl == null || relOrAbsUrl.isBlank()) return null;
        String trimmed = relOrAbsUrl.trim();
        if (trimmed.startsWith("javascript:") || trimmed.startsWith("#")) return null;

        try {
            URI base = URI.create(baseUrl);
            URI resolved = base.resolve(trimmed);
            String fullUrl = resolved.toString();
            if (isTrustedDomain(fullUrl)) {
                return fullUrl;
            }
        } catch (Exception e) {
            logger.warn("Could not resolve or validate URL: {} against {}", relOrAbsUrl, baseUrl);
        }
        return null;
    }

    /**
     * Parse date string safely into LocalDate.
     */
    public static LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        String clean = dateStr.trim();
        // Remove time or extra characters if present
        if (clean.contains(" ")) {
            clean = clean.split(" ")[0];
        }
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(clean, formatter);
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    /**
     * Fetches official recruitment notifications from the TNPSC Application Portal.
     */
    public List<Notification> fetchFromApplyPortal() throws Exception {
        List<Notification> list = new ArrayList<>();
        logger.info("Connecting to TNPSC Application Portal: {}", APPLY_PORTAL_URL);

        Document doc = Jsoup.connect(APPLY_PORTAL_URL)
                .userAgent(USER_AGENT)
                .timeout(TIMEOUT_MS)
                .get();

        Element table = doc.selectFirst("table#example");
        if (table == null) {
            table = doc.selectFirst("table.table");
        }
        if (table == null) {
            logger.warn("No table found on apply.tnpscexams.in");
            return list;
        }

        Elements rows = table.select("tbody tr");
        logger.info("Found {} notification rows in apply table", rows.size());

        for (Element row : rows) {
            try {
                Elements cells = row.select("td");
                if (cells.size() < 7) continue;

                String notifNumber = cells.get(0).text().trim();
                String notifDate = cells.get(1).text().trim();
                String postName = cells.get(2).text().trim();
                String startDate = cells.size() > 3 ? cells.get(3).text().trim() : "";
                String endDate = cells.size() > 4 ? cells.get(4).text().trim() : "";
                String paymentDate = cells.size() > 5 ? cells.get(5).text().trim() : "";

                // PDFs in column 6
                String pdfTamil = null;
                String pdfEnglish = null;
                if (cells.size() > 6) {
                    Elements pdfLinks = cells.get(6).select("a[href]");
                    for (Element a : pdfLinks) {
                        String linkText = a.text().toLowerCase();
                        String href = a.attr("href");
                        String validUrl = resolveAndValidateUrl(APPLY_PORTAL_URL, href);
                        if (validUrl != null) {
                            if (linkText.contains("tamil")) {
                                pdfTamil = validUrl;
                            } else if (linkText.contains("english")) {
                                pdfEnglish = validUrl;
                            } else if (pdfEnglish == null) {
                                pdfEnglish = validUrl;
                            }
                        }
                    }
                }

                String examDate = cells.size() > 7 ? cells.get(7).text().trim() : "";
                // Clean up dummy default epoch date 01/01/1970 if present
                if (examDate.contains("01/01/1970")) {
                    examDate = "To be announced";
                }

                String activity = cells.size() > 8 ? cells.get(8).text().trim() : "";
                String applyUrl = null;
                if (cells.size() > 8) {
                    Element actLink = cells.get(8).selectFirst("a[href]");
                    if (actLink != null && !actLink.attr("href").startsWith("javascript:")) {
                        applyUrl = resolveAndValidateUrl(APPLY_PORTAL_URL, actLink.attr("href"));
                    }
                }
                if (applyUrl == null) {
                    applyUrl = APPLY_PORTAL_URL;
                }

                if (postName.isEmpty()) continue;

                Notification notif = new Notification();
                notif.setNotificationNumber(notifNumber);
                notif.setTitle(postName);
                notif.setDescription(postName + " (Notification No: " + notifNumber + ")");
                notif.setPublishedDate(notifDate);
                notif.setApplicationStartDate(startDate);
                notif.setApplicationEndDate(endDate);
                notif.setPaymentLastDate(paymentDate);
                notif.setExaminationDate(examDate);
                notif.setOfficialPdfUrl(pdfEnglish != null ? pdfEnglish : pdfTamil);
                notif.setOfficialPdfUrlTamil(pdfTamil);
                notif.setOfficialNotificationUrl(applyUrl);
                notif.setSourceUrl(APPLY_PORTAL_URL);
                notif.setSourceName("TNPSC Online Application Portal");
                notif.setOfficial(true);

                String category = determineCategory(postName);
                notif.setCategory(category);
                notif.setIcon(determineIcon(category));

                String status = determineStatus(postName, activity, startDate, endDate, examDate);
                notif.setStatus(status);

                // Determine isNew
                LocalDate pubDate = parseDate(notifDate);
                LocalDate today = LocalDate.now();
                if (pubDate != null && !pubDate.isBefore(today.minusDays(30))) {
                    notif.setNew(true);
                } else {
                    notif.setNew("Application Open".equals(status));
                }

                list.add(notif);
            } catch (Exception ex) {
                logger.error("Error parsing row from apply portal: {}", ex.getMessage());
            }
        }

        return list;
    }

    /**
     * Fetches current announcements and hall ticket notices from the main TNPSC homepage.
     */
    public List<Notification> fetchFromMainPortal() throws Exception {
        List<Notification> list = new ArrayList<>();
        logger.info("Connecting to TNPSC Main Portal: {}", MAIN_PORTAL_URL);

        Document doc = Jsoup.connect(MAIN_PORTAL_URL)
                .userAgent(USER_AGENT)
                .timeout(TIMEOUT_MS)
                .get();

        Elements items = doc.select(".list-item");
        logger.info("Found {} announcement items on main portal", items.size());

        for (Element item : items) {
            try {
                Element content = item.selectFirst(".item-content");
                if (content == null) continue;

                Elements h6s = content.select("h6");
                String tamilTitle = "";
                String englishTitle = "";
                if (h6s.size() >= 2) {
                    tamilTitle = h6s.get(0).text().trim();
                    englishTitle = h6s.get(1).text().trim();
                } else if (h6s.size() == 1) {
                    englishTitle = h6s.get(0).text().trim();
                }

                String displayTitle = !englishTitle.isEmpty() ? englishTitle : tamilTitle;
                if (displayTitle.isEmpty()) continue;

                // Extract notification number using regex
                String notifNumber = extractNotificationNumber(displayTitle);

                // Extract links
                Element details = item.selectFirst(".item-details");
                String officialUrl = null;
                String pdfTamil = null;
                String pdfEnglish = null;

                if (details != null) {
                    Elements links = details.select("a[href]");
                    for (Element a : links) {
                        String href = a.attr("href");
                        String text = a.text().toLowerCase();
                        String valid = resolveAndValidateUrl(MAIN_PORTAL_URL, href);
                        if (valid != null) {
                            if (text.contains("hall ticket") || text.contains("apply") || text.contains("otr")) {
                                officialUrl = valid;
                            } else if (text.contains("tamil") || text.contains("?????")) {
                                pdfTamil = valid;
                            } else if (text.contains("english")) {
                                pdfEnglish = valid;
                            } else if (officialUrl == null) {
                                officialUrl = valid;
                            }
                        }
                    }
                }

                Notification notif = new Notification();
                notif.setNotificationNumber(notifNumber);
                notif.setTitle(displayTitle);
                notif.setDescription(displayTitle);
                notif.setOfficialNotificationUrl(officialUrl != null ? officialUrl : MAIN_PORTAL_URL);
                notif.setOfficialPdfUrl(pdfEnglish != null ? pdfEnglish : pdfTamil);
                notif.setOfficialPdfUrlTamil(pdfTamil);
                notif.setSourceUrl(MAIN_PORTAL_URL);
                notif.setSourceName("TNPSC Official Portal");
                notif.setOfficial(true);

                String category = determineCategory(displayTitle);
                notif.setCategory(category);
                notif.setIcon(determineIcon(category));

                String status = determineStatus(displayTitle, "", "", "", "");
                notif.setStatus(status);
                notif.setNew(true);

                list.add(notif);
            } catch (Exception ex) {
                logger.error("Error parsing item from main portal: {}", ex.getMessage());
            }
        }

        return list;
    }

    /**
     * Fetches latest results and announcements from tnpsc.gov.in/home.aspx
     */
    public List<Notification> fetchFromHomePageEvents() {
        List<Notification> list = new ArrayList<>();
        try {
            logger.info("Connecting to TNPSC Home Page Events: {}", HOME_PAGE_URL);
            Document doc = Jsoup.connect(HOME_PAGE_URL)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT_MS)
                    .get();

            Elements eventTitles = doc.select(".event-title a");
            for (Element a : eventTitles) {
                try {
                    String title = a.text().trim();
                    if (title.isEmpty()) continue;

                    String href = a.attr("href");
                    String validUrl = resolveAndValidateUrl(HOME_PAGE_URL, href);

                    String notifNumber = extractNotificationNumber(title);

                    Notification notif = new Notification();
                    notif.setNotificationNumber(notifNumber);
                    notif.setTitle(title);
                    notif.setDescription(title);
                    notif.setOfficialNotificationUrl(validUrl != null ? validUrl : HOME_PAGE_URL);
                    if (validUrl != null && validUrl.endsWith(".pdf")) {
                        notif.setOfficialPdfUrl(validUrl);
                    }
                    notif.setSourceUrl(HOME_PAGE_URL);
                    notif.setSourceName("TNPSC Official Announcements");
                    notif.setOfficial(true);

                    String category = determineCategory(title);
                    notif.setCategory(category);
                    notif.setIcon(determineIcon(category));

                    String status = determineStatus(title, "", "", "", "");
                    notif.setStatus(status);
                    notif.setNew(true);

                    list.add(notif);
                } catch (Exception e) {
                    logger.warn("Error parsing event title: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.warn("Could not fetch home.aspx events: {}", e.getMessage());
        }
        return list;
    }

    /**
     * Fetches Press Releases table from tnpsc.gov.in/English/press_releases.aspx
     */
    public List<Notification> fetchPressReleases() {
        List<Notification> list = new ArrayList<>();
        try {
            logger.info("Connecting to TNPSC Press Releases: {}", PRESS_RELEASES_URL);
            Document doc = Jsoup.connect(PRESS_RELEASES_URL)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT_MS)
                    .get();

            Elements rows = doc.select("table.table-striped tbody tr");
            if (rows.isEmpty()) {
                rows = doc.select("table tbody tr");
            }

            for (Element row : rows) {
                try {
                    Elements cells = row.select("td");
                    if (cells.size() < 3) continue;

                    String prNo = cells.get(0).text().trim();
                    String date = cells.get(1).text().trim();
                    String title = cells.get(2).text().trim();

                    String pdfUrl = null;
                    if (cells.size() > 3) {
                        Element a = cells.get(3).selectFirst("a[href]");
                        if (a != null) {
                            pdfUrl = resolveAndValidateUrl(PRESS_RELEASES_URL, a.attr("href"));
                        }
                    }

                    if (title.isEmpty()) continue;

                    Notification notif = new Notification();
                    notif.setNotificationNumber("PR " + prNo);
                    notif.setTitle(title);
                    notif.setDescription("Press Release No. " + prNo + ": " + title);
                    notif.setPublishedDate(date);
                    notif.setOfficialPdfUrl(pdfUrl);
                    notif.setOfficialNotificationUrl(pdfUrl != null ? pdfUrl : PRESS_RELEASES_URL);
                    notif.setSourceUrl(PRESS_RELEASES_URL);
                    notif.setSourceName("TNPSC Press Releases");
                    notif.setCategory("Press Release");
                    notif.setIcon("📰");
                    notif.setStatus(determineStatus(title, "", "", "", ""));
                    notif.setOfficial(true);

                    LocalDate prDate = parseDate(date);
                    if (prDate != null && !prDate.isBefore(LocalDate.now().minusDays(14))) {
                        notif.setNew(true);
                    }

                    list.add(notif);
                } catch (Exception e) {
                    logger.warn("Error parsing press release row: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.warn("Could not fetch press releases: {}", e.getMessage());
        }
        return list;
    }

    /**
     * Determines notification category based on title keywords.
     */
    public String determineCategory(String title) {
        if (title == null) return "General Recruitment";
        String upper = title.toUpperCase();

        if (upper.contains("PRESS RELEASE") || upper.contains("PRESS NOTE")) {
            return "Press Release";
        }
        if (upper.contains("HALL TICKET") || upper.contains("ADMIT CARD")) {
            return "Hall Ticket";
        }
        if (upper.contains("RESULT") || upper.contains("MARKS") || upper.contains("RANK LIST")) {
            return "Results";
        }
        if (upper.contains("CERTIFICATE VERIFICATION") || upper.contains("OCV")) {
            return "Certificate Verification";
        }
        if (upper.contains("CORRIGENDUM") || upper.contains("ADDENDUM")) {
            return "Corrigendum / Addendum";
        }
        if (upper.contains("GROUP IV") || upper.contains("GROUP-IV") || upper.contains("GROUP 4") || upper.contains("CCSE-IV") || upper.contains("CCSE - IV")) {
            return "Group IV";
        }
        if (upper.contains("GROUP II") || upper.contains("GROUP-II") || upper.contains("GROUP 2") || upper.contains("CCSE-II") || upper.contains("CCSE - II")) {
            return "Group II / IIA";
        }
        if (upper.contains("GROUP I") || upper.contains("GROUP-I") || upper.contains("GROUP 1") || upper.contains("CCSE-I") || upper.contains("CCSE - I")) {
            return "Group I";
        }
        if (upper.contains("TECHNICAL") || upper.contains("CTS") || upper.contains("ENGINEERING") || upper.contains("DIPLOMA") || upper.contains("ITI")) {
            return "Technical Services";
        }
        return "General Recruitment";
    }

    /**
     * Determines application status based on dates and official keywords.
     */
    public String determineStatus(String title, String activity, String startDateStr, String endDateStr, String examDateStr) {
        String upperTitle = title != null ? title.toUpperCase() : "";
        String upperActivity = activity != null ? activity.toUpperCase() : "";

        // Explicit events confirmed by announcement text
        if (upperTitle.contains("RESULT") || upperTitle.contains("MARKS") || upperTitle.contains("RANK LIST") || upperActivity.contains("RESULT")) {
            return "Results Published";
        }
        if (upperTitle.contains("HALL TICKET") || upperActivity.contains("HALL TICKET") || upperActivity.contains("ADMIT CARD")) {
            return "Hall Ticket Released";
        }

        LocalDate today = LocalDate.now();
        LocalDate startDate = parseDate(startDateStr);
        LocalDate endDate = parseDate(endDateStr);

        // Upcoming if start date is strictly in future
        if (startDate != null && today.isBefore(startDate)) {
            return "Upcoming";
        }

        // Application Open if within window or activity says Apply
        if (startDate != null && endDate != null) {
            if (!today.isBefore(startDate) && !today.isAfter(endDate)) {
                return "Application Open";
            }
        } else if (startDate != null && !today.isBefore(startDate) && (endDate == null)) {
            return "Application Open";
        }

        if (upperActivity.contains("APPLY NOW") || upperActivity.contains("APPLY ONLINE")) {
            if (endDate == null || !today.isAfter(endDate)) {
                return "Application Open";
            }
        }

        // If deadline passed
        if (endDate != null && today.isAfter(endDate)) {
            LocalDate examDate = parseDate(examDateStr);
            if (examDate != null && !today.isAfter(examDate)) {
                return "Examination Scheduled";
            }
            if (examDateStr != null && !examDateStr.isBlank()
                    && !examDateStr.toLowerCase().contains("will be announced")
                    && !examDateStr.contains("1970")) {
                return "Examination Scheduled";
            }
            return "Application Closed";
        }

        if (upperActivity.contains("APPLICATION CLOSED") || upperActivity.contains("CLOSED")) {
            return "Application Closed";
        }

        return "Upcoming";
    }

    /**
     * Assigns appropriate emoji icon for category.
     */
    public String determineIcon(String category) {
        if (category == null) return "📢";
        return switch (category) {
            case "Group IV" -> "📘";
            case "Group II / IIA" -> "📗";
            case "Group I" -> "🎓";
            case "Technical Services" -> "⚙️";
            case "Hall Ticket" -> "🎟️";
            case "Results" -> "🏆";
            case "Certificate Verification" -> "📜";
            case "Press Release" -> "📰";
            case "Corrigendum / Addendum" -> "📝";
            default -> "📢";
        };
    }

    /**
     * Extracts notification number like "11/2026" or "07/2026" from text.
     */
    private String extractNotificationNumber(String text) {
        if (text == null) return null;
        Pattern pattern = Pattern.compile("(?i)(?:Notification\\s*No\\.?|?????????\\s*???\\.?)\\s*[:.]?\\s*([0-9]{1,3}/[0-9]{4})");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }
}
