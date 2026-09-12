/**
 * 分发糖果可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 135：双向两次贪心（左向右 + 右向左取 max），求最少分发糖果数
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  CANDY_PROBLEM_HTML,
  CANDY_ANALYSIS_HTML,
  CANDY_CODE_LANGUAGES,
} from './candy-problem-content';

export interface CandyStep {
  ratings: number[];
  candies: number[];
  currentIndex: number;
  direction: 'left-to-right' | 'right-to-left' | 'init' | 'done';
  action: 'init' | 'inc_right' | 'keep_right' | 'inc_left' | 'keep_left' | 'done';
  message: string;
  codeLine: number;
  metrics?: Record<string, string>;
  log?: string;
}

export function buildCandySteps(rawRatings: number[]): CandyStep[] {
  const steps: CandyStep[] = [];
  const n = rawRatings.length;

  if (n === 0) {
    steps.push({
      ratings: [],
      candies: [],
      currentIndex: -1,
      direction: 'done',
      action: 'done',
      message: '输入为空，最少糖果数为 0',
      codeLine: 2,
    });
    return steps;
  }

  const candies = new Array(n).fill(1);

  steps.push({
    ratings: [...rawRatings],
    candies: [...candies],
    currentIndex: -1,
    direction: 'init',
    action: 'init',
    message: `第 1 步：初始化全部 ${n} 个孩子糖果数为 1 (每人至少 1 颗)`,
    codeLine: 3,
  });

  // 1. 从左向右遍历（右孩子评分 > 左孩子评分）
  for (let i = 1; i < n; i++) {
    const prev = rawRatings[i - 1];
    const cur = rawRatings[i];

    if (cur > prev) {
      candies[i] = candies[i - 1] + 1;
      steps.push({
        ratings: [...rawRatings],
        candies: [...candies],
        currentIndex: i,
        direction: 'left-to-right',
        action: 'inc_right',
        message: `📈 [左 &rarr; 右] 孩子 [${i}] 评分 ${cur} > 左边 [${i - 1}] 评分 ${prev}，糖果递增为 ${candies[i]} (= ${candies[i - 1]} + 1)`,
        codeLine: 7,
      });
    } else {
      steps.push({
        ratings: [...rawRatings],
        candies: [...candies],
        currentIndex: i,
        direction: 'left-to-right',
        action: 'keep_right',
        message: `⏩ [左 &rarr; 右] 孩子 [${i}] 评分 ${cur} &le; 左边 ${prev}，保持糖果数 ${candies[i]}`,
        codeLine: 6,
      });
    }
  }

  // 2. 从右向左遍历（左孩子评分 > 右孩子评分，取 max）
  for (let i = n - 2; i >= 0; i--) {
    const cur = rawRatings[i];
    const next = rawRatings[i + 1];

    if (cur > next) {
      const oldVal = candies[i];
      candies[i] = Math.max(candies[i], candies[i + 1] + 1);

      steps.push({
        ratings: [...rawRatings],
        candies: [...candies],
        currentIndex: i,
        direction: 'right-to-left',
        action: candies[i] > oldVal ? 'inc_left' : 'keep_left',
        message: `📉 [右 &rarr; 左] 孩子 [${i}] 评分 ${cur} > 右边 [${i + 1}] 评分 ${next}，糖果取 max(${oldVal}, ${candies[i + 1] + 1}) = ${candies[i]}`,
        codeLine: 13,
      });
    } else {
      steps.push({
        ratings: [...rawRatings],
        candies: [...candies],
        currentIndex: i,
        direction: 'right-to-left',
        action: 'keep_left',
        message: `⏩ [右 &rarr; 左] 孩子 [${i}] 评分 ${cur} &le; 右边 ${next}，保持糖果数 ${candies[i]}`,
        codeLine: 12,
      });
    }
  }

  const total = candies.reduce((acc, v) => acc + v, 0);

  steps.push({
    ratings: [...rawRatings],
    candies: [...candies],
    currentIndex: -1,
    direction: 'done',
    action: 'done',
    message: `🎉 分发完成！双向贪心满足所有相邻约束，所需最少糖果总数为 ${total} 颗：[${candies.join(', ')}]`,
    codeLine: 17,
  });

  return steps;
}


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: CandyStep[]): CandyStep[] {
  return steps.map((s) => {
    const total = s.candies.reduce((acc, v) => acc + v, 0);
    const idx = s.currentIndex;
    const isIncR = s.action === 'inc_right';
    const isIncL = s.action === 'inc_left';

    let action = '⏩ 评分不高于相邻 (保持)';
    if (isIncR) action = '📈 右孩子评分高 (+1 奖励)';
    else if (isIncL) action = '📉 左孩子评分高 (取 max 奖励)';
    else if (s.action === 'done') action = '✓ 完成';

    const phaseText =
      s.direction === 'left-to-right' ? '➡️ 从左到右 (右 > 左 递增)'
      : s.direction === 'right-to-left' ? '⬅️ 从右到左 (左 > 右 取 max)'
      : s.direction === 'done' ? '✓ 完成' : '初始化';

    return {
      ...s,
      log: s.message,
      metrics: {
        phase: phaseText,
        'cur-child': idx >= 0 ? `[${idx}] (评分: ${s.ratings[idx]}, ${s.candies[idx]} 颗)` : '—',
        total: `${total} 颗`,
        candies: `[${s.candies.join(', ')}]`,
        action,
      },
    };
  });
}

/** 主视觉：评分与糖果堆叠沙盘 */
export function renderCandyCanvas(container: HTMLElement, step: CandyStep): void {
  const ratings = step.ratings;
  const candies = step.candies;
  const n = ratings.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';

  const childrenHtml = ratings
    .map((r, idx) => {
      const c = candies[idx] ?? 1;
      const isCurrent = idx === curIdx && !isDone;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#fef2f2';
        borderColor = '#ef4444';
        textColor = '#dc2626';
      }

      const candyDots = Array.from({ length: Math.min(c, 6) })
        .map(() => `<span style="font-size: 10px;">🍬</span>`)
        .join('');

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 9px; color: ${isCurrent ? '#ef4444' : '#94a3b8'}; font-weight: 700;">
            ${isCurrent ? '📍 当前' : `[${idx}]`}
          </span>
          <div style="width: 52px; min-height: 58px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04); gap: 2px;">
            <span style="font-size: 10px; color: #64748b;">评分: ${r}</span>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1px; max-width: 44px;">
              ${candyDots}
            </div>
            <span style="font-size: 11px; color: #ef4444; font-weight: 800;">${c} 颗</span>
          </div>
        </div>
      `;
    })
    .join('');

  const totalSoFar = candies.reduce((acc, v) => acc + v, 0);

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>遍历阶段: <strong style="color: #ef4444;">${step.direction === 'left-to-right' ? '➡️ 从左到右 (右 > 左 递增)' : step.direction === 'right-to-left' ? '⬅️ 从右到左 (左 > 右 取 max)' : step.direction === 'done' ? '✓ 完成' : '初始化'}</strong></span>
        <span>当前糖果总数: <strong style="color: #ef4444; font-family: monospace; font-size: 12.5px;">${totalSoFar} 颗</strong></span>
      </div>

      <div style="display: flex; gap: 8px; overflow-x: auto; justify-content: center; padding: 4px 0;">
        ${childrenHtml}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'candy',
  name: '分发糖果',
  category: 'greedy',
  description: '双向两次贪心遍历，左向右递增与右向左取 max 结合，求最少糖果数',
  icon: '🍬',
  difficulty: 3,
  levelOrder: 13,
  learningGoal: '掌握双向两次贪心解题范式，学会将双边相邻约束拆解为单向独立推导',
  inputs: [
    {
      id: 'ratings',
      label: '孩子评分数组',
      type: 'text',
      defaultValue: '1,2,87,87,87,2,1',
      placeholder: '逗号分隔评分',
    },
  ],
  presets: [
    { label: '示例 1', values: { ratings: '1,0,2' } },
    { label: '示例 2', values: { ratings: '1,2,2' } },
    { label: '波峰分配', values: { ratings: '1,3,4,5,2' } },
    { label: '平台波谷', values: { ratings: '1,2,87,87,87,2,1' } },
  ],
  metrics: [
    { id: 'phase', label: '遍历阶段', color: '#ef4444' },
    { id: 'cur-child', label: '当前孩子', color: '#ef4444' },
    { id: 'total', label: '最少糖果总数', color: '#ef4444' },
    { id: 'candies', label: '分配方案', color: '#059669' },
    { id: 'action', label: '贪心判定', color: '#2563eb' },
  ],
  legend: [
    { label: '📍 当前考察孩子', color: '#ef4444' },
    { label: '🍬 已分配糖果', color: '#f472b6' },
  ],
  codeLanguages: CANDY_CODE_LANGUAGES,
  problemHtml: CANDY_PROBLEM_HTML,
  analysisHtml: CANDY_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawRatings = String(inputs.ratings ?? '1,2,87,87,87,2,1')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return withMetrics(buildCandySteps(rawRatings.length ? rawRatings : [1, 2, 87, 87, 87, 2, 1]));
  },
  renderCanvas: (container, step) => renderCandyCanvas(container, step as CandyStep),
});
