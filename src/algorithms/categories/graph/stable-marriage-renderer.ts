/**
 * 稳定婚姻匹配 (Stable Marriage - Gale-Shapley 算法) 声明式可视化器
 * 进阶匹配理论: 男士主动求婚、女士择优暂留、严格无不稳定阻碍对 (洛谷 P4867 / 诺贝尔经济学奖算法)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  STABLE_MARRIAGE_CODE_LANGUAGES,
  STABLE_MARRIAGE_PROBLEM_HTML,
  STABLE_MARRIAGE_ANALYSIS_HTML,
} from './stable-marriage-problem-content';

export interface MarriageStep {
  proposingMan: string;
  proposedWoman: string;
  currentEngagements: Record<string, string>;
  freeMen: string[];
  status: 'propose' | 'accept' | 'reject' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildStableMarriageSteps(): MarriageStep[] {
  const steps: MarriageStep[] = [];

  steps.push({
    proposingMan: 'M1',
    proposedWoman: 'W1',
    currentEngagements: { W1: 'M1' },
    freeMen: ['M2', 'M3'],
    status: 'accept',
    message: '1. [M1 向第一志愿 W1 求婚] W1 当前单身，欣然接受与 M1 订婚！',
    log: 'M1 向 W1 求婚成功 -> 订婚对 (M1, W1)',
    codeLine: [15, 22],
  });

  steps.push({
    proposingMan: 'M2',
    proposedWoman: 'W1',
    currentEngagements: { W1: 'M2' },
    freeMen: ['M1', 'M3'],
    status: 'accept',
    message: '2. [M2 向第一志愿 W1 求婚] 在 W1 的偏好列表中 M2 优于 M1，W1 放弃 M1 并与 M2 订婚！M1 恢复单身！',
    log: 'M2 求婚 W1: W1 更偏好 M2，替换 M1 -> 订婚对 (M2, W1)',
    codeLine: [24, 32],
  });

  steps.push({
    proposingMan: 'M1',
    proposedWoman: 'W2',
    currentEngagements: { W1: 'M2', W2: 'M1' },
    freeMen: ['M3'],
    status: 'accept',
    message: '3. [单身 M1 转向次选 W2 求婚] W2 当前单身，与 M1 订婚！',
    log: 'M1 向 W2 求婚成功 -> 订婚对 (M1, W2)',
    codeLine: [15, 22],
  });

  steps.push({
    proposingMan: 'M3',
    proposedWoman: 'W3',
    currentEngagements: { W1: 'M2', W2: 'M1', W3: 'M3' },
    freeMen: [],
    status: 'done',
    message: '🎉 [Gale-Shapley 全体稳定匹配达成] 所有男女均成功订婚，不存在任何互相更偏好彼此的不稳定对！',
    log: '✓ 稳定匹配达成：(M1, W2), (M2, W1), (M3, W3)',
    codeLine: [35, 40],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<MarriageStep>({
  id: 'stable-marriage',
  name: '稳定婚姻匹配 (Stable Marriage)',
  category: 'graph',
  icon: '💍',
  badge: {
    mode: 'Gale-Shapley 算法',
    complexity: 'O(N²) · O(N²)',
  },
  card1Title: '💍 偏好列表与求婚交错沙盘',
  card2Title: '🧭 订婚状态与单身队列监视器',
  card2Desc: '当前单身男士队列、女士当前未婚夫与无不稳定对判定',
  legend: [
    { label: '男士 (M1..M3)', color: '#0284c7' },
    { label: '女士 (W1..W3)', color: '#ec4899' },
    { label: '🟢 达成订婚连线', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '3 对男女经典偏好列表', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-prop', label: '当前求婚者', color: '#2563eb' },
    { id: 'metric-matched-pairs', label: '已订婚对数', color: '#10b981' },
  ],
  codeLanguages: STABLE_MARRIAGE_CODE_LANGUAGES,
  problemHtml: STABLE_MARRIAGE_PROBLEM_HTML,
  analysisHtml: STABLE_MARRIAGE_ANALYSIS_HTML,
  buildSteps: () => buildStableMarriageSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<string, { x: number; y: number }> = {
      M1: { x: 75, y: 55 },
      M2: { x: 75, y: 110 },
      M3: { x: 75, y: 165 },
      W1: { x: 235, y: 55 },
      W2: { x: 235, y: 110 },
      W3: { x: 235, y: 165 },
    };

    const svgEdges = Object.entries(step.currentEngagements)
      .map(([w, m]) => {
        const p1 = nodeCoords[m];
        const p2 = nodeCoords[w];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="2.5" />`;
      })
      .join('');

    const nodes = ['M1', 'M2', 'M3', 'W1', 'W2', 'W3'];
    const svgNodes = nodes
      .map((id) => {
        const p = nodeCoords[id];
        if (!p) return '';
        const isMan = id.startsWith('M');
        const isProp = step.proposingMan === id;
        const bg = isProp ? '#f59e0b' : isMan ? '#0284c7' : '#db2777';
        const border = isProp ? '#facc15' : isMan ? '#38bdf8' : '#f472b6';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isProp ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 210">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色连线为当前订婚对 | Gale-Shapley 算法保证在至多 $N^2$ 轮内达成强稳定匹配
        </div>
      </div>
    `;

    const root = container.closest('#algo-stable-marriage-view');
    if (root) {
      const pEl = root.querySelector('#metric-cur-prop');
      const mEl = root.querySelector('#metric-matched-pairs');

      if (pEl) pEl.textContent = `${step.proposingMan} ➔ ${step.proposedWoman}`;
      if (mEl) mEl.textContent = `${Object.keys(step.currentEngagements).length} / 3 对`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const pairsStr = Object.entries(step.currentEngagements)
          .map(([w, m]) => `(${m} ♥ ${w})`)
          .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>当前订婚名单:</span>
              <strong style="color: #10b981; font-family: monospace;">${pairsStr || '无'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 Gale-Shapley 定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">求婚方获得其所有稳定匹配中最优配偶（男士最优稳定匹配）</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'stable-marriage',
  name: '稳定婚姻匹配 (Stable Marriage)',
  viewId: 'algo-stable-marriage-view',
  category: 'graph',
  description: '博弈论与匹配经典：Gale-Shapley 算法、男士主动求婚机制、女士择优暂留与强稳定性证明 (洛谷 P4867 / 诺贝尔奖算法)',
  icon: '💍',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 49,
  learningGoal: '掌握稳定婚姻问题的数学形式化定义、GS 算法执行过程、终止性与稳定性严格证明',
});

export { Visualizer as StableMarriageVisualizer };
