package com.tnexam.repository;

import com.tnexam.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends MongoRepository<Quiz, String> {
    List<Quiz> findBySubject(String subject);
    List<Quiz> findByDifficulty(String difficulty);
    List<Quiz> findByLevel(String level);
    List<Quiz> findBySubjectAndDifficulty(String subject, String difficulty);
    List<Quiz> findBySubjectAndLevel(String subject, String level);
}
