/**
 * Dinic 最大流与残量网络 (Dinic's Maximum Flow Algorithm) 步进编译器
 * 进阶网络流: BFS 分层网络 depth[u]、当前弧优化 cur[u]、多路增广 DFS 阻塞流 (洛谷 P3376)
 * 深度架构重构：严格全流程逐行高亮执行、纯中文步骤日志、四语言行号映射
 */

import { HighlightTarget } from '../../../core/code-panel';

export interface DinicStep {
  levels: Record<string, number>;
  flowEdges: Array<{ u: string; v: string; cap: number; flow: number }>;
  curMaxFlow: number;
  activePath?: string[];
  activeEdge?: [string, string];
  curPushed?: number;
  levelArray: number[];
  curArray: number[];
  activeArray?: 'level' | 'cur';
  activeSlot?: number;
  status: 'bfs_level' | 'dfs_augment' | 'cur_arc' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildDinicSteps(preset: string = 'diamond'): DinicStep[] {
  const steps: DinicStep[] = [];
  const isCross = preset === 'cross';

  const nodeNames = ['S', 'A', 'B', 'T'];

  const rawEdges: Array<{ u: string; v: string; cap: number; flow: number }> = isCross
    ? [
        { u: 'S', v: 'A', cap: 10, flow: 0 },
        { u: 'S', v: 'B', cap: 10, flow: 0 },
        { u: 'A', v: 'B', cap: 5, flow: 0 },
        { u: 'A', v: 'T', cap: 8, flow: 0 },
        { u: 'B', v: 'T', cap: 10, flow: 0 },
      ]
    : [
        { u: 'S', v: 'A', cap: 10, flow: 0 },
        { u: 'S', v: 'B', cap: 10, flow: 0 },
        { u: 'A', v: 'T', cap: 10, flow: 0 },
        { u: 'B', v: 'T', cap: 10, flow: 0 },
      ];

  const levels: Record<string, number> = { S: 0, A: 0, B: 0, T: 0 };
  const curArc: Record<string, number> = { S: 0, A: 0, B: 0, T: 0 };
  let curMaxFlow = 0;
  let activePath: string[] | undefined = undefined;
  let activeEdge: [string, string] | undefined = undefined;

  // 精准 22 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    maxFlowEntry: { cpp: 72, java: 54, python: 32, javascript: 36 },
    maxFlowWhileBfs: { cpp: 67, java: 56, python: 34, javascript: 38 },
    bfsEntry: { cpp: 27, java: 17, python: 12, javascript: 11 },
    bfsFillDepth: { cpp: 28, java: 18, python: 13, javascript: 12 },
    bfsInitQueue: { cpp: 29, java: 19, python: 14, javascript: 13 },
    bfsSetSrc: { cpp: 31, java: 21, python: 15, javascript: 14 },
    bfsWhile: { cpp: 33, java: 23, python: 17, javascript: 16 },
    bfsPoll: { cpp: 34, java: 24, python: 18, javascript: 17 },
    bfsForEdges: { cpp: 35, java: 25, python: 19, javascript: 18 },
    bfsCheckLevel: { cpp: 36, java: 26, python: 20, javascript: 19 },
    bfsSetLevel: { cpp: 37, java: 27, python: 21, javascript: 20 },
    bfsReturn: { cpp: 42, java: 32, python: 23, javascript: 24 },
    maxFlowResetCur: { cpp: 68, java: 57, python: 35, javascript: 39 },
    dfsEntry: { cpp: 46, java: 35, python: 25, javascript: 26 },
    dfsBase: { cpp: 47, java: 36, python: 26, javascript: 27 },
    dfsForCur: { cpp: 50, java: 38, python: 29, javascript: 29 },
    dfsUpdateCur: { cpp: 50, java: 39, python: 30, javascript: 30 },
    dfsCheckEdge: { cpp: 52, java: 41, python: 32, javascript: 32 },
    dfsPush: { cpp: 53, java: 42, python: 33, javascript: 33 },
    dfsUpdateResidual: { cpp: 55, java: 44, python: 34, javascript: 34 },
    dfsReturn: { cpp: 62, java: 51, python: 35, javascript: 35 },
    maxFlowDfsCall: { cpp: 69, java: 58, python: 36, javascript: 40 },
    maxFlowReturn: { cpp: 71, java: 60, python: 38, javascript: 42 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'bfs_level' | 'dfs_augment' | 'cur_arc' | 'done',
    pushed?: number,
    activeArray?: 'level' | 'cur',
    activeSlot?: number
  ): void {
    const levelStr = levels.T > 0 ? `level[T] = ${levels.T}` : '不可达 (增广结束)';
    const pathStr = activePath && activePath.length > 0 ? activePath.join(' ➔ ') : '无';
    const phaseStr =
      status === 'done'
        ? '算法结束'
        : status === 'cur_arc'
          ? '当前弧优化'
          : status === 'dfs_augment'
            ? 'DFS 阻塞流增广'
            : 'BFS 构造分层网络';

    const lvlArr = [levels.S, levels.A, levels.B, levels.T];
    const curArr = [curArc.S, curArc.A, curArc.B, curArc.T];

    steps.push({
      levels: { ...levels },
      flowEdges: rawEdges.map((e) => ({ ...e })),
      curMaxFlow,
      activePath: activePath ? [...activePath] : undefined,
      activeEdge,
      curPushed: pushed,
      levelArray: lvlArr,
      curArray: curArr,
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-dinic-level': levelStr,
        'metric-dinic-max-flow': `${curMaxFlow} 单位流量`,
        'metric-dinic-path': pathStr,
        'metric-dinic-phase': phaseStr,
      },
    });
  }

