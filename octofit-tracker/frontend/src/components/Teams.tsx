import { CapabilityCard } from './CapabilityCard.js';

type Team = { name?: string; mascot?: string; members?: string[] };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  return <CapabilityCard<TeamResponse>
    title="Teams"
    description="Manage teams and members."
    path="/api/teams"
    emptyMessage="No teams yet."
    renderItems={({ teams }) => teams.map((team) => (
      `${team.name ?? 'Team'}${team.mascot ? ` — Mascot: ${team.mascot}` : ''}${team.members ? ` — ${team.members.length} members` : ''}`
    ))}
  />;
}
