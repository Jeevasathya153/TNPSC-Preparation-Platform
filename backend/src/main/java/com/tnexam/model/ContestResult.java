package com.tnexam.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "contest_results")
@CompoundIndexes({
    @CompoundIndex(name = "user_contest_idx", def = "{'userId': 1, 'contestId': 1}", unique = true)
})
public class ContestResult {
    
    @Id
    private String id;
    private String contestId;
    private String contestType; // "DAILY" or "WEEKLY"
    private String userId;
    private String userName;
    private String userEmail;
    private int score;
    private int totalMarks;
    private int correctAnswers;
    private int wrongAnswers;
    private int totalQuestions;
    private long timeTakenSeconds;
    private double accuracy; // percentage
    private double averageTimePerQuestion; // in seconds
    private int rank; // calculated rank
    private Map<String, Integer> answersMap; // questionId -> selected answer index
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;

    public ContestResult() {
        this.createdAt = LocalDateTime.now();
        this.submittedAt = LocalDateTime.now();
    }

    // Calculate accuracy
    public void calculateAccuracy() {
        if (totalQuestions > 0) {
            this.accuracy = ((double) correctAnswers / totalQuestions) * 100;
        }
    }

    // Calculate average time per question
    public void calculateAverageTime() {
        if (totalQuestions > 0) {
            this.averageTimePerQuestion = (double) timeTakenSeconds / totalQuestions;
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getContestId() { return contestId; }
    public void setContestId(String contestId) { this.contestId = contestId; }

    public String getContestType() { return contestType; }
    public void setContestType(String contestType) { this.contestType = contestType; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalMarks() { return totalMarks; }
    public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

    public int getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }

    public int getWrongAnswers() { return wrongAnswers; }
    public void setWrongAnswers(int wrongAnswers) { this.wrongAnswers = wrongAnswers; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public long getTimeTakenSeconds() { return timeTakenSeconds; }
    public void setTimeTakenSeconds(long timeTakenSeconds) { this.timeTakenSeconds = timeTakenSeconds; }

    public double getAccuracy() { return accuracy; }
    public void setAccuracy(double accuracy) { this.accuracy = accuracy; }

    public double getAverageTimePerQuestion() { return averageTimePerQuestion; }
    public void setAverageTimePerQuestion(double averageTimePerQuestion) { this.averageTimePerQuestion = averageTimePerQuestion; }

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }

    public Map<String, Integer> getAnswersMap() { return answersMap; }
    public void setAnswersMap(Map<String, Integer> answersMap) { this.answersMap = answersMap; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
