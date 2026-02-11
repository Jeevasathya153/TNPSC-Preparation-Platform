package com.tnexam.service;

import com.tnexam.model.PreviousYearQuestion;
import com.tnexam.repository.PreviousYearQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PreviousYearQuestionService {

    @Autowired
    private PreviousYearQuestionRepository previousYearQuestionRepository;

    public List<PreviousYearQuestion> getAllPreviousYearQuestions() {
        return previousYearQuestionRepository.findAll();
    }

    public Optional<PreviousYearQuestion> getPreviousYearQuestionById(String id) {
        return previousYearQuestionRepository.findById(id);
    }

    public List<PreviousYearQuestion> getPreviousYearQuestionsByExam(String exam) {
        return previousYearQuestionRepository.findByExam(exam);
    }

    public List<PreviousYearQuestion> getPreviousYearQuestionsByYear(String year) {
        return previousYearQuestionRepository.findByYear(year);
    }

    public List<PreviousYearQuestion> getPreviousYearQuestionsBySubject(String subject) {
        return previousYearQuestionRepository.findBySubject(subject);
    }

    public List<PreviousYearQuestion> getPreviousYearQuestionsByLanguage(String language) {
        return previousYearQuestionRepository.findByLanguage(language);
    }

    public List<PreviousYearQuestion> getPreviousYearQuestionsByExamAndYear(String exam, String year) {
        return previousYearQuestionRepository.findByExamAndYear(exam, year);
    }

    public PreviousYearQuestion createPreviousYearQuestion(PreviousYearQuestion previousYearQuestion) {
        return previousYearQuestionRepository.save(previousYearQuestion);
    }

    public PreviousYearQuestion updatePreviousYearQuestion(String id, PreviousYearQuestion details) {
        Optional<PreviousYearQuestion> pyq = previousYearQuestionRepository.findById(id);
        if (pyq.isPresent()) {
            PreviousYearQuestion existing = pyq.get();
            existing.setExam(details.getExam());
            existing.setYear(details.getYear());
            existing.setSubject(details.getSubject());
            existing.setLanguage(details.getLanguage());
            existing.setPdfSource(details.getPdfSource());
            existing.setOfficialPageUrl(details.getOfficialPageUrl());
            return previousYearQuestionRepository.save(existing);
        }
        return null;
    }

    public void deletePreviousYearQuestion(String id) {
        previousYearQuestionRepository.deleteById(id);
    }
}
