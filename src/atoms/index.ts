import { atom } from "jotai";

export const currentQuestionIndexAtom = atom(0);
export const questionsAtom = atom([]);
export const selectedAnswerAtom = atom(null);
export const timerStartTimeAtom = atom(null);
export const elapsedTimeAtom = atom(0);
export const isTimerRunningAtom = atom(false);
export const scoreAtom = atom(0);
export const gameStatusAtom = atom("ready"); // 'ready', 'playing', 'finished'
export const correctAnswersAtom = atom(0);
export const incorrectAnswersAtom = atom(0);
