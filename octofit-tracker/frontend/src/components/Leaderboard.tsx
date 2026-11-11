import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName?: string; totalPoints?: number; rank?: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardResponse>
    title="Leaderboard"
    description="Compare team point totals."
    path="/api/leaderboard"
    emptyMessage="No leaderboard rankings yet."
    renderItems={({ leaderboard }) => leaderboard.map((entry) => (
      `${entry.rank === undefined ? '' : `${entry.rank}. `}${entry.teamName ?? 'Team'} — ${entry.totalPoints ?? 0} points`
    ))}
  />;
}
