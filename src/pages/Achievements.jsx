import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const BADGE_LABELS = {
  "7-day-streak": "7-Day Streak Champion",
  "4-week-streak": "4-Week Streak Master",
};

export default function Achievements() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    axios
      .get(`/api/achievements/${user.id}`)
      .then((res) => {
        setBadges(res.data.badges || []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div>Please log in to view achievements.</div>;
  if (loading) return <div>Loading achievements...</div>;

  return (
    <div className="achievements-page">
      <h2>Your Achievements</h2>
      {badges.length === 0 ? (
        <p>No badges earned yet. Participate in daily contests to earn badges!</p>
      ) : (
        <ul className="badge-list">
          {badges.map((badge) => (
            <li key={badge} className="badge-item">
              <span role="img" aria-label="badge">🏅</span> {BADGE_LABELS[badge] || badge}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
