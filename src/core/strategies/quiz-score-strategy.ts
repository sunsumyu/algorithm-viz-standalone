/**
 * 知识竞赛得分最大化策略适配器 (QuizScoreStrategy)
 * 遵循身材红线标准 (LOC < 120 行)，负责参数提取与委托核心编译器
 * 对应左程云 092 Code04 (Quiz Score Maximization)
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { TwoSequenceGreedyStepCompiler } from './two-sequence-greedy-step-compiler';

export class QuizScoreStrategy extends BaseAlgorithmStrategy {
  constructor(modelId: string = 'quiz-score-maximization') {
    super(modelId);
  }

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'quiz-score-maximization' ||
      modelId === 'quiz-score' ||
      modelId === 'quiz-score-max' ||
      modelId === 'class092-code04'
    );
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawQuestions =
      options?.customInputs?.questions ??
      options?.customInputs?.['input-questions'] ??
      model.defaultParams?.questions;

    const rawK =
      options?.customInputs?.k ??
      options?.customInputs?.['input-k'] ??
      model.defaultParams?.k;

    const questions = this.parseQuestions(rawQuestions);
    const k = this.parseK(rawK, questions.length);

    return TwoSequenceGreedyStepCompiler.compileQuizScore(
      model,
      questions,
      k,
      stage,
      direction,
      options?.anchorMap
    );
  }

  private parseQuestions(raw: any): [number, number][] {
    const fallback: [number, number][] = [
      [10, 2],
      [8, 5],
      [6, 6],
      [3, 7],
    ];
    if (Array.isArray(raw) && raw.length >= 1) {
      const valid = raw
        .map((item) => (Array.isArray(item) ? [Number(item[0]), Number(item[1])] : null))
        .filter((c): c is [number, number] => c !== null && !isNaN(c[0]) && !isNaN(c[1]));
      if (valid.length >= 1) return valid;
    }
    if (typeof raw === 'string') {
      const pairs = raw.split(/[;；]+/).map((s) => s.trim()).filter(Boolean);
      const res: [number, number][] = [];
      for (const p of pairs) {
        const nums = p.split(/[,，\s]+/).map(Number).filter((n) => !isNaN(n));
        if (nums.length >= 2) res.push([nums[0], nums[1]]);
      }
      if (res.length >= 1) return res;
    }
    return fallback;
  }

  private parseK(raw: any, maxK: number): number {
    const num = Number(raw);
    if (!isNaN(num) && num >= 0) {
      return Math.min(Math.floor(num), maxK);
    }
    return Math.min(2, maxK);
  }
}
