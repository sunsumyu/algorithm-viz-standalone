/**
 * 知识竞赛得分最大化 - 声明式教学级沙盘渲染器
 * 核心贪心：全选 B 策略基准分 + 差值贡献 (a[i] - b[i]) 降序排序贪心选前 k 题为 A
 * Thin Domain Adapter (< 60 LOC)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_092_PROBLEMS } from './greedy-092-problem-content';
import { QUIZ_SCORE_CODES } from './greedy-092-stage-codes';
import {
  QuizQuestionItem,
  QuizScoreStep,
  buildQuizScoreSteps,
  parseQuizScoreInputs,
} from './quiz-score-step-compiler';
import { renderQuizScoreCanvas } from './quiz-score-canvas-adapter';

export type { QuizQuestionItem, QuizScoreStep };
export { buildQuizScoreSteps, renderQuizScoreCanvas };

export const quizScoreVisualizer = registerDeclarativeAlgorithm<QuizScoreStep>({
  id: 'quiz-score-maximization',
  name: '知识竞赛得分最大化 (Quiz Score)',
  category: 'greedy',
  icon: '📝',
  difficulty: 2,
  levelOrder: 924,
  aliases: ['class092-code04', 'quiz-score', 'quiz-score-max'],
  learningGoal: '掌握基准假定结合边际差值 (A - B) 降序贪心排序选择的经典转化模型',
  problemHtml: GREEDY_092_PROBLEMS.quizScore.html,
  analysisHtml: GREEDY_092_PROBLEMS.quizScore.html,
  inputs: [
    {
      id: 'input-questions',
      label: '题目分值列表 (A,B 分号隔开)',
      type: 'text',
      defaultValue: '10,2; 8,5; 6,6; 3,7',
      placeholder: '10,2; 8,5; 6,6; 3,7',
    },
    {
      id: 'input-k',
      label: '选择 A 策略题目数 k',
      type: 'text',
      defaultValue: '2',
      placeholder: '如 2',
    },
  ],
  codeLanguages: QUIZ_SCORE_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const { questions, k } = parseQuizScoreInputs(inputs);
    return buildQuizScoreSteps(questions, k);
  },
  renderCanvas: (stageContainer: HTMLElement, step: QuizScoreStep) => {
    renderQuizScoreCanvas(stageContainer, step);
  },
});
