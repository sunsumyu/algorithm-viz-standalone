/**
 * Hard 22: 缺失的第一个正数 (First Missing Positive)
 * LeetCode 41 (Hard) / 大厂压轴原地哈希 (In-place Hash) 奠基母题
 * 核心原语：鸽巢原理 + 原地置换，将数字 x 归位至下标 x - 1，O(N) 时间严格 O(1) 空间
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MissingPositiveStep,
  MISSING_POSITIVE_CODES,
  FIRST_MISSING_POSITIVE_CODE_LINES,
  generateMissingPositiveSteps,
} from './first-missing-positive-step-compiler';
import {
  renderMissingPositiveCanvas,
  renderMissingPositiveAuxiliary,
} from './first-missing-positive-canvas-adapter';

export type { MissingPositiveStep };
export {
  MISSING_POSITIVE_CODES,
  FIRST_MISSING_POSITIVE_CODE_LINES,
  generateMissingPositiveSteps,
  renderMissingPositiveCanvas,
};

export const firstMissingPositiveVisualizer = registerDeclarativeAlgorithm<MissingPositiveStep>({
  id: 'first-missing-positive',
  aliases: ['41', 'leetcode-41', 'first-missing-positive-in-place-hash'],
  hasDeductionTree: true,
  name: 'Hard 22: 缺失的第一个正数 (First Missing Positive)',
  category: 'array',
  icon: '🎯',
  badge: {
    mode: '原地置换哈希',
    complexity: 'O(n) · O(1)',
  },
  card1Title: '📊 原地哈希置换沙盘 (In-Place Hash)',
  card2Title: '🧭 鸽巢原理与状态空间监视器',
  card2Desc: '物理槽位归位情况、当前置换决策与数学公理验证',
  legend: [
    { label: '已完美归位 nums[i]=i+1', color: '#22c55e' },
    { label: '当前检查槽位 i', color: '#3b82f6' },
    { label: '正在置换对 (Swap)', color: '#f59e0b' },
    { label: '未归位槽位', color: '#64748b' },
  ],
  difficulty: 3,
  levelOrder: 41,
  learningGoal: '掌握原地哈希桶排序置换技巧，深刻理解鸽巢原理在常数级额外空间 O(1) 检索中的精妙应用',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 41 - Hard)</h3>
      <p>给你一个未排序的整数数组 <code>nums</code> ，请你找出其中没有出现的最小的正整数。</p>
      <ul>
        <li><strong>时空要求</strong>：请你实现时间复杂度为 $O(N)$ 并且只使用常数级别额外空间 $O(1)$ 的解决方案。</li>
        <li><strong>核心思想</strong>：鸽巢原理 + 原地置换。将数值 $x$ 交换至下标 $x - 1$ 位置，最后扫描首个失配槽位。</li>
      </ul>
    </div>
  `,
  codeLanguages: MISSING_POSITIVE_CODES,
  inputs: [
    {
      id: 'scenario',
      label: '预设数组用例',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: '标准用例: [3, 4, -1, 1] ➔ 答案 2', value: 'standard' },
        { label: '连续用例: [1, 2, 0] ➔ 答案 3', value: 'continuous' },
        { label: '负数断层: [7, 8, 9, 11, 12] ➔ 答案 1', value: 'large_positive' },
      ],
    },
  ],
  metrics: [
    { id: 'min-missing', label: '最小缺失正数', color: '#0d9488' },
    { id: 'cur-index', label: '当前检查槽位', color: '#2563eb' },
    { id: 'in-place-count', label: '已正确归位槽数', color: '#8b5cf6' },
    { id: 'array-scale', label: '数组物理规模', color: '#d97706' },
  ],
  auxiliaryVisual: {
    title: '🧭 鸽巢原理与状态空间监视器',
    desc: '当前置换决策与原地哈希公理验证',
    render: (container, step) => {
      renderMissingPositiveAuxiliary(container, step);
    },
  },
  generateSteps: (input) => {
    const sc = input.scenario || 'standard';
    let arr = [3, 4, -1, 1];
    if (sc === 'continuous') arr = [1, 2, 0];
    else if (sc === 'large_positive') arr = [7, 8, 9, 11, 12];
    return generateMissingPositiveSteps(arr);
  },
  renderCanvas: (container, step) => {
    renderMissingPositiveCanvas(container, step);
  },
});
