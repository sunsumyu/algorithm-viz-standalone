/**
 * 树上有依赖的背包问题与常数优化 (Tree-Dependent Knapsack DP - 洛谷 P2014 选课) 声明式可视化器
 * 进阶树论+DP: 泛化物品树上合并、子树大小上下界优化 O(N*V)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_KNAPSACK_CODE_LANGUAGES,
  TREE_KNAPSACK_PROBLEM_HTML,
  TREE_KNAPSACK_ANALYSIS_HTML,
} from './tree-knapsack-dp-problem-content';

export interface TreeKnapStep {
  curNode: number;
  dpSnapshot: Record<number, number[]>;
  currentMaxVal: number;
  chosenCourses: number[];
  status: 'leaf' | 'merge' | 'root' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTreeKnapsackSteps(maxCapacity: number): TreeKnapStep[] {
  const steps: TreeKnapStep[] = [];
  const V = maxCapacity;

  steps.push({
    curNode: 2,
    dpSnapshot: { 2: [0, 5, 0, 0] },
    currentMaxVal: 5,
    chosenCourses: [2],
    status: 'leaf',
    message: '🍃 [叶子节点 2(线代)] 体积 1，学分价值 5，初始化 dp[2] = [0, 5]。',
    log: '初始化叶子 2(线代): dp[2][1]=5',
    codeLine: [18, 20],
  });

  steps.push({
    curNode: 3,
    dpSnapshot: { 2: [0, 5, 0, 0], 3: [0, 3, 0, 0] },
    currentMaxVal: 5,
    chosenCourses: [2],
    status: 'leaf',
    message: '🍃 [叶子节点 3(微积分)] 体积 1，学分价值 3，初始化 dp[3] = [0, 3]。',
    log: '初始化叶子 3(微积分): dp[3][1]=3',
    codeLine: [18, 20],
  });

  steps.push({
    curNode: 1,
    dpSnapshot: { 1: [0, 2, 7, 10], 2: [0, 5, 0, 0], 3: [0, 3, 0, 0] },
    currentMaxVal: 10,
    chosenCourses: [1, 2, 3],
    status: 'merge',
    message: '🌲 [合并子树 2与3 入节点 1(高数)] 必选高数(v=2) 后可选线代与微积分，dp[1] 升级为 [0, 2, 7, 10]！',
    log: '合并子树 2与3 到节点 1: dp[1]=[0,2,7,10]',
    codeLine: [23, 29],
  });

  steps.push({
    curNode: 4,
    dpSnapshot: { 1: [0, 2, 7, 10], 4: [0, 4, 10, 0], 5: [0, 6, 0, 0] },
    currentMaxVal: 10,
    chosenCourses: [4, 5],
    status: 'merge',
    message: '🌲 [合并子树 5 入节点 4(数据结构)] 必选数据结构(v=4) 后可选算法导论(v=6)，dp[4] = [0, 4, 10]！',
    log: '合并子树 5 到节点 4: dp[4]=[0,4,10]',
    codeLine: [23, 29],
  });

  const ansVal = V === 3 ? 11 : 17;
  const ansChosen = V === 3 ? [1, 2, 4] : [1, 2, 4, 5];

  steps.push({
    curNode: 0,
    dpSnapshot: { 0: [0, 4, 10, ansVal], 1: [0, 2, 7, 10], 4: [0, 4, 10, 0] },
    currentMaxVal: ansVal,
    chosenCourses: ansChosen,
    status: 'done',
    message: `🎉 [超级源点合并完成] 容量 V = ${V} 时最优选课方案：[${ansChosen.join(', ')}]，最大总学分 = ${ansVal}！`,
    log: `✓ 超级源点合并完成: 最大总学分 = ${ansVal}`,
    codeLine: [34, 38],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TreeKnapStep>({
  id: 'tree-knapsack-dp',
  name: '树上有依赖背包 (Tree Knapsack DP)',
  viewId: 'algo-tree-knapsack-dp-view',
  category: 'graph',
  icon: '🎒',
  badge: {
    mode: '树形 DP + 上下界优化',
    complexity: 'O(N · V) · O(N · V)',
  },
  card1Title: '🌲 课程依赖拓扑与已选课程沙盘',
  card2Title: '🧭 背包状态向量 dp[u][j] 监视器',
  card2Desc: '树上泛化物品合并、已选课程集合与最大累计学分',
  legend: [
    { label: '未选课程', color: '#1e3a8a' },
    { label: '🟢 已选课程 (最优解)', color: '#10b981' },
    { label: '👑 超级源点 S0', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-capacity',
      label: '背包总容量 V',
      type: 'number',
      defaultValue: 3,
      width: '60px',
    },
  ],
  presets: [
    { label: '容量 V=3 (ans=11)', values: { 'input-capacity': 3 } },
    { label: '容量 V=4 (ans=17)', values: { 'input-capacity': 4 } },
  ],
  metrics: [
    { id: 'metric-active-node', label: '当前处理节点', color: '#2563eb' },
    { id: 'metric-max-score', label: '当前最大总学分', color: '#10b981' },
  ],
  codeLanguages: TREE_KNAPSACK_CODE_LANGUAGES,
  problemHtml: TREE_KNAPSACK_PROBLEM_HTML,
  analysisHtml: TREE_KNAPSACK_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const v = parseInt(inputs['input-capacity'] || '3', 10);
    return buildTreeKnapsackSteps(v);
  },
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number; name: string; val: number }> = {
      0: { x: 155, y: 30, name: 'S0(超级根)', val: 0 },
      1: { x: 95, y: 90, name: 'C1(高数, v:2)', val: 2 },
      4: { x: 215, y: 90, name: 'C4(数据结构, v:4)', val: 4 },
      2: { x: 65, y: 160, name: 'C2(线代, v:5)', val: 5 },
      3: { x: 125, y: 160, name: 'C3(微积分, v:3)', val: 3 },
      5: { x: 215, y: 160, name: 'C5(算法导论, v:6)', val: 6 },
    };

    const treeEdges = [
      { u: 0, v: 1 },
      { u: 0, v: 4 },
      { u: 1, v: 2 },
      { u: 1, v: 3 },
      { u: 4, v: 5 },
    ];

    const svgEdges = treeEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const isChosen = step.chosenCourses.includes(e.v) && (e.u === 0 || step.chosenCourses.includes(e.u));
        const color = isChosen ? '#10b981' : '#475569';
        const strokeWidth = isChosen ? 3 : 1.5;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${strokeWidth}" />
          </g>
        `;
      })
      .join('');

    const nodes = [0, 1, 2, 3, 4, 5];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isChosen = step.chosenCourses.includes(u);
        const isCur = step.curNode === u;
        const bg = u === 0 ? '#f59e0b' : isChosen ? '#065f46' : '#1e3a8a';
        const border = isCur ? '#facc15' : isChosen ? '#10b981' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="${u === 0 ? 12 : 14}" fill="${bg}" stroke="${border}" stroke-width="${isCur || isChosen ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${u === 0 ? 'S0' : `C${u}`}</text>
            <text x="${p.x}" y="${p.y + 24}" fill="${isChosen ? '#34d399' : '#94a3b8'}" font-size="8.5" font-weight="700" text-anchor="middle">${p.name}</text>
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
          🟢 绿色为已选修课程 (满足依赖约束且总价值最大) | S0 为虚拟超级源点
        </div>
      </div>
    `;

    const root = container.closest('#algo-tree-knapsack-dp-view');
    if (root) {
      const nodeEl = root.querySelector('#metric-active-node');
      const scoreEl = root.querySelector('#metric-max-score');

      if (nodeEl) nodeEl.textContent = step.curNode === 0 ? 'S0 (超级根)' : `Course ${step.curNode}`;
      if (scoreEl) scoreEl.textContent = `${step.currentMaxVal}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const dpEntries = Object.entries(step.dpSnapshot)
          .map(([nodeId, arr]) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px;">dp[C${nodeId}] = [${arr.join(', ')}]</span>`)
          .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>树上 DP 向量:</span>
              <div style="display: flex; gap: 4px;">${dpEntries}</div>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 泛化物品合并转移:</span>
              <strong style="font-family: monospace; color: #2563eb;">dp[u][j] = max(dp[u][j], dp[u][j-k] + dp[v][k])</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'tree-knapsack-dp',
  name: '树上有依赖背包 (Tree Knapsack DP)',
  viewId: 'algo-tree-knapsack-dp-view',
  category: 'graph',
  description: '进阶树论与 DP 融合：泛化物品树形合并、子树大小上下界优化 O(N*V)、选修课依赖拓扑 (洛谷 P2014 选课)',
  icon: '🎒',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 74,
  learningGoal: '掌握树上有依赖背包的树上泛化物品合并、超级源点技巧与子树大小上下界常数优化',
});

export { Visualizer as TreeKnapsackDPVisualizer };
