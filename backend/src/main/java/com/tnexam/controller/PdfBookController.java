package com.tnexam.controller;

import com.tnexam.model.PdfBook;
import com.tnexam.service.PdfBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/pdf-books")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:5173"})
public class PdfBookController {

    @Autowired
    private PdfBookService pdfBookService;

    @GetMapping
    public ResponseEntity<List<PdfBook>> getAllPdfBooks() {
        return ResponseEntity.ok(pdfBookService.getAllPdfBooks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPdfBookById(@PathVariable String id) {
        Optional<PdfBook> pdfBook = pdfBookService.getPdfBookById(id);
        if (pdfBook.isPresent()) {
            return ResponseEntity.ok(pdfBook.get());
        }
        Map<String, String> error = new HashMap<>();
        error.put("message", "PDF Book not found");
        return ResponseEntity.badRequest().body(error);
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<PdfBook>> getPdfBooksBySubject(@PathVariable String subject) {
        return ResponseEntity.ok(pdfBookService.getPdfBooksBySubject(subject));
    }

    @GetMapping("/language/{language}")
    public ResponseEntity<List<PdfBook>> getPdfBooksByLanguage(@PathVariable String language) {
        return ResponseEntity.ok(pdfBookService.getPdfBooksByLanguage(language));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<PdfBook>> getPdfBooksByType(@PathVariable String type) {
        return ResponseEntity.ok(pdfBookService.getPdfBooksByType(type));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PdfBook>> searchPdfBooks(@RequestParam String title) {
        return ResponseEntity.ok(pdfBookService.searchPdfBooks(title));
    }

    @PostMapping
    public ResponseEntity<?> createPdfBook(@RequestBody PdfBook pdfBook) {
        PdfBook created = pdfBookService.createPdfBook(pdfBook);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePdfBook(@PathVariable String id, @RequestBody PdfBook pdfBookDetails) {
        PdfBook updated = pdfBookService.updatePdfBook(id, pdfBookDetails);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        Map<String, String> error = new HashMap<>();
        error.put("message", "PDF Book not found");
        return ResponseEntity.badRequest().body(error);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePdfBook(@PathVariable String id) {
        pdfBookService.deletePdfBook(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "PDF Book deleted successfully");
        return ResponseEntity.ok(response);
    }
}