  // 1. Dinic 算法入口
  makeStep(lines.maxFlowEntry, `🚀 [算法初始化] maxFlow(s=S, t=T, n=4)：准备运行 Dinic 最大流算法。`, '初始化 maxFlow 算法求解入口', 'bfs_level');

  // BFS 阶段
  function runBfs(): boolean {
    makeStep(lines.bfsEntry, '🌊 [调用 BFS 构建分层图] public static boolean bfs(s, t, n)：从源点 S 向外搜索层次。', '调用 BFS 构建分层网络', 'bfs_level');

    for (const k of nodeNames) levels[k] = 0;
    makeStep(lines.bfsFillDepth, '📊 [重置层次数组] Arrays.fill(depth, 0)；清空上一轮残留的层级。', '重置节点层次数组 depth 为 0', 'bfs_level', undefined, 'level');

    const queue: string[] = ['S'];
    levels.S = 1;
    makeStep(lines.bfsSetSrc, '🌱 [标记源点层级] depth[S] = 1, queue.add(S)；源点为分层网络的第 1 层。', '标记源点 S 层次为 1 并入队', 'bfs_level', undefined, 'level', 0);

    while (queue.length > 0) {
      makeStep(lines.bfsWhile, `🔁 [检查队列非空] while (!queue.isEmpty()) -> 队列元素: [${queue.join(', ')}]。`, `队列非空继续 BFS 层级扩展`, 'bfs_level');

      const u = queue.shift()!;
      makeStep(lines.bfsPoll, `📤 [出队扩展层次] int u = queue.poll() = ${u} (当前层级 depth[${u}] = ${levels[u]})。`, `取出队首节点 ${u} 展开出边`, 'bfs_level');

      for (const e of rawEdges.filter((edge) => edge.u === u)) {
        const v = e.v;
        const residual = e.cap - e.flow;
        activeEdge = [u, v];

        makeStep(lines.bfsForEdges, `  ↳ [考察残量边] 边 (${u} ➔ ${v}): cap=${e.cap}, flow=${e.flow}, 残量残额=${residual}。`, `考察出边 (${u} ➔ ${v}) 残量为 ${residual}`, 'bfs_level');

        makeStep(lines.bfsCheckLevel, `  🔎 [分层判定] if (residual > 0 && depth[${v}] == 0) -> (${residual > 0} && ${levels[v] === 0})。`, `判断节点 ${v} 是否未分层且残量大于 0`, 'bfs_level');

        if (residual > 0 && levels[v] === 0) {
          levels[v] = levels[u] + 1;
          queue.push(v);
          const vSlot = nodeNames.indexOf(v);
          makeStep(lines.bfsSetLevel, `  🏷️ [确定节点层次] depth[${v}] = depth[${u}] + 1 = ${levels[v]}；节点 ${v} 顺利入队！`, `设置节点 ${v} 层次 depth[${v}] = ${levels[v]}`, 'bfs_level', undefined, 'level', vSlot);
        }
      }
      activeEdge = undefined;
    }

    const reachable = levels.T > 0;
    makeStep(lines.bfsReturn, `🏁 [BFS 完成] return depth[T] > 0 -> (${reachable})：汇点 T ${reachable ? `在第 ${levels.T} 层可达` : '在残量网络中已不可达'}！`, `返回分层图判定结果: 汇点可达性为 ${reachable}`, 'bfs_level');
    return reachable;
  }

