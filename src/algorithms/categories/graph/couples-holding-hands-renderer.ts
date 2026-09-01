/**
 * 情侣牵手并查集置换环 (Couples Holding Hands - LeetCode 765 / 左程云 Class 067 题目1) 声明式可视化器
 * 核心：情侣对编号 row[i]/2 与 row[i+1]/2、并查集连通块/置换环、最少交换次数 N - 连通分量数
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  COUPLES_HOLDING_HANDS_CODE_LANGUAGES,
  COUPLES_HOLDING_HANDS_PROBLEM_HTML,
  COUPLES_HOLDING_HANDS_ANALYSIS_HTML,
} from './couples-holding-hands-problem-content';

export interface CouplesStep {
  row: number[];
  couplesPairs: Array<[number, number]>;
  disjointSetCount: number;
  minSwaps: number;
  status: 'init' | 'union' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildCouplesSteps(): CouplesStep[] {
  const steps: CouplesStep[] = [];

  steps.push({
    row: [0, 2, 1, 3],
    couplesPairs: [
      [0, 1],
      [0, 1],
    ],
    disjointSetCount: 2,
    minSwaps: 0,
    status: 'init',
    message: '1. [情侣组对分析] 位置 (0, 2) 分属情侣组 0 与 1；位置 (1, 3) 亦分属情侣组 0 与 1。',
    log: '分析情侣组：Pair(0, 2) ➔ Group(0, 1), Pair(1, 3) ➔ Group(0, 1)',
    codeLine: [15, 22],
  });

  steps.push({
    row: [0, 2, 1, 3],
    couplesPairs: [
      [0, 1],
      [0, 1],
    ],
    disjointSetCount: 1,
    minSwaps: 1,
    status: 'union',
    message: '2. [并查集合并错误相邻情侣] 合并情侣组 0 与 1，2 对情侣缩入同一个大小为 2 的置换环！',
    log: '并查集合并：Group 0 与 Group 1 连通，形成大小为 2 的置换环',
    codeLine: [24, 32],
  });

  steps.push({
    row: [0, 1, 2, 3],
    couplesPairs: [
      [0, 0],
      [1, 1],
    ],
    disjointSetCount: 2,
    minSwaps: 1,
    status: 'done',
    message: '🎉 [最少交换次数确定] 交换 1 次 (2 与 1) 即可让全员牵手！最少交换次数 = 情侣对数(2) - 并查集连通分量数(1) = 1！',
    log: '✓ 判定完成：最少交换次数 = N - 连通块数 = 2 - 1 = 1',
    codeLine: [35, 42],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<CouplesStep>({
  id: 'couples-holding-hands',
  name: '情侣牵手置换环 (Couples Holding Hands)',
  category: 'graph',
  icon: '👫',
  badge: {
    mode: '并查集置换环 N - 连通块',
    complexity: 'O(N) · O(N)',
  },
  card1Title: '👫 沙发座位与情侣组置换环沙盘',
  card2Title: '🧭 连通分量数与最少交换次数监视器',
  card2Desc: '情侣组映射 row[i]/2、置换环合并与最小交换公式',
  legend: [
    { label: '情侣组 0 (编号 0, 1)', color: '#0284c7' },
    { label: '情侣组 1 (编号 2, 3)', color: '#ec4899' },
    { label: '🟢 牵手成功匹配对', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '4 人 2 对经典错位用例 (LeetCode 765)', values: {} },
  ],
  metrics: [
    { id: 'metric-disjoint-sets', label: '并查集连通块数', color: '#2563eb' },
    { id: 'metric-min-swaps', label: '最少交换次数', color: '#10b981' },
  ],
  codeLanguages: COUPLES_HOLDING_HANDS_CODE_LANGUAGES,
  problemHtml: COUPLES_HOLDING_HANDS_PROBLEM_HTML,
  analysisHtml: COUPLES_HOLDING_HANDS_ANALYSIS_HTML,
  buildSteps: () => buildCouplesSteps(),
  renderCanvas: (container, step) => {
    const seats = step.row
      .map((personId, idx) => {
        const groupId = Math.floor(personId / 2);
        const bg = groupId === 0 ? '#0284c7' : '#db2777';
        const border = groupId === 0 ? '#38bdf8' : '#f472b6';

        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <div style="width: 45px; height: 45px; background: ${bg}; border: 2px solid ${border}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; font-family: monospace;">
              <span style="font-size: 14px; font-weight: 800;">${personId}</span>
              <span style="font-size: 8.5px; opacity: 0.8;">G${groupId}</span>
            </div>
            <span style="font-size: 10px; color: #94a3b8;">座${idx}</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
          ${seats}
        </div>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          相邻两个座位 (0-1, 2-3) 应当坐同一情侣组 | 大小为 $k$ 的置换环需要 $k - 1$ 次交换
        </div>
      </div>
    `;

    const root = container.closest('#algo-couples-holding-hands-view');
    if (root) {
      const dEl = root.querySelector('#metric-disjoint-sets');
      const sEl = root.querySelector('#metric-min-swaps');

      if (dEl) dEl.textContent = `${step.disjointSetCount} 块`;
      if (sEl) sEl.textContent = `${step.minSwaps} 次`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 置换环最少交换主定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">最少交换次数 = N (情侣对数) - 并查集连通分量个数</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'couples-holding-hands',
  name: '情侣牵手置换环 (Couples Holding Hands)',
  viewId: 'algo-couples-holding-hands-view',
  category: 'graph',
  description: '左程云算法通关课 Class 067 题目1：情侣组映射、错位邻居建边形成置换环、并查集 O(N) 求解最少交换次数 (LeetCode 765)',
  icon: '👫',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 29,
  learningGoal: '掌握置换群与置换环的图论抽象、并查集连通块与最少交换次数数学等价证明',
});

export { Visualizer as CouplesHoldingHandsVisualizer };
