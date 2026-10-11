/**
 * Class 101: KMP 循环节与周期串检测
 * 洛谷 P4391 / POJ 2406
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { STRING_100_105_PROBLEMS } from './string-100-105-problem-content';
import { KMP_PERIOD_CODES } from './string-100-105-stage-codes';
import {
  KmpPeriodStep,
  computeNextArrayWithLength,
  buildKmpPeriodSteps,
} from './kmp-period-step-compiler';
import { renderKmpPeriodCanvas } from './kmp-period-canvas-adapter';

export type { KmpPeriodStep };
export { computeNextArrayWithLength, buildKmpPeriodSteps, renderKmpPeriodCanvas };

export const kmpPeriodVisualizer = registerDeclarativeAlgorithm<KmpPeriodStep>({
  id: 'kmp-period',
  name: 'KMP 循环节与周期串检测 (Class 101)',
  category: 'string',
  icon: '🔁',
  difficulty: 2,
  levelOrder: 101,
  aliases: ['class101-code01', 'kmp-period', 'luogu-p4391', 'string-period'],
  learningGoal: '掌握 KMP next[n] 的周期平移性质、最小正周期与字符串重复覆盖判定',
  problemHtml: STRING_100_105_PROBLEMS.kmpPeriod.html,
  analysisHtml: STRING_100_105_PROBLEMS.kmpPeriod.html,
  inputs: [
    {
      id: 's',
      label: '输入字符串 (s)',
      type: 'text',
      defaultValue: 'abcabcabc',
      placeholder: '请输入测试字符串，如 abcabcabc',
    },
  ],
  codeLanguages: KMP_PERIOD_CODES,
  generateSteps: (input) => {
    const s = String(input.s || 'abcabcabc');
    return buildKmpPeriodSteps(s);
  },
  renderCanvas: (container, step) => {
    renderKmpPeriodCanvas(container, step);
  },
});
