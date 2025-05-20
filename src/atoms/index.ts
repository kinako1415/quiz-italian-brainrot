import { atom } from "jotai";

export const currentQuestionIndexAtom = atom(0);
export const questionsAtom = atom<{ sound: string; correctAnswer: string; incorrectAnswers: string[]; questionText: string }[]>([]);
export const selectedAnswerAtom = atom<string | null>(null);
export const gameStatusAtom = atom<"start" | "ready" | "playing" | "finished">(
  "ready"
);
export const correctAnswersAtom = atom(0);
export const incorrectAnswersAtom = atom(0);
export const mutedAtom = atom(false);
