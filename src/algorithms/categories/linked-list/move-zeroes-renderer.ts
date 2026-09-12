/**
 * 移动零可视化器（快慢双指针原地交换）
 * LeetCode 283
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  MOVE_ZEROES_PROBLEM_HTML,
  MOVE_ZEROES_ANALYSIS_HTML,
  MOVE_ZEROES_CODE_LANGUAGES,
} from './move-zeroes-problem-content';

export interface MoveZeroesStep {
  nums: number[];
  slow: number;
  fast: number;
  action: 'init' | 'check_zero' | 'check_nonzero' | 'swap' | 'done';
  message: string;
  codeLine: HighlightTarget;
}

export function parseValues(input: string, defaultVals: number[]): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : defaultVals;
}

export function buildMoveZeroesSteps(initialNums: number[]): MoveZeroesStep[] {
  const steps: MoveZeroesStep[] = [];
  const nums = [...initialNums];
  let slow = 0;

  const lines = {
    init: { java: 3, cpp: 4, python: 3, javascript: 2 },
    checkZero: { java: 4, cpp: 5, python: 4, javascript: 3 },
    checkNonzero: { java: 5, cpp: 6, python: 5, javascript: 4 },
    swap: { java: [6, 7, 8, 9], cpp: [7, 8], python: [6, 7], javascript: [5, 6] },
    done: { java: 11, cpp: 10, python: 4, javascript: 8 },
  };

  steps.push({
    nums: [...nums],
    slow: 0,
    fast: 0,
    action: 'init',
    message: `初始化：slow=0, fast=0。慢指针 slow 指向待填槽位，快指针 fast 扫描非零元素。`,
    codeLine: lines.init,
  });

  for (let fast = 0; fast < nums.length; fast++) {
    const val = nums[fast];
    if (val !== 0) {
      steps.push({
        nums: [...nums],
        slow,
        fast,
        action: 'check_nonzero',
        message: `fast=${fast} 处 nums[${fast}]=${val} ≠ 0，命中非零值，准备与 slow=${slow} 处元素交换。`,
        codeLine: lines.checkNonzero,
      });

      // 交换
      const temp = nums[slow];
      nums[slow] = nums[fast];
      nums[fast] = temp;

      steps.push({
        nums: [...nums],
        slow,
        fast,
        action: 'swap',
        message: `交换 nums[${slow}] (${temp}) 与 nums[${fast}] (${val})。slow++ 递增至 ${slow + 1}。`,
        codeLine: lines.swap,
      });

      slow++;
    } else {
      steps.push({
        nums: [...nums],
        slow,
        fast,
        action: 'check_zero',
        message: `fast=${fast} 处 nums[${fast}]=0，跳过继续探测。`,
        codeLine: lines.checkZero,
      });
    }
  }

  steps.push({
    nums: [...nums],
    slow,
    fast: nums.length,
    action: 'done',
    message: `🎉 扫描完毕！所有非零元素已按序排在前部，末尾全为 0。最终数组: [${nums.join(', ')}]。`,
    codeLine: lines.done,
  });

  return steps;
}


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: MoveZeroesStep[]): MoveZeroesStep[] {
  return steps.map((s) => {
    let phase = '初始化';
    if (s.action === 'check_nonzero') phase = '命中非零';
    else if (s.action === 'swap') phase = '原地交换';
    else if (s.action === 'check_zero') phase = '遇到 0 跳过';
    else if (s.action === 'done') phase = '移动完成';

    return {
      ...s,
      log: s.message,
      metrics: {
        slow: `[${s.slow}]`,
        fast: s.fast < s.nums.length ? `[${s.fast}]` : '扫描结束',
        'cur-val': s.fast < s.nums.length ? String(s.nums[s.fast]) : '—',
        phase,
      },
    };
  });
}

/** 主视觉：数组内存结构 + 快慢双指针沙盘 */
export function renderMoveZeroesCanvas(container: HTMLElement, step: MoveZeroesStep): void {
  const n = step.nums.length;
  let html = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 12px; width: 100%; height: 100%; box-sizing: border-box;">
      <div style="font-size: 11.5px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
        <span>数组内存结构 (长度 ${n})</span>
        <span style="font-size: 10.5px; font-weight: normal; color: #64748b;">[0..slow-1 为已整理非零区]</span>
      </div>
      <div style="display: flex; gap: 6px; position: relative; flex-wrap: wrap; justify-content: center;">
  `;

  for (let i = 0; i < n; i++) {
    const val = step.nums[i];
    const isSlow = step.slow === i;
    const isFast = step.fast === i;
    const isSwapped = (isSlow || isFast) && step.action === 'swap';

    let bg = '#ffffff';
    let border = '2px solid #cbd5e1';
    let textColor = '#0f172a';

    if (val === 0) {
      textColor = '#94a3b8';
      bg = '#f8fafc';
    } else {
      textColor = '#2563eb';
      bg = '#eff6ff';
    }

    if (isSwapped) {
      border = '2px solid #f59e0b';
      bg = '#fef3c7';
    } else if (isFast) {
      border = '2px solid #10b981';
    } else if (isSlow) {
      border = '2px solid #6366f1';
    }

    html += `
      <div style="display: flex; flex-direction: column; align-items: center; width: 40px; position: relative;">
        <div style="height: 18px; display: flex; align-items: center; justify-content: center; gap: 2px;">
          ${isSlow ? '<span style="background: #6366f1; color: white; font-size: 8.5px; font-weight: bold; padding: 1px 3px; border-radius: 4px;">slow</span>' : ''}
          ${isFast ? '<span style="background: #10b981; color: white; font-size: 8.5px; font-weight: bold; padding: 1px 3px; border-radius: 4px;">fast</span>' : ''}
        </div>
        <div style="width: 40px; height: 40px; border-radius: 8px; background: ${bg}; border: ${border}; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: ${textColor}; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s ease;">
          ${val}
        </div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-family: monospace;">[${i}]</div>
      </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function parseNums(raw: string): number[] {
  return String(raw ?? '')
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
}

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
    const nums = parseNums(String(inputs.nums ?? '0, 1, 0, 3, 12'));
    return withMetrics(buildMoveZeroesSteps(nums.length ? nums : [0, 1, 0, 3, 12]));
  },
  renderCanvas: (container, step) => renderMoveZeroesCanvas(container, step as MoveZeroesStep),
});
