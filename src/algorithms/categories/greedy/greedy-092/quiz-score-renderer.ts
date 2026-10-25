/**
 * 知识竞赛得分最大化 - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 * 核心贪心：全选 B 策略基准分 + 差值贡献 (a[i] - b[i]) 降序排序贪心选前 k 题为 A
 */

import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import {
  QuizQuestionItem,
  QuizScoreStep,
  buildQuizScoreSteps,
} from './quiz-score-step-compiler';
import { renderQuizScoreCanvas } from './quiz-score-canvas-adapter';

export type { QuizQuestionItem, QuizScoreStep };
export { buildQuizScoreSteps, renderQuizScoreCanvas };

const template = `<div id="algo-quiz-score-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const quizScoreRenderer = UniversalStageVisualizer;
export const quizScoreVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'quiz-score-maximization',
  name: '知识竞赛得分最大化 (Quiz Score)',
  viewId: 'algo-quiz-score-view',
  category: 'greedy',
  description: '左程云算法讲解 092 Code04：知识竞赛得分最大化，差额排序贪心策略与动态规划推演',
  icon: '📝',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 924,
  learningGoal: '掌握基准假定结合边际差值 (A - B) 降序贪心排序选择的经典转化模型',
  aliases: ['class092-code04', 'quiz-score', 'quiz-score-max'],
});

export function registerQuizScore(): void {
  // 保持向前兼容导出
}
