import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type?: string; minutes?: number; points?: number };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  return <CapabilityCard<ActivityResponse>
    title="Activities"
    description="Track student activity minutes and points."
    path="/api/activities"
    emptyMessage="No activities yet."
    renderItems={({ activities }) => activities.map((activity, index) => (
      `${activity.type ?? 'Activity'}${activity.minutes === undefined ? '' : ` — ${activity.minutes} minutes`}${activity.points === undefined ? '' : `, ${activity.points} points`}`
    ))}
  />;
}
