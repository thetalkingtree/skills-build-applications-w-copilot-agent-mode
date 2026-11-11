import { Activity, Team, User, Workout } from '../models/index.js';
import { isObjectIdOrHexString } from 'mongoose';

type ActivityInput = {
  userId?: unknown;
  teamId?: unknown;
  type?: unknown;
  minutes?: unknown;
};

type TeamInput = {
  name?: unknown;
  mascot?: unknown;
  members?: unknown;
};

function clientError(message: string, status = 400) {
  return Object.assign(new Error(message), { status });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: ActivityInput) {
  if (!input || !isNonEmptyString(input.userId) || !isNonEmptyString(input.teamId)
    || !isNonEmptyString(input.type) || typeof input.minutes !== 'number'
    || !Number.isFinite(input.minutes) || input.minutes <= 0) {
    throw clientError('A valid userId, teamId, type, and positive minutes value are required');
  }
  if (!isObjectIdOrHexString(input.userId) || !isObjectIdOrHexString(input.teamId)) {
    throw clientError('userId and teamId must be valid IDs');
  }
  const [user, team] = await Promise.all([User.findById(input.userId), Team.findById(input.teamId)]);
  if (!user || !team) throw clientError('The specified user or team does not exist', 404);
  return Activity.create({
    user: user._id,
    team: team._id,
    type: input.type.trim(),
    minutes: input.minutes,
    points: input.minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: TeamInput) {
  if (!input || !isNonEmptyString(input.name)) throw clientError('A team name is required');
  if (!isNonEmptyString(input.mascot)) throw clientError('A team mascot is required');
  if (input.members !== undefined && !Array.isArray(input.members)) {
    throw clientError('Team members must be an array of user IDs');
  }
  const memberIds: string[] = input.members === undefined ? [] : input.members.map((member: unknown) => {
    if (!isNonEmptyString(member) || !isObjectIdOrHexString(member)) {
      throw clientError('Each team member must have a valid user ID');
    }
    return member;
  }).filter((member, index, values) => values.indexOf(member) === index);
  const members = await User.find({ _id: { $in: memberIds } }).select('_id');
  if (members.length !== memberIds.length) throw clientError('One or more team members do not exist', 404);
  return Team.create({
    name: input.name.trim(),
    mascot: input.mascot.trim(),
    members: members.map((member) => member._id),
  });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: string; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

function focusForActivity(type: string) {
  const normalized = type.toLowerCase();
  if (['run', 'running', 'cycle', 'cycling', 'walk', 'walking', 'swim', 'swimming'].includes(normalized)) return 'endurance';
  return normalized;
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw clientError('No user was found for that email address', 404);
  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const activityFocus = recentActivity ? focusForActivity(recentActivity.type) : undefined;
  const goalFocus = user.fitnessGoal.toLowerCase();
  const preferredFocuses = [...new Set([activityFocus, goalFocus].filter((focus): focus is string => focus !== undefined))];
  const workouts = await Workout.find().lean();
  return workouts
    .map((workout) => ({
      ...workout,
      reason: preferredFocuses.includes(workout.focus.toLowerCase())
        ? `Recommended based on your ${workout.focus.toLowerCase() === activityFocus && recentActivity ? `recent ${recentActivity.type} activity` : `${user.fitnessGoal} goal`}.`
        : `A complementary workout for your ${user.fitnessGoal} goal.`,
      priority: preferredFocuses.indexOf(workout.focus.toLowerCase()),
    }))
    .sort((left, right) => {
      const leftPriority = left.priority === -1 ? preferredFocuses.length : left.priority;
      const rightPriority = right.priority === -1 ? preferredFocuses.length : right.priority;
      return leftPriority - rightPriority || left.title.localeCompare(right.title);
    })
    .map(({ priority: _priority, ...workout }) => workout);
}

export { User };
