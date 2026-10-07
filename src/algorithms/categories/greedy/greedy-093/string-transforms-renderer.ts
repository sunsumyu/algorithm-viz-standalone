/**
 * 转化字符串的最少操作次数 (LeetCode 1153) - 声明式教学级沙盘渲染器
 * 核心贪心：映射单值一致性校验 + 26 字符满射死锁判定
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_093_PROBLEMS } from './greedy-093-problem-content';
import { STRING_TRANSFORMS_CODES } from './greedy-093-stage-codes';
import {
  CharMapPair,
  StringTransformsStep,
  buildStringTransformsSteps,
} from '../../../../core/renderers/adapters/string-transforms-093-step-compiler';
import { stringTransforms093CanvasAdapter } from '../../../../core/renderers/adapters/string-transforms-093-canvas-adapter';

export type { CharMapPair, StringTransformsStep };
export { buildStringTransformsSteps };

export const stringTransformsVisualizer = registerDeclarativeAlgorithm<StringTransformsStep>({
  id: 'string-transforms-into-another-string',
  name: '转化字符串的最少操作次数',
  category: 'greedy',
  icon: '🔤',
  difficulty: 3,
  levelOrder: 933,
  aliases: ['class093-code03', 'string-transforms-1153', 'leetcode-1153', 'string-transforms'],
  learningGoal: '掌握字符集一对多单值映射检测与26全字母满射置换死锁的拓扑判断',
  problemHtml: GREEDY_093_PROBLEMS.stringTransforms.html,
  analysisHtml: GREEDY_093_PROBLEMS.stringTransforms.html,
  inputs: [
    {
      id: 'input-str1',
      label: '源字符串 str1',
      type: 'text',
      defaultValue: 'aabcc',
      placeholder: 'aabcc',
    },
    {
      id: 'input-str2',
      label: '目标字符串 str2',
      type: 'text',
      defaultValue: 'ccdee',
      placeholder: 'ccdee',
    },
  ],
  codeLanguages: STRING_TRANSFORMS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const str1 = String(inputs?.['input-str1'] ?? 'aabcc').trim();
    const str2 = String(inputs?.['input-str2'] ?? 'ccdee').trim();
    return buildStringTransformsSteps(str1, str2);
  },
  renderCanvas: (stageContainer: HTMLElement, step: StringTransformsStep) => {
    stringTransforms093CanvasAdapter.render(stageContainer, step);
  },
});

export function registerStringTransforms(): void {
  // 保持向前兼容导出
}
