import { atom } from "jotai";
import type { Question } from "@/types";

export const questionsAtom = atom<Question[]>([]);
export const currentQuestionIndexAtom = atom<number>(0);
export const selectedAnswerAtom = atom<string | null>(null);
export const timerStartTimeAtom = atom<number | null>(null);
export const elapsedTimeAtom = atom<number>(0);
export const isTimerRunningAtom = atom<boolean>(false);
export const correctAnswersAtom = atom<number>(0);
export const incorrectAnswersAtom = atom<number>(0);
export const gameStatusAtom = atom<"ready" | "playing" | "finished" | "error">(
  "ready"
);
