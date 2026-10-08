import { StepBase } from '../../../core/step-visualizer';
import { HighlightTarget } from '../../../core/code-panel';

export interface NCStep extends StepBase {
  dist: number[];
  round: number;
  maxRounds: number;
  currentEdge: { u: number; v: number; w: number } | null;
  relaxedEdge: boolean;
  relaxCount: number;
  hasCycle: boolean;
  cycleEdges: { u: number; v: number; w: number }[];
  action: 'init' | 'relax-success' | 'relax-skip' | 'round-done' | 'cycle-detected' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const NC_EDGES = [
  { u: 0, v: 1, w: 2 },
  { u: 1, v: 2, w: -3 },
  { u: 2, v: 3, w: 1 },
  { u: 3, v: 1, w: -1 },
  { u: 0, v: 3, w: 5 },
  { u: 3, v: 4, w: 2 },
];

export const NC_NODES = [0, 1, 2, 3, 4];
export const NC_NODE_POS = [
  { x: 60, y: 130 },
  { x: 180, y: 60 },
  { x: 320, y: 60 },
  { x: 250, y: 190 },
  { x: 400, y: 150 },
];

export function buildNCSteps(): NCStep[] {
  const steps: NCStep[] = [];
  const n = NC_NODES.length;
  const INF = 999999;

  // 精准 13 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 3, java: 2, python: 2, javascript: 1 },
    initDist: { cpp: 5, java: 4, python: 3, javascript: 3 },
    setSrc: { cpp: 6, java: 5, python: 4, javascript: 4 },
    forRound: { cpp: 7, java: 7, python: 5, javascript: 5 },
    forEdge: { cpp: 8, java: 8, python: 6, javascript: 6 },
    unpackEdge: { cpp: 9, java: 9, python: 6, javascript: 6 },
    checkRelax: { cpp: 10, java: 10, python: 7, javascript: 7 },
    updateDist: { cpp: 11, java: 11, python: 8, javascript: 8 },
    forCheckRound: { cpp: 15, java: 14, python: 9, javascript: 12 },
    unpackCheckEdge: { cpp: 16, java: 15, python: 9, javascript: 12 },
    checkCycleRelax: { cpp: 17, java: 16, python: 10, javascript: 13 },
    returnTrue: { cpp: 18, java: 17, python: 11, javascript: 14 },
    returnFalse: { cpp: 21, java: 20, python: 12, javascript: 17 },
  };

