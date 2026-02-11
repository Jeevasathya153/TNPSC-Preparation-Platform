package com.tnexam.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/pdf-proxy")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:5173"})
public class PdfProxyController {

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Proxy PDF files to avoid CORS issues and enable in-app viewing
     * GET /pdf-proxy?url=<encoded-pdf-url>
     */
    @GetMapping
    @SuppressWarnings("null")
    public ResponseEntity<byte[]> proxyPdf(@RequestParam String url) {
        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            // Fetch the PDF from the external URL
            byte[] pdfBytes = restTemplate.getForObject(url, byte[].class);
            
            if (pdfBytes == null || pdfBytes.length == 0) {
                return ResponseEntity.notFound().build();
            }

            // Set appropriate headers for PDF display (inline, not download)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setCacheControl(CacheControl.maxAge(3600, java.util.concurrent.TimeUnit.SECONDS));
            headers.add("Content-Disposition", "inline; filename=document.pdf");
            headers.add("X-Content-Type-Options", "nosniff");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error proxying PDF: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
