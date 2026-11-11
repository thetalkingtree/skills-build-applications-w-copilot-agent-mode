import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title?: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };
type WorkoutResponse = { suggestions: WorkoutSuggestion[] };

export default function Workouts() {
  return <CapabilityCard<WorkoutResponse>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    path={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
    emptyMessage="No workout suggestions available."
    renderItems={({ suggestions }) => suggestions.map((suggestion) => (
      `${suggestion.title ?? 'Workout'}${suggestion.focus ? ` — ${suggestion.focus}` : ''}${suggestion.minutes === undefined ? '' : `, ${suggestion.minutes} minutes`}${suggestion.difficulty ? ` (${suggestion.difficulty})` : ''}${suggestion.reason ? `. ${suggestion.reason}` : ''}`
    ))}
  />;
}
