
package com.tnexam.service;

import com.tnexam.model.Achievement;
import com.tnexam.repository.AchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.ZoneId;

@Service
public class AchievementService {
        // Call this after a user completes a contest for streak/badge logic
        public void processContestCompletion(String userId, Date contestDate) {
            Achievement achievement = getOrCreateAchievement(userId);
            LocalDate lastDate = achievement.getLastContestDate() == null ? null : achievement.getLastContestDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            LocalDate today = contestDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

            int dailyStreak = achievement.getDailyStreak();
            int weeklyStreak = achievement.getWeeklyStreak();

            if (lastDate == null || lastDate.isBefore(today.minusDays(1))) {
                dailyStreak = 1; // streak broken, start over
            } else if (lastDate.isEqual(today.minusDays(1))) {
                dailyStreak += 1; // streak continues
            } // else: same day, don't increment

            // Weekly streak: if daily streak hits 7, increment weekly streak
            if (dailyStreak == 7) {
                weeklyStreak += 1;
                addBadge(userId, "7-day-streak");
                dailyStreak = 0; // reset daily streak for next week
            }
            // 4-week streak badge
            if (weeklyStreak == 4) {
                addBadge(userId, "4-week-streak");
                weeklyStreak = 0; // reset for next month
            }

            achievement.setLastContestDate(contestDate);
            achievement.setDailyStreak(dailyStreak);
            achievement.setWeeklyStreak(weeklyStreak);
            achievementRepository.save(achievement);
        }
    @Autowired
    private AchievementRepository achievementRepository;

    public Achievement getOrCreateAchievement(String userId) {
        Optional<Achievement> achievementOpt = achievementRepository.findByUserId(userId);
        if (achievementOpt.isPresent()) {
            return achievementOpt.get();
        } else {
            Achievement achievement = new Achievement(userId, List.of(), null, 0, 0);
            return achievementRepository.save(achievement);
        }
    }

    public Achievement updateAchievement(Achievement achievement) {
        return achievementRepository.save(achievement);
    }

    public void addBadge(String userId, String badge) {
        Achievement achievement = getOrCreateAchievement(userId);
        List<String> badges = achievement.getBadges();
        if (!badges.contains(badge)) {
            badges.add(badge);
            achievement.setBadges(badges);
            achievementRepository.save(achievement);
        }
    }

    public void updateStreaks(String userId, Date lastContestDate, int dailyStreak, int weeklyStreak) {
        Achievement achievement = getOrCreateAchievement(userId);
        achievement.setLastContestDate(lastContestDate);
        achievement.setDailyStreak(dailyStreak);
        achievement.setWeeklyStreak(weeklyStreak);
        achievementRepository.save(achievement);
    }

    public Optional<Achievement> getAchievementByUserId(String userId) {
        return achievementRepository.findByUserId(userId);
    }
}
