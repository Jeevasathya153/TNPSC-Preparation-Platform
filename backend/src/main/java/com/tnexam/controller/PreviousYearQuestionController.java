package com.tnexam.controller;

import com.tnexam.model.PreviousYearQuestion;
import com.tnexam.service.PreviousYearQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/previous-year-questions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:5173"})
public class PreviousYearQuestionController {

    @Autowired
    private PreviousYearQuestionService previousYearQuestionService;

    @GetMapping
    public ResponseEntity<List<PreviousYearQuestion>> getAllPreviousYearQuestions() {
        return ResponseEntity.ok(previousYearQuestionService.getAllPreviousYearQuestions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPreviousYearQuestionById(@PathVariable String id) {
        Optional<PreviousYearQuestion> pyq = previousYearQuestionService.getPreviousYearQuestionById(id);
        if (pyq.isPresent()) {
            return ResponseEntity.ok(pyq.get());
        }
        Map<String, String> error = new HashMap<>();
        error.put("message", "Previous year question not found");
        return ResponseEntity.badRequest().body(error);
    }

    @GetMapping("/exam/{exam}")
    public ResponseEntity<List<PreviousYearQuestion>> getPreviousYearQuestionsByExam(@PathVariable String exam) {
        return ResponseEntity.ok(previousYearQuestionService.getPreviousYearQuestionsByExam(exam));
    }

    @GetMapping("/year/{year}")
    public ResponseEntity<List<PreviousYearQuestion>> getPreviousYearQuestionsByYear(@PathVariable String year) {
        return ResponseEntity.ok(previousYearQuestionService.getPreviousYearQuestionsByYear(year));
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<PreviousYearQuestion>> getPreviousYearQuestionsBySubject(@PathVariable String subject) {
        return ResponseEntity.ok(previousYearQuestionService.getPreviousYearQuestionsBySubject(subject));
    }

    @GetMapping("/language/{language}")
    public ResponseEntity<List<PreviousYearQuestion>> getPreviousYearQuestionsByLanguage(@PathVariable String language) {
        return ResponseEntity.ok(previousYearQuestionService.getPreviousYearQuestionsByLanguage(language));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<PreviousYearQuestion>> filterPreviousYearQuestions(
            @RequestParam(required = false) String exam,
            @RequestParam(required = false) String year) {
        if (exam != null && year != null) {
            return ResponseEntity.ok(previousYearQuestionService.getPreviousYearQuestionsByExamAndYear(exam, year));
        }
        return ResponseEntity.ok(previousYearQuestionService.getAllPreviousYearQuestions());
    }

    @PostMapping
    public ResponseEntity<?> createPreviousYearQuestion(@RequestBody PreviousYearQuestion pyq) {
        PreviousYearQuestion created = previousYearQuestionService.createPreviousYearQuestion(pyq);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePreviousYearQuestion(@PathVariable String id, @RequestBody PreviousYearQuestion details) {
        PreviousYearQuestion updated = previousYearQuestionService.updatePreviousYearQuestion(id, details);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        Map<String, String> error = new HashMap<>();
        error.put("message", "Previous year question not found");
        return ResponseEntity.badRequest().body(error);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePreviousYearQuestion(@PathVariable String id) {
        previousYearQuestionService.deletePreviousYearQuestion(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Previous year question deleted successfully");
        return ResponseEntity.ok(response);
    }
}
