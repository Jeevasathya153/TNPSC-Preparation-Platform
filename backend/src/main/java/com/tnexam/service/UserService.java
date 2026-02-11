package com.tnexam.service;

import com.tnexam.model.User;
import com.tnexam.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(String id, User userDetails) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            User existingUser = user.get();
            if (userDetails.getFirstName() != null) existingUser.setFirstName(userDetails.getFirstName());
            if (userDetails.getLastName() != null) existingUser.setLastName(userDetails.getLastName());
            if (userDetails.getPhone() != null) existingUser.setPhone(userDetails.getPhone());
            if (userDetails.getCity() != null) existingUser.setCity(userDetails.getCity());
            if (userDetails.getState() != null) existingUser.setState(userDetails.getState());
            if (userDetails.getTargetExam() != null) existingUser.setTargetExam(userDetails.getTargetExam());
            existingUser.setStudyHoursPerDay(userDetails.getStudyHoursPerDay());
            existingUser.setEmailNotifications(userDetails.isEmailNotifications());
            existingUser.setPushNotifications(userDetails.isPushNotifications());
            return userRepository.save(existingUser);
        }
        return null;
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    public boolean userExists(String email) {
        return userRepository.existsByEmail(email);
    }
}
