export const EXERCISE_SUGGESTIONS = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Pull-up',
  'Row',
  'Overhead Press',
  'Lunge',
  'Plank',
  'Dip',
  'Curl',
];

export const randomExerciseSuggestion = (): string =>
  EXERCISE_SUGGESTIONS[Math.floor(Math.random() * EXERCISE_SUGGESTIONS.length)] + '?';

export const stripSuggestionMark = (name: string): string =>
  name.endsWith('?') ? name.slice(0, -1).trim() : name.trim();

export const isSuggestion = (name: string): boolean => name.endsWith('?');
