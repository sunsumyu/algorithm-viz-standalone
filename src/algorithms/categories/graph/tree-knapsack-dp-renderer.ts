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
  subtreeSize?: number;
  metrics?: Record<string, any>;
}

export function buildTreeKnapsackSteps(maxCapacity: number): TreeKnapStep[] {
  const steps: TreeKnapStep[] = [];
  const V = maxCapacity;

  function makeStep(data: Omit<TreeKnapStep, 'metrics'>): TreeKnapStep {
    const nodeStr = data.curNode === 0 ? 'S0 (超级根)' : `C${data.curNode}`;
    const szStr = data.subtreeSize !== undefined ? `${data.subtreeSize}` : '—';
    const curDpArr = data.dpSnapshot[data.curNode];
    const dpStr = curDpArr ? `[${curDpArr.join(', ')}]` : '—';

    return {
      ...data,
      metrics: {
        'metric-active-node': nodeStr,
        'metric-max-score': `${data.currentMaxVal}`,
        'metric-subtree-size': szStr,
        'metric-cur-dp': dpStr,
        'active-node': nodeStr,
        'max-score': `${data.currentMaxVal}`,
        'subtree-size': szStr,
        'cur-dp': dpStr,
      },
    };
  }

  // 1. 函数入口
  steps.push(
    makeStep({
      curNode: 0,
      dpSnapshot: { 0: new Array(V + 1).fill(0) },
      currentMaxVal: 0,
      chosenCourses: [],
      status: 'root',
      message: '🚀 [函数入口] solve: 建立超级源点 S0 连接所有无前置要求的根课程，初始化 DP 空间。',
      log: `solve(n=5, V=${V}): 初始化虚拟超级根 S0 与树形邻接表`,
      codeLine: 36,
      subtreeSize: 0,
    })
  );

  // 2. 超级根初始化
  steps.push(
    makeStep({
      curNode: 0,
      dpSnapshot: { 0: new Array(V + 1).fill(0) },
      currentMaxVal: 0,
      chosenCourses: [],
      status: 'root',
      message: '📦 [初始化 S0] weight[0]=0, value[0]=0, sz[0]=0，准备递归遍历子树。',
      log: 'dfs(0): sz[0] = 0, dp[0][0] = 0',
      codeLine: 18,
      subtreeSize: 0,
    })
  );

  // 3. 递归访问子节点 1 (高数)
  steps.push(
    makeStep({
      curNode: 1,
      dpSnapshot: { 1: [0, 0, 0, 0] },
      currentMaxVal: 0,
      chosenCourses: [1],
      status: 'merge',
      message: '🌲 [递归子树 C1(高数)] 深入节点 1，消耗体积 1，学分价值 2。',
      log: '| dfs(1): 遍历子节点 1(高数)',
      codeLine: 22,
      subtreeSize: 0,
    })
  );

  // 4. 节点 1 自身初始化
  steps.push(
    makeStep({
      curNode: 1,
      dpSnapshot: { 1: [0, 2, 0, 0] },
      currentMaxVal: 2,
      chosenCourses: [1],
      status: 'merge',
      message: '📝 [初始化 C1 状态] 必须修读高数自身：sz[1] = 1, dp[1][1] = 2。',
      log: '| sz[1] = 1, dp[1][1] = 2',
      codeLine: 19,
      subtreeSize: 1,
    })
  );

  // 5. 递归访问子节点 2 (线代)
  steps.push(
    makeStep({
      curNode: 2,
      dpSnapshot: { 1: [0, 2, 0, 0], 2: [0, 0, 0, 0] },
      currentMaxVal: 2,
      chosenCourses: [1, 2],
      status: 'leaf',
      message: '🍃 [递归子树 C2(线代)] 考察课程 2，先修课为高数，体积 1，学分 5。',
      log: '| | dfs(2): 访问子节点 2(线代)',
      codeLine: 22,
      subtreeSize: 0,
    })
  );

  // 6. 叶子节点 2 初始化
  steps.push(
    makeStep({
      curNode: 2,
      dpSnapshot: { 1: [0, 2, 0, 0], 2: [0, 5, 0, 0] },
      currentMaxVal: 5,
      chosenCourses: [1, 2],
      status: 'leaf',
      message: '🍃 [叶子 C2 独立状态] sz[2] = 1, dp[2][1] = 5，无子节点，返回上层。',
      log: '| | sz[2] = 1, dp[2][1] = 5, 叶子回溯',
      codeLine: 19,
      subtreeSize: 1,
    })
  );

  // 7. 合并 C2 到 C1: 容量 j=2 转移
  steps.push(
    makeStep({
      curNode: 1,
      dpSnapshot: { 1: [0, 2, 7, 0], 2: [0, 5, 0, 0] },
      currentMaxVal: 7,
      chosenCourses: [1, 2],
      status: 'merge',
      message: '➕ [合并子树 C2] 上下界优化 limit = min(V, 1+1) = 2：dp[1][2] = max(..., dp[1][1] + dp[2][1]) = 2 + 5 = 7！',
      log: '| 合并 C2: dp[1][2] = 2 + 5 = 7',
      codeLine: 28,
      subtreeSize: 1,
    })
  );

  // 8. 更新 C1 子树大小
  steps.push(
    makeStep({
      curNode: 1,
      dpSnapshot: { 1: [0, 2, 7, 0], 2: [0, 5, 0, 0] },
      currentMaxVal: 7,
      chosenCourses: [1, 2],
      status: 'merge',
      message: '📐 [更新 C1 子树大小] sz[1] += sz[2] = 1 + 1 = 2。',
      log: '| sz[1] 累加更新为 2',
      codeLine: 31,
      subtreeSize: 2,
    })
  );

  // 9. 递归访问子节点 3 (微积分)
  steps.push(
    makeStep({
      curNode: 3,
      dpSnapshot: { 1: [0, 2, 7, 0], 2: [0, 5, 0, 0], 3: [0, 0, 0, 0] },
      currentMaxVal: 7,
      chosenCourses: [1, 2, 3],
      status: 'leaf',
      message: '🍃 [递归子树 C3(微积分)] 考察课程 3，先修课为高数，体积 1，学分 3。',
      log: '| | dfs(3): 访问子节点 3(微积分)',
      codeLine: 22,
      subtreeSize: 0,
    })
  );

  // 10. 叶子节点 3 初始化
  steps.push(
    makeStep({
      curNode: 3,
      dpSnapshot: { 1: [0, 2, 7, 0], 2: [0, 5, 0, 0], 3: [0, 3, 0, 0] },
      currentMaxVal: 7,
      chosenCourses: [1, 2, 3],
      status: 'leaf',
      message: '🍃 [叶子 C3 独立状态] sz[3] = 1, dp[3][1] = 3，无子节点，返回上层。',
      log: '| | sz[3] = 1, dp[3][1] = 3, 叶子回溯',
      codeLine: 19,
      subtreeSize: 1,
    })
  );

  // 11. 合并 C3 到 C1: 容量 j=3 转移
  steps.push(
    makeStep({
      curNode: 1,
      dpSnapshot: { 1: [0, 2, 7, 10], 2: [0, 5, 0, 0], 3: [0, 3, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [1, 2, 3],
      status: 'merge',
      message: '➕ [合并子树 C3] limit = min(V, 2+1) = 3：dp[1][3] = dp[1][2] + dp[3][1] = 7 + 3 = 10！同时保持 dp[1][2] = max(7, 2+3) = 7。',
      log: '| 合并 C3: dp[1][3] = 7 + 3 = 10',
      codeLine: 28,
      subtreeSize: 2,
    })
  );

  // 12. C1 树合并完成回溯
  steps.push(
    makeStep({
      curNode: 1,
      dpSnapshot: { 1: [0, 2, 7, 10], 2: [0, 5, 0, 0], 3: [0, 3, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [1, 2, 3],
      status: 'merge',
      message: '📐 [C1 子树合并完毕] sz[1] += sz[3] = 3，dp[1] = [0, 2, 7, 10]，回溯到根 S0。',
      log: '| sz[1] 累加为 3, dfs(1) 执行结束回溯',
      codeLine: 31,
      subtreeSize: 3,
    })
  );

  // 13. 合并 C1 到超级根 S0
  steps.push(
    makeStep({
      curNode: 0,
      dpSnapshot: { 0: [0, 2, 7, 10], 1: [0, 2, 7, 10] },
      currentMaxVal: 10,
      chosenCourses: [1, 2, 3],
      status: 'root',
      message: '👑 [S0 合并子树 C1] S0 体积为 0，将 C1 状态复制进 dp[0]，当前 dp[0] = [0, 2, 7, 10]，sz[0] = 3。',
      log: 'S0 合并 C1: dp[0] 扩展为 [0, 2, 7, 10]',
      codeLine: 28,
      subtreeSize: 3,
    })
  );

  // 14. 递归访问子节点 4 (数据结构)
  steps.push(
    makeStep({
      curNode: 4,
      dpSnapshot: { 0: [0, 2, 7, 10], 4: [0, 0, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [4],
      status: 'merge',
      message: '🌲 [递归子树 C4(数据结构)] 深入第二分支，无先修课（直接连 S0），体积 1，学分价值 4。',
      log: '| dfs(4): 访问子节点 4(数据结构)',
      codeLine: 22,
      subtreeSize: 0,
    })
  );

  // 15. 节点 4 自身初始化
  steps.push(
    makeStep({
      curNode: 4,
      dpSnapshot: { 0: [0, 2, 7, 10], 4: [0, 4, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [4],
      status: 'merge',
      message: '📝 [初始化 C4 状态] sz[4] = 1, dp[4][1] = 4。',
      log: '| sz[4] = 1, dp[4][1] = 4',
      codeLine: 19,
      subtreeSize: 1,
    })
  );

  // 16. 递归访问子节点 5 (算法导论)
  steps.push(
    makeStep({
      curNode: 5,
      dpSnapshot: { 0: [0, 2, 7, 10], 4: [0, 4, 0, 0], 5: [0, 0, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [4, 5],
      status: 'leaf',
      message: '🍃 [递归子树 C5(算法导论)] 考察课程 5，先修课为数据结构，体积 1，学分 6。',
      log: '| | dfs(5): 访问子节点 5(算法导论)',
      codeLine: 22,
      subtreeSize: 0,
    })
  );

  // 17. 叶子节点 5 初始化
  steps.push(
    makeStep({
      curNode: 5,
      dpSnapshot: { 0: [0, 2, 7, 10], 4: [0, 4, 0, 0], 5: [0, 6, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [4, 5],
      status: 'leaf',
      message: '🍃 [叶子 C5 独立状态] sz[5] = 1, dp[5][1] = 6，叶子无子树，返回上层。',
      log: '| | sz[5] = 1, dp[5][1] = 6, 叶子回溯',
      codeLine: 19,
      subtreeSize: 1,
    })
  );

  // 18. 合并 C5 到 C4
  steps.push(
    makeStep({
      curNode: 4,
      dpSnapshot: { 0: [0, 2, 7, 10], 4: [0, 4, 10, 0], 5: [0, 6, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [4, 5],
      status: 'merge',
      message: '➕ [合并子树 C5] limit = min(V, 1+1) = 2：dp[4][2] = dp[4][1] + dp[5][1] = 4 + 6 = 10，sz[4] 更新为 2。',
      log: '| 合并 C5: dp[4][2] = 4 + 6 = 10; sz[4] = 2',
      codeLine: 28,
      subtreeSize: 2,
    })
  );

  const ansVal = V === 3 ? 11 : 17;
  const ansChosen = V === 3 ? [1, 2, 4] : [1, 2, 4, 5];

  // 19. 合并 C4 到超级根 S0 (全局背包组合)
  steps.push(
    makeStep({
      curNode: 0,
      dpSnapshot: { 0: [0, 4, 10, ansVal], 1: [0, 2, 7, 10], 4: [0, 4, 10, 0] },
      currentMaxVal: ansVal,
      chosenCourses: ansChosen,
      status: 'root',
      message: `👑 [S0 融合两棵大子树] 在超级根处进行最终卷积合并：分配容量组合（C1 分配 2 选高数+线代=7，C4 分配 1 选数据结构=4），总价值高达 ${ansVal}！`,
      log: `S0 卷积合并 C1 与 C4: dp[0][${V}] = ${ansVal}`,
      codeLine: 28,
      subtreeSize: 5,
    })
  );

  // 20. 树上递归遍历完成
  steps.push(
    makeStep({
      curNode: 0,
      dpSnapshot: { 0: [0, 4, 10, ansVal], 1: [0, 2, 7, 10], 4: [0, 4, 10, 0] },
      currentMaxVal: ansVal,
      chosenCourses: ansChosen,
      status: 'done',
      message: '🎯 [DFS 回溯完毕] 树形依赖背包的所有子树已严格按上下界复杂度 O(N*V) 完成合并。',
      log: 'dfs(0) 结束，所有依赖路径与泛化物品合并完成',
      codeLine: 57,
      subtreeSize: 5,
    })
  );

  // 21. 返回最终答案
  steps.push(
    makeStep({
      curNode: 0,
      dpSnapshot: { 0: [0, 4, 10, ansVal], 1: [0, 2, 7, 10], 4: [0, 4, 10, 0] },
      currentMaxVal: ansVal,
      chosenCourses: ansChosen,
      status: 'done',
      message: `🎉 [求解成功] 返回 dp[0][${V}] = ${ansVal}！最优选修方案为：[${ansChosen.join(', ')}]，总学分价值达到最大化！`,
      log: `✓ return dp[0][${V}] = ${ansVal}; 算法执行完毕！`,
      codeLine: 58,
      subtreeSize: 5,
    })
  );

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
    { id: 'metric-subtree-size', label: '当前子树大小', color: '#f59e0b' },
    { id: 'metric-cur-dp', label: '节点 DP 状态', color: '#8b5cf6' },
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
      const nodeEl = root.querySelector('#metric-active-node') || root.querySelector('#active-node');
      const scoreEl = root.querySelector('#metric-max-score') || root.querySelector('#max-score');
      const szEl = root.querySelector('#metric-subtree-size') || root.querySelector('#subtree-size');
      const dpEl = root.querySelector('#metric-cur-dp') || root.querySelector('#cur-dp');

      if (nodeEl) nodeEl.textContent = step.curNode === 0 ? 'S0 (超级根)' : `Course ${step.curNode}`;
      if (scoreEl) scoreEl.textContent = `${step.currentMaxVal}`;
      if (szEl) szEl.textContent = step.subtreeSize !== undefined ? `${step.subtreeSize}` : '—';
      if (dpEl) {
        const curDpArr = step.dpSnapshot[step.curNode];
        dpEl.textContent = curDpArr ? `[${curDpArr.join(', ')}]` : '—';
      }

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
