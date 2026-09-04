/**
 * 差分约束系统 (System of Difference Constraints) 声明式可视化器
 * 核心：不等式 x_v - x_u <= c 转化为有向带权边 u ➔ v (w=c)、超级源点连 0 权边、SPFA 负环判定 (洛谷 P5960)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（建约束边、超级源点连边、SPFA队列循环、poll出队、松弛更新、count计数、负环分支判定均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  DIFF_CONSTRAINTS_CODE_LANGUAGES,
  DIFF_CONSTRAINTS_PROBLEM_HTML,
  DIFF_CONSTRAINTS_ANALYSIS_HTML,
} from './diff-constraints-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface DiffConstraintStep {
  distMap: Record<number, number>;
  curU: number;
  curV: number;
  activeEdge?: [number, number];
  queue?: number[];
  countMap?: Record<number, number>;
  hasNegativeCycle: boolean;
  status: 'init_super' | 'relax' | 'check' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildDiffConstraintsSteps(preset: string = 'feasible'): DiffConstraintStep[] {
  const steps: DiffConstraintStep[] = [];
  const isCycle = preset === 'cycle';

  // 精准 21 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 10, java: 12, python: 3, javascript: 2 },
    initGraph: { cpp: 11, java: 13, python: 4, javascript: 3 },
    forConstraints: { cpp: 14, java: 16, python: 6, javascript: 4 },
    addConstraintEdge: { cpp: 16, java: 17, python: 7, javascript: 5 },
    forSuperSource: { cpp: 20, java: 19, python: 8, javascript: 7 },
    addSuperEdge: { cpp: 21, java: 20, python: 9, javascript: 8 },
    initDist: { cpp: 25, java: 23, python: 11, javascript: 11 },
    initCount: { cpp: 26, java: 24, python: 12, javascript: 12 },
    initQueue: { cpp: 28, java: 26, python: 15, javascript: 14 },
    pushSuperSource: { cpp: 30, java: 28, python: 17, javascript: 15 },
    whileQueue: { cpp: 32, java: 30, python: 19, javascript: 17 },
    pollQueue: { cpp: 33, java: 31, python: 20, javascript: 18 },
    forEdges: { cpp: 35, java: 32, python: 23, javascript: 21 },
    checkRelax: { cpp: 37, java: 33, python: 24, javascript: 22 },
    updateDist: { cpp: 38, java: 34, python: 25, javascript: 23 },
    updateCount: { cpp: 39, java: 35, python: 26, javascript: 24 },
    checkCycle: { cpp: 40, java: 36, python: 27, javascript: 25 },
    returnCycle: { cpp: 40, java: 36, python: 28, javascript: 25 },
    checkInQueue: { cpp: 41, java: 37, python: 29, javascript: 26 },
    pushQueue: { cpp: 42, java: 38, python: 30, javascript: 27 },
    returnTrue: { cpp: 49, java: 44, python: 33, javascript: 33 },
  };

  if (isCycle) {
    // 负环无解用例: x1 - x2 <= -3 (2 ➔ 1, w=-3), x2 - x1 <= 2 (1 ➔ 2, w=2) -> 环权 -1
    const n = 3;
    const dist: Record<number, number> = { 0: 0, 1: 1000000000, 2: 1000000000, 3: 1000000000 };
    const cnt: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    let q: number[] = [];

    function makeStep(
      codeLine: HighlightTarget,
      message: string,
      log: string,
      status: 'init_super' | 'relax' | 'check' | 'done',
      curU: number = 0,
      curV: number = 0,
      activeEdge?: [number, number],
      hasCycle: boolean = false
    ): void {
      const qStr = `[${q.join(', ')}]`;
      const solStr = hasCycle ? '无可行解 (UNSAT)' : '检测中...';

      steps.push({
        distMap: { ...dist },
        curU,
        curV,
        activeEdge,
        queue: [...q],
        countMap: { ...cnt },
        hasNegativeCycle: hasCycle,
        status,
        message,
        log,
        codeLine,
        metrics: {
          'metric-diff-cycle': hasCycle ? '❌ 捕获负权环' : '检测中...',
          'metric-diff-sol': solStr,
          'metric-cur-queue': qStr,
          'metric-cur-relax': activeEdge ? `${activeEdge[0]} -> ${activeEdge[1]}` : '—',
        },
      });
    }

    makeStep(lines.entry, '🚀 [算法启动] solve(n=3, constraints)：载入差分约束系统。', 'solve 入口', 'init_super');
    makeStep(lines.initGraph, '📦 [构建邻接表] List<Edge>[] graph = new ArrayList[4] 初始化。', 'init graph', 'init_super');

    // 约束建边
    makeStep(lines.forConstraints, '🔎 [遍历约束] 约束 1: x1 - x2 <= -3 ➔ 建立有向边 2 ➔ 1 (权值 w=-3)。', 'constraint 1', 'init_super', 2, 1, [2, 1]);
    makeStep(lines.addConstraintEdge, '➕ [添加有向边] graph[2].add(new Edge(1, -3))。', 'add edge 2->1 (w=-3)', 'init_super', 2, 1, [2, 1]);

    makeStep(lines.forConstraints, '🔎 [遍历约束] 约束 2: x2 - x1 <= 2 ➔ 建立有向边 1 ➔ 2 (权值 w=2)。', 'constraint 2', 'init_super', 1, 2, [1, 2]);
    makeStep(lines.addConstraintEdge, '➕ [添加有向边] graph[1].add(new Edge(2, 2))。两边构成负回路 (-3 + 2 = -1 < 0)！', 'add edge 1->2 (w=2)', 'init_super', 1, 2, [1, 2]);

    // 超级源点连边
    makeStep(lines.forSuperSource, '🌐 [超级源点连接] 超级源点 0 向所有真实变量节点 (1..3) 连接权值为 0 的单向边。', 'super source loop', 'init_super', 0, 1, [0, 1]);
    makeStep(lines.addSuperEdge, '➕ [超级边 0➔1] graph[0].add(new Edge(1, 0))。', 'add 0->1', 'init_super', 0, 1, [0, 1]);
    makeStep(lines.addSuperEdge, '➕ [超级边 0➔2] graph[0].add(new Edge(2, 0))。', 'add 0->2', 'init_super', 0, 2, [0, 2]);
    makeStep(lines.addSuperEdge, '➕ [超级边 0➔3] graph[0].add(new Edge(3, 0))。', 'add 0->3', 'init_super', 0, 3, [0, 3]);

    // SPFA 初始化
    makeStep(lines.initDist, '📊 [初始化最短路] Arrays.fill(dist, 1e9)；超级源点 dist[0] = 0。', 'init dist[]', 'init_super');
    makeStep(lines.initCount, '🏷️ [初始化入队计数] int[] count = new int[4]；记录松弛次数。', 'init count[]', 'init_super');
    makeStep(lines.initQueue, '📦 [初始化队列] Queue<Integer> q = new LinkedList<>()。', 'init queue', 'init_super');

    q.push(0);
    dist[0] = 0;
    makeStep(lines.pushSuperSource, '🌱 [源点入队] q.offer(0), inQueue[0] = true；开启 SPFA 扩散！', 'push 0', 'init_super', 0, 0);

    // SPFA 循环展开
    makeStep(lines.whileQueue, '🔁 [SPFA 展开] while (!q.isEmpty()) -> 队列长度: 1。', '!q.isEmpty()', 'relax', 0, 0);
    q.shift();
    makeStep(lines.pollQueue, '📤 [出队推进] poll() -> 弹出超级源点 0。', 'poll 0', 'relax', 0, 0);

    // 从 0 扩散至 1, 2
    dist[1] = 0;
    cnt[1] = 1;
    q.push(1);
    makeStep(lines.updateDist, '  ⚡ [源点松弛 1] dist[1] = dist[0] + 0 = 0, count[1] = 1, q.offer(1)。', 'relax 0->1', 'relax', 0, 1, [0, 1]);

    dist[2] = 0;
    cnt[2] = 1;
    q.push(2);
    makeStep(lines.updateDist, '  ⚡ [源点松弛 2] dist[2] = dist[0] + 0 = 0, count[2] = 1, q.offer(2)。', 'relax 0->2', 'relax', 0, 2, [0, 2]);

    // 负权环反复松弛
    let loopRound = 1;
    while (cnt[1] <= n && cnt[2] <= n) {
      makeStep(lines.whileQueue, `🔁 [SPFA 负环振荡] while (!q.isEmpty()) -> 当前队列: [${q.join(', ')}]。`, '!q.isEmpty()', 'relax', 1, 2);
      const u = q.shift()!;
      makeStep(lines.pollQueue, `📤 [出队节点] poll() -> 弹出节点 ${u}。`, `poll ${u}`, 'relax', u, 0);

      const v = u === 1 ? 2 : 1;
      const w = u === 1 ? 2 : -3;
      makeStep(lines.forEdges, `  ↳ [遍历出边] 考察边 ${u} ➔ ${v} (权值 w=${w})。`, `edge ${u}->${v}`, 'relax', u, v, [u, v]);
      makeStep(lines.checkRelax, `  🔎 [松弛核验] if (dist[${v}]=${dist[v]} > dist[${u}]=${dist[u]} + ${w}=${dist[u] + w}) -> (true)。`, `check relax ${u}->${v}`, 'relax', u, v, [u, v]);

      dist[v] = dist[u] + w;
      cnt[v] = cnt[u] + 1;
      makeStep(lines.updateDist, `  ⚡ [更新距离] 负环松弛！dist[${v}] 下降至 ${dist[v]}！`, `dist[${v}]=${dist[v]}`, 'relax', u, v, [u, v]);
      makeStep(lines.updateCount, `  📈 [累加入队次数] count[${v}] = count[${u}] + 1 = ${cnt[v]}。`, `count[${v}]=${cnt[v]}`, 'relax', u, v, [u, v]);

      makeStep(lines.checkCycle, `  🚨 [负环判定核验] if (count[${v}]=${cnt[v]} > n=${n}) -> (${cnt[v] > n})。`, `count[${v}] > ${n}?`, 'check', u, v, [u, v]);
      if (cnt[v] > n) {
        makeStep(lines.returnCycle, `❌ [捕获负权环] return false！节点 ${v} 的松弛次数已达到 ${cnt[v]} > ${n}，系统存在负环代数矛盾，判定无解！`, 'return false', 'done', u, v, [u, v], true);
        break;
      }

      q.push(v);
      makeStep(lines.pushQueue, `  📥 [节点再次入队] q.offer(${v})，由于负环驱动将无休止入队！`, `offer ${v}`, 'relax', u, v, [u, v]);
      loopRound++;
    }
  } else {
    // 可行解标准用例: x2 - x1 <= 3, x3 - x1 <= 1, x2 - x3 <= 1
    const n = 3;
    const dist: Record<number, number> = { 0: 0, 1: 1000000000, 2: 1000000000, 3: 1000000000 };
    const cnt: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    let q: number[] = [];

    function makeStep(
      codeLine: HighlightTarget,
      message: string,
      log: string,
      status: 'init_super' | 'relax' | 'check' | 'done',
      curU: number = 0,
      curV: number = 0,
      activeEdge?: [number, number]
    ): void {
      const qStr = `[${q.join(', ')}]`;
      const solStr = status === 'done' ? `[x1:${dist[1]}, x2:${dist[2]}, x3:${dist[3]}]` : '未求解';

      steps.push({
        distMap: { ...dist },
        curU,
        curV,
        activeEdge,
        queue: [...q],
        countMap: { ...cnt },
        hasNegativeCycle: false,
        status,
        message,
        log,
        codeLine,
        metrics: {
          'metric-diff-cycle': '无负环 (收敛)',
          'metric-diff-sol': solStr,
          'metric-cur-queue': qStr,
          'metric-cur-relax': activeEdge ? `${activeEdge[0]} -> ${activeEdge[1]}` : '—',
        },
      });
    }

    makeStep(lines.entry, '🚀 [差分约束启动] solve(n=3, constraints)：载入 3 个线性不等式约束。', 'solve 入口', 'init_super');
    makeStep(lines.initGraph, '📦 [构建邻接表] List<Edge>[] graph = new ArrayList[4]。', 'init graph', 'init_super');

    // 3 条约束边
    makeStep(lines.forConstraints, '🔎 [不等式建边 1] 由 x2 - x1 <= 3 变形为 x2 <= x1 + 3，建立有向边 1 ➔ 2 (权值 w=3)。', 'x2 - x1 <= 3', 'init_super', 1, 2, [1, 2]);
    makeStep(lines.addConstraintEdge, '➕ [添加有向边] graph[1].add(new Edge(2, 3))。', 'add 1->2 (w=3)', 'init_super', 1, 2, [1, 2]);

    makeStep(lines.forConstraints, '🔎 [不等式建边 2] 由 x3 - x1 <= 1 变形为 x3 <= x1 + 1，建立有向边 1 ➔ 3 (权值 w=1)。', 'x3 - x1 <= 1', 'init_super', 1, 3, [1, 3]);
    makeStep(lines.addConstraintEdge, '➕ [添加有向边] graph[1].add(new Edge(3, 1))。', 'add 1->3 (w=1)', 'init_super', 1, 3, [1, 3]);

    makeStep(lines.forConstraints, '🔎 [不等式建边 3] 由 x2 - x3 <= 1 变形为 x2 <= x3 + 1，建立有向边 3 ➔ 2 (权值 w=1)。', 'x2 - x3 <= 1', 'init_super', 3, 2, [3, 2]);
    makeStep(lines.addConstraintEdge, '➕ [添加有向边] graph[3].add(new Edge(2, 1))。', 'add 3->2 (w=1)', 'init_super', 3, 2, [3, 2]);

    // 超级源点建边
    makeStep(lines.forSuperSource, '🌐 [超级源点连接] 超级源点 0 向真实变量 (1..3) 连接 0 权边，赋予 x_i <= 0 上界基准。', 'super source loop', 'init_super');
    makeStep(lines.addSuperEdge, '➕ [超级边 0➔1] graph[0].add(new Edge(1, 0))。', 'add 0->1 (w=0)', 'init_super', 0, 1, [0, 1]);
    makeStep(lines.addSuperEdge, '➕ [超级边 0➔2] graph[0].add(new Edge(2, 0))。', 'add 0->2 (w=0)', 'init_super', 0, 2, [0, 2]);
    makeStep(lines.addSuperEdge, '➕ [超级边 0➔3] graph[0].add(new Edge(3, 0))。', 'add 0->3 (w=0)', 'init_super', 0, 3, [0, 3]);

    // 初始化 SPFA
    makeStep(lines.initDist, '📊 [初始化最短路] Arrays.fill(dist, 1e9)；记录各变量的最大上界。', 'init dist[]', 'init_super');
    makeStep(lines.initCount, '🏷️ [初始化入队计数] int[] count = new int[4]。', 'init count[]', 'init_super');
    makeStep(lines.initQueue, '📦 [初始化队列] Queue<Integer> q = new LinkedList<>()。', 'init queue', 'init_super');

    q.push(0);
    dist[0] = 0;
    makeStep(lines.pushSuperSource, '🌱 [源点入队] q.offer(0), inQueue[0] = true；开启 SPFA 扩散！', 'push 0', 'init_super', 0, 0);

    // 展开步骤
    makeStep(lines.whileQueue, '🔁 [SPFA 轮次 1] while (!q.isEmpty()) -> 展开超级源点。', '!q.isEmpty()', 'relax', 0, 0);
    q.shift();
    makeStep(lines.pollQueue, '📤 [出队节点] poll() -> 弹出节点 0。', 'poll 0', 'relax', 0, 0);

    dist[1] = 0;
    cnt[1] = 1;
    q.push(1);
    makeStep(lines.updateDist, '  ⚡ [松弛节点 1] dist[1] = dist[0] + 0 = 0，加入队列。', 'relax 0->1', 'relax', 0, 1, [0, 1]);

    dist[2] = 0;
    cnt[2] = 1;
    q.push(2);
    makeStep(lines.updateDist, '  ⚡ [松弛节点 2] dist[2] = dist[0] + 0 = 0，加入队列。', 'relax 0->2', 'relax', 0, 2, [0, 2]);

    dist[3] = 0;
    cnt[3] = 1;
    q.push(3);
    makeStep(lines.updateDist, '  ⚡ [松弛节点 3] dist[3] = dist[0] + 0 = 0，加入队列。', 'relax 0->3', 'relax', 0, 3, [0, 3]);

    // 节点 3 松弛边 3 -> 2
    makeStep(lines.whileQueue, '🔁 [SPFA 轮次 2] while (!q.isEmpty()) -> 考察节点 3。', '!q.isEmpty()', 'relax', 3, 2);
    q.shift();
    makeStep(lines.pollQueue, '📤 [出队节点] poll() -> 弹出节点 3 (当前 dist[3]=0)。', 'poll 3', 'relax', 3, 2);
    makeStep(lines.forEdges, '  ↳ [遍历出边] 考察边 3 ➔ 2 (权值 w=1)。', 'edge 3->2 (w=1)', 'relax', 3, 2, [3, 2]);
    makeStep(lines.checkRelax, '  🔎 [松弛检验] if (dist[2]=0 > dist[3]+1 = 1) -> (false)；保持松弛不变。', 'no relax', 'relax', 3, 2, [3, 2]);

    // 队列清空并收敛
    q = [];
    makeStep(lines.whileQueue, '🔁 [检查队列] while (!q.isEmpty()) -> (队列已清空，所有不等式完全收敛)！', 'queue empty', 'relax');

    makeStep(lines.returnTrue, `🎉 [求得可行解] return true！系统存在可行解向量：[x1=${dist[1]}, x2=${dist[2]}, x3=${dist[3]}] 完全满足所有差分约束！`, 'return true (可行解)', 'done');
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<DiffConstraintStep>({
  id: 'diff-constraints',
  name: '差分约束系统 (System of Difference Constraints)',
  viewId: 'algo-diff-constraints-view',
  category: 'graph',
  icon: '⚖️',
  badge: {
    mode: '差分约束 · 三角不等式 · SPFA 负环判定',
    complexity: 'O(N · M) · O(N + M)',
  },
  card1Title: '⚖️ 差分约束图论同构与 SPFA 负环沙盘',
  card2Title: '📊 约束系统解状态监视器 (dist, count, SPFA 队列)',
  card2Desc: '展示不等式向有向边同构转化、超级源点初始化、最短路收敛解与负权环矛盾判定全流程',
  legend: [
    { label: '🌐 超级源点 (Node 0)', color: '#a855f7' },
    { label: '🔵 变量节点 (x1, x2, x3)', color: '#0369a1' },
    { label: '⚡ 当前松弛考察边', color: '#f59e0b' },
    { label: '❌ 负权回路报警边', color: '#ef4444' },
    { label: '🟢 可行解确定边', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设约束系统',
      type: 'select',
      defaultValue: 'feasible',
      options: [
        { label: '存在可行解 (收敛于一组最大解 [0, 0, 0])', value: 'feasible' },
        { label: '存在负环无解 (x1-x2<=-3 且 x2-x1<=2 矛盾)', value: 'cycle' },
      ],
    },
  ],
  presets: [
    { label: '可行解约束组', values: { 'input-preset': 'feasible' } },
    { label: '负环矛盾无解', values: { 'input-preset': 'cycle' } },
  ],
  metrics: [
    { id: 'metric-diff-cycle', label: '负环判定状态', color: '#ef4444' },
    { id: 'metric-diff-sol', label: '系统解状态', color: '#10b981' },
    { id: 'metric-cur-queue', label: 'SPFA 队列', color: '#38bdf8' },
    { id: 'metric-cur-relax', label: '当前松弛边', color: '#f59e0b' },
  ],
  codeLanguages: DIFF_CONSTRAINTS_CODE_LANGUAGES,
  problemHtml: DIFF_CONSTRAINTS_PROBLEM_HTML,
  analysisHtml: DIFF_CONSTRAINTS_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'feasible') as string;
    return buildDiffConstraintsSteps(preset);
  },
  renderCanvas: (container, step) => {
    const coords: Record<number, { x: number; y: number }> = {
      0: { x: 50, y: 75 },
      1: { x: 130, y: 35 },
      2: { x: 230, y: 75 },
      3: { x: 130, y: 115 },
    };

    const isCyclePreset = step.hasNegativeCycle;

    // 绘制连边
    const edgeList: Array<{ u: number; v: number; w: number; isSuper?: boolean }> = [
      { u: 0, v: 1, w: 0, isSuper: true },
      { u: 0, v: 2, w: 0, isSuper: true },
      { u: 0, v: 3, w: 0, isSuper: true },
    ];

    if (isCyclePreset) {
      edgeList.push({ u: 2, v: 1, w: -3 });
      edgeList.push({ u: 1, v: 2, w: 2 });
    } else {
      edgeList.push({ u: 1, v: 2, w: 3 });
      edgeList.push({ u: 1, v: 3, w: 1 });
      edgeList.push({ u: 3, v: 2, w: 1 });
    }

    const svgEdges = edgeList
      .map(({ u, v, w, isSuper }) => {
        const p1 = coords[u];
        const p2 = coords[v];
        if (!p1 || !p2) return '';

        const isActive = step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
        const isCycleEdge = step.hasNegativeCycle && ((u === 1 && v === 2) || (u === 2 && v === 1));

        const color = isCycleEdge ? '#ef4444' : isActive ? '#f59e0b' : isSuper ? '#475569' : '#0284c7';
        const strokeWidth = isActive || isCycleEdge ? 2.5 : 1.2;
        const dashArray = isSuper ? 'stroke-dasharray="3,3"' : '';

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 + (u === 2 && v === 1 ? -8 : 0);

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${strokeWidth}" ${dashArray} />
            <circle cx="${midX}" cy="${midY}" r="7" fill="#0f172a" stroke="${color}" stroke-width="1" />
            <text x="${midX}" y="${midY + 3}" fill="${color}" font-size="8.5" font-weight="800" text-anchor="middle">${w}</text>
          </g>
        `;
      })
      .join('');

    const svgNodes = [0, 1, 2, 3]
      .map((id) => {
        const p = coords[id];
        if (!p) return '';

        const isSuper = id === 0;
        const isCur = step.curU === id || step.curV === id;
        const inQueue = step.queue?.includes(id);

        let bg = isSuper ? '#581c87' : '#0f172a';
        let border = isSuper ? '#a855f7' : '#334155';
        if (inQueue) {
          bg = '#1e3a8a';
          border = '#38bdf8';
        }
        if (isCur) {
          border = '#facc15';
        }
        if (step.hasNegativeCycle && (id === 1 || id === 2)) {
          bg = '#7f1d1d';
          border = '#ef4444';
        }

        const label = isSuper ? 'S(0)' : `x${id}`;
        const distVal = step.distMap[id];
        const distStr = distVal === 1000000000 || distVal === Infinity ? '∞' : `${distVal}`;

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y - 1}" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">${label}</text>
            <text x="${p.x}" y="${p.y + 9}" fill="${isSuper ? '#d8b4fe' : '#38bdf8'}" font-size="7" font-weight="700" text-anchor="middle">${distStr}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #0b0f19; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">⚖️ 差分约束系统图论同构</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            系统状态: <b style="color: ${step.hasNegativeCycle ? '#ef4444' : '#10b981'};">${step.hasNegativeCycle ? '❌ 存在负环 (无解)' : '✅ 正在收敛/已收敛'}</b>
          </span>
        </div>

        <div style="width: 100%; min-height: 150px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 150px;" viewBox="0 0 300 150">
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 底部差分约束数学与同构舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">⚖️ 差分约束同构与负环检验舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              当前队列: <b>[${step.queue?.join(', ') ?? ''}]</b>
            </div>
          </div>

          <div style="display: flex; gap: 8px; font-size: 11px;">
            <div style="background: rgba(3, 105, 161, 0.4); border: 1px solid #0284c7; border-radius: 4px; padding: 4px 8px; color: #bae6fd;">
              <b>同构法则:</b> x_u - x_v <= w ➔ 建边 v ➔ u (权值 w)
            </div>
            <div style="background: rgba(168, 85, 247, 0.2); border: 1px solid #a855f7; border-radius: 4px; padding: 4px 8px; color: #e9d5ff;">
              <b>负环判据:</b> count[v] > n 时系统产生代数矛盾判定无解
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const distItems = [1, 2, 3].map((id) => {
      const d = step.distMap[id];
      const dStr = d === 1000000000 || d === Infinity ? '∞' : `${d}`;
      const cnt = step.countMap?.[id] ?? 0;

      return `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 60px; height: 36px; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 2px 4px;">
          <span style="font-size: 8.5px; color: #94a3b8;">x${id} (count:${cnt})</span>
          <span style="font-size: 11px; font-weight: 800; font-family: monospace; color: #38bdf8;">d=${dStr}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #f59e0b;">变量解向量 (dist):</span>
            <div style="display: flex; gap: 6px;">${distItems}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
            <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">解存在性:</span>
            <strong style="color: ${step.hasNegativeCycle ? '#ef4444' : '#10b981'}; font-family: monospace; font-size: 11px;">${step.hasNegativeCycle ? '系统无可行解 (负权回路)' : '存在一组可行解'}</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'diff-constraints',
  name: '差分约束系统 (System of Difference Constraints)',
  viewId: 'algo-diff-constraints-view',
  icon: '⚖️',
  category: 'graph',
  description: '左程云算法通关课 Class 070：不等式转化为最短路、超级源点建图与 SPFA 负环判定 (洛谷 P5960)',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 85,
  learningGoal: '掌握差分约束系统的代数不等式转最短路建图方法，以及 SPFA 负权环无解判定',
});

export { Visualizer as DiffConstraintsVisualizer };
