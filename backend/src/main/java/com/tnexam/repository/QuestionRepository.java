package com.tnexam.repository;

import com.tnexam.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findByQuizId(String quizId);
    List<Question> findBySubject(String subject);
    List<Question> findByDifficulty(String difficulty);
    List<Question> findBySubjectAndDifficulty(String subject, String difficulty);
    long countBySubject(String subject);
    long countBySubjectAndDifficulty(String subject, String difficulty);
}
