package com.tnexam.controller;

import com.tnexam.entity.Achievement;
import com.tnexam.service.AchievementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/achievements")
public class AchievementController {

    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Achievement> getAchievement(@PathVariable String userId) {
        return achievementService.getAchievementByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/addBadge/{userId}")
    public ResponseEntity<Void> addBadge(@PathVariable String userId, @RequestParam String badge) {
        achievementService.addBadge(userId, badge);
        return ResponseEntity.ok().build();
    }
}
