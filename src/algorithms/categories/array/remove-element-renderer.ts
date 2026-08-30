/**
 * 移除元素可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 27：快慢双指针原地覆盖
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { ArrayTrackAdapter } from '../../../core/renderers/adapters/array-track-adapter';
import {
  REMOVE_ELEMENT_PROBLEM_HTML,
  REMOVE_ELEMENT_ANALYSIS_HTML,
  REMOVE_ELEMENT_CODE_LANGUAGES,
} from './remove-element-problem-content';

export interface RemoveStep {
  array: number[];
  fast: number;
  slow: number;
  val: number;
  status: 'check' | 'skip' | 'copy' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function parseArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : [3, 2, 2, 3];
}

export function buildRemoveElementSteps(arr: number[], val: number): RemoveStep[] {
  const steps: RemoveStep[] = [];
  let slow = 0;
  const work = [...arr];

  steps.push({
    array: [...work],
    fast: 0,
    slow: 0,
    val,
    status: 'check',
    message: `初始化 slow = 0，fast 从 0 开始遍历，待移除的目标值 val = ${val}。`,
    log: `初始化快慢指针：slow=0, fast=0, val=${val}`,
    codeLine: 2,
  });

  for (let fast = 0; fast < work.length; fast++) {
    steps.push({
      array: [...work],
      fast,
      slow,
      val,
      status: 'check',
      message: `快指针 fast=${fast}，检查 nums[${fast}]=${work[fast]} 是否等于 val=${val}。`,
      log: `检查 nums[${fast}] = ${work[fast]}`,
      codeLine: 3,
    });

    if (work[fast] !== val) {
      const prevVal = work[slow];
      work[slow] = work[fast];
      steps.push({
        array: [...work],
        fast,
        slow,
        val,
        status: 'copy',
        message: `nums[fast]=${work[fast]} ≠ val，保留此元素：覆写到 nums[slow=${slow}]（原值 ${prevVal}），slow++ → ${slow + 1}。`,
        log: `保留元素: nums[${slow}] = ${work[fast]}，slow 右移至 ${slow + 1}`,
        codeLine: [4, 5],
      });
      slow++;
    } else {
      steps.push({
        array: [...work],
        fast,
        slow,
        val,
        status: 'skip',
        message: `nums[fast]=${work[fast]} == val，遇到待移除元素，跳过不复制，慢指针 slow 保持在 ${slow}。`,
        log: `跳过目标值: nums[${fast}] == ${val}`,
        codeLine: 3,
      });
    }
  }

  steps.push({
    array: [...work],
    fast: work.length,
    slow,
    val,
    status: 'done',
    message: `🎉 遍历完成！新数组有效长度为 slow = ${slow}，前 ${slow} 个元素为最终保留结果 [${work.slice(0, slow).join(', ')}]。`,
    log: `✓ 完成：有效长度 k = ${slow}`,
    codeLine: 6,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<RemoveStep>({
  id: 'remove-element',
  name: '移除元素',
  category: 'array',
  icon: '✂️',
  badge: {
    mode: '快慢双指针原地覆写',
    complexity: 'O(n) · O(1)',
  },
  card1Title: '📊 数组条带与快慢双指针沙盘',
  card2Title: '🧭 指针状态与有效保留区间监视器',
  card2Desc: '快慢指针索引、当前覆写动作与有效数组前缀',
  legend: [
    { label: '快指针 fast', color: '#2563eb' },
    { label: '慢指针 slow', color: '#0d9488' },
    { label: '待移除目标 val', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-array',
      label: '输入数组',
      type: 'text',
      defaultValue: '3, 2, 2, 3',
      width: '140px',
      placeholder: '3, 2, 2, 3',
    },
    {
      id: 'input-val',
      label: '移除值 val',
      type: 'number',
      defaultValue: 3,
      width: '45px',
    },
  ],
  presets: [
    { label: '示例 1 (val=3)', values: { 'input-array': '3, 2, 2, 3', 'input-val': 3 } },
    { label: '示例 2 (val=2)', values: { 'input-array': '0, 1, 2, 2, 3, 0, 4, 2', 'input-val': 2 } },
    { label: '无匹配项 (val=5)', values: { 'input-array': '1, 2, 3, 4', 'input-val': 5 } },
  ],
  metrics: [
    { id: 'fast-idx', label: '快指针 fast', color: '#2563eb' },
    { id: 'slow-idx', label: '慢指针 slow (有效长)', color: '#0d9488' },
    { id: 'action-state', label: '当前动作', color: '#16a34a' },
  ],
  codeLanguages: REMOVE_ELEMENT_CODE_LANGUAGES,
  problemHtml: REMOVE_ELEMENT_PROBLEM_HTML,
  analysisHtml: REMOVE_ELEMENT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-array'] || '3, 2, 2, 3';
    const arr = parseArray(raw);
    const val = parseInt(inputs['input-val'] || '3', 10);
    return buildRemoveElementSteps(arr, val);
  },
  renderCanvas: (container, step) => {
    const isDone = step.status === 'done';
    const highlights = new Map<number, { bg?: string; border?: string; color?: string }>();

    // 为有效前缀 [0..slow-1] 标记绿色
    for (let i = 0; i < step.slow; i++) {
      highlights.set(i, { bg: '#f0fdf4', border: '#86efac', color: '#166534' });
    }

    if (step.fast < step.array.length && !isDone) {
      if (step.status === 'skip') {
        highlights.set(step.fast, { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b' });
      }
    }

    ArrayTrackAdapter.renderTrack(container, {
      array: step.array,
      pointers: isDone
        ? [{ name: 'k', index: step.slow, color: '#16a34a', position: 'top' }]
        : [
            { name: 'fast', index: step.fast, color: '#2563eb', position: 'top' },
            { name: 'slow', index: step.slow, color: '#0d9488', position: 'bottom' },
          ],
      itemHighlights: highlights,
      primaryTitle: '📊 原地数组条带 (nums):',
    });

    const root = container.closest('#algo-remove-element-view');
    if (root) {
      const fastEl = root.querySelector('#metric-fast-idx');
      const slowEl = root.querySelector('#metric-slow-idx');
      const actEl = root.querySelector('#metric-action-state');

      if (fastEl) fastEl.textContent = `${step.fast}`;
      if (slowEl) slowEl.textContent = `${step.slow}`;
      if (actEl) {
        actEl.textContent =
          step.status === 'copy'
            ? `覆写 nums[${step.slow}] = ${step.array[step.slow]}`
            : step.status === 'skip'
            ? `跳过 val=${step.val}`
            : step.status === 'done'
            ? `完成 (有效长度 ${step.slow})`
            : '检查中';
      }

      // 在 Card 2 中展示当前有效数组前缀
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const validItems = step.array.slice(0, step.slow);
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10.5px; font-weight: 700; color: #475569;">有效前缀 [0..${Math.max(0, step.slow - 1)}]:</span>
              <span style="font-size: 10px; color: #16a34a; font-family: monospace;">长度 k = ${step.slow}</span>
            </div>
            <div style="padding: 4px 8px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #16a34a;">
              [ ${validItems.join(', ')} ]
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'remove-element',
  name: '移除元素',
  viewId: 'algo-remove-element-view',
  category: 'array',
  description: '快慢双指针原地覆写：快指针寻找新元素，慢指针指向新数组位置，O(1) 额外空间',
  icon: '✂️',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握利用快慢双指针在单数组中原地覆写元素以消除特定目标的经典范式',
});
