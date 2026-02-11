package com.tnexam.service;

import com.tnexam.model.ResourceActivity;
import com.tnexam.repository.ResourceActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ResourceActivityService {
    
    @Autowired
    private ResourceActivityRepository resourceActivityRepository;

    public ResourceActivity trackResourceAccess(ResourceActivity activity) {
        // Check if activity already exists for this user and resource
        Optional<ResourceActivity> existingActivity = 
            resourceActivityRepository.findByUserIdAndResourceId(activity.getUserId(), activity.getResourceId());
        
        if (existingActivity.isPresent()) {
            // Update existing activity
            ResourceActivity existing = existingActivity.get();
            existing.setLastAccessedAt(LocalDateTime.now());
            existing.setTimeSpentSeconds(existing.getTimeSpentSeconds() + activity.getTimeSpentSeconds());
            
            if (activity.getPagesRead() > 0) {
                existing.setPagesRead(Math.max(existing.getPagesRead(), activity.getPagesRead()));
            }
            
            if (activity.getTotalPages() > 0) {
                existing.setTotalPages(activity.getTotalPages());
            }
            
            // Auto-mark as completed if all pages read
            if (existing.getTotalPages() > 0 && existing.getPagesRead() >= existing.getTotalPages()) {
                existing.setCompleted(true);
            }
            
            return resourceActivityRepository.save(existing);
        } else {
            // Create new activity
            return resourceActivityRepository.save(activity);
        }
    }

    public List<ResourceActivity> getUserActivities(String userId) {
        return resourceActivityRepository.findByUserIdOrderByLastAccessedAtDesc(userId);
    }

    public List<ResourceActivity> getUserActivitiesByType(String userId, String resourceType) {
        return resourceActivityRepository.findByUserIdAndResourceType(userId, resourceType);
    }

    public Optional<ResourceActivity> getActivity(String id) {
        return resourceActivityRepository.findById(id);
    }

    public long getUserTotalResourcesAccessed(String userId) {
        return resourceActivityRepository.countByUserId(userId);
    }

    public long getUserCompletedResources(String userId) {
        return resourceActivityRepository.countByUserIdAndCompleted(userId, true);
    }

    public void deleteActivity(String id) {
        resourceActivityRepository.deleteById(id);
    }
}
