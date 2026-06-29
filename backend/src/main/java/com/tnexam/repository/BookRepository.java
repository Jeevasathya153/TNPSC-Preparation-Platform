package com.tnexam.repository;

import com.tnexam.entity.Book;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends MongoRepository<Book, String> {
    List<Book> findByCategory(String category);
    List<Book> findBySubject(String subject);
}
