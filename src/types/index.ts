export interface Question {
  id: number;
  sound: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  questionText: string;
}
