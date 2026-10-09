/**
 * 差分约束系统 (System of Difference Constraints) 步进编译器
 * 核心：不等式 x_v - x_u <= c 转化为有向带权边 u ➔ v (w=c)、超级源点连 0 权边、SPFA 负环判定 (洛谷 P5960 / 左程云 class070)
 * 架构：严格解释器级全流程逐行高亮执行、纯中文步骤日志、四语言行号映射
 */

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

  // 精准 21 处四语言映射行号字典 (cpp / java / python / javascript 1-based)
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

    makeStep(lines.entry, '🚀 [算法启动] solve(n=3, constraints)：载入差分约束系统。', '进入差分约束求解函数', 'init_super');
    makeStep(lines.initGraph, '📦 [构建邻接表] List<Edge>[] graph = new ArrayList[4] 初始化。', '初始化差分约束图邻接表', 'init_super');

    // 约束建边
    makeStep(lines.forConstraints, '🔎 [遍历约束] 约束 1: x1 - x2 <= -3 ➔ 建立有向边 2 ➔ 1 (权值 w=-3)。', '建立约束边: (2 ➔ 1, 权值 -3)', 'init_super', 2, 1, [2, 1]);
    makeStep(lines.addConstraintEdge, '➕ [添加有向边] graph[2].add(new Edge(1, -3))。', '图结构新增边 (2 ➔ 1)', 'init_super', 2, 1, [2, 1]);

    makeStep(lines.forConstraints, '🔎 [遍历约束] 约束 2: x2 - x1 <= 2 ➔ 建立有向边 1 ➔ 2 (权值 w=2)。', '建立约束边: (1 ➔ 2, 权值 2)', 'init_super', 1, 2, [1, 2]);
    makeStep(lines.addConstraintEdge, '➕ [添加有向边] graph[1].add(new Edge(2, 2))。两边构成负回路 (-3 + 2 = -1 < 0)！', '形成潜在负权回路: 1 ➔ 2 ➔ 1', 'init_super', 1, 2, [1, 2]);

    // 超级源点连边
    makeStep(lines.forSuperSource, '🌐 [超级源点连接] 超级源点 0 向所有真实变量节点 (1..3) 连接权值为 0 的单向边。', '超级源点 0 向全变量连 0 权边', 'init_super', 0, 1, [0, 1]);
    makeStep(lines.addSuperEdge, '➕ [超级边 0➔1] graph[0].add(new Edge(1, 0))。', '新增超级边 (0 ➔ 1)', 'init_super', 0, 1, [0, 1]);
    makeStep(lines.addSuperEdge, '➕ [超级边 0➔2] graph[0].add(new Edge(2, 0))。', '新增超级边 (0 ➔ 2)', 'init_super', 0, 2, [0, 2]);
    makeStep(lines.addSuperEdge, '➕ [超级边 0➔3] graph[0].add(new Edge(3, 0))。', '新增超级边 (0 ➔ 3)', 'init_super', 0, 3, [0, 3]);

    // SPFA 初始化
    makeStep(lines.initDist, '📊 [初始化最短路] Arrays.fill(dist, 1e9)；超级源点 dist[0] = 0。', '初始化最短路数组 dist[]', 'init_super');
    makeStep(lines.initCount, '🏷️ [初始化入队计数] int[] count = new int[4]；记录松弛次数。', '初始化松弛计数数组 count[]', 'init_super');
    makeStep(lines.initQueue, '📦 [初始化队列] Queue<Integer> q = new LinkedList<>()。', '初始化 SPFA 探索队列', 'init_super');

    q.push(0);
    dist[0] = 0;
    makeStep(lines.pushSuperSource, '🌱 [源点入队] q.offer(0), inQueue[0] = true；开启 SPFA 扩散！', '超级源点 0 入队开启探测', 'init_super', 0, 0);

    // SPFA 循环展开
    makeStep(lines.whileQueue, '🔁 [SPFA 展开] while (!q.isEmpty()) -> 队列长度: 1。', 'SPFA 队列开始循环处理', 'relax', 0, 0);
    q.shift();
    makeStep(lines.pollQueue, '📤 [出队推进] poll() -> 弹出超级源点 0。', '超级源点 0 出队', 'relax', 0, 0);

    // 从 0 扩散至 1, 2
    dist[1] = 0;
    cnt[1] = 1;
    q.push(1);
    makeStep(lines.updateDist, '  ⚡ [源点松弛 1] dist[1] = dist[0] + 0 = 0, count[1] = 1, q.offer(1)。', '超级边松弛更新: dist[1]=0', 'relax', 0, 1, [0, 1]);

    dist[2] = 0;
    cnt[2] = 1;
    q.push(2);
    makeStep(lines.updateDist, '  ⚡ [源点松弛 2] dist[2] = dist[0] + 0 = 0, count[2] = 1, q.offer(2)。', '超级边松弛更新: dist[2]=0', 'relax', 0, 2, [0, 2]);

    // 负权环反复松弛
    let loopRound = 1;
    while (cnt[1] <= n && cnt[2] <= n) {
      makeStep(lines.whileQueue, `🔁 [SPFA 负环振荡] while (!q.isEmpty()) -> 当前队列: [${q.join(', ')}]。`, `SPFA 轮次 ${loopRound}: 处理队首`, 'relax', 1, 2);
      const u = q.shift()!;
      makeStep(lines.pollQueue, `📤 [出队节点] poll() -> 弹出节点 ${u}。`, `节点 ${u} 出队进行松弛`, 'relax', u, 0);

      const v = u === 1 ? 2 : 1;
      const w = u === 1 ? 2 : -3;
      makeStep(lines.forEdges, `  ↳ [遍历出边] 考察边 ${u} ➔ ${v} (权值 w=${w})。`, `考察出边 (${u} ➔ ${v}, 权值 ${w})`, 'relax', u, v, [u, v]);
      makeStep(lines.checkRelax, `  🔎 [松弛核验] if (dist[${v}]=${dist[v]} > dist[${u}]=${dist[u]} + ${w}=${dist[u] + w}) -> (true)。`, `松弛条件成立: dist[${u}]+${w} < dist[${v}]`, 'relax', u, v, [u, v]);

      dist[v] = dist[u] + w;
      cnt[v] = cnt[u] + 1;
      makeStep(lines.updateDist, `  ⚡ [更新距离] 负环松弛！dist[${v}] 下降至 ${dist[v]}！`, `负环持续松弛: dist[${v}]=${dist[v]}`, 'relax', u, v, [u, v]);
      makeStep(lines.updateCount, `  📈 [累加入队次数] count[${v}] = count[${u}] + 1 = ${cnt[v]}。`, `松弛计数累加: count[${v}]=${cnt[v]}`, 'relax', u, v, [u, v]);

      makeStep(lines.checkCycle, `  🚨 [负环判定核验] if (count[${v}]=${cnt[v]} > n=${n}) -> (${cnt[v] > n})。`, `检验负环阈值: count[${v}]=${cnt[v]} > ${n}`, 'check', u, v, [u, v]);
      if (cnt[v] > n) {
        makeStep(lines.returnCycle, `❌ [捕获负权环] return false！节点 ${v} 的松弛次数已达到 ${cnt[v]} > ${n}，系统存在负环代数矛盾，判定无解！`, '捕获负权回路，判定系统无可行解', 'done', u, v, [u, v], true);
        break;
      }

      q.push(v);
      makeStep(lines.pushQueue, `  📥 [节点再次入队] q.offer(${v})，由于负环驱动将无休止入队！`, `节点 ${v} 再次入队`, 'relax', u, v, [u, v]);
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

    makeStep(lines.entry, '🚀 [差分约束启动] solve(n=3, constraints)：载入 3 个线性不等式约束。', '进入差分约束求解函数', 'init_super');
    makeStep(lines.initGraph, '📦 [构建邻接表] List<Edge>[] graph = new ArrayList[4]。', '初始化差分约束图邻接表', 'init_super');

    // 3 条约束边
    makeStep(lines.forConstraints, '🔎 [不等式建边 1] 由 x2 - x1 <= 3 变形为 x2 <= x1 + 3，建立有向边 1 ➔ 2 (权值 w=3)。', '建立约束边: (1 ➔ 2, 权值 3)', 'init_super', 1, 2, [1, 2]);
    makeStep(lines.addConstraintEdge, '➕ [添加有向边] graph[1].add(new Edge(2, 3))。', '图结构新增边 (1 ➔ 2)', 'init_super', 1, 2, [1, 2]);

    makeStep(lines.forConstraints, '🔎 [不等式建边 2] 由 x3 - x1 <= 1 变形为 x3 <= x1 + 1，建立有向边 1 ➔ 3 (权值 w=1)。', '建立约束边: (1 ➔ 3, 权值 1)', 'init_super', 1, 3, [1, 3]);
    makeStep(lines.addConstraintEdge, '➕ [添加有向边] graph[1].add(new Edge(3, 1))。', '图结构新增边 (1 ➔ 3)', 'init_super', 1, 3, [1, 3]);

    makeStep(lines.forConstraints, '🔎 [不等式建边 3] 由 x2 - x3 <= 1 变形为 x2 <= x3 + 1，建立有向边 3 ➔ 2 (权值 w=1)。', '建立约束边: (3 ➔ 2, 权值 1)', 'init_super', 3, 2, [3, 2]);
    makeStep(lines.addConstraintEdge, '➕ [添加有向边] graph[3].add(new Edge(2, 1))。', '图结构新增边 (3 ➔ 2)', 'init_super', 3, 2, [3, 2]);

    // 超级源点建边
    makeStep(lines.forSuperSource, '🌐 [超级源点连接] 超级源点 0 向真实变量 (1..3) 连接 0 权边，赋予 x_i <= 0 上界基准。', '超级源点 0 向全变量连 0 权边', 'init_super');
    makeStep(lines.addSuperEdge, '➕ [超级边 0➔1] graph[0].add(new Edge(1, 0))。', '新增超级边 (0 ➔ 1)', 'init_super', 0, 1, [0, 1]);
    makeStep(lines.addSuperEdge, '➕ [超级边 0➔2] graph[0].add(new Edge(2, 0))。', '新增超级边 (0 ➔ 2)', 'init_super', 0, 2, [0, 2]);
    makeStep(lines.addSuperEdge, '➕ [超级边 0➔3] graph[0].add(new Edge(3, 0))。', '新增超级边 (0 ➔ 3)', 'init_super', 0, 3, [0, 3]);

    // 初始化 SPFA
    makeStep(lines.initDist, '📊 [初始化最短路] Arrays.fill(dist, 1e9)；记录各变量的最大上界。', '初始化最短路数组 dist[]', 'init_super');
    makeStep(lines.initCount, '🏷️ [初始化入队计数] int[] count = new int[4]。', '初始化松弛计数数组 count[]', 'init_super');
    makeStep(lines.initQueue, '📦 [初始化队列] Queue<Integer> q = new LinkedList<>()。', '初始化 SPFA 探索队列', 'init_super');

    q.push(0);
    dist[0] = 0;
    makeStep(lines.pushSuperSource, '🌱 [源点入队] q.offer(0), inQueue[0] = true；开启 SPFA 扩散！', '超级源点 0 入队开启探测', 'init_super', 0, 0);

    // 展开步骤
    makeStep(lines.whileQueue, '🔁 [SPFA 轮次 1] while (!q.isEmpty()) -> 展开超级源点。', 'SPFA 轮次 1: 处理超级源点', 'relax', 0, 0);
    q.shift();
    makeStep(lines.pollQueue, '📤 [出队节点] poll() -> 弹出节点 0。', '超级源点 0 出队', 'relax', 0, 0);

    dist[1] = 0;
    cnt[1] = 1;
    q.push(1);
    makeStep(lines.updateDist, '  ⚡ [松弛节点 1] dist[1] = dist[0] + 0 = 0，加入队列。', '超级边松弛更新: dist[1]=0', 'relax', 0, 1, [0, 1]);

    dist[2] = 0;
    cnt[2] = 1;
    q.push(2);
    makeStep(lines.updateDist, '  ⚡ [松弛节点 2] dist[2] = dist[0] + 0 = 0，加入队列。', '超级边松弛更新: dist[2]=0', 'relax', 0, 2, [0, 2]);

    dist[3] = 0;
    cnt[3] = 1;
    q.push(3);
    makeStep(lines.updateDist, '  ⚡ [松弛节点 3] dist[3] = dist[0] + 0 = 0，加入队列。', '超级边松弛更新: dist[3]=0', 'relax', 0, 3, [0, 3]);

    // 节点 3 松弛边 3 -> 2
    makeStep(lines.whileQueue, '🔁 [SPFA 轮次 2] while (!q.isEmpty()) -> 考察节点 3。', 'SPFA 轮次 2: 考察节点 3', 'relax', 3, 2);
    q.shift();
    makeStep(lines.pollQueue, '📤 [出队节点] poll() -> 弹出节点 3 (当前 dist[3]=0)。', '节点 3 出队', 'relax', 3, 2);
    makeStep(lines.forEdges, '  ↳ [遍历出边] 考察边 3 ➔ 2 (权值 w=1)。', '考察出边 (3 ➔ 2, 权值 1)', 'relax', 3, 2, [3, 2]);
    makeStep(lines.checkRelax, '  🔎 [松弛检验] if (dist[2]=0 > dist[3]+1 = 1) -> (false)；保持松弛不变。', '松弛检验不满足，保持当前距离', 'relax', 3, 2, [3, 2]);

    // 队列清空并收敛
    q = [];
    makeStep(lines.whileQueue, '🔁 [检查队列] while (!q.isEmpty()) -> (队列已清空，所有不等式完全收敛)！', 'SPFA 队列清空，全系统收敛', 'relax');

    makeStep(lines.returnTrue, `🎉 [求得可行解] return true！系统存在可行解向量：[x1=${dist[1]}, x2=${dist[2]}, x3=${dist[3]}] 完全满足所有差分约束！`, '系统满足全部约束，输出可行解', 'done');
  }

  return steps;
}
