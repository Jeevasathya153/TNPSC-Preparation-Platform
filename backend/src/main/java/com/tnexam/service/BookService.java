package com.tnexam.service;

import com.tnexam.model.Book;
import com.tnexam.repository.BookRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Optional<Book> getBookById(String id) {
        return bookRepository.findById(id);
    }

    public List<Book> getAllPdfBooks() {
        try {
            return mongoTemplate.findAll(Book.class, "pdf_books");
        } catch (Exception e) {
            return bookRepository.findAll();
        }
    }

    public List<Book> getBooksByCategory(String category) {
        if (category == null) return getAllPdfBooks();
        return bookRepository.findByCategory(category);
    }
    
    public List<Book> getBooksBySubject(String subject) {
        return bookRepository.findBySubject(subject);
    }

    public List<Book> searchByAuthor(String author) {
        return bookRepository.findByAuthorContainingIgnoreCase(author);
    }

    public List<Book> searchByTitle(String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title);
    }

    public Book createBook(Book book) {
        book.setCreatedAt(LocalDateTime.now());
        book.setUpdatedAt(LocalDateTime.now());
        return bookRepository.save(book);
    }

    public Book updateBook(String id, Book bookDetails) {
        Optional<Book> book = bookRepository.findById(id);
        if (book.isPresent()) {
            Book existingBook = book.get();
            if (bookDetails.getTitle() != null) existingBook.setTitle(bookDetails.getTitle());
            if (bookDetails.getCategory() != null) existingBook.setCategory(bookDetails.getCategory());
            if (bookDetails.getAuthor() != null) existingBook.setAuthor(bookDetails.getAuthor());
            if (bookDetails.getDescription() != null) existingBook.setDescription(bookDetails.getDescription());
            if (bookDetails.getFileUrl() != null) existingBook.setFileUrl(bookDetails.getFileUrl());
            if (bookDetails.getFileSize() > 0) existingBook.setFileSize(bookDetails.getFileSize());
            if (bookDetails.getTotalPages() > 0) existingBook.setTotalPages(bookDetails.getTotalPages());
            if (bookDetails.getCoverImageUrl() != null) existingBook.setCoverImageUrl(bookDetails.getCoverImageUrl());
            existingBook.setUpdatedAt(LocalDateTime.now());
            return bookRepository.save(existingBook);
        }
        return null;
    }

    public void deleteBook(String id) {
        bookRepository.deleteById(id);
    }
}
