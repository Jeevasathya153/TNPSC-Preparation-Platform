package com.tnexam.controller;

import com.tnexam.model.Book;
import com.tnexam.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/books")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:5173"})
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookById(@PathVariable String id) {
        Optional<Book> book = bookService.getBookById(id);
        if (book.isPresent()) {
            return ResponseEntity.ok(book.get());
        }
        Map<String, String> error = new HashMap<>();
        error.put("message", "Book not found");
        return ResponseEntity.badRequest().body(error);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Book>> getBooksByCategory(@PathVariable String category) {
        return ResponseEntity.ok(bookService.getBooksByCategory(category));
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<Book>> getBooksBySubject(@PathVariable String subject) {
        return ResponseEntity.ok(bookService.getBooksBySubject(subject));
    }

    @GetMapping("/pdf-books")
    public ResponseEntity<List<Book>> getAllPdfBooks() {
        return ResponseEntity.ok(bookService.getAllPdfBooks());
    }

    @PostMapping
    public ResponseEntity<?> createBook(@RequestBody Book book) {
        Book createdBook = bookService.createBook(book);
        return ResponseEntity.ok(createdBook);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBook(@PathVariable String id, @RequestBody Book bookDetails) {
        Book updatedBook = bookService.updateBook(id, bookDetails);
        if (updatedBook != null) {
            return ResponseEntity.ok(updatedBook);
        }
        Map<String, String> error = new HashMap<>();
        error.put("message", "Book not found");
        return ResponseEntity.badRequest().body(error);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable String id) {
        bookService.deleteBook(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Book deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadBook(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("subject") String subject,
            @RequestParam("userId") String userId,
            @RequestParam("file") MultipartFile file) {
        
        try {
            if (file.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "File is empty");
                return ResponseEntity.badRequest().body(error);
            }

            if (!file.getContentType().equals("application/pdf")) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Only PDF files are allowed");
                return ResponseEntity.badRequest().body(error);
            }

            Book book = new Book();
            book.setTitle(title);
            book.setDescription(description);
            book.setCategory(category);
            book.setSubject(subject);
            book.setFileName(file.getOriginalFilename());
            book.setFileType(file.getContentType());
            book.setFileSize(file.getSize());
            book.setFileData(file.getBytes());
            book.setUploadedBy(userId);

            Book savedBook = bookService.createBook(book);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Book uploaded successfully");
            response.put("book", savedBook);
            response.put("bookId", savedBook.getId());
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error processing file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadBook(@PathVariable String id) {
        Optional<Book> bookOpt = bookService.getBookById(id);
        if (bookOpt.isPresent()) {
            Book book = bookOpt.get();
            // If file binary is present, stream it
            if (book.getFileData() != null && book.getFileData().length > 0) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + book.getFileName() + "\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(book.getFileData());
            }
            // If binary not present but we have a URL, return the URL so frontend can open it
            if (book.getFileUrl() != null && !book.getFileUrl().isBlank()) {
                Map<String, String> resp = new HashMap<>();
                resp.put("fileUrl", book.getFileUrl());
                return ResponseEntity.ok(resp);
            }
        }
        return ResponseEntity.notFound().build();
    }
}