  const dist = new Array(n).fill(INF);
  dist[0] = 0;
  let totalRelax = 0;

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'relax-success' | 'relax-skip' | 'round-done' | 'cycle-detected' | 'done',
    statusText: string,
    log: string,
    round: number,
    currentEdge: { u: number; v: number; w: number } | null = null,
    relaxedEdge: boolean = false,
    hasCycle: boolean = false,
    cycleEdges: { u: number; v: number; w: number }[] = []
  ): void {
    const dStr = dist.map((d, idx) => `${idx}:${d >= INF ? '∞' : d}`).join(', ');

    steps.push({
      dist: [...dist],
      round,
      maxRounds: n,
      currentEdge,
      relaxedEdge,
      relaxCount: totalRelax,
      hasCycle,
      cycleEdges,
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-nc-round': `${round} / ${n}`,
        'metric-nc-edge': currentEdge ? `(${currentEdge.u}➔${currentEdge.v}, w=${currentEdge.w})` : '—',
        'metric-nc-cycle': hasCycle ? '❌ 检测到负权回路' : '检测中...',
        'metric-nc-dist': `[${dStr}]`,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] hasNegativeCycle(n=5, edges, src=0)：启动负权回路检测算法。', 'hasNegativeCycle 入口', 0);
  makeStep(lines.initDist, 'init', '📊 [初始化距离数组] int[] dist = new int[5]; Arrays.fill(dist, INF)。', 'Arrays.fill(dist, INF)', 0);

  dist[0] = 0;
  makeStep(lines.setSrc, 'init', '🌱 [设置源点距离] dist[0] = 0；从源点 0 开始展开最短路径。', 'dist[0] = 0', 0);

  // 2. 前 n - 1 轮常规松弛
  for (let round = 1; round <= n - 1; round++) {
    makeStep(lines.forRound, 'round-done', `🔁 [轮次循环] for (i = ${round}; i <= ${n - 1}; i++)：开始第 ${round} / ${n - 1} 轮全边遍历。`, `--- 第 ${round} 轮常规松弛 ---`, round);

    for (let ei = 0; ei < NC_EDGES.length; ei++) {
      const e = NC_EDGES[ei];
      makeStep(lines.forEdge, 'relax-skip', `🔎 [考察边] 遍历边 (${e.u} ➔ ${e.v}, 权值 w=${e.w})。`, `edge (${e.u}->${e.v}, w=${e.w})`, round, e);
      makeStep(lines.unpackEdge, 'relax-skip', `  ↳ [解构边元] u=${e.u}, v=${e.v}, w=${e.w}。`, `u=${e.u}, v=${e.v}, w=${e.w}`, round, e);

      const canRelax = dist[e.u] !== INF && dist[e.u] + e.w < dist[e.v];
      makeStep(lines.checkRelax, canRelax ? 'relax-success' : 'relax-skip', `  🔎 [松弛核验] if (dist[${e.u}](${dist[e.u] >= INF ? '∞' : dist[e.u]}) + ${e.w} < dist[${e.v}](${dist[e.v] >= INF ? '∞' : dist[e.v]})) -> (${canRelax})。`, `check (${e.u}->${e.v})`, round, e);

      if (canRelax) {
        const oldVal = dist[e.v];
        dist[e.v] = dist[e.u] + e.w;
        totalRelax++;
        makeStep(lines.updateDist, 'relax-success', `  ⚡ [更新距离] 成功松弛！dist[${e.v}] 从 ${oldVal >= INF ? '∞' : oldVal} 缩短为 ${dist[e.v]}！`, `dist[${e.v}]=${dist[e.v]}`, round, e, true);
      } else {
        makeStep(lines.checkRelax, 'relax-skip', `  ⏭️ [跳过边] 边 (${e.u} ➔ ${e.v}) 不满足严格缩短条件。`, `skip (${e.u}->${e.v})`, round, e);
      }
    }

    makeStep(lines.forRound, 'round-done', `✓ [轮次完成] 完成第 ${round} 轮松弛迭代，累计松弛 ${totalRelax} 次。`, `round ${round} done`, round);
  }

  // 3. 第 n 轮额外检测负权回路
  makeStep(lines.forCheckRound, 'round-done', `🚨 [第 N 轮额外检测] 启动第 ${n} 轮额外扫描！若此时仍有边能被松弛，说明存在负权回路！`, `--- 第 ${n} 轮负环判定 ---`, n);

  let cycleFound = false;
  const cycleEdges: { u: number; v: number; w: number }[] = [];

  for (let ei = 0; ei < NC_EDGES.length; ei++) {
    const e = NC_EDGES[ei];
    makeStep(lines.forCheckRound, 'relax-skip', `🔎 [核验边] 第 ${n} 轮复验边 (${e.u} ➔ ${e.v}, w=${e.w})。`, `check edge (${e.u}->${e.v})`, n, e);
    makeStep(lines.unpackCheckEdge, 'relax-skip', `  ↳ [解构边元] u=${e.u}, v=${e.v}, w=${e.w}。`, `u=${e.u}, v=${e.v}, w=${e.w}`, n, e);

    const stillCanRelax = dist[e.u] !== INF && dist[e.u] + e.w < dist[e.v];
    makeStep(lines.checkCycleRelax, stillCanRelax ? 'cycle-detected' : 'relax-skip', `  🔎 [负环松弛核验] if (dist[${e.u}] + ${e.w} < dist[${e.v}]) -> (${stillCanRelax})。`, `cycle relax check (${e.u}->${e.v})`, n, e);

    if (stillCanRelax) {
      cycleFound = true;
      cycleEdges.push(e);
      makeStep(lines.returnTrue, 'cycle-detected', `⚠️ [捕获负权回路] return true！第 ${n} 轮边 (${e.u} ➔ ${e.v}) 依然能被松弛！图中存在负权回路（环权和 < 0），最短路无下界！`, 'return true (负环成立)', n, e, true, true, [...cycleEdges]);
      break;
    }
  }

  if (!cycleFound) {
    makeStep(lines.returnFalse, 'done', '🎉 [检测完成] return false！第 n 轮无任何边能继续松弛，图中无负权回路，最短路完全收敛！', 'return false (无负环)', n);
  }

  return steps;
}
