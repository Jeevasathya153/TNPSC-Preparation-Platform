package com.tnexam.service;

import com.tnexam.model.Quiz;
import com.tnexam.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class QuizService {
    
    @Autowired
    private QuizRepository quizRepository;

    public Quiz createQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    public Optional<Quiz> getQuizById(String id) {
        return quizRepository.findById(id);
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public List<Quiz> getQuizzesBySubject(String subject) {
        return quizRepository.findBySubject(subject);
    }

    public List<Quiz> getQuizzesByDifficulty(String difficulty) {
        // Try both 'difficulty' and 'level' fields
        List<Quiz> byDifficulty = quizRepository.findByDifficulty(difficulty);
        if (byDifficulty.isEmpty()) {
            return quizRepository.findByLevel(difficulty);
        }
        return byDifficulty;
    }

    public List<Quiz> getQuizzesBySubjectAndDifficulty(String subject, String difficulty) {
        // Try both 'difficulty' and 'level' fields
        List<Quiz> byDifficulty = quizRepository.findBySubjectAndDifficulty(subject, difficulty);
        if (byDifficulty.isEmpty()) {
            return quizRepository.findBySubjectAndLevel(subject, difficulty);
        }
        return byDifficulty;
    }

    public List<Quiz> getQuizzesByLevel(String level) {
        return quizRepository.findByLevel(level);
    }

    public List<Quiz> getQuizzesBySubjectAndLevel(String subject, String level) {
        return quizRepository.findBySubjectAndLevel(subject, level);
    }

    public Quiz updateQuiz(String id, Quiz quizDetails) {
        Optional<Quiz> quiz = quizRepository.findById(id);
        if (quiz.isPresent()) {
            Quiz existingQuiz = quiz.get();
            if (quizDetails.getTitle() != null) existingQuiz.setTitle(quizDetails.getTitle());
            if (quizDetails.getDescription() != null) existingQuiz.setDescription(quizDetails.getDescription());
            if (quizDetails.getPassingScore() > 0) existingQuiz.setPassingScore(quizDetails.getPassingScore());
            if (quizDetails.getTimeLimit() > 0) existingQuiz.setTimeLimit(quizDetails.getTimeLimit());
            return quizRepository.save(existingQuiz);
        }
        return null;
    }

    public void deleteQuiz(String id) {
        quizRepository.deleteById(id);
    }
}
