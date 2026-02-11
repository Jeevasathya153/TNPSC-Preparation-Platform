package com.tnexam.service;

import com.tnexam.model.User;
import com.tnexam.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public Map<String, Object> registerUser(User user) {
        Map<String, Object> response = new HashMap<>();
        
        System.out.println("=== REGISTRATION ATTEMPT ===");
        System.out.println("Email: " + user.getEmail());
        
        // Validate required fields
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Email is required");
            return response;
        }
        
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Password is required");
            return response;
        }
        
        if (user.getFirstName() == null || user.getFirstName().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "First name is required");
            return response;
        }
        
        // Normalize email to lowercase
        String normalizedEmail = user.getEmail().trim().toLowerCase();
        user.setEmail(normalizedEmail);
        
        // Check if email already exists
        if (userRepository.existsByEmail(normalizedEmail)) {
            response.put("success", false);
            response.put("message", "Email already registered. Please login instead.");
            return response;
        }
        
        // Set timestamps
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Save user to database
        User savedUser = userRepository.save(user);
        
        System.out.println("User registered successfully with ID: " + savedUser.getId());
        
        // Create welcome and default exam notifications for new user
        String userName = savedUser.getFirstName() != null ? savedUser.getFirstName() : "User";
        try {
            notificationService.createWelcomeNotification(savedUser.getId(), userName);
            notificationService.createDefaultExamNotifications(savedUser.getId());
        } catch (Exception e) {
            // Log but don't fail registration if notification creation fails
            System.err.println("Error creating notifications: " + e.getMessage());
        }
        
        response.put("success", true);
        response.put("message", "Registration successful! Welcome to TNGov Exam Preparation.");
        response.put("user", savedUser);
        response.put("token", generateToken(savedUser.getId()));
        return response;
    }

    public Map<String, Object> loginUser(String email, String password) {
        Map<String, Object> response = new HashMap<>();
        
        System.out.println("=== LOGIN ATTEMPT ===");
        System.out.println("Email received: " + email);
        
        // Validate input
        if (email == null || email.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Email is required");
            return response;
        }
        
        if (password == null || password.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Password is required");
            return response;
        }
        
        // Check if user exists
        Optional<User> user = userRepository.findByEmail(email.trim().toLowerCase());
        
        System.out.println("User found in DB: " + user.isPresent());
        
        if (user.isEmpty()) {
            System.out.println("User not found with email: " + email);
            response.put("success", false);
            response.put("message", "User not found. Please register first to create an account.");
            return response;
        }

        User userData = user.get();
        
        System.out.println("User ID: " + userData.getId());
        System.out.println("User Email in DB: " + userData.getEmail());
        System.out.println("Password matches: " + userData.getPassword().equals(password));
        
        // Verify password
        if (!userData.getPassword().equals(password)) {
            response.put("success", false);
            response.put("message", "Invalid password. Please try again.");
            return response;
        }

        System.out.println("Login successful for user: " + userData.getId());
        
        response.put("success", true);
        response.put("message", "Login successful");
        response.put("user", userData);
        response.put("token", generateToken(userData.getId()));
        return response;
    }

    private String generateToken(String userId) {
        // Simple token generation (In production, use JWT)
        return "token_" + userId + "_" + System.currentTimeMillis();
    }

    public boolean validateToken(String token) {
        // Simple token validation (In production, use JWT)
        return token != null && token.startsWith("token_");
    }
}
