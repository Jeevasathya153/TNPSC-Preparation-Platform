package com.tnexam.service;

import com.tnexam.model.PdfBook;
import com.tnexam.repository.PdfBookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PdfBookService {

    @Autowired
    private PdfBookRepository pdfBookRepository;

    public List<PdfBook> getAllPdfBooks() {
        return pdfBookRepository.findAll();
    }

    public Optional<PdfBook> getPdfBookById(String id) {
        return pdfBookRepository.findById(id);
    }

    public List<PdfBook> getPdfBooksBySubject(String subject) {
        return pdfBookRepository.findBySubject(subject);
    }

    public List<PdfBook> getPdfBooksByLanguage(String language) {
        return pdfBookRepository.findByLanguage(language);
    }

    public List<PdfBook> getPdfBooksByType(String type) {
        return pdfBookRepository.findByType(type);
    }

    public List<PdfBook> searchPdfBooks(String title) {
        return pdfBookRepository.findByTitleContainingIgnoreCase(title);
    }

    public PdfBook createPdfBook(PdfBook pdfBook) {
        return pdfBookRepository.save(pdfBook);
    }

    public PdfBook updatePdfBook(String id, PdfBook pdfBookDetails) {
        Optional<PdfBook> pdfBook = pdfBookRepository.findById(id);
        if (pdfBook.isPresent()) {
            PdfBook existing = pdfBook.get();
            existing.setTitle(pdfBookDetails.getTitle());
            existing.setSubject(pdfBookDetails.getSubject());
            existing.setLanguage(pdfBookDetails.getLanguage());
            existing.setPdfUrl(pdfBookDetails.getPdfUrl());
            existing.setSource(pdfBookDetails.getSource());
            existing.setType(pdfBookDetails.getType());
            return pdfBookRepository.save(existing);
        }
        return null;
    }

    public void deletePdfBook(String id) {
        pdfBookRepository.deleteById(id);
    }
}
