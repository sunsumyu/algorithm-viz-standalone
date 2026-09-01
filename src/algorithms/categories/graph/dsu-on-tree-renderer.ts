/**
 * 树上启发式合并 (DSU on Tree) 声明式可视化器
 * 进阶树论: 树链剖分重儿子保留、轻儿子子树清除、O(N log N) 极速统计 (CF600E / 洛谷 P4149)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  DSU_ON_TREE_CODE_LANGUAGES,
  DSU_ON_TREE_PROBLEM_HTML,
  DSU_ON_TREE_ANALYSIS_HTML,
} from './dsu-on-tree-problem-content';

export interface DSUTreeStep {
  curNode: number;
  isHeavy: boolean;
  preservedData: Record<number, number>;
  activeSubtree: number[];
  status: 'light' | 'heavy' | 'merge' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildDSUOnTreeSteps(): DSUTreeStep[] {
  const steps: DSUTreeStep[] = [];

  steps.push({
    curNode: 2,
    isHeavy: false,
    preservedData: { 2: 1 },
    activeSubtree: [2],
    status: 'light',
    message: '1. [轻儿子遍历与清空] 节点 2 为轻儿子，统计完子树信息后清除全局频次数组，避免对兄弟子树造成污染。',
    log: '轻儿子 2 遍历后清除数据',
    codeLine: [18, 24],
  });

  steps.push({
    curNode: 3,
    isHeavy: true,
    preservedData: { 3: 1, 4: 1 },
    activeSubtree: [3, 4],
    status: 'heavy',
    message: '2. [重儿子遍历与保留] 节点 3 为重儿子，统计完后【不清除】全局数据，直接保留给父节点 1 复用！',
    log: '重儿子 3 遍历并保留数据 (keep=true)',
    codeLine: [26, 32],
  });

  steps.push({
    curNode: 1,
    isHeavy: false,
    preservedData: { 1: 1, 2: 1, 3: 1, 4: 1 },
    activeSubtree: [1, 2, 3, 4],
    status: 'done',
    message: '🎉 [根节点合并完成] 仅需重新暴力扫描轻子树 2，与已保留的重儿子数据合并！每个节点仅被扫描 $O(\\log N)$ 次！',
    log: '✓ 根节点 1 合并完成：严格 O(N log N) 复杂度',
    codeLine: [34, 40],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<DSUTreeStep>({
  id: 'dsu-on-tree',
  name: '树上启发式合并 (DSU on Tree)',
  viewId: 'algo-dsu-on-tree-view',
  category: 'graph',
  icon: '🌳',
  badge: {
    mode: '重链剖分 + 数据保留',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '🌳 树形拓扑与轻重子树划分沙盘',
  card2Title: '🧭 频次数组保留状态监视器',
  card2Desc: '轻儿子递归后清除、重儿子递归后保留与全局复杂度 O(N log N)',
  legend: [
    { label: '轻儿子 / 轻边', color: '#64748b' },
    { label: '👑 重儿子 (Heavy Son)', color: '#f59e0b' },
    { label: '🟢 当前活跃子树', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '经典 4 节点重链划分', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-node', label: '当前处理子树', color: '#2563eb' },
    { id: 'metric-keep-status', label: '数据保留模式', color: '#10b981' },
  ],
  codeLanguages: DSU_ON_TREE_CODE_LANGUAGES,
  problemHtml: DSU_ON_TREE_PROBLEM_HTML,
  analysisHtml: DSU_ON_TREE_ANALYSIS_HTML,
  buildSteps: () => buildDSUOnTreeSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 35 },
      2: { x: 80, y: 110 },
      3: { x: 230, y: 110 },
      4: { x: 230, y: 175 },
    };

    const treeEdges = [
      { u: 1, v: 2, isHeavy: false },
      { u: 1, v: 3, isHeavy: true },
      { u: 3, v: 4, isHeavy: true },
    ];

    const svgEdges = treeEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const color = e.isHeavy ? '#f59e0b' : '#475569';
        const width = e.isHeavy ? 3 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isActive = step.activeSubtree.includes(u);
        const isCur = step.curNode === u;
        const bg = isCur ? '#f59e0b' : isActive ? '#065f46' : '#1e293b';
        const border = isCur ? '#facc15' : isActive ? '#10b981' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isCur || isActive ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟡 金色粗边为重儿子链 | 重儿子递归参数 keep=true，状态不被清空直接继承
        </div>
      </div>
    `;

    const root = container.closest('#algo-dsu-on-tree-view');
    if (root) {
      const nodeEl = root.querySelector('#metric-cur-node');
      const keepEl = root.querySelector('#metric-keep-status');

      if (nodeEl) nodeEl.textContent = `Node ${step.curNode}`;
      if (keepEl) {
        keepEl.textContent = step.isHeavy ? 'keep=true (保留数据)' : 'keep=false (清空数据)';
        keepEl.style.color = step.isHeavy ? '#10b981' : '#f59e0b';
      }

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const preservedItems = Object.entries(step.preservedData)
          .map(([u, cnt]) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px;">N${u}: ${cnt}</span>`)
          .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>全局计数器 cnt:</span>
              <div style="display: flex; gap: 4px;">${preservedItems}</div>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 DSU on Tree 核心定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">每个点只在其到根的轻边上被重新扫描，总复杂度 O(N log N)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'dsu-on-tree',
  name: '树上启发式合并 (DSU on Tree)',
  viewId: 'algo-dsu-on-tree-view',
  category: 'graph',
  description: '进阶树论经典启发式合并：树链剖分重儿子保留、轻儿子子树清除、严格 O(N log N) (CF600E / 洛谷 P4149)',
  icon: '🌳',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 63,
  learningGoal: '掌握 DSU on Tree 消除轻重子树数据冲突的递归保留策略及 O(N log N) 复杂度证明',
});

export { Visualizer as DSUOnTreeVisualizer };
