/**
 * 欧拉回路与欧拉路径 (Eulerian Path & Circuit - Hierholzer 算法) 声明式可视化器
 * 进阶图论: Hierholzer 深度优先搜索 + 当前弧优化删边 + 死胡同回溯压栈倒序输出 (洛谷 P7771)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（排序、while当前弧推进、DFS递归深入、死胡同回溯压栈、倒序输出均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  EULERIAN_CIRCUIT_CODE_LANGUAGES,
  EULERIAN_CIRCUIT_PROBLEM_HTML,
  EULERIAN_CIRCUIT_ANALYSIS_HTML,
} from './eulerian-circuit-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface EulerianStep {
  curNode: number;
  circuitPath: number[];
  visitedEdges: Array<[number, number]>;
  activeStack: number[];
  activeEdge?: [number, number];
  headArray: number[];
  degArray: number[];
  pathArray: number[];
  activeArray?: 'head' | 'deg' | 'path';
  activeSlot?: number;
  status: 'check' | 'traverse' | 'backtrack' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildEulerianCircuitSteps(preset: string = 'classic_4node'): EulerianStep[] {
  const steps: EulerianStep[] = [];
  const isTriangle = preset === 'simple_triangle';
  const n = isTriangle ? 3 : 4;

  const edges: Array<[number, number]> = isTriangle
    ? [[1, 2], [2, 3], [3, 1]]
    : [[1, 2], [2, 3], [3, 4], [4, 1]];

  const graph: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    graph[u].push(v);
  }

  const head: number[] = new Array(n + 1).fill(0);
  const inDeg: number[] = new Array(n + 1).fill(0);
  const outDeg: number[] = new Array(n + 1).fill(0);
  for (const [u, v] of edges) {
    outDeg[u]++;
    inDeg[v]++;
  }

  const path: number[] = [];
  const visitedEdges: Array<[number, number]> = [];
  const dfsStack: number[] = [];

  // 精准四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    solverInit: { cpp: 24, java: 7, python: 6, javascript: 5 },
    allocGraph: { cpp: 24, java: 10, python: 7, javascript: 6 },
    allocHead: { cpp: 24, java: 11, python: 10, javascript: 9 },
    entry: { cpp: 39, java: 28, python: 34, javascript: 34 },
    sortLoop: { cpp: 41, java: 29, python: 36, javascript: 35 },
    sortAction: { cpp: 42, java: 29, python: 37, javascript: 35 },
    startDfsCall: { cpp: 44, java: 30, python: 38, javascript: 36 },
    dfsDef: { cpp: 30, java: 19, python: 26, javascript: 28 },
    whileHead: { cpp: 32, java: 21, python: 28, javascript: 30 },
    popEdge: { cpp: 33, java: 22, python: 29, javascript: 31 },
    recurseDfs: { cpp: 34, java: 23, python: 31, javascript: 32 },
    pushPath: { cpp: 36, java: 25, python: 32, javascript: 34 },
    reversePath: { cpp: 45, java: 31, python: 39, javascript: 37 },
    returnPath: { cpp: 46, java: 32, python: 39, javascript: 38 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'check' | 'traverse' | 'backtrack' | 'done',
    curNode: number,
    activeEdge?: [number, number],
    activeArray?: 'head' | 'deg' | 'path',
    activeSlot?: number,
    finalPath?: number[]
  ): void {
    const currentPath = finalPath || [...path];
    const pathStr = currentPath.length > 0 ? `[${currentPath.join(' ➔ ')}]` : '构建中...';
    const stackStr = dfsStack.length > 0 ? `[${dfsStack.join(', ')}]` : '[]';

    steps.push({
      curNode,
      circuitPath: currentPath,
      visitedEdges: [...visitedEdges],
      activeStack: [...dfsStack],
      activeEdge,
      headArray: [...head],
      degArray: [...outDeg],
      pathArray: [...path],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-euler-status': '✓ 度数守恒 (In=Out)',
        'metric-euler-path': pathStr,
        'metric-euler-cur': `节点 ${curNode}`,
        'metric-euler-stack': stackStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.solverInit, `🚀 [算法初始化] Solver(n=${n})：构造 Hierholzer 求解器，准备在包含 ${n} 个顶点的有向图中寻找欧拉回路。`, `Solver(${n})`, 'check', 1);
  makeStep(lines.allocGraph, '📐 [初始化邻接表] 分配图边表，完成各点有向边的装载。', '分配 graph 边表', 'check', 1);
  makeStep(lines.allocHead, '📌 [初始化当前弧数组] head = new int[n + 1] (全 0)。', 'head = new int[n+1]', 'check', 1);

  // 2. 启动入口
  makeStep(lines.entry, '🏁 [调用入口] getEulerianPath(start=1)：启动欧拉回路计算过程。', 'getEulerianPath(1)', 'check', 1);

  for (let i = 1; i <= n; i++) {
    makeStep(lines.sortLoop, `🔁 [邻接表字典序排序] for (int i = ${i}; i <= ${n}; i++)。`, `for i=${i}`, 'check', i);
    graph[i].sort((a, b) => a - b);
    makeStep(lines.sortAction, `🔤 [排序出边] Collections.sort(graph[${i}])：确保优先探索字典序最小节点。`, `sort graph[${i}]`, 'check', i);
  }

  makeStep(lines.startDfsCall, '🚀 [发起深度优先搜索] dfs(1)：从起点 1 开始深度优先搜索遍历所有有向边。', 'dfs(1)', 'traverse', 1);

  // 3. Hierholzer 递归 DFS
  function dfs(u: number): void {
    makeStep(lines.dfsDef, `🎯 [进入 dfs 节点] void dfs(u=${u})：当前位于顶点 ${u}。`, `dfs(${u})`, 'traverse', u);
    dfsStack.push(u);

    while (head[u] < graph[u].length) {
      makeStep(lines.whileHead, `🔁 [当前弧优化扫描] while (head[${u}] < graph[${u}].size()) -> (${head[u]} < ${graph[u].length})。`, `while head[${u}]=${head[u]}`, 'traverse', u, undefined, 'head', u);

      const v = graph[u][head[u]];
      head[u]++;
      makeStep(lines.popEdge, `⚡ [沿弧推进删边] int v = graph[${u}][${head[u] - 1}] = ${v}；当前弧指针递增为 head[${u}] = ${head[u]}！`, `edge (${u}, ${v}), head[${u}]++`, 'traverse', u, [u, v], 'head', u);

      visitedEdges.push([u, v]);

      makeStep(lines.recurseDfs, `🌲 [递归深入邻居] 沿着有向边 (${u} ➔ ${v}) 递归调用 dfs(${v})。`, `recurse dfs(${v})`, 'traverse', v, [u, v]);
      dfs(v);
    }

    makeStep(lines.whileHead, `🛑 [死胡同无路可走] 节点 ${u} 的所有出边均已遍历消耗 (head[${u}] == ${graph[u].length})，开始死胡同回溯！`, `head[${u}] exhausted`, 'backtrack', u);

    dfsStack.pop();
    path.push(u);
    makeStep(lines.pushPath, `📥 [后序压入结果栈] path.add(${u})；死胡同回溯压栈，当前后序序列: [${path.join(', ')}]。`, `path.add(${u})`, 'backtrack', u, undefined, 'path', path.length - 1);
  }

  dfs(1);

  makeStep(lines.reversePath, '🔄 [序列逆序反转] Collections.reverse(path)：死胡同回溯序列翻转后，得到正向一笔画欧拉回路！', 'reverse(path)', 'done', 1, undefined, undefined, undefined, [...path].reverse());

  const finalCircuit = [...path].reverse();
  makeStep(lines.returnPath, `🎉 [输出欧拉回路] return path: [${finalCircuit.join(' ➔ ')}]！每条边恰好且仅经过一次，一笔画闭环构建成功！`, 'return path', 'done', 1, undefined, undefined, undefined, finalCircuit);

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<EulerianStep>({
  id: 'eulerian-circuit',
  name: '欧拉回路 (Eulerian Circuit - Hierholzer)',
  viewId: 'algo-eulerian-circuit-view',
  category: 'graph',
  icon: '🔄',
  badge: {
    mode: 'Hierholzer 深度优先 · 当前弧删边优化',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '🔄 有向图拓扑与一笔画欧拉轨迹舱',
  card2Title: '📊 Hierholzer 状态监视器 (head, 出度, 栈, path)',
  card2Desc: '展示当前弧 head[u] 动态删边、递归调用栈与死胡同回溯倒序构建欧拉回路全过程',
  legend: [
    { label: '⚡ 当前遍历活跃顶点', color: '#f59e0b' },
    { label: '✔ 已完整走过的有向边', color: '#10b981' },
    { label: '⚪ 待访问边', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图结构',
      type: 'select',
      defaultValue: 'classic_4node',
      options: [
        { label: '4 节点经典回路 (1->2->3->4->1 一笔画)', value: 'classic_4node' },
        { label: '3 节点环形回路 (1->2->3->1 一笔画)', value: 'simple_triangle' },
      ],
    },
  ],
  presets: [
    { label: '4 节点环路', values: { 'input-preset': 'classic_4node' } },
    { label: '3 节点环路', values: { 'input-preset': 'simple_triangle' } },
  ],
  metrics: [
    { id: 'metric-euler-status', label: '图连通与度数', color: '#10b981' },
    { id: 'metric-euler-path', label: '当前回路轨迹', color: '#38bdf8' },
    { id: 'metric-euler-cur', label: '当前考察顶点', color: '#f59e0b' },
    { id: 'metric-euler-stack', label: 'DFS 活跃调用栈', color: '#a855f7' },
  ],
  codeLanguages: EULERIAN_CIRCUIT_CODE_LANGUAGES,
  problemHtml: EULERIAN_CIRCUIT_PROBLEM_HTML,
  analysisHtml: EULERIAN_CIRCUIT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_4node') as string;
    return buildEulerianCircuitSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isTriangle = step.headArray.length === 4;
    const n = isTriangle ? 3 : 4;

    const nodeCoords: Record<number, { x: number; y: number }> = isTriangle
      ? {
          1: { x: 155, y: 35 },
          2: { x: 85, y: 125 },
          3: { x: 225, y: 125 },
        }
      : {
          1: { x: 75, y: 45 },
          2: { x: 235, y: 45 },
          3: { x: 235, y: 125 },
          4: { x: 75, y: 125 },
        };

    const allEdges = isTriangle
      ? [[1, 2], [2, 3], [3, 1]]
      : [[1, 2], [2, 3], [3, 4], [4, 1]];

    const svgEdges = allEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';

        const isAct = step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
        const isVisited = step.visitedEdges.some(([fu, fv]) => fu === u && fv === v);

        const color = isAct ? '#facc15' : isVisited ? '#10b981' : '#64748b';
        const width = isAct ? 3.5 : isVisited ? 2.5 : 1.5;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const mx = (p1.x + p2.x) / 2 - dy * 0.12;
        const my = (p1.y + p2.y) / 2 + dx * 0.12;

        return `
          <g>
            <path d="M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}" fill="none" stroke="${color}" stroke-width="${width}" marker-end="url(#euler-arrow)" />
          </g>
        `;
      })
      .join('');

    const nodes = isTriangle ? [1, 2, 3] : [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCur = step.curNode === u;
        const inStack = step.activeStack.includes(u);
        const bg = isCur ? '#b45309' : inStack ? '#1e3a8a' : '#1e293b';
        const border = isCur ? '#facc15' : inStack ? '#38bdf8' : '#475569';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isCur || inStack ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 24}" fill="#94a3b8" font-size="7.5" font-weight="700" text-anchor="middle">弧:${step.headArray[u]}</text>
          </g>
        `;
      })
      .join('');

    const circuitBadges = step.circuitPath.length > 0
      ? step.circuitPath.map((u, idx) => `<span style="background: #1e293b; border: 1px solid #10b981; border-radius: 4px; padding: 2px 7px; font-size: 11px; color: #a7f3d0; font-family: monospace; font-weight: 700;">${idx === 0 ? '' : '➔ '}${u}</span>`).join(' ')
      : '<span style="font-size: 10.5px; color: #64748b;">(回路构建中...)</span>';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #0b0f19; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">🔄 有向图一笔画拓扑</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            已遍历有向边: <b style="color: #10b981;">${step.visitedEdges.length}</b> / ${allEdges.length} 条
          </span>
        </div>

        <div style="width: 100%; min-height: 150px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 150px;" viewBox="0 0 310 150">
            <defs>
              <marker id="euler-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
              </marker>
            </defs>
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 底部一笔画轨迹舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">🛤️ 一笔画欧拉回路轨迹舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              当前递归深度: <b>${step.activeStack.length}</b>
            </div>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center;">
            ${circuitBadges}
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const isTriangle = step.headArray.length === 4;
    const slotsCount = isTriangle ? 3 : 4;
    const indices = Array.from({ length: slotsCount }, (_, i) => i + 1);

    const renderRow = (name: string, arr: number[], activeName: string, color: string) => {
      const cells = indices
        .map((idx) => {
          const val = arr[idx] ?? 0;
          const isActive = step.activeArray === activeName && step.activeSlot === idx;
          const bg = isActive ? '#78350f' : '#1e293b';
          const textCol = isActive ? '#fde047' : '#e2e8f0';
          const border = isActive ? '2px solid #eab308' : '1px solid #475569';

          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
              <span style="font-size: 8px; color: #94a3b8; line-height: 1;">N[${idx}]</span>
              <span style="line-height: 1.1;">${val}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 135px; color: ${color};">${name}:</span>
          <div style="display: flex; gap: 4px;">${cells}</div>
        </div>
      `;
    };

    const headRow = renderRow('head[] (当前弧)', step.headArray, 'head', '#38bdf8');
    const degRow = renderRow('outDeg[] (出度)', step.degArray, 'deg', '#f59e0b');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          ${headRow}
          ${degRow}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
            <span style="color: #a855f7; font-size: 10.5px; font-weight: 700;">递归活跃栈:</span>
            <strong style="color: #a855f7; font-family: monospace; font-size: 11px;">[ ${step.activeStack.join(' ➔ ') || '空'} ]</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 2px;">
            <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">后序收集 path:</span>
            <strong style="color: #10b981; font-family: monospace; font-size: 11px;">[ ${step.pathArray.join(', ') || '空'} ]</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'eulerian-circuit',
  name: '欧拉回路 (Eulerian Circuit - Hierholzer)',
  viewId: 'algo-eulerian-circuit-view',
  category: 'graph',
  description: '进阶图论一笔画算法：Hierholzer 深度优先搜索、当前弧删边优化、逆序回溯压栈构造回路 (洛谷 P7771)',
  icon: '🔄',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 66,
  learningGoal: '掌握欧拉回路与欧拉路径存在充要条件、Hierholzer 算法原理及当前弧优化应用',
});

export { Visualizer as EulerianCircuitVisualizer };
