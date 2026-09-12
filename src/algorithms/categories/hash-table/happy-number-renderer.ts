/**
 * 快乐数可视化器 — 声明式 4-Card 标准架构
 * LeetCode 202：HashSet 判环
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  HAPPY_NUMBER_PROBLEM_HTML,
  HAPPY_NUMBER_ANALYSIS_HTML,
  HAPPY_NUMBER_CODE_LANGUAGES,
} from './happy-number-problem-content';

export interface HappyNumberStep {
  n: number;
  nextN: number;
  formula: string;
  seen: number[];
  cycleNode: number | null;
  status: 'init' | 'compute' | 'check' | 'happy' | 'cycle';
  isHappy: boolean;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function getNextSquareSum(n: number): { sum: number; formula: string } {
  let sum = 0;
  let temp = n;
  const parts: string[] = [];

  while (temp > 0) {
    const d = temp % 10;
    sum += d * d;
    parts.unshift(`${d}²`);
    temp = Math.floor(temp / 10);
  }

  const formula = parts.join(' + ') + ` = ${sum}`;
  return { sum, formula };
}

export function buildHappyNumberSteps(initialN: number): HappyNumberStep[] {
  const steps: HappyNumberStep[] = [];
  const seen = new Set<number>();
  let cur = initialN;

  const lines = {
    init: { java: 2, cpp: 4, python: 3, javascript: 2 },
    compute: { java: [4, 5], cpp: [6, 7], python: [5, 6], javascript: [13, 14] },
    happy: { java: 7, cpp: 9, python: 7, javascript: 16 },
    cycle: { java: 7, cpp: 9, python: 7, javascript: 16 },
  };

  steps.push({
    n: cur,
    nextN: cur,
    formula: '',
    seen: [],
    cycleNode: null,
    status: 'init',
    isHappy: false,
    message: `初始数字 n = ${cur}，初始化空哈希集合 HashSet seen。`,
    log: `开始计算 n = ${cur}`,
    codeLine: lines.init,
  });

  while (cur !== 1 && !seen.has(cur)) {
    const { sum, formula } = getNextSquareSum(cur);
    seen.add(cur);

    steps.push({
      n: cur,
      nextN: sum,
      formula,
      seen: Array.from(seen),
      cycleNode: null,
      status: 'compute',
      isHappy: false,
      message: `将 ${cur} 加入 seen 集合。计算各位平方和: ${formula}。`,
      log: `${cur} -> ${formula}`,
      codeLine: lines.compute,
    });

    cur = sum;
  }

  if (cur === 1) {
    steps.push({
      n: 1,
      nextN: 1,
      formula: '1² = 1',
      seen: Array.from(seen),
      cycleNode: null,
      status: 'happy',
      isHappy: true,
      message: `🎉 平方和收敛到 1！数字 ${initialN} 是快乐数，返回 true。`,
      log: `✓ 收敛到 1，是快乐数！`,
      codeLine: lines.happy,
    });
  } else {
    steps.push({
      n: cur,
      nextN: cur,
      formula: `已存在于 HashSet 中`,
      seen: Array.from(seen),
      cycleNode: cur,
      status: 'cycle',
      isHappy: false,
      message: `⚠️ 检测到死循环！数字 ${cur} 之前已经在 seen 集合中出现过，陷入死循环，不是快乐数，返回 false。`,
      log: `✗ 检测到循环节点 ${cur}，返回 false`,
      codeLine: lines.cycle,
    });
  }

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: HappyNumberStep[]): HappyNumberStep[] {
  return steps.map((s) => {
    let res: string;
    if (s.status === 'happy') {
      res = '✓ 快乐数';
    } else if (s.status === 'cycle') {
      res = '✗ 死循环';
    } else {
      res = '计算中...';
    }
    return {
      ...s,
      metrics: {
        n: String(s.n),
        next: String(s.nextN),
        'set-size': `${s.seen.length} 个`,
        res,
      },
    };
  });
}

export function renderHappyNumberCanvas(container: HTMLElement, step: HappyNumberStep): void {
  const { n, formula, seen, cycleNode, status } = step;

  // 1. 渲染数字拆解 (当前数字 + 平方和公式)
  const formulaText = formula || '等待计算...';

  // 2. 渲染 HashSet 轨道
  const setHtml =
    seen.length === 0
      ? '<span style="color: #94a3b8; font-size: 11px;">(HashSet 当前为空)</span>'
      : seen
          .map((num) => {
            const isCycle = cycleNode === num;
            const isOne = num === 1 || (status === 'happy' && num === seen[seen.length - 1]);
            let bg = '#ffffff';
            let border = '#cbd5e1';
            let color = '#334155';
            if (isCycle) {
              border = '#ef4444';
              bg = '#fef2f2';
              color = '#b91c1c';
            } else if (isOne) {
              border = '#10b981';
              bg = '#ecfdf5';
              color = '#047857';
            }
            return `
              <div style="padding: 3px 8px; border-radius: 6px; background: ${bg}; border: 1px solid ${border}; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 700; color: ${color}; transition: all 0.15s; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);">
                <span>${num}</span>
              </div>
            `;
          })
          .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 100%; padding: 10px 12px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; gap: 12px; justify-content: center; width: 100%;">
        <span style="font-size: 20px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: #2563eb; padding: 2px 10px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; box-shadow: 0 1px 2px rgba(37, 99, 235, 0.1);">${n}</span>
        <span style="font-size: 14px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: #1e293b;">${formulaText}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; width: 100%; min-height: 28px; justify-content: center;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">seen 集合:</span>
        ${setHtml}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'happy-number',
  name: '快乐数（哈希集合判环）',
  category: 'hash-table',
  description: '用哈希集合检测平方和循环，判断快乐数',
  icon: '😊',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握用 Set 检测循环的方法',
  inputs: [
    {
      id: 'n',
      label: 'n',
      type: 'number',
      defaultValue: 19,
      placeholder: '正整数 n',
      width: '50px',
    },
  ],
  presets: [
    { label: '示例 1: (n = 19 ➔ 快乐数)', values: { n: 19 } },
    { label: '示例 2: (n = 2 ➔ 死循环)', values: { n: 2 } },
    { label: '快乐数: (n = 7)', values: { n: 7 } },
    { label: '死循环: (n = 11)', values: { n: 11 } },
  ],
  metrics: [
    { id: 'n', label: '当前数值 n', color: '#2563eb' },
    { id: 'next', label: '下一平方和', color: '#9333ea' },
    { id: 'set-size', label: '已记录数大小', color: '#f59e0b' },
    { id: 'res', label: '判定结果', color: '#10b981' },
  ],
  legend: [
    { label: '1 (快乐数)', color: '#10b981' },
    { label: '重复出现 (死循环)', color: '#ef4444' },
  ],
  codeLanguages: HAPPY_NUMBER_CODE_LANGUAGES,
  problemHtml: HAPPY_NUMBER_PROBLEM_HTML,
  analysisHtml: HAPPY_NUMBER_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const n = parseInt(String(inputs.n ?? '19'), 10);
    return withMetrics(buildHappyNumberSteps(isNaN(n) || n <= 0 ? 19 : n));
  },
  renderCanvas: (container, step) => renderHappyNumberCanvas(container, step as HappyNumberStep),
});
