/**
 * 树上众数求和 (Tree Dominant Color - CF600E) 声明式可视化器
 * 进阶树论启发式合并: DSU on Tree 动态维护最值与频次和、轻重儿子判定
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_DOMINANT_CODE_LANGUAGES,
  TREE_DOMINANT_PROBLEM_HTML,
  TREE_DOMINANT_ANALYSIS_HTML,
} from './tree-dominant-color-problem-content';

export interface TreeDominantStep {
  curNode: number;
  nodeColors: Record<number, number>;
  heavySon: Record<number, number>;
  colorCount: Record<number, number>;
  maxFreq: number;
  sumColors: number;
  ans: Record<number, number>;
  status: 'heavy' | 'light' | 'update' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTreeDominantColorSteps(): TreeDominantStep[] {
  const steps: TreeDominantStep[] = [];

  const colors = { 1: 1, 2: 2, 3: 1, 4: 1, 5: 3 };
  const heavy = { 1: 3, 2: 4, 3: 0, 4: 0, 5: 0 };

  steps.push({
    curNode: 3,
    nodeColors: colors,
    heavySon: heavy,
    colorCount: { 1: 1, 2: 0, 3: 0 },
    maxFreq: 1,
    sumColors: 1,
    ans: { 3: 1 },
    status: 'heavy',
    message: '🍃 [叶子轻节点 3(颜色 1)] 统计频次 cnt[1]=1，maxFreq=1，众数编号和 sum=1，ans[3]=1。',
    log: '访问叶子 3: color=1, ans[3]=1',
    codeLine: [18, 22],
  });

  steps.push({
    curNode: 4,
    nodeColors: colors,
    heavySon: heavy,
    colorCount: { 1: 1, 2: 0, 3: 0 },
    maxFreq: 1,
    sumColors: 1,
    ans: { 3: 1, 4: 1 },
    status: 'heavy',
    message: '🍃 [叶子节点 4(颜色 1)] 统计频次 cnt[1]=1，ans[4]=1。',
    log: '访问叶子 4: color=1, ans[4]=1',
    codeLine: [18, 22],
  });

  steps.push({
    curNode: 2,
    nodeColors: colors,
    heavySon: heavy,
    colorCount: { 1: 1, 2: 1, 3: 0 },
    maxFreq: 1,
    sumColors: 3,
    ans: { 3: 1, 4: 1, 2: 3 },
    status: 'update',
    message: '🌲 [子树 2 启发式合并] 重儿子 4 保留频次，加入节点 2(颜色 2)，cnt[1]=1, cnt[2]=1，最高频次均为 1，众数和 sum = 1 + 2 = 3，ans[2]=3！',
    log: 'DSU on Tree 合并节点 2: maxFreq=1, ans[2]=3',
    codeLine: [25, 33],
  });

  steps.push({
    curNode: 1,
    nodeColors: colors,
    heavySon: heavy,
    colorCount: { 1: 3, 2: 1, 3: 1 },
    maxFreq: 3,
    sumColors: 1,
    ans: { 1: 1, 2: 3, 3: 1, 4: 1, 5: 3 },
    status: 'done',
    message: '🎉 [根节点 1 全局合并] 遍历全树，颜色 1 出现 3 次成为唯一绝对众数 (maxFreq=3)，ans[1]=1！',
    log: '✓ 根节点 1 统计完成: maxFreq=3, ans[1]=1',
    codeLine: [35, 40],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TreeDominantStep>({
  id: 'tree-dominant-color',
  name: '树上众数求和 (Tree Dominant Color)',
  viewId: 'algo-tree-dominant-color-view',
  category: 'graph',
  icon: '👑',
  badge: {
    mode: 'DSU on Tree 启发式合并',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '🌲 树形拓扑与轻重链划分沙盘',
  card2Title: '🧭 频次统计 cnt[c] 与众数和监视器',
  card2Desc: '各颜色频次统计、当前最高频次 maxFreq 与众数编号累计和',
  legend: [
    { label: '轻儿子/普通边', color: '#64748b' },
    { label: '👑 重儿子 (Heavy Son)', color: '#f59e0b' },
    { label: '当前处理子树根', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: 'CF600E 经典 5 节点树', values: {} },
  ],
  metrics: [
    { id: 'metric-max-freq', label: '最高频次 maxFreq', color: '#2563eb' },
    { id: 'metric-sum-colors', label: '众数编号和 sum', color: '#10b981' },
    { id: 'metric-cur-root', label: '当前子树根', color: '#f59e0b' },
  ],
  codeLanguages: TREE_DOMINANT_CODE_LANGUAGES,
  problemHtml: TREE_DOMINANT_PROBLEM_HTML,
  analysisHtml: TREE_DOMINANT_ANALYSIS_HTML,
  buildSteps: () => buildTreeDominantColorSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 35 },
      2: { x: 95, y: 100 },
      3: { x: 215, y: 100 },
      4: { x: 70, y: 165 },
      5: { x: 120, y: 165 },
    };

    const treeEdges = [
      { u: 1, v: 2, isHeavy: false },
      { u: 1, v: 3, isHeavy: true },
      { u: 2, v: 4, isHeavy: true },
      { u: 2, v: 5, isHeavy: false },
    ];

    const svgEdges = treeEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const color = e.isHeavy ? '#f59e0b' : '#475569';
        const width = e.isHeavy ? 3 : 1.5;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />
          </g>
        `;
      })
      .join('');

    const nodes = [1, 2, 3, 4, 5];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCur = step.curNode === u;
        const colorVal = step.nodeColors[u];
        const ansVal = step.ans[u] !== undefined ? `ans:${step.ans[u]}` : '';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${isCur ? '#065f46' : '#1e3a8a'}" stroke="${isCur ? '#10b981' : '#38bdf8'}" stroke-width="${isCur ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}(c${colorVal})</text>
            <text x="${p.x}" y="${p.y + 25}" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">${ansVal}</text>
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
          🟡 金色边为重边 (保留子树状态不清除) | 节点标注 编号(颜色c) 与 众数求和结果 ans
        </div>
      </div>
    `;

    const root = container.closest('#algo-tree-dominant-color-view');
    if (root) {
      const maxEl = root.querySelector('#metric-max-freq');
      const sumEl = root.querySelector('#metric-sum-colors');
      const curEl = root.querySelector('#metric-cur-root');

      if (maxEl) maxEl.textContent = `${step.maxFreq}`;
      if (sumEl) sumEl.textContent = `${step.sumColors}`;
      if (curEl) curEl.textContent = `Node ${step.curNode}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const cntItems = Object.entries(step.colorCount)
          .map(([c, count]) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10.5px;">颜色${c}: <strong style="color: #2563eb;">${count}次</strong></span>`)
          .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>频次表 cnt[color]:</span>
              <div style="display: flex; gap: 4px;">${cntItems}</div>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 DSU on Tree 动态维护:</span>
              <strong style="font-family: monospace; color: #2563eb;">if (cnt[c] > maxFreq) { maxFreq = cnt[c]; sum = c; }</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'tree-dominant-color',
  name: '树上众数求和 (Tree Dominant Color)',
  viewId: 'algo-tree-dominant-color-view',
  category: 'graph',
  description: '进阶树论启发式合并：DSU on Tree 动态最值维护、子树众数频次单调更新与众数编号求和 (CF600E Lomsat gelral)',
  icon: '👑',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 70,
  learningGoal: '掌握 DSU on Tree 动态维护最值与属性和的 O(1) 转移技巧及树上启发式合并模板',
});

export { Visualizer as TreeDominantColorVisualizer };
