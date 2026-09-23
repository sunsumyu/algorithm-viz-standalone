/**
 * K次取反后最大化的数组和可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 1005: 绝对值降序排序 + 负数优先翻转 + 剩余奇数次翻转最小绝对值
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import type { HighlightTarget } from '../../../core/step-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  MAXIMIZE_SUM_K_PROBLEM_HTML,
  MAXIMIZE_SUM_K_ANALYSIS_HTML,
  MAXIMIZE_SUM_K_CODE_LANGUAGES,
} from './maximize-sum-k-problem-content';

export interface MaxSumKStep {
  array: number[];
  currentIndex: number;
  remainingK: number;
  currentSum: number;
  flippedIndices: number[];
  action: 'init' | 'sort' | 'flip_negative' | 'skip_positive' | 'flip_smallest' | 'done';
  message: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
  log?: string;
}

export const MAXIMIZE_SUM_K_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 2, cpp: 4, python: 3, javascript: 2 },
  sort: { java: 3, cpp: 5, python: 4, javascript: 2 },
  skip: { java: 9, cpp: 9, python: 6, javascript: 4 },
  flipNeg: { java: 10, cpp: 10, python: 7, javascript: 5 },
  flipSmall: { java: 15, cpp: 14, python: 10, javascript: 9 },
  done: { java: 17, cpp: 17, python: 11, javascript: 10 },
};

export function buildMaxSumKSteps(rawArr: number[], initialK: number): MaxSumKStep[] {
  const steps: MaxSumKStep[] = [];
  const n = rawArr.length;

  if (n === 0) {
    steps.push({
      array: [],
      currentIndex: -1,
      remainingK: initialK,
      currentSum: 0,
      flippedIndices: [],
      action: 'done',
      message: '数组为空，返回 0',
      codeLine: MAXIMIZE_SUM_K_CODE_LINES.guard,
    });
    return steps;
  }

  // 1. 按照绝对值从大到小排序
  const arr = [...rawArr].sort((a, b) => Math.abs(b) - Math.abs(a));
  let k = initialK;
  let currentSum = arr.reduce((acc, v) => acc + v, 0);
  const flippedIndices: number[] = [];

  steps.push({
    array: [...arr],
    currentIndex: -1,
    remainingK: k,
    currentSum,
    flippedIndices: [],
    action: 'sort',
    message: `第 1 步：按绝对值降序排序完成：nums = [${arr.join(', ')}]，初始总和 = ${currentSum}，剩余 K = ${k}`,
    codeLine: MAXIMIZE_SUM_K_CODE_LINES.sort,
  });

  // 2. 第一步贪心：遍历数组，遇到负数翻转为正数
  for (let i = 0; i < n; i++) {
    if (arr[i] < 0 && k > 0) {
      const oldVal = arr[i];
      arr[i] = -arr[i];
      k--;
      currentSum += 2 * arr[i]; // -oldVal 变为 +oldVal
      flippedIndices.push(i);

      steps.push({
        array: [...arr],
        currentIndex: i,
        remainingK: k,
        currentSum,
        flippedIndices: [...flippedIndices],
        action: 'flip_negative',
        message: `🔄 优先翻转绝对值大的负数：[${i}] 从 ${oldVal} &rarr; ${arr[i]}，和增加 ${2 * arr[i]}，剩余 K = ${k}`,
        codeLine: MAXIMIZE_SUM_K_CODE_LINES.flipNeg,
      });
    } else {
      steps.push({
        array: [...arr],
        currentIndex: i,
        remainingK: k,
        currentSum,
        flippedIndices: [...flippedIndices],
        action: 'skip_positive',
        message: `⏩ 下标 [${i}]=${arr[i]} 为非负数或 K 已耗尽，暂不翻转`,
        codeLine: MAXIMIZE_SUM_K_CODE_LINES.skip,
      });
    }
  }

  // 3. 第二步贪心：如果 k 还有剩余且为奇数，翻转绝对值最小的元素 (arr[n - 1])
  if (k % 2 === 1) {
    const lastIdx = n - 1;
    const oldVal = arr[lastIdx];
    arr[lastIdx] = -arr[lastIdx];
    currentSum += 2 * arr[lastIdx];
    flippedIndices.push(lastIdx);

    steps.push({
      array: [...arr],
      currentIndex: lastIdx,
      remainingK: 0,
      currentSum,
      flippedIndices: [...flippedIndices],
      action: 'flip_smallest',
      message: `⚖️ 剩余 K=${k} 为奇数！翻转绝对值最小的尾部元素：[${lastIdx}] 从 ${oldVal} &rarr; ${arr[lastIdx]}，损失降至最低！`,
      codeLine: MAXIMIZE_SUM_K_CODE_LINES.flipSmall,
    });
  } else if (k > 0) {
    steps.push({
      array: [...arr],
      currentIndex: -1,
      remainingK: 0,
      currentSum,
      flippedIndices: [...flippedIndices],
      action: 'skip_positive',
      message: `⚖️ 剩余 K=${k} 为偶数！在同一元素上反复翻转两次即抵消，对总和无损害`,
      codeLine: MAXIMIZE_SUM_K_CODE_LINES.skip,
    });
  }

  steps.push({
    array: [...arr],
    currentIndex: -1,
    remainingK: 0,
    currentSum,
    flippedIndices: [...flippedIndices],
    action: 'done',
    message: `🎉 贪心取反完成！修改后数组可能的最大和为 ${currentSum}`,
    codeLine: MAXIMIZE_SUM_K_CODE_LINES.done,
  });

  return steps;
}


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: MaxSumKStep[]): MaxSumKStep[] {
  return steps.map((s) => {
    const isFlipNeg = s.action === 'flip_negative';
    const isFlipSmall = s.action === 'flip_smallest';

    let action = '🔍 遍历扫描中';
    if (isFlipNeg) action = '🔄 贪心1: 大负数优先转正';
    else if (isFlipSmall) action = '⚖️ 贪心2: 奇数次翻转最小绝对值';
    else if (s.action === 'done') action = '🎉 完成';
    else if (s.action === 'sort') action = '🔀 绝对值降序排序';

    return {
      ...s,
      log: s.message,
      metrics: {
        'remaining-k': String(s.remainingK),
        flipped: `${s.flippedIndices.length} 次`,
        sum: String(s.currentSum),
        array: `[${s.array.join(', ')}]`,
        action,
      },
    };
  });
}

/** 主视觉：绝对值排序与取反沙盘 */
export function renderMaximizeSumKCanvas(container: HTMLElement, step: MaxSumKStep): void {
  const arr = step.array;
  const n = arr.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';

  const cellsHtml = arr
    .map((val, idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const isFlipped = step.flippedIndices.includes(idx);
      const isNegative = val < 0;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#fff1f2';
        borderColor = '#e11d48';
        textColor = '#e11d48';
      } else if (isFlipped) {
        bg = '#ecfdf5';
        borderColor = '#10b981';
        textColor = '#059669';
      } else if (isNegative) {
        bg = '#fef2f2';
        borderColor = '#fca5a5';
        textColor = '#dc2626';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 9.5px; color: ${isCurrent ? '#e11d48' : '#94a3b8'}; font-weight: 700;">
            ${isCurrent ? '📍 当前' : `|${Math.abs(val)}|`}
          </span>
          <div style="width: 48px; height: 48px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 5px rgba(0,0,0,0.04); transition: all 0.15s;">
            <span>${val > 0 ? `+${val}` : val}</span>
          </div>
          <span style="font-size: 9px; color: ${isFlipped ? '#059669' : isNegative ? '#dc2626' : '#64748b'}; font-weight: 700;">
            ${isFlipped ? '✓ 翻转' : isNegative ? '⚠️ 负数' : '正数'}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>按绝对值降序排列: <code style="color:#e11d48;">|x| desc</code></span>
        <span>当前数组和: <strong style="color: #059669; font-family: monospace; font-size: 12.5px;">${step.currentSum}</strong></span>
      </div>

      <div style="display: flex; gap: 10px; overflow-x: auto; justify-content: center; padding: 6px 0;">
        ${cellsHtml}
      </div>
    </div>
  `;
}

registerAlgorithm({
  id: 'maximize-sum-k',
  name: 'K 次取反后最大化的数组和',
  viewId: 'maximize-sum-k',
  category: 'greedy',
  icon: '±',
  difficulty: 1,
  levelOrder: 7,
  learningGoal: '掌握贪心算法中的绝对值排序策略与奇偶性分类讨论思维，理解有限配额资源调度模型与四阶段状态机演进',
  description: '绝对值降序排序，负数优先转正，剩余奇数次翻转最小绝对值',
  template: `<div id="maximize-sum-k" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerMaximizeSumK(): void {
  // 保持向前兼容导出
}
