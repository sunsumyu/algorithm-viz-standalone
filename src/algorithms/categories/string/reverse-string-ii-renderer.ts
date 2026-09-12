/**
 * 反转字符串 II 可视化器 — 声明式 4-Card 标准架构
 * LeetCode 541：每 2k 步长反转前 k 个字符
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REVERSE_STRING_II_PROBLEM_HTML,
  REVERSE_STRING_II_ANALYSIS_HTML,
  REVERSE_STRING_II_CODE_LANGUAGES,
} from './reverse-string-ii-problem-content';

export interface ReverseStringIIStep {
  s: string[];
  i: number;
  k: number;
  chunkEnd: number;
  windowStart: number;
  windowEnd: number;
  left: number;
  right: number;
  swapping: boolean;
  phase: 'init' | 'select-chunk' | 'swap' | 'advance' | 'done';
  status: 'init' | 'select-chunk' | 'swap' | 'advance' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function buildReverseStringIISteps(inputStr: string, k: number): ReverseStringIIStep[] {
  const steps: ReverseStringIIStep[] = [];
  const s = inputStr.split('');
  const n = s.length;
  const safeK = Math.max(1, k);

  steps.push({
    s: [...s],
    i: 0,
    k: safeK,
    chunkEnd: Math.min(n - 1, 2 * safeK - 1),
    windowStart: 0,
    windowEnd: Math.min(n - 1, safeK - 1),
    left: -1,
    right: -1,
    swapping: false,
    phase: 'init',
    status: 'init',
    message: `初始化分段反转：字符串长度 n = ${n}，参数 k = ${safeK}，步长 2k = ${2 * safeK}。`,
    log: `开始 2k 分段反转 (n=${n}, k=${safeK})`,
    codeLine: 2,
  });

  for (let i = 0; i < n; i += 2 * safeK) {
    const chunkEnd = Math.min(n - 1, i + 2 * safeK - 1);
    let left = i;
    let right = Math.min(n - 1, i + safeK - 1);
    const windowStart = left;
    const windowEnd = right;

    steps.push({
      s: [...s],
      i,
      k: safeK,
      chunkEnd,
      windowStart,
      windowEnd,
      left,
      right,
      swapping: false,
      phase: 'select-chunk',
      status: 'select-chunk',
      message: `处理第 [${i}, ${chunkEnd}] 分段：待反转区间为 [${left}, ${right}] (right = min(${n - 1}, ${i + safeK - 1}))。`,
      log: `分段 i=${i}: 锁定待反转区间 [${left}, ${right}]`,
      codeLine: [3, 4, 5],
    });

    while (left < right) {
      const temp = s[left];
      s[left] = s[right];
      s[right] = temp;

      steps.push({
        s: [...s],
        i,
        k: safeK,
        chunkEnd,
        windowStart,
        windowEnd,
        left,
        right,
        swapping: true,
        phase: 'swap',
        status: 'swap',
        message: `交换字符：s[${left}] <-> s[${right}] ('${temp}' <-> '${s[left]}')。`,
        log: `交换 s[${left}] <-> s[${right}]`,
        codeLine: [7, 8, 9],
      });

      left++;
      right--;
    }
  }

  steps.push({
    s: [...s],
    i: n,
    k: safeK,
    chunkEnd: n - 1,
    windowStart: -1,
    windowEnd: -1,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'done',
    status: 'done',
    message: `🎉 分段反转全部完成！最终字符串为 "${s.join('')}"。`,
    log: `✓ 处理完成: "${s.join('')}"`,
    codeLine: 14,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: ReverseStringIIStep[]): ReverseStringIIStep[] {
  const phaseMap: Record<string, string> = {
    init: '初始化',
    'select-chunk': '分段锁定',
    swap: '交换中',
    advance: '步进',
    done: '处理完成',
  };
  return steps.map((step) => {
    let action = 'right = min(n - 1, i + k - 1)';
    if (step.windowStart >= 0 && step.windowEnd >= 0 && step.phase !== 'done') {
      action = `right = min(${step.s.length - 1}, ${step.i} + ${step.k} - 1) = ${step.windowEnd}`;
    } else if (step.phase === 'done') {
      action = '分段反转完成';
    }

    return {
      ...step,
      metrics: {
        i: step.phase === 'done' ? '—' : String(step.i),
        window:
          step.windowStart >= 0 && step.windowEnd >= 0 && step.phase !== 'done'
            ? `[${step.windowStart}, ${step.windowEnd}]`
            : '—',
        k: `${step.k} / ${2 * step.k}`,
        phase: phaseMap[step.phase] || step.phase,
        action,
      },
    };
  });
}

export function renderReverseStringIICanvas(container: HTMLElement, step: ReverseStringIIStep): void {
  const { s, i, chunkEnd, windowStart, windowEnd, left, right, swapping, phase } = step;

  const cellsHtml = s
    .map((ch, idx) => {
      const inChunk = idx >= i && idx <= chunkEnd && phase !== 'done';
      const inRevWindow = idx >= windowStart && idx <= windowEnd && phase !== 'done';
      const isLeft = idx === left && phase !== 'done';
      const isRight = idx === right && phase !== 'done';
      const isSwapping = swapping && (idx === left || idx === right);
      const isI = idx === i && phase !== 'done';

      let border = '#cbd5e1';
      let bg = '#ffffff';
      let transform = 'none';
      let boxShadow = 'none';
      if (isSwapping) {
        border = '#10b981';
        bg = '#ecfdf5';
        transform = 'translateY(-3px) scale(1.05)';
        boxShadow = '0 4px 10px rgba(16, 185, 129, 0.2)';
      } else if (isLeft) {
        border = '#2563eb';
        bg = '#eff6ff';
      } else if (isRight) {
        border = '#f59e0b';
        bg = '#fffbeb';
      } else if (inRevWindow || inChunk) {
        border = '#93c5fd';
        bg = '#f0fdf4';
      }

      let ptrTags = '';
      if (isI) {
        ptrTags +=
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #9333ea; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">i</span>';
      }
      if (isLeft && isRight) {
        ptrTags +=
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">L</span>' +
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #f59e0b; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">R</span>';
      } else if (isLeft) {
        ptrTags +=
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">left</span>';
      } else if (isRight) {
        ptrTags +=
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #f59e0b; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">right</span>';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <div style="min-height: 18px; display: flex; align-items: center; gap: 3px;">${ptrTags}</div>
          <div style="width: 44px; height: 48px; border-radius: 10px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); transform: ${transform}; box-shadow: ${boxShadow};">
            <span style="font-size: 16px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace;">${ch}</span>
            <span style="font-size: 9px; font-weight: 700; color: #94a3b8; position: absolute; bottom: 2px;">${idx}</span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; align-items: flex-end; gap: 8px; flex-wrap: wrap; justify-content: center; height: 100%; padding: 12px; box-sizing: border-box;">
      ${cellsHtml}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'reverse-string-ii',
  name: '反转字符串II（分段反转）',
  category: 'string',
  description: '每隔 2k 个字符反转前 k 个字符',
  icon: '🔁',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握分段处理 + 边界条件的双指针反转',
  inputs: [
    { id: 's', label: '字符串 s', type: 'text', defaultValue: 'abcdefg', placeholder: '例如: abcdefg' },
    { id: 'k', label: '反转长度 k', type: 'number', defaultValue: 2, min: 1, max: 10 },
  ],
  presets: [
    { label: '示例 1: ("abcdefg", k=2)', values: { s: 'abcdefg', k: 2 } },
    { label: '示例 2: ("abcd", k=2)', values: { s: 'abcd', k: 2 } },
    { label: '长字符串: ("abcdefghijk", k=3)', values: { s: 'abcdefghijk', k: 3 } },
    { label: '单字符: ("a", k=2)', values: { s: 'a', k: 2 } },
  ],
  metrics: [
    { id: 'i', label: '步长下标 i', color: '#9333ea' },
    { id: 'window', label: '反转区间 [left, right]', color: '#2563eb' },
    { id: 'k', label: 'k / 2k 步长', color: '#f59e0b' },
    { id: 'phase', label: '当前阶段', color: '#0f172a' },
    { id: 'action', label: '边界计算', color: '#2563eb' },
  ],
  legend: [
    { label: 'i 步长 (+2k)', color: '#9333ea' },
    { label: '[left, right] 反转窗口', color: '#2563eb' },
  ],
  codeLanguages: REVERSE_STRING_II_CODE_LANGUAGES,
  problemHtml: REVERSE_STRING_II_PROBLEM_HTML,
  analysisHtml: REVERSE_STRING_II_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const str = String(inputs.s ?? 'abcdefg');
    const rawK = Number(inputs.k ?? 2);
    const k = isNaN(rawK) || rawK <= 0 ? 2 : rawK;
    return withMetrics(buildReverseStringIISteps(str, k));
  },
  renderCanvas: (container, step) => renderReverseStringIICanvas(container, step as ReverseStringIIStep),
});
