package com.tnexam.repository;

import com.tnexam.model.PdfBook;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PdfBookRepository extends MongoRepository<PdfBook, String> {
    List<PdfBook> findBySubject(String subject);
    List<PdfBook> findByLanguage(String language);
    List<PdfBook> findByType(String type);
    List<PdfBook> findBySubjectAndLanguage(String subject, String language);
    List<PdfBook> findByTitleContainingIgnoreCase(String title);
}
