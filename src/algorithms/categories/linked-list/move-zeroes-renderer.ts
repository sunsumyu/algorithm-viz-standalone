/**
 * 移动零可视化器（快慢双指针原地交换）
 * LeetCode 283
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MOVE_ZEROES_PROBLEM_HTML,
  MOVE_ZEROES_ANALYSIS_HTML,
  MOVE_ZEROES_CODE_LANGUAGES,
} from './move-zeroes-problem-content';
import {
  MoveZeroesStep,
  buildMoveZeroesSteps,
  withMoveZeroesMetrics,
} from './move-zeroes-step-compiler';
import { renderMoveZeroesCanvas } from './move-zeroes-canvas-adapter';

export type { MoveZeroesStep };
export { buildMoveZeroesSteps, withMoveZeroesMetrics, renderMoveZeroesCanvas };

registerDeclarativeAlgorithm({
  id: 'move-zeroes',
  name: '移动零（双指针原地操作）',
  category: 'linked-list',
  description: '快慢双指针原地把所有 0 移到末尾并保持非零元素相对次序',
  icon: '0️⃣',
  difficulty: 1,
  levelOrder: 7,
  learningGoal: '掌握快慢指针在数组原地覆盖和交换中的应用技巧',
  inputs: [
    { id: 'nums', label: '输入数组', type: 'text', defaultValue: '0, 1, 0, 3, 12' },
  ],
  presets: [
    { label: '示例 1', values: { nums: '0, 1, 0, 3, 12' } },
    { label: '单零', values: { nums: '0' } },
    { label: '多零分布', values: { nums: '1, 0, 2, 0, 0, 3, 4' } },
    { label: '长数组', values: { nums: '4, 2, 4, 0, 0, 3, 0, 5, 1, 0' } },
  ],
  metrics: [
    { id: 'slow', label: '慢指针 slow', color: '#6366f1' },
    { id: 'fast', label: '快指针 fast', color: '#10b981' },
    { id: 'cur-val', label: '当前考察值', color: '#2563eb' },
    { id: 'phase', label: '当前阶段', color: '#f59e0b' },
  ],
  legend: [
    { label: 'slow 非零区边界', color: '#6366f1' },
    { label: 'fast 扫描指针', color: '#10b981' },
    { label: '交换发生', color: '#f59e0b' },
  ],
  codeLanguages: MOVE_ZEROES_CODE_LANGUAGES,
  problemHtml: MOVE_ZEROES_PROBLEM_HTML,
  analysisHtml: MOVE_ZEROES_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums = parseNumberList(String(inputs.nums ?? '0, 1, 0, 3, 12'), []);
    return withMoveZeroesMetrics(buildMoveZeroesSteps(nums.length ? nums : [0, 1, 0, 3, 12]));
  },
  renderCanvas: (container, step) => renderMoveZeroesCanvas(container, step as MoveZeroesStep),
});
