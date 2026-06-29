package com.tnexam.service;

import com.tnexam.entity.User;
import com.tnexam.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Map<String, Object> registerUser(User user) {
        Map<String, Object> response = new HashMap<>();
        
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
        
        // Create welcome and default exam notifications for new user
        String userName = savedUser.getFirstName() != null ? savedUser.getFirstName() : "User";
        try {
            notificationService.createWelcomeNotification(savedUser.getId(), userName);
            notificationService.createDefaultExamNotifications(savedUser.getId());
        } catch (Exception e) {
            // Ignore error but prevent failure of registration
        }
        
        response.put("success", true);
        response.put("message", "Registration successful! Welcome to TNGov Exam Preparation.");
        response.put("user", savedUser);
        response.put("token", generateToken(savedUser.getId()));
        return response;
    }

    public Map<String, Object> loginUser(String email, String password) {
        Map<String, Object> response = new HashMap<>();
        
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
        
        if (user.isEmpty()) {
            response.put("success", false);
            response.put("message", "User not found. Please register first to create an account.");
            return response;
        }

        User userData = user.get();
        
        // Verify password
        if (!userData.getPassword().equals(password)) {
            response.put("success", false);
            response.put("message", "Invalid password. Please try again.");
            return response;
        }

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
