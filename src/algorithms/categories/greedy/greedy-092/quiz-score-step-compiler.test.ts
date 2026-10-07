import { describe, it, expect } from 'vitest';
import { buildQuizScoreSteps } from './quiz-score-step-compiler';
import { QUIZ_SCORE_CODES } from './greedy-092-stage-codes';

describe('QuizScoreStepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for classic greedy quiz case', () => {
    const questions: [number, number][] = [
      [10, 2],
      [8, 5],
      [6, 6],
      [3, 7],
    ];
    const k = 2;
    const steps = buildQuizScoreSteps(questions, k);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = QUIZ_SCORE_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.totalScore).toBe(31);
  });
});
