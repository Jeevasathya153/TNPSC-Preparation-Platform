package com.tnexam.service;

import com.tnexam.model.Contest;
import com.tnexam.model.ContestResult;
import com.tnexam.model.Question;
import com.tnexam.model.QuestionEmbedded;
import com.tnexam.repository.ContestRepository;
import com.tnexam.repository.ContestResultRepository;
import com.tnexam.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ContestService {

    @Autowired
    private ContestRepository contestRepository;

    @Autowired
    private ContestResultRepository contestResultRepository;

    @Autowired
    private QuestionRepository questionRepository;

    private static final int DAILY_QUESTION_COUNT = 10;
    private static final int WEEKLY_QUESTION_COUNT = 30;
    // Time limit = 1 minute per question
    private static final int DAILY_TIME_LIMIT = DAILY_QUESTION_COUNT; // 10 minutes (1 min per question)
    private static final int WEEKLY_TIME_LIMIT = WEEKLY_QUESTION_COUNT; // 30 minutes (1 min per question)
    private static final int MARKS_PER_QUESTION = 1;

    /**
     * Create daily contest at 12:00 AM every day
     */
    @Scheduled(cron = "0 0 0 * * *") // Runs at 12:00 AM every day
    public void createDailyContest() {
        LocalDate today = LocalDate.now();
        
        // Check if daily contest already exists for today
        if (contestRepository.existsByContestTypeAndContestDate("DAILY", today)) {
            System.out.println("Daily contest already exists for " + today);
            return;
        }

        // Deactivate previous daily contests
        contestRepository.findByContestTypeAndIsActiveTrue("DAILY")
            .ifPresent(contest -> {
                contest.setActive(false);
                contest.setUpdatedAt(LocalDateTime.now());
                contestRepository.save(contest);
            });

        // Create new daily contest
        Contest dailyContest = new Contest();
        dailyContest.setTitle("Daily Challenge - " + today.toString());
        dailyContest.setDescription("Test your knowledge with today's daily challenge! New questions every day at 12:00 AM.");
        dailyContest.setContestType("DAILY");
        dailyContest.setContestDate(today);
        dailyContest.setYear(today.getYear());
        dailyContest.setTotalQuestions(DAILY_QUESTION_COUNT);
        dailyContest.setTimeLimit(DAILY_TIME_LIMIT);
        dailyContest.setMarksPerQuestion(MARKS_PER_QUESTION);
        dailyContest.setTotalMarks(DAILY_QUESTION_COUNT * MARKS_PER_QUESTION);
        dailyContest.setStartTime(today.atStartOfDay());
        dailyContest.setEndTime(today.plusDays(1).atStartOfDay());
        dailyContest.setActive(true);

        // Get random questions
        List<QuestionEmbedded> questions = getRandomQuestions(DAILY_QUESTION_COUNT);
        dailyContest.setQuestions(questions);

        contestRepository.save(dailyContest);
        System.out.println("Created daily contest for " + today);
    }

    /**
     * Create weekly contest every Monday at 12:00 AM
     */
    @Scheduled(cron = "0 0 0 * * MON") // Runs at 12:00 AM every Monday
    public void createWeeklyContest() {
        LocalDate today = LocalDate.now();
        int weekNumber = today.get(WeekFields.ISO.weekOfYear());
        int year = today.getYear();

        // Check if weekly contest already exists
        if (contestRepository.existsByContestTypeAndWeekNumberAndYear("WEEKLY", weekNumber, year)) {
            System.out.println("Weekly contest already exists for week " + weekNumber + " of " + year);
            return;
        }

        // Deactivate previous weekly contests
        contestRepository.findByContestTypeAndIsActiveTrue("WEEKLY")
            .ifPresent(contest -> {
                contest.setActive(false);
                contest.setUpdatedAt(LocalDateTime.now());
                contestRepository.save(contest);
            });

        // Create new weekly contest
        Contest weeklyContest = new Contest();
        weeklyContest.setTitle("Weekly Challenge - Week " + weekNumber + ", " + year);
        weeklyContest.setDescription("Take on the weekly challenge! Compete with others for the top spot on the leaderboard.");
        weeklyContest.setContestType("WEEKLY");
        weeklyContest.setWeekNumber(weekNumber);
        weeklyContest.setYear(year);
        weeklyContest.setContestDate(today);
        weeklyContest.setTotalQuestions(WEEKLY_QUESTION_COUNT);
        weeklyContest.setTimeLimit(WEEKLY_TIME_LIMIT);
        weeklyContest.setMarksPerQuestion(MARKS_PER_QUESTION);
        weeklyContest.setTotalMarks(WEEKLY_QUESTION_COUNT * MARKS_PER_QUESTION);
        weeklyContest.setStartTime(today.atStartOfDay());
        weeklyContest.setEndTime(today.plusWeeks(1).atStartOfDay());
        weeklyContest.setActive(true);

        // Get random questions
        List<QuestionEmbedded> questions = getRandomQuestions(WEEKLY_QUESTION_COUNT);
        weeklyContest.setQuestions(questions);

        contestRepository.save(weeklyContest);
        System.out.println("Created weekly contest for week " + weekNumber + " of " + year);
    }

    /**
     * Get random questions from the question pool
     */
    private List<QuestionEmbedded> getRandomQuestions(int count) {
        List<Question> allQuestions = questionRepository.findAll();
        
        if (allQuestions.isEmpty()) {
            return generateSampleQuestions(count);
        }

        Collections.shuffle(allQuestions);
        
        return allQuestions.stream()
            .limit(count)
            .map(this::convertToEmbedded)
            .collect(Collectors.toList());
    }

    private QuestionEmbedded convertToEmbedded(Question question) {
        QuestionEmbedded embedded = new QuestionEmbedded();
        embedded.setId(question.getId());
        embedded.setQuestionText(question.getQuestionText());
        embedded.setOptions(question.getOptions());
        embedded.setCorrectAnswerIndex(question.getCorrectAnswerIndex());
        embedded.setExplanation(question.getExplanation());
        embedded.setDifficulty(question.getDifficulty());
        embedded.setSubject(question.getSubject());
        return embedded;
    }

    /**
     * Generate sample questions if no questions exist
     */
    private List<QuestionEmbedded> generateSampleQuestions(int count) {
        List<QuestionEmbedded> questions = new ArrayList<>();
        String[] subjects = {"General Knowledge", "Tamil Nadu History", "Indian Polity", "Geography", "Science"};
        
        for (int i = 1; i <= count; i++) {
            QuestionEmbedded q = new QuestionEmbedded();
            q.setId("sample-" + UUID.randomUUID().toString().substring(0, 8));
            q.setQuestionText("Sample Question " + i + ": What is the capital of Tamil Nadu?");
            q.setOptions(Arrays.asList("Chennai", "Coimbatore", "Madurai", "Trichy"));
            q.setCorrectAnswerIndex(0);
            q.setExplanation("Chennai is the capital city of Tamil Nadu.");
            q.setDifficulty("EASY");
            q.setSubject(subjects[i % subjects.length]);
            questions.add(q);
        }
        
        return questions;
    }

    /**
     * Get active daily contest
     */
    public Optional<Contest> getActiveDailyContest() {
        LocalDate today = LocalDate.now();
        Optional<Contest> contest = contestRepository.findByContestTypeAndContestDate("DAILY", today);
        
        // If no contest for today, create one
        if (contest.isEmpty()) {
            createDailyContest();
            contest = contestRepository.findByContestTypeAndContestDate("DAILY", today);
        }
        
        return contest;
    }

    /**
     * Get active weekly contest
     */
    public Optional<Contest> getActiveWeeklyContest() {
        LocalDate today = LocalDate.now();
        int weekNumber = today.get(WeekFields.ISO.weekOfYear());
        int year = today.getYear();
        
        Optional<Contest> contest = contestRepository.findByContestTypeAndWeekNumberAndYear("WEEKLY", weekNumber, year);
        
        // If no weekly contest exists, create one
        if (contest.isEmpty()) {
            createWeeklyContest();
            contest = contestRepository.findByContestTypeAndWeekNumberAndYear("WEEKLY", weekNumber, year);
        }
        
        return contest;
    }

    /**
     * Get contest by ID
     */
    public Optional<Contest> getContestById(String contestId) {
        return contestRepository.findById(contestId);
    }

    /**
     * Submit contest result
     */
    public ContestResult submitContestResult(ContestResult result) {
        // Check if user has already participated
        if (contestResultRepository.existsByUserIdAndContestId(result.getUserId(), result.getContestId())) {
            throw new RuntimeException("You have already participated in this contest");
        }

        // Calculate derived values
        result.setWrongAnswers(result.getTotalQuestions() - result.getCorrectAnswers());
        result.calculateAccuracy();
        result.calculateAverageTime();
        result.setSubmittedAt(LocalDateTime.now());

        ContestResult savedResult = contestResultRepository.save(result);

        // Update ranks for all participants
        updateRanks(result.getContestId());

        return savedResult;
    }

    /**
     * Update ranks for all participants of a contest
     */
    private void updateRanks(String contestId) {
        List<ContestResult> results = contestResultRepository
            .findByContestIdOrderByScoreDescTimeTakenSecondsAsc(contestId);

        int rank = 1;
        for (ContestResult result : results) {
            result.setRank(rank++);
            contestResultRepository.save(result);
        }
    }

    /**
     * Get leaderboard for a contest
     */
    public List<ContestResult> getContestLeaderboard(String contestId) {
        return contestResultRepository.findByContestIdOrderByScoreDescTimeTakenSecondsAsc(contestId);
    }

    /**
     * Get top 10 performers for a contest
     */
    public List<ContestResult> getTopPerformers(String contestId) {
        return contestResultRepository.findTop10ByContestIdOrderByScoreDescTimeTakenSecondsAsc(contestId);
    }

    /**
     * Get user's contest history
     */
    public List<ContestResult> getUserContestHistory(String userId) {
        return contestResultRepository.findByUserIdOrderBySubmittedAtDesc(userId);
    }

    /**
     * Get user's result for a specific contest
     */
    public Optional<ContestResult> getUserContestResult(String userId, String contestId) {
        return contestResultRepository.findByUserIdAndContestId(userId, contestId);
    }

    /**
     * Check if user has participated in a contest
     */
    public boolean hasUserParticipated(String userId, String contestId) {
        return contestResultRepository.existsByUserIdAndContestId(userId, contestId);
    }

    /**
     * Get recent contests
     */
    public List<Contest> getRecentContests() {
        return contestRepository.findTop10ByOrderByCreatedAtDesc();
    }

    /**
     * Get contest statistics
     */
    public Map<String, Object> getContestStats(String contestId) {
        Map<String, Object> stats = new HashMap<>();
        
        List<ContestResult> results = contestResultRepository
            .findByContestIdOrderByScoreDescTimeTakenSecondsAsc(contestId);
        
        if (results.isEmpty()) {
            stats.put("participantCount", 0);
            stats.put("averageScore", 0);
            stats.put("averageTime", 0);
            stats.put("highestScore", 0);
            stats.put("lowestScore", 0);
            return stats;
        }

        double avgScore = results.stream()
            .mapToInt(ContestResult::getScore)
            .average()
            .orElse(0);

        double avgTime = results.stream()
            .mapToLong(ContestResult::getTimeTakenSeconds)
            .average()
            .orElse(0);

        int highest = results.stream()
            .mapToInt(ContestResult::getScore)
            .max()
            .orElse(0);

        int lowest = results.stream()
            .mapToInt(ContestResult::getScore)
            .min()
            .orElse(0);

        stats.put("participantCount", results.size());
        stats.put("averageScore", Math.round(avgScore * 100.0) / 100.0);
        stats.put("averageTime", Math.round(avgTime));
        stats.put("highestScore", highest);
        stats.put("lowestScore", lowest);

        return stats;
    }

    /**
     * Get all contests by type
     */
    public List<Contest> getContestsByType(String contestType) {
        return contestRepository.findByContestTypeOrderByCreatedAtDesc(contestType);
    }
}
