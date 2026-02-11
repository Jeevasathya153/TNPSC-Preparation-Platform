db = db.getSiblingDB("tnexam");

var now = new Date();
var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
var weekNumber = Math.ceil((((now - new Date(now.getFullYear(),0,1)) / 86400000) + new Date(now.getFullYear(),0,1).getDay()+1)/7);

// Check and create daily contest if not exists
var dailyContest = db.contests.findOne({ contestType: "DAILY", contestDate: { $gte: today } });
if (!dailyContest) {
  db.contests.insertOne({
    title: "Daily Challenge - " + now.toISOString().split('T')[0],
    description: "Test your knowledge with today's daily challenge! New questions every day at 12:00 AM.",
    contestType: "DAILY",
    contestDate: today,
    year: now.getFullYear(),
    totalQuestions: 10,
    timeLimit: 10,
    marksPerQuestion: 1,
    totalMarks: 10,
    startTime: today,
    endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    isActive: true,
    questions: [],
    createdAt: now,
    updatedAt: now
  });
  print("Created daily contest for " + now.toISOString().split('T')[0]);
} else {
  print("Daily contest already exists: " + dailyContest._id);
}

// Check and create weekly contest if not exists
var weeklyContest = db.contests.findOne({ contestType: "WEEKLY", weekNumber: weekNumber, year: now.getFullYear() });
if (!weeklyContest) {
  db.contests.insertOne({
    title: "Weekly Challenge - Week " + weekNumber + ", " + now.getFullYear(),
    description: "Take on the weekly challenge! Compete with others for the top spot on the leaderboard.",
    contestType: "WEEKLY",
    weekNumber: weekNumber,
    year: now.getFullYear(),
    contestDate: now,
    totalQuestions: 30,
    timeLimit: 30,
    marksPerQuestion: 1,
    totalMarks: 30,
    startTime: now,
    endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    questions: [],
    createdAt: now,
    updatedAt: now
  });
  print("Created weekly contest for week " + weekNumber);
} else {
  print("Weekly contest already exists: " + weeklyContest._id);
}

// Show all contests
print("\n=== CONTESTS ===");
db.contests.find().forEach(function(c) {
  print("ID: " + c._id + ", Type: " + c.contestType + ", Title: " + c.title);
});
