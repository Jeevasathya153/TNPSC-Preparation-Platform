package com.tnexam.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.util.Date;

@Document(collection = "achievement")
public class Achievement {
    @Id
    private String id;
    private String userId;
    private List<String> badges; // badge ids or names
    private Date lastContestDate;
    private int dailyStreak;
    private int weeklyStreak;

    public Achievement() {}

    public Achievement(String userId, List<String> badges, Date lastContestDate, int dailyStreak, int weeklyStreak) {
        this.userId = userId;
        this.badges = badges;
        this.lastContestDate = lastContestDate;
        this.dailyStreak = dailyStreak;
        this.weeklyStreak = weeklyStreak;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public List<String> getBadges() { return badges; }
    public void setBadges(List<String> badges) { this.badges = badges; }

    public Date getLastContestDate() { return lastContestDate; }
    public void setLastContestDate(Date lastContestDate) { this.lastContestDate = lastContestDate; }

    public int getDailyStreak() { return dailyStreak; }
    public void setDailyStreak(int dailyStreak) { this.dailyStreak = dailyStreak; }

    public int getWeeklyStreak() { return weeklyStreak; }
    public void setWeeklyStreak(int weeklyStreak) { this.weeklyStreak = weeklyStreak; }
}
