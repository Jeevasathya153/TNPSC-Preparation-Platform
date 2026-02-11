package com.tnexam.controller;

import com.tnexam.service.TranslationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/translate")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:5173"})
public class TranslationController {

    @Autowired
    private TranslationService translationService;

    /**
     * Translate a single text
     * POST /translate
     * Body: { "text": "Hello", "from": "en", "to": "ta" }
     */
    @PostMapping
    public ResponseEntity<?> translate(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        String from = request.getOrDefault("from", "en");
        String to = request.getOrDefault("to", "ta");

        if (text == null || text.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Text is required");
            return ResponseEntity.badRequest().body(error);
        }

        String translatedText = translationService.translateText(text, from, to);
        
        Map<String, String> response = new HashMap<>();
        response.put("original", text);
        response.put("translated", translatedText);
        response.put("from", from);
        response.put("to", to);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Translate multiple texts at once
     * POST /translate/batch
     * Body: { "texts": ["Hello", "World"], "from": "en", "to": "ta" }
     */
    @PostMapping("/batch")
    public ResponseEntity<?> translateBatch(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> texts = (List<String>) request.get("texts");
        String from = (String) request.getOrDefault("from", "en");
        String to = (String) request.getOrDefault("to", "ta");

        if (texts == null || texts.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Texts array is required");
            return ResponseEntity.badRequest().body(error);
        }

        List<Map<String, String>> translations = new ArrayList<>();
        for (String text : texts) {
            String translatedText = translationService.translateText(text, from, to);
            Map<String, String> item = new HashMap<>();
            item.put("original", text);
            item.put("translated", translatedText);
            translations.add(item);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("translations", translations);
        response.put("from", from);
        response.put("to", to);
        response.put("count", translations.size());

        return ResponseEntity.ok(response);
    }

    /**
     * Translate to Tamil
     * POST /translate/to-tamil
     * Body: { "text": "Hello" }
     */
    @PostMapping("/to-tamil")
    public ResponseEntity<?> translateToTamil(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        
        if (text == null || text.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Text is required");
            return ResponseEntity.badRequest().body(error);
        }

        String translatedText = translationService.translateToTamil(text);
        
        Map<String, String> response = new HashMap<>();
        response.put("original", text);
        response.put("translated", translatedText);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Translate to English
     * POST /translate/to-english
     * Body: { "text": "வணக்கம்" }
     */
    @PostMapping("/to-english")
    public ResponseEntity<?> translateToEnglish(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        
        if (text == null || text.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Text is required");
            return ResponseEntity.badRequest().body(error);
        }

        String translatedText = translationService.translateToEnglish(text);
        
        Map<String, String> response = new HashMap<>();
        response.put("original", text);
        response.put("translated", translatedText);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get cache statistics
     * GET /translate/cache-stats
     */
    @GetMapping("/cache-stats")
    public ResponseEntity<?> getCacheStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("cacheSize", translationService.getCacheSize());
        stats.put("status", "active");
        return ResponseEntity.ok(stats);
    }

    /**
     * Clear translation cache
     * POST /translate/clear-cache
     */
    @PostMapping("/clear-cache")
    public ResponseEntity<?> clearCache() {
        translationService.clearCache();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Translation cache cleared successfully");
        return ResponseEntity.ok(response);
    }
}
