/**
 * 一维差分数组 (1D Difference Array / 航班预订统计) - 声明式教学级沙盘渲染器
 * 核心原理：区间加法 diff[L] += val, diff[R+1] -= val，最后一次前缀和扫描还原
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ARRAY_DIFF_PROBLEMS } from './array-diff-problem-content';
import { DIFF_1D_CODES } from './array-diff-stage-codes';
import { renderDiff1DView } from './array-diff-shared';
import {
  Diff1DStep,
  buildDiff1DSteps,
} from './diff-array-1d-step-compiler';

// 向后兼容导出
export type { Diff1DStep };
export { buildDiff1DSteps };

export const diffArray1DVisualizer = registerDeclarativeAlgorithm<Diff1DStep>({
  id: 'diff-array-1d-047',
  name: '一维差分数组 (1D Difference Array)',
  category: 'array',
  icon: '🎚️',
  difficulty: 2,
  levelOrder: 471,
  aliases: ['class047-code01', 'diff-array-1d', 'corporate-flight-bookings-1109', 'leetcode-1109', 'luogu-p2367'],
  learningGoal: '掌握差分与前缀和互为逆运算的数学本质，实现 O(1) 极速区间修改',
  problemHtml: ARRAY_DIFF_PROBLEMS.diff1D.html,
  analysisHtml: ARRAY_DIFF_PROBLEMS.diff1D.html,
  inputs: [
    {
      id: 'input-bookings',
      label: '预订区间与增量 (L, R, val; 分号隔开)',
      type: 'text',
      defaultValue: '1, 2, 10; 2, 3, 20; 2, 5, 25',
      placeholder: '例如 1, 2, 10; 2, 3, 20; 2, 5, 25',
    },
    {
      id: 'input-n',
      label: '总位置数 n',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 20,
      step: 1,
      placeholder: '例如 5',
    },
  ],
  codeLanguages: DIFF_1D_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-bookings'] ?? '1, 2, 10; 2, 3, 20; 2, 5, 25');
    const bookings = raw.split(';').map(item =>
      item.split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    ).filter(b => b.length === 3);
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '5'), 10) || 5);
    return buildDiff1DSteps(bookings.length > 0 ? bookings : [[1, 2, 10], [2, 3, 20], [2, 5, 25]], n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: Diff1DStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 差分与前缀和双视图
    renderDiff1DView(root, step.diffArray || [], step.ansArray || [], step.activeRange);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
