package com.tnexam.controller;

import com.tnexam.model.Question;
import com.tnexam.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Collections;

@RestController
@RequestMapping("/questions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:5173"})
public class QuestionController {
    
    @Autowired
    private QuestionRepository questionRepository;

    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        List<Question> questions = questionRepository.findAll();
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<Question>> getQuestionsByQuizId(@PathVariable String quizId) {
        List<Question> questions = questionRepository.findByQuizId(quizId);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<Question>> getQuestionsBySubject(@PathVariable String subject) {
        List<Question> questions = questionRepository.findBySubject(subject);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/subject/{subject}/difficulty/{difficulty}")
    public ResponseEntity<List<Question>> getQuestionsBySubjectAndDifficulty(
            @PathVariable String subject, 
            @PathVariable String difficulty) {
        List<Question> questions = questionRepository.findBySubjectAndDifficulty(subject, difficulty);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/subject/{subject}/random")
    public ResponseEntity<List<Question>> getRandomQuestionsBySubject(
            @PathVariable String subject,
            @RequestParam(defaultValue = "10") int count) {
        List<Question> questions = questionRepository.findBySubject(subject);
        Collections.shuffle(questions);
        List<Question> randomQuestions = questions.stream().limit(count).collect(Collectors.toList());
        return ResponseEntity.ok(randomQuestions);
    }

    @GetMapping("/subject/{subject}/mixed")
    public ResponseEntity<List<Question>> getMixedDifficultyQuestions(
            @PathVariable String subject,
            @RequestParam(defaultValue = "5") int easyCount,
            @RequestParam(defaultValue = "5") int mediumCount,
            @RequestParam(defaultValue = "5") int hardCount) {
        
        List<Question> easyQuestions = questionRepository.findBySubjectAndDifficulty(subject, "easy");
        List<Question> mediumQuestions = questionRepository.findBySubjectAndDifficulty(subject, "medium");
        List<Question> hardQuestions = questionRepository.findBySubjectAndDifficulty(subject, "hard");
        
        Collections.shuffle(easyQuestions);
        Collections.shuffle(mediumQuestions);
        Collections.shuffle(hardQuestions);
        
        List<Question> result = new java.util.ArrayList<>();
        result.addAll(easyQuestions.stream().limit(easyCount).collect(Collectors.toList()));
        result.addAll(mediumQuestions.stream().limit(mediumCount).collect(Collectors.toList()));
        result.addAll(hardQuestions.stream().limit(hardCount).collect(Collectors.toList()));
        
        Collections.shuffle(result);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<Question>> getQuestionsByDifficulty(@PathVariable String difficulty) {
        List<Question> questions = questionRepository.findByDifficulty(difficulty);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getQuestionStats() {
        List<Question> allQuestions = questionRepository.findAll();
        Map<String, Object> stats = new HashMap<>();
        
        // Count by subject
        Map<String, Long> bySubject = allQuestions.stream()
            .filter(q -> q.getSubject() != null)
            .collect(Collectors.groupingBy(Question::getSubject, Collectors.counting()));
        
        // Count by difficulty
        Map<String, Long> byDifficulty = allQuestions.stream()
            .filter(q -> q.getDifficulty() != null)
            .collect(Collectors.groupingBy(Question::getDifficulty, Collectors.counting()));
        
        // Count by subject and difficulty
        Map<String, Map<String, Long>> bySubjectAndDifficulty = allQuestions.stream()
            .filter(q -> q.getSubject() != null && q.getDifficulty() != null)
            .collect(Collectors.groupingBy(Question::getSubject, 
                Collectors.groupingBy(Question::getDifficulty, Collectors.counting())));
        
        stats.put("total", allQuestions.size());
        stats.put("bySubject", bySubject);
        stats.put("byDifficulty", byDifficulty);
        stats.put("bySubjectAndDifficulty", bySubjectAndDifficulty);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{questionId}")
    public ResponseEntity<?> getQuestionById(@PathVariable String questionId) {
        Optional<Question> question = questionRepository.findById(questionId);
        if (question.isPresent()) {
            return ResponseEntity.ok(question.get());
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("message", "Question not found");
        return ResponseEntity.badRequest().body(error);
    }

    @PostMapping
    public ResponseEntity<?> createQuestion(@RequestBody Question question) {
        Question savedQuestion = questionRepository.save(question);
        return ResponseEntity.ok(savedQuestion);
    }

    @PostMapping("/batch")
    public ResponseEntity<?> createQuestions(@RequestBody List<Question> questions) {
        List<Question> savedQuestions = questionRepository.saveAll(questions);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Questions created successfully");
        response.put("count", savedQuestions.size());
        response.put("questions", savedQuestions);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<?> updateQuestion(@PathVariable String questionId, @RequestBody Question questionDetails) {
        Optional<Question> question = questionRepository.findById(questionId);
        if (question.isPresent()) {
            Question existingQuestion = question.get();
            if (questionDetails.getQuestionText() != null) existingQuestion.setQuestionText(questionDetails.getQuestionText());
            if (questionDetails.getOptions() != null) existingQuestion.setOptions(questionDetails.getOptions());
            if (questionDetails.getCorrectAnswerIndex() >= 0) existingQuestion.setCorrectAnswerIndex(questionDetails.getCorrectAnswerIndex());
            if (questionDetails.getExplanation() != null) existingQuestion.setExplanation(questionDetails.getExplanation());
            if (questionDetails.getDifficulty() != null) existingQuestion.setDifficulty(questionDetails.getDifficulty());
            if (questionDetails.getSubject() != null) existingQuestion.setSubject(questionDetails.getSubject());
            
            Question updatedQuestion = questionRepository.save(existingQuestion);
            return ResponseEntity.ok(updatedQuestion);
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("message", "Question not found");
        return ResponseEntity.badRequest().body(error);
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable String questionId) {
        Optional<Question> question = questionRepository.findById(questionId);
        if (question.isPresent()) {
            questionRepository.deleteById(questionId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Question deleted successfully");
            return ResponseEntity.ok(response);
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("message", "Question not found");
        return ResponseEntity.badRequest().body(error);
    }
}
