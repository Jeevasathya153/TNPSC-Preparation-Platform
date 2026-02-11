package com.tnexam.model;

import java.util.List;

/**
 * Embedded question structure that matches MongoDB quiz documents
 */
public class QuestionEmbedded {
    
    private String id;
    private Integer qno;
    private String question;  // MongoDB uses "question" not "questionText"
    private List<String> options;
    private String correctAnswer;  // MongoDB stores as string
    private int correctAnswerIndex;  // Computed field for frontend
    private String explanation;
    private String difficulty;
    private String subject;
    private String type;

    public QuestionEmbedded() {}

    public QuestionEmbedded(String question, List<String> options, String correctAnswer) {
        this.question = question;
        this.options = options;
        this.correctAnswer = correctAnswer;
        computeCorrectAnswerIndex();
    }

    // Compute correctAnswerIndex from correctAnswer string
    private void computeCorrectAnswerIndex() {
        if (correctAnswer != null && options != null) {
            for (int i = 0; i < options.size(); i++) {
                if (options.get(i).equalsIgnoreCase(correctAnswer)) {
                    this.correctAnswerIndex = i;
                    return;
                }
            }
        }
        this.correctAnswerIndex = -1;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Integer getQno() { return qno; }
    public void setQno(Integer qno) { this.qno = qno; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    
    // For backward compatibility with frontend
    public String getQuestionText() { return question; }
    public void setQuestionText(String questionText) { this.question = questionText; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { 
        this.options = options;
        computeCorrectAnswerIndex();
    }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { 
        this.correctAnswer = correctAnswer;
        computeCorrectAnswerIndex();
    }

    public int getCorrectAnswerIndex() { 
        if (correctAnswerIndex == 0 && correctAnswer != null) {
            computeCorrectAnswerIndex();
        }
        return correctAnswerIndex; 
    }
    public void setCorrectAnswerIndex(int correctAnswerIndex) { this.correctAnswerIndex = correctAnswerIndex; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
