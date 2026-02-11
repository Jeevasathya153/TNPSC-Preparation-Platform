package com.tnexam.controller;

import com.tnexam.model.Quiz;
import com.tnexam.model.Result;
import com.tnexam.service.QuizService;
import com.tnexam.service.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/quizzes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:5173"})
public class QuizController {
    
    @Autowired
    private QuizService quizService;
    
    @Autowired
    private ResultService resultService;

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizById(@PathVariable String id) {
        Optional<Quiz> quiz = quizService.getQuizById(id);
        if (quiz.isPresent()) {
            return ResponseEntity.ok(quiz.get());
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("message", "Quiz not found");
        return ResponseEntity.badRequest().body(error);
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<?> getQuizQuestions(@PathVariable String id) {
        Optional<Quiz> quiz = quizService.getQuizById(id);
        if (quiz.isPresent() && quiz.get().getQuestions() != null) {
            return ResponseEntity.ok(quiz.get().getQuestions());
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("message", "Quiz or questions not found");
        return ResponseEntity.badRequest().body(error);
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<Quiz>> getQuizzesBySubject(@PathVariable String subject) {
        return ResponseEntity.ok(quizService.getQuizzesBySubject(subject));
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<Quiz>> getQuizzesByDifficulty(@PathVariable String difficulty) {
        return ResponseEntity.ok(quizService.getQuizzesByDifficulty(difficulty));
    }

    @GetMapping("/subject/{subject}/difficulty/{difficulty}")
    public ResponseEntity<List<Quiz>> getQuizzesBySubjectAndDifficulty(
            @PathVariable String subject,
            @PathVariable String difficulty) {
        return ResponseEntity.ok(quizService.getQuizzesBySubjectAndDifficulty(subject, difficulty));
    }

    @GetMapping("/level/{level}")
    public ResponseEntity<List<Quiz>> getQuizzesByLevel(@PathVariable String level) {
        return ResponseEntity.ok(quizService.getQuizzesByLevel(level));
    }

    @GetMapping("/subject/{subject}/level/{level}")
    public ResponseEntity<List<Quiz>> getQuizzesBySubjectAndLevel(
            @PathVariable String subject,
            @PathVariable String level) {
        return ResponseEntity.ok(quizService.getQuizzesBySubjectAndLevel(subject, level));
    }

    @PostMapping
    public ResponseEntity<?> createQuiz(@RequestBody Quiz quiz) {
        Quiz createdQuiz = quizService.createQuiz(quiz);
        return ResponseEntity.ok(createdQuiz);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuiz(@PathVariable String id, @RequestBody Quiz quizDetails) {
        Quiz updatedQuiz = quizService.updateQuiz(id, quizDetails);
        if (updatedQuiz != null) {
            return ResponseEntity.ok(updatedQuiz);
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("message", "Quiz not found");
        return ResponseEntity.badRequest().body(error);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable String id) {
        quizService.deleteQuiz(id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Quiz deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{quizId}/submit")
    public ResponseEntity<?> submitQuizResult(@PathVariable String quizId, @RequestBody Result result) {
        result.setQuizId(quizId);
        Result savedResult = resultService.submitQuizResult(result);
        return ResponseEntity.ok(savedResult);
    }
}
