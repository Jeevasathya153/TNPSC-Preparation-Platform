package com.tnexam.controller;

import com.tnexam.model.Achievement;
import com.tnexam.service.AchievementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {
    @Autowired
    private AchievementService achievementService;

    @GetMapping("/{userId}")
    public Optional<Achievement> getAchievement(@PathVariable String userId) {
        return achievementService.getAchievementByUserId(userId);
    }

    @PostMapping("/addBadge/{userId}")
    public void addBadge(@PathVariable String userId, @RequestParam String badge) {
        achievementService.addBadge(userId, badge);
    }
}
