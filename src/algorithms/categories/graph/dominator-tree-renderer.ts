/**
 * DAG 支配树 (Dominator Tree - 拓扑排序与支配关系) 声明式可视化器
 * 进阶图论: DAG 拓扑反向递推、多前驱 LCA 汇聚、idom[u] 唯一直接支配点
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (inDegree, idom, depth, 拓扑队列) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  DOMINATOR_TREE_CODE_LANGUAGES,
  DOMINATOR_TREE_PROBLEM_HTML,
  DOMINATOR_TREE_ANALYSIS_HTML,
} from './dominator-tree-problem-content';

export interface DominatorStep {
  curNode: number;
  idomMap: Record<number, number | null>;
  dominatorTreeEdges: Array<{ u: number; v: number }>;
  topoQueue: number[];
  inDegreeMap: Record<number, number>;
  depthMap: Record<number, number>;
  activeArray?: 'inDegree' | 'idom' | 'depth';
  activeSlot?: number;
  status: 'init' | 'topo' | 'lca' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildDominatorTreeSteps(preset: string = 'classic_diamond'): DominatorStep[] {
  const steps: DominatorStep[] = [];
  const isLinear = preset === 'linear_bypass';
  const n = 4;
  const root = 1;

  // 有向边定义
  // classic_diamond: 1->2, 1->3, 2->4, 3->4
  // linear_bypass: 1->2, 2->3, 3->4, 1->4
  const directedEdges: Array<[number, number]> = isLinear
    ? [
        [1, 2],
        [2, 3],
        [3, 4],
        [1, 4],
      ]
    : [
        [1, 2],
        [1, 3],
        [2, 4],
        [3, 4],
      ];

  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  const revAdj: number[][] = Array.from({ length: n + 1 }, () => []);
  const inDegree: number[] = new Array(n + 1).fill(0);
  const depth: number[] = new Array(n + 1).fill(0);
  const idom: Array<number | null> = new Array(n + 1).fill(null);
  const up: number[][] = Array.from({ length: n + 1 }, () => new Array(19).fill(0));
  const domTreeEdges: Array<{ u: number; v: number }> = [];
  const q: number[] = [];

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'topo' | 'lca' | 'done',
    curNode: number = root,
    lcaDesc?: string,
    activeArray?: 'inDegree' | 'idom' | 'depth',
    activeSlot?: number
  ): void {
    const idomRecord: Record<number, number | null> = {};
    const inDegRecord: Record<number, number> = {};
    const depthRecord: Record<number, number> = {};
    for (let i = 1; i <= n; i++) {
      idomRecord[i] = idom[i];
      inDegRecord[i] = inDegree[i];
      depthRecord[i] = depth[i];
    }

    const phaseStr =
      status === 'done'
        ? '支配树构建完成'
        : status === 'lca'
          ? '前驱 LCA 汇聚'
          : status === 'topo'
            ? '拓扑排序推进'
            : '初始化';

    steps.push({
      curNode,
      idomMap: idomRecord,
      dominatorTreeEdges: domTreeEdges.map((e) => ({ ...e })),
      topoQueue: [...q],
      inDegreeMap: inDegRecord,
      depthMap: depthRecord,
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-node': `Node ${curNode}`,
        'metric-dom-lca': lcaDesc || (idom[curNode] ? `idom[${curNode}] = ${idom[curNode]}` : '根节点 / 待求'),
        'metric-dom-edges': `${domTreeEdges.length} 条支配边`,
        'metric-dom-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 17: DominatorTree(n, root)
  makeStep(17, `🚀 [算法初始化] DominatorTree(n=${n}, root=${root})：准备在包含 ${n} 个顶点的有向无环图上建立支配树。`, `DominatorTree(${n}, ${root})`, 'init');

  // 行 28-31: 分配数组
  makeStep([28, 31], '📊 [分配状态数组] 分配 inDegree[], depth[], idom[], up[][] 状态数组。', '分配状态数组', 'init');

  // ==================== 2. 逐条加边与入度统计 ====================
  for (const [u, v] of directedEdges) {
    // 行 34: addEdge(u, v)
    makeStep(34, `🔗 [读入有向边] addEdge(${u}, ${v})：添加有向边 ${u} ➔ ${v}。`, `addEdge(${u}, ${v})`, 'init', u);

    // 行 35-37: 邻接、反向邻接、入度累加
    adj[u].push(v);
    revAdj[v].push(u);
    inDegree[v]++;
    makeStep([35, 37], `✏️ [更新入度与反图] inDegree[${v}] 增加至 ${inDegree[v]}，revAdj[${v}] 记录前驱 ${u}。`, `inDegree[${v}]++ -> ${inDegree[v]}`, 'init', u, undefined, 'inDegree', v);
  }

  // ==================== 3. 支配树倍增 LCA 函数 ====================
  function getLCA(u: number, v: number): number {
    if (depth[u] < depth[v]) {
      const t = u;
      u = v;
      v = t;
    }
    for (let i = 18; i >= 0; i--) {
      if (depth[u] - (1 << i) >= depth[v]) {
        u = up[u][i];
      }
    }
    if (u === v) return u;
    for (let i = 18; i >= 0; i--) {
      if (up[u][i] !== up[v][i]) {
        u = up[u][i];
        v = up[v][i];
      }
    }
    return up[u][0];
  }

  // ==================== 4. 拓扑排序与支配树构建 ====================
  // 行 52: build()
  makeStep(52, '⚡ [启动支配树构建] build(): 借助拓扑排序自顶向下确定支配关系。', 'build() 入口', 'topo');

  // 行 53-55: 根节点入队
  q.push(root);
  depth[root] = 1;
  makeStep([53, 55], `👑 [根节点入队] q.add(root=${root}); depth[${root}] = 1; 根节点不受任何其他点支配。`, `队列加入 root ${root}`, 'topo', root, '根节点自身', 'depth', root);

  // 行 57: while (!q.isEmpty())
  while (q.length > 0) {
    // 行 58: int u = q.poll();
    const u = q.shift()!;
    makeStep(58, `📤 [弹出队首] 节点 u = ${u} 出队进行支配点求取。`, `u = ${u} 出队`, 'topo', u);

    // 行 59: if (u != root && !revAdj[u].isEmpty())
    if (u !== root && revAdj[u].length > 0) {
      makeStep(59, `🔍 [多前驱考察] 节点 ${u} 的前驱集：{ ${revAdj[u].join(', ')} }，在已建好的支配树上求所有前驱的公共祖先 LCA！`, `考察前驱 {${revAdj[u].join(',')}}`, 'lca', u);

      // 行 60: int pLCA = revAdj[u].get(0);
      let pLCA = revAdj[u][0];
      makeStep(60, `📍 [初始 LCA] pLCA = revAdj[${u}][0] = ${pLCA}。`, `初始 pLCA = ${pLCA}`, 'lca', u);

      // 行 61-63: for (int i = 1; i < revAdj[u].size(); i++) pLCA = getLCA(pLCA, revAdj[u].get(i));
      for (let i = 1; i < revAdj[u].length; i++) {
        const pred = revAdj[u][i];
        const oldLCA = pLCA;
        pLCA = getLCA(pLCA, pred);
        makeStep([61, 63], `⚖️ [迭代求解 LCA] pLCA = getLCA(${oldLCA}, ${pred}) = ${pLCA}；合并前驱支配约束。`, `getLCA(${oldLCA}, ${pred}) = ${pLCA}`, 'lca', u, `LCA(${oldLCA}, ${pred}) = ${pLCA}`);
      }

      // 行 64: idom[u] = pLCA;
      idom[u] = pLCA;
      makeStep(64, `🎯 [确立直接支配点] idom[${u}] = ${pLCA}！要到达 ${u}，必须先经过其直接支配点 ${pLCA}！`, `idom[${u}] = ${pLCA}`, 'lca', u, `idom[${u}] = ${pLCA}`, 'idom', u);

      // 行 65: domTreeAdj.get(pLCA).add(u);
      domTreeEdges.push({ u: pLCA, v: u });
      makeStep(65, `🌳 [添加支配边] 支配树中连边：${pLCA} ➔ ${u}。`, `支配树边: ${pLCA} ➔ ${u}`, 'lca', u);

      // 行 66-68: depth 与 up 倍增更新
      depth[u] = depth[pLCA] + 1;
      up[u][0] = pLCA;
      for (let i = 1; i <= 18; i++) {
        up[u][i] = up[up[u][i - 1]][i - 1];
      }
      makeStep([66, 68], `📏 [更新支配树深度] depth[${u}] = depth[${pLCA}] + 1 = ${depth[u]}，倍增祖先数组更新就绪。`, `depth[${u}] = ${depth[u]}`, 'lca', u, undefined, 'depth', u);
    }

    // 行 70-71: 遍历出边，入度减一，入队
    makeStep(70, `📡 [后继入度递减] 遍历节点 ${u} 的所有出边后继：${adj[u].join(', ') || '无'}。`, `遍历 ${u} 的后继`, 'topo', u);
    for (const v of adj[u]) {
      inDegree[v]--;
      makeStep(71, `📉 [入度减 1] inDegree[${v}]-- -> ${inDegree[v]} (${inDegree[v] === 0 ? '入度归零，加入拓扑队列！' : '仍有前驱未就绪'})。`, `--inDegree[${v}] = ${inDegree[v]}`, 'topo', u, undefined, 'inDegree', v);
      if (inDegree[v] === 0) {
        q.push(v);
        makeStep(71, `📥 [新点入队] 节点 ${v} 拓扑就绪，进入队列：[${q.join(', ')}]。`, `节点 ${v} 入队`, 'topo', v);
      }
    }
  }

  // 终态
  makeStep(76, `🎉 [支配树构建完毕] DAG 支配树求解完成！各节点直接支配点：${Array.from({ length: n }, (_, i) => `idom[${i + 1}]=${idom[i + 1] ?? 'null'}`).join(', ')}！`, '支配树构建完成', 'done', root);

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<DominatorStep>({
  id: 'dominator-tree',
  name: 'DAG 支配树 (Dominator Tree)',
  category: 'graph',
  icon: '🌳',
  badge: {
    mode: 'DAG 拓扑排序 + 前驱 LCA',
    complexity: 'O((V + E) log V) · O(V + E)',
  },
  card1Title: '🌳 原图 DAG 拓扑与支配树 (Dominator Tree) 沙盘',
  card2Title: '📊 支配树多数组 (inDegree, idom, depth, 队列) 监控器',
  card2Desc: '逐行对齐拓扑排序出入度递减、前驱集合在支配树上的 LCA 汇聚与唯一直接支配点 idom[u] 确立',
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '⭐ 当前分析点', color: '#f59e0b' },
    { label: '🟢 根节点 (Root)', color: '#10b981' },
    { label: '🟣 支配树边 (紫色)', color: '#8b5cf6' },
    { label: '⚪ 原图边 (灰线)', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图结构',
      type: 'select',
      defaultValue: 'classic_diamond',
      options: [
        { label: '经典菱形图 (汇聚点 4 支配点为 1)', value: 'classic_diamond' },
        { label: '旁路控制流 (节点 4 支配点为 1)', value: 'linear_bypass' },
      ],
    },
  ],
  presets: [
    { label: '经典菱形图', values: { 'input-preset': 'classic_diamond' } },
    { label: '旁路控制流', values: { 'input-preset': 'linear_bypass' } },
  ],
  metrics: [
    { id: 'metric-cur-node', label: '当前处理节点', color: '#f59e0b' },
    { id: 'metric-dom-lca', label: '前驱汇聚 LCA', color: '#10b981' },
    { id: 'metric-dom-edges', label: '支配树边数', color: '#38bdf8' },
    { id: 'metric-dom-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: DOMINATOR_TREE_CODE_LANGUAGES,
  problemHtml: DOMINATOR_TREE_PROBLEM_HTML,
  analysisHtml: DOMINATOR_TREE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_diamond') as string;
    return buildDominatorTreeSteps(preset);
  },
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 40 },
      2: { x: 80, y: 105 },
      3: { x: 230, y: 105 },
      4: { x: 155, y: 175 },
    };

    const origEdges = [
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 4],
    ];

    const svgOrigEdges = origEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,2" />`;
      })
      .join('');

    const svgDomEdges = step.dominatorTreeEdges
      .map(({ u, v }) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#a855f7" stroke-width="3" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCur = step.curNode === u;
        const isRoot = u === 1;
        const idomVal = step.idomMap[u];

        const bg = isCur ? '#f59e0b' : isRoot ? '#065f46' : idomVal ? '#581c87' : '#1e3a8a';
        const border = isCur ? '#facc15' : isRoot ? '#10b981' : idomVal ? '#a855f7' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isCur ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">${isRoot ? '根点' : `idom:${idomVal ?? '?'}`}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 310 200">
          ${svgOrigEdges}
          ${svgDomEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          紫色实线为支配树边 | 支配定理：所有前驱在支配树上的最近公共祖先 LCA 即为该点的直接支配点 idom[u]
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-dominator-tree-view') ||
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
        const indices = [1, 2, 3, 4];
        const renderRow = (name: string, map: Record<number, any>, activeName: string, color: string) => {
          const cells = indices
            .map((idx) => {
              const val = map[idx];
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const displayVal = val === null || val === undefined ? '∅' : val;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #eab308' : '1px solid #475569';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
                <span style="line-height: 1.1;">${displayVal}</span>
              </div>`;
            })
            .join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 95px; color: ${color};">${name}:</span>
              <div style="display: flex; gap: 4px;">${cells}</div>
            </div>
          `;
        };

        const inDegRow = renderRow('inDegree[] (入度)', step.inDegreeMap, 'inDegree', '#38bdf8');
        const idomRow = renderRow('idom[] (支配点)', step.idomMap, 'idom', '#a855f7');
        const depthRow = renderRow('depth[] (树深度)', step.depthMap, 'depth', '#f59e0b');
        const qStr = step.topoQueue.length > 0 ? step.topoQueue.join(' ➔ ') : '空队列';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #cbd5e1; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
              ${inDegRow}
              ${idomRow}
              ${depthRow}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
                <span style="color: #38bdf8; font-size: 10px; font-weight: 700;">拓扑排序队列:</span>
                <strong style="color: #38bdf8; font-family: monospace; font-size: 10.5px;">[ ${qStr} ]</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #94a3b8; font-size: 10.5px;">执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'dominator-tree',
  name: 'DAG 支配树 (Dominator Tree)',
  viewId: 'algo-dominator-tree-view',
  category: 'graph',
  description: '进阶图论经典：有向无环图支配树构建、拓扑排序自顶向下、前驱集合最近公共祖先 LCA 汇聚定理 (洛谷 P2597)',
  icon: '🌳',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 73,
  learningGoal: '掌握 DAG 支配树构造原理、前驱支配交集与 LCA 等价定理及倍增查询应用',
});

export { Visualizer as DominatorTreeVisualizer };
