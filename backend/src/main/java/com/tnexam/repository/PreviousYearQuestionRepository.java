package com.tnexam.repository;

import com.tnexam.model.PreviousYearQuestion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreviousYearQuestionRepository extends MongoRepository<PreviousYearQuestion, String> {
    List<PreviousYearQuestion> findByExam(String exam);
    List<PreviousYearQuestion> findByYear(String year);
    List<PreviousYearQuestion> findBySubject(String subject);
    List<PreviousYearQuestion> findByLanguage(String language);
    List<PreviousYearQuestion> findByExamAndYear(String exam, String year);
    List<PreviousYearQuestion> findByExamAndSubject(String exam, String subject);
}
