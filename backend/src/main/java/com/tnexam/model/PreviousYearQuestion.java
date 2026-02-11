package com.tnexam.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "previous_year_questions")
public class PreviousYearQuestion {
    @Id
    @Field("_id")
    private String id;
    
    private String exam;
    private String year;
    private String subject;
    private String language;
    
    @Field("pdfSource")
    private String pdfSource;
    
    @Field("officialPageUrl")
    private String officialPageUrl;

    // Constructors
    public PreviousYearQuestion() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getExam() { return exam; }
    public void setExam(String exam) { this.exam = exam; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getPdfSource() { return pdfSource; }
    public void setPdfSource(String pdfSource) { this.pdfSource = pdfSource; }

    public String getOfficialPageUrl() { return officialPageUrl; }
    public void setOfficialPageUrl(String officialPageUrl) { this.officialPageUrl = officialPageUrl; }
}
