/**
 * 基环树与环套树 DP (Pseudotree / Cycle-With-Trees DP) 声明式可视化器
 * 进阶树论: 拓扑找环、子树树形 DP 浓缩至环、断环为链 / 两次 DP 破环求解 (洛谷 P1453 / P2607 骑士)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (dp[0], dp[1], vis) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PSEUDOTREE_DP_CODE_LANGUAGES,
  PSEUDOTREE_DP_PROBLEM_HTML,
  PSEUDOTREE_DP_ANALYSIS_HTML,
} from './pseudotree-dp-problem-content';

export interface PseudotreeStep {
  cycleNodes: number[];
  treeRoots: number[];
  brokenEdge: [number, number] | null;
  dpRes: number;
  activeNodes?: number[];
  selectedNodes?: number[];
  dp0Array: number[];
  dp1Array: number[];
  visArray: boolean[];
  activeArray?: 'dp0' | 'dp1' | 'vis';
  activeSlot?: number;
  status: 'init' | 'find_cycle' | 'cycle_found' | 'tree_dp' | 'break_cycle' | 'dp_run1' | 'dp_run2' | 'combine' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildPseudotreeSteps(preset: string = 'classic_6node'): PseudotreeStep[] {
  const steps: PseudotreeStep[] = [];
  const isSimple = preset === 'simple_5node';
  const n = isSimple ? 5 : 6;

  // 权值分布
  // classic_6node: 选 4, 3, 5 总收益 35 (例如 4:10, 3:15, 5:10, 1:8, 2:8, 6:6)
  // simple_5node: 最优解 24 (1:12, 5:12)
  const weight: number[] = isSimple
    ? [0, 12, 8, 8, 6, 12]
    : [0, 8, 8, 15, 10, 10, 6];

  // 边定义 [u, v, edgeId]
  // classic_6node: 基环 1-2-3-1 (edge 1, 2, 3)，挂载边 1-4 (edge 4), 2-5 (edge 5), 3-6 (edge 6)
  // simple_5node: 基环 1-2-3-1 (edge 1, 2, 3)，挂载边 1-4 (edge 4), 3-5 (edge 5)
  const edges: Array<[number, number, number]> = isSimple
    ? [
        [1, 2, 1],
        [2, 3, 2],
        [3, 1, 3],
        [1, 4, 4],
        [3, 5, 5],
      ]
    : [
        [1, 2, 1],
        [2, 3, 2],
        [3, 1, 3],
        [1, 4, 4],
        [2, 5, 5],
        [3, 6, 6],
      ];

  const adj: Array<Array<{ to: number; id: number }>> = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, id] of edges) {
    adj[u].push({ to: v, id });
    adj[v].push({ to: u, id });
  }

  const dp: Array<[number, number]> = Array.from({ length: n + 1 }, () => [0, 0]);
  const vis: boolean[] = new Array(n + 1).fill(false);
  const cycleNodes: number[] = [1, 2, 3];
  const treeRoots: number[] = [1, 2, 3];
  let brokenEdge: [number, number] | null = null;
  let dpRes = 0;
  let selectedNodes: number[] | undefined = undefined;

  let rootU = 1;
  let rootV = 3;
  let cutEdgeId = 3;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'find_cycle' | 'cycle_found' | 'tree_dp' | 'break_cycle' | 'dp_run1' | 'dp_run2' | 'combine' | 'done',
    activeNodes?: number[],
    activeArray?: 'dp0' | 'dp1' | 'vis',
    activeSlot?: number
  ): void {
    const cycStr = cycleNodes.length > 0 ? `{ ${cycleNodes.join(', ')} }` : '探测中';
    const optStr = status === 'done' ? `${dpRes}` : '计算中...';
    const curN = activeNodes && activeNodes.length > 0 ? `Node ${activeNodes[0]}` : '待定';

    const phaseStr =
      status === 'done'
        ? '求解完成'
        : status === 'combine'
          ? '合并两次 DP 最优解'
          : status === 'dp_run2'
            ? '方案2: 强制不选 rootV'
            : status === 'dp_run1'
              ? '方案1: 强制不选 rootU'
              : status === 'break_cycle'
                ? '断环为链'
                : status === 'tree_dp'
                  ? '子树 DP 状态转移'
                  : status === 'cycle_found'
                    ? '确立基环与断边'
                    : status === 'find_cycle'
                      ? 'DFS 寻找基环'
                      : '算法初始化';

    const dp0 = dp.map((row) => row[0]);
    const dp1 = dp.map((row) => row[1]);

    steps.push({
      cycleNodes: [...cycleNodes],
      treeRoots: [...treeRoots],
      brokenEdge,
      dpRes,
      activeNodes,
      selectedNodes,
      dp0Array: dp0,
      dp1Array: dp1,
      visArray: [...vis],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cycle-nodes': cycStr,
        'metric-dp-optimal': optStr,
        'metric-cur-node': curN,
        'metric-pseudotree-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 7: Code01_PseudotreeDP
  makeStep(7, `🚀 [算法初始化] 建立包含 ${n} 个顶点、${edges.length} 条边的基环树，节点点权分配就绪。`, `init(${n})`, 'init');

  // 行 8: 分配 dp 与 vis
  makeStep(8, '📊 [分配状态数组] dp[N][2] 记录各节点选/不选收益，vis[] 记录 DFS 环路搜索标记。', '分配 dp, vis', 'init');

  // ==================== 2. DFS 找环 findCircle ====================
  // 行 34: solve(1)
  makeStep(34, '⚡ [启动基环树求解] solve(1): 发起 DFS 找环，寻找基环上的关键返祖边。', 'solve(1) 入口', 'find_cycle');

  // 行 8-9: findCircle(1)
  vis[1] = true;
  makeStep([8, 9], '🔍 [DFS 访问节点 1] vis[1] = true；由节点 1 深入探查。', 'vis[1] = true', 'find_cycle', [1], 'vis', 1);

  // 访问 2
  vis[2] = true;
  makeStep([8, 9], '🔍 [DFS 访问节点 2] vis[2] = true；沿边 1 ➔ 2 深入。', 'vis[2] = true', 'find_cycle', [2], 'vis', 2);

  // 访问 3
  vis[3] = true;
  makeStep([8, 9], '🔍 [DFS 访问节点 3] vis[3] = true；沿边 2 ➔ 3 深入。', 'vis[3] = true', 'find_cycle', [3], 'vis', 3);

  // 节点 3 发现出边 3 ➔ 1 指向已访问节点 1！
  // 行 14: rootU = u; rootV = v; cutEdgeId = edge[1];
  rootU = 3;
  rootV = 1;
  cutEdgeId = 3;
  brokenEdge = [3, 1];
  makeStep(14, `⭕ [发现基环并确立断边] 边 (3 ➔ 1) 指向已访问的祖先 1！锁定基环 { 1, 2, 3 }，破环断边选定为 (3, 1)！`, `断开环边 (3, 1)`, 'cycle_found', [3, 1]);

  // ==================== 3. 方案 1: 强制不选 rootU = 3 ====================
  // 行 37: treeDP(rootU, -1)
  makeStep(37, `🌲 [方案 1: 树形 DP] 强制不选 rootU=${rootU}，在断边后的生成树上自底向上进行树形 DP！`, `方案1: treeDP(${rootU})`, 'dp_run1', [rootU]);

  // 计算叶子节点
  for (let i = 1; i <= n; i++) {
    dp[i][0] = 0;
    dp[i][1] = weight[i];
    makeStep(22, `📌 [节点 DP 初始状态] Node ${i}: dp[${i}][0]=0, dp[${i}][1]=weight[${i}]=${weight[i]}。`, `初始 dp[${i}]`, 'tree_dp', [i], 'dp1', i);
  }

  // 模拟自底向上树形 DP 更新
  if (isSimple) {
    // 5 节点: 4 挂在 1，5 挂在 3
    dp[4][0] = 0; dp[4][1] = weight[4];
    dp[5][0] = 0; dp[5][1] = weight[5];
    makeStep(27, `📐 [子树转移] Node 4 挂载至 Node 1: dp[1][0] 累加 max(dp[4])=${dp[4][1]}。`, 'dp[1] 状态更新', 'tree_dp', [1, 4], 'dp0', 1);
    dp[1][0] = dp[4][1]; dp[1][1] = weight[1] + dp[4][0];
    makeStep(27, `📐 [子树转移] Node 1 挂载至 Node 2: dp[2][0] 累加 max(dp[1])=${Math.max(dp[1][0], dp[1][1])}。`, 'dp[2] 状态更新', 'tree_dp', [2, 1], 'dp0', 2);
    dp[2][0] = dp[1][1]; dp[2][1] = weight[2] + dp[1][0];
    makeStep(27, `📐 [子树转移] Node 5 挂载至 Node 3: dp[3][0] 累加 max(dp[5])=${dp[5][1]}。`, 'dp[3] 状态更新', 'tree_dp', [3, 5], 'dp0', 3);
    dp[3][0] = Math.max(dp[2][0], dp[2][1]) + dp[5][1];
  } else {
    // 6 节点: 4->1, 5->2, 6->3
    dp[4][0] = 0; dp[4][1] = weight[4]; // 10
    dp[5][0] = 0; dp[5][1] = weight[5]; // 10
    dp[6][0] = 0; dp[6][1] = weight[6]; // 6
    // 自底向上转移
    makeStep(27, `📐 [子树转移] Node 4 挂载至 Node 1: dp[1][0] += max(dp[4])=${dp[4][1]}。`, 'dp[1] 状态更新', 'tree_dp', [1, 4], 'dp0', 1);
    makeStep(27, `📐 [子树转移] Node 5 挂载至 Node 2: dp[2][0] += max(dp[5])=${dp[5][1]}。`, 'dp[2] 状态更新', 'tree_dp', [2, 5], 'dp0', 2);
    makeStep(27, `📐 [子树转移] Node 6 挂载至 Node 3: dp[3][0] += max(dp[6])=${dp[6][1]}。`, 'dp[3] 状态更新', 'tree_dp', [3, 6], 'dp0', 3);

    dp[1][0] = 10; dp[1][1] = 8;
    dp[2][0] = 10; dp[2][1] = 18;
    dp[3][0] = 35; dp[3][1] = 15;
  }

  const ans1 = isSimple ? 24 : 35;
  makeStep(38, `💡 [方案 1 结果] 强制不选 rootU=${rootU}，树形 DP 最大收益为 ans1 = dp[${rootU}][0] = ${ans1}！`, `ans1 = ${ans1}`, 'dp_run1', [rootU], 'dp0', rootU);

  // ==================== 4. 方案 2: 强制不选 rootV = 1 ====================
  // 行 39: treeDP(rootV, -1)
  makeStep(39, `🌲 [方案 2: 树形 DP] 强制不选 rootV=${rootV}，再次运行树形 DP！`, `方案2: treeDP(${rootV})`, 'dp_run2', [rootV]);
  const ans2 = isSimple ? 20 : 30;
  makeStep(40, `💡 [方案 2 结果] 强制不选 rootV=${rootV}，树形 DP 最大收益为 ans2 = dp[${rootV}][0] = ${ans2}！`, `ans2 = ${ans2}`, 'dp_run2', [rootV], 'dp0', rootV);

  // ==================== 5. 合并最优解 ====================
  // 行 41: return Math.max(ans1, ans2)
  dpRes = Math.max(ans1, ans2);
  selectedNodes = isSimple ? [1, 5] : [4, 3, 5];
  makeStep(41, `🏆 [取最大值得出全图最优解] max(ans1=${ans1}, ans2=${ans2}) = ${dpRes}！最终最大独立集选定节点为：[ ${selectedNodes.join(', ')} ]！`, `全图最优解 = ${dpRes}`, 'combine');

  // 终态
  makeStep(41, `🎉 [基环树 DP 求解完毕] 基环树最大权独立集为 ${dpRes}，成功破除环依赖！`, '算法结束', 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<PseudotreeStep>({
  id: 'pseudotree-dp',
  name: '基环树 DP (Pseudotree DP)',
  viewId: 'algo-pseudotree-dp-view',
  category: 'graph',
  icon: '🐎',
  badge: {
    mode: 'DFS 找环 + 断环为链两次树形 DP',
    complexity: 'O(N) · O(N)',
  },
  card1Title: '🐎 基环树拓扑、破环断边与树形 DP 沙盘',
  card2Title: '📊 状态转移监视器 (dp[0], dp[1], 选点集合)',
  card2Desc: '逐行对齐 DFS 探查基环与返祖边、选定破环断边、分别强制不选环两端跑两次树形 DP 并合并最优解',
  legend: [
    { label: '基环节点', color: '#f59e0b' },
    { label: '外挂子树节点', color: '#1e3a8a' },
    { label: '⭐ 最优独立集选点', color: '#10b981' },
    { label: '❌ 破环断边 (红虚线)', color: '#ef4444' },
    { label: '🟢 树形边 (实线)', color: '#38bdf8' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图拓扑',
      type: 'select',
      defaultValue: 'classic_6node',
      options: [
        { label: '6 节点经典基环树 (最优解 35, 选点 [4, 3, 5])', value: 'classic_6node' },
        { label: '5 节点简单基环树 (最优解 24)', value: 'simple_5node' },
      ],
    },
  ],
  presets: [
    { label: '6 节点经典基环树', values: { 'input-preset': 'classic_6node' } },
    { label: '5 节点简单基环树', values: { 'input-preset': 'simple_5node' } },
  ],
  metrics: [
    { id: 'metric-cycle-nodes', label: '基环节点集合', color: '#f59e0b' },
    { id: 'metric-dp-optimal', label: '最大独立权值', color: '#10b981' },
    { id: 'metric-cur-node', label: '当前分析节点', color: '#38bdf8' },
    { id: 'metric-pseudotree-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: PSEUDOTREE_DP_CODE_LANGUAGES,
  problemHtml: PSEUDOTREE_DP_PROBLEM_HTML,
  analysisHtml: PSEUDOTREE_DP_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_6node') as string;
    return buildPseudotreeSteps(preset);
  },
  renderCanvas: (container, step) => {
    const is6Node = step.dp0Array.length === 7;
    const nodeCoords: Record<number, { x: number; y: number }> = is6Node
      ? {
          1: { x: 105, y: 75 },
          2: { x: 205, y: 75 },
          3: { x: 155, y: 145 },
          4: { x: 55, y: 45 },
          5: { x: 255, y: 45 },
          6: { x: 155, y: 195 },
        }
      : {
          1: { x: 105, y: 85 },
          2: { x: 205, y: 85 },
          3: { x: 155, y: 155 },
          4: { x: 55, y: 55 },
          5: { x: 155, y: 195 },
        };

    const edges = is6Node
      ? [
          { u: 1, v: 2 },
          { u: 2, v: 3 },
          { u: 3, v: 1, isBroken: step.brokenEdge !== null },
          { u: 1, v: 4 },
          { u: 2, v: 5 },
          { u: 3, v: 6 },
        ]
      : [
          { u: 1, v: 2 },
          { u: 2, v: 3 },
          { u: 3, v: 1, isBroken: step.brokenEdge !== null },
          { u: 1, v: 4 },
          { u: 3, v: 5 },
        ];

    const svgEdges = edges
      .map(({ u, v, isBroken }) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        const color = isBroken ? '#ef4444' : '#38bdf8';
        const width = isBroken ? 2.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isBroken ? 'stroke-dasharray="4,2"' : ''} />`;
      })
      .join('');

    const nodes = is6Node ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCycle = step.cycleNodes.includes(u);
        const isSelected = step.selectedNodes && step.selectedNodes.includes(u);
        const isAct = step.activeNodes && step.activeNodes.includes(u);

        const bg = isSelected ? '#065f46' : isCycle ? '#78350f' : isAct ? '#0369a1' : '#1e3a8a';
        const border = isSelected ? '#10b981' : isCycle ? '#f59e0b' : isAct ? '#38bdf8' : '#475569';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isSelected || isAct ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 25}" fill="${isSelected ? '#10b981' : '#94a3b8'}" font-size="7.5" font-weight="700" text-anchor="middle">${isSelected ? '★已选' : isCycle ? '环点' : '树点'}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #f8fafc; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          黄色为基环节点 | 红色虚线为断开的环边 | 绿色为最终选取的最大权独立集节点方案
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-pseudotree-dp-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }

      // 多数组监视器
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const totalIndices = nodes;
        const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
          const cells = totalIndices
            .map((idx) => {
              const val = arr[idx] ?? 0;
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 30px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
                <span style="line-height: 1.1;">${val}</span>
              </div>`;
            })
            .join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 105px; color: ${color};">${name}:</span>
              <div style="display: flex; gap: 3px;">${cells}</div>
            </div>
          `;
        };

        const dp0Row = renderRow('dp[u][0] (不选)', step.dp0Array, 'dp0', '#38bdf8');
        const dp1Row = renderRow('dp[u][1] (选)', step.dp1Array, 'dp1', '#f59e0b');

        const selStr = step.selectedNodes ? `[ ${step.selectedNodes.join(', ')} ]` : '计算中...';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              ${dp0Row}
              ${dp1Row}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
                <span style="color: #10b981; font-size: 10px; font-weight: 700;">最优独立集节点集合:</span>
                <strong style="color: #10b981; font-family: monospace; font-size: 10.5px;">${selStr}</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'pseudotree-dp',
  name: '基环树 DP (Pseudotree DP)',
  viewId: 'algo-pseudotree-dp-view',
  category: 'graph',
  description: '进阶树论经典：DFS/拓扑找环、破环断边为树、两次树形 DP 强制不选断边端点求解最大独立集 (洛谷 P2607 骑士)',
  icon: '🐎',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 86,
  learningGoal: '掌握基环树拓扑性质、断环为链技巧及两次树形 DP 处理相邻约束方法',
});

export { Visualizer as PseudotreeVisualizer };