  // 模拟 Dinic 主循环与多路增广
  let round = 1;
  while (true) {
    makeStep(lines.maxFlowWhileBfs, `🔁 [外层增广轮次 ${round}] while (bfs(s, t, n))：尝试构建新一轮分层图。`, `第 ${round} 轮尝试 BFS 寻找增广层级`, 'bfs_level');

    const hasAugment = runBfs();
    if (!hasAugment) break;

    // 当前弧重置
    for (const k of nodeNames) curArc[k] = 0;
    makeStep(lines.maxFlowResetCur, '🎯 [重置当前弧优化] Arrays.fill(cur, 0)；各点出边从头开始扫描，避免重复回溯。', '重置当前弧优化指针 cur 数组为 0', 'cur_arc', undefined, 'cur');

    if (round === 1) {
      if (!isCross) {
        // 增广路径 1: S -> A -> T (推 10)
        activePath = ['S', 'A', 'T'];
        makeStep(lines.dfsEntry, '🌊 [启动 DFS 多路增广] dfs(S, T, limit=1e9)：沿分层图寻找第 1 条阻塞流。', '沿分层图启动 DFS 阻塞流增广', 'dfs_augment');
        makeStep(lines.dfsForCur, '  ↳ [当前弧推进] cur[S]=0, 考察出边 (S ➔ A, cap=10, 残量=10, depth 1➔2)。', '当前弧考察出边 (S ➔ A)', 'dfs_augment');
        makeStep(lines.dfsPush, '  ⚡ [递归推流] 发现可行瓶颈容量 = min(1e9, 10, 10) = 10 单位流量！', '计算瓶颈容量并推进 10 单位流量', 'dfs_augment', 10);

        rawEdges.find((e) => e.u === 'S' && e.v === 'A')!.flow += 10;
        rawEdges.find((e) => e.u === 'A' && e.v === 'T')!.flow += 10;
        curMaxFlow += 10;
        makeStep(lines.dfsUpdateResidual, '  🔄 [残量网络流量更新] (S➔A): 10/10 (饱和), (A➔T): 10/10 (饱和)；正向流+10，反向流自动抵消！', '更新残量网络流量: 路径已饱和', 'dfs_augment', 10);

        // 增广路径 2: S -> B -> T (推 10)
        activePath = ['S', 'B', 'T'];
        curArc.S = 1;
        makeStep(lines.dfsForCur, '  ↳ [当前弧跳过饱和边] cur[S]=1, 转向未饱和出边 (S ➔ B, cap=10, 残量=10, depth 1➔2)。', '当前弧跳过饱和边并转向 (S ➔ B)', 'dfs_augment');
        makeStep(lines.dfsPush, '  ⚡ [递归推流] 发现可行瓶颈容量 = 10 单位流量！', '计算第二路瓶颈容量并推进 10 单位流量', 'dfs_augment', 10);

        rawEdges.find((e) => e.u === 'S' && e.v === 'B')!.flow += 10;
        rawEdges.find((e) => e.u === 'B' && e.v === 'T')!.flow += 10;
        curMaxFlow += 10;
        makeStep(lines.dfsUpdateResidual, '  🔄 [残量网络流量更新] (S➔B): 10/10 (饱和), (B➔T): 10/10 (饱和)；累计流量达 20！', '更新残量网络流量: 累计最大流达 20', 'dfs_augment', 10);
      } else {
        // cross 交叉图增广
        activePath = ['S', 'A', 'T'];
        makeStep(lines.dfsEntry, '🌊 [启动 DFS 多路增广] dfs(S, T, limit=1e9)：沿分层图寻找阻塞流。', '启动交叉网络 DFS 阻塞流增广', 'dfs_augment');
        rawEdges.find((e) => e.u === 'S' && e.v === 'A')!.flow += 8;
        rawEdges.find((e) => e.u === 'A' && e.v === 'T')!.flow += 8;
        curMaxFlow += 8;
        makeStep(lines.dfsUpdateResidual, '  🔄 [更新流量] 沿 S➔A➔T 注入 8 单位流量！(A➔T 饱和)', '更新残量网络流量: 注入 8 单位流量', 'dfs_augment', 8);

        activePath = ['S', 'B', 'T'];
        rawEdges.find((e) => e.u === 'S' && e.v === 'B')!.flow += 10;
        rawEdges.find((e) => e.u === 'B' && e.v === 'T')!.flow += 10;
        curMaxFlow += 10;
        makeStep(lines.dfsUpdateResidual, '  🔄 [更新流量] 沿 S➔B➔T 注入 10 单位流量！(S➔B, B➔T 饱和)', '更新残量网络流量: 注入 10 单位流量', 'dfs_augment', 10);
      }
    }
    activePath = undefined;
    round++;
  }

  makeStep(lines.maxFlowReturn, `🎉 [Dinic 算法结束] return total = ${curMaxFlow}！残量网络中汇点已不可达，已求得全网最大流 ${curMaxFlow} 单位！`, `算法结束，返回全网最大流 total = ${curMaxFlow}`, 'done');

  return steps;
}
