package com.tnexam.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class TranslationService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private static final String MYMEMORY_API_URL = "https://api.mymemory.translated.net/get";
    
    // Cache for translations to avoid repeated API calls
    private final Map<String, String> translationCache = new HashMap<>();

    public TranslationService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Translate text from one language to another using MyMemory API
     * @param text Text to translate
     * @param sourceLang Source language code (en, ta)
     * @param targetLang Target language code (en, ta)
     * @return Translated text
     */
    public String translateText(String text, String sourceLang, String targetLang) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }

        // Return original if same language
        if (sourceLang.equals(targetLang)) {
            return text;
        }

        // Check cache first
        String cacheKey = sourceLang + "|" + targetLang + "|" + text;
        if (translationCache.containsKey(cacheKey)) {
            return translationCache.get(cacheKey);
        }

        try {
            // Encode text for URL
            String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8);
            // Convert to uppercase as required by MyMemory API
            String langPair = sourceLang.toUpperCase() + "|" + targetLang.toUpperCase();
            
            // Build URL
            String url = UriComponentsBuilder.fromHttpUrl(MYMEMORY_API_URL)
                    .queryParam("q", encodedText)
                    .queryParam("langpair", langPair)
                    .toUriString();

            // Make API call
            String response = restTemplate.getForObject(url, String.class);
            
            // Parse JSON response
            JsonNode root = objectMapper.readTree(response);
            String translatedText = root.path("responseData").path("translatedText").asText();
            
            // Check if the response contains an error message
            if (translatedText != null && !translatedText.isEmpty() && 
                !translatedText.toUpperCase().contains("INVALID LANGUAGE") &&
                !translatedText.toUpperCase().contains("ERROR")) {
                // Cache the translation
                translationCache.put(cacheKey, translatedText);
                return translatedText;
            } else {
                System.err.println("Invalid translation response: " + translatedText);
                return text; // Return original text on invalid response
            }
        } catch (Exception e) {
            System.err.println("Translation error: " + e.getMessage());
            return text; // Return original text on error
        }
    }

    /**
     * Translate from English to Tamil
     */
    public String translateToTamil(String text) {
        return translateText(text, "en", "ta");
    }

    /**
     * Translate from Tamil to English
     */
    public String translateToEnglish(String text) {
        return translateText(text, "ta", "en");
    }

    /**
     * Clear translation cache
     */
    public void clearCache() {
        translationCache.clear();
    }

    /**
     * Get cache size
     */
    public int getCacheSize() {
        return translationCache.size();
    }
}
