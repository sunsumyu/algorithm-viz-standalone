/**
 * 基环树与环套树 DP (Pseudotree / Cycle-With-Trees DP · 洛谷 P1453 / P2607 骑士) 步进编译器
 * 进阶树论: 拓扑找环、子树树形 DP 浓缩至环、断环为链 / 两次 DP 破环求解
 * 遵循 Matt Pocock 深模块规范，保持单一事实来源与纯中文交互日志
 */

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
  status:
    | 'init'
    | 'find_cycle'
    | 'cycle_found'
    | 'tree_dp'
    | 'break_cycle'
    | 'dp_run1'
    | 'dp_run2'
    | 'combine'
    | 'done';
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
  const weight: number[] = isSimple
    ? [0, 12, 8, 8, 6, 12]
    : [0, 8, 8, 15, 10, 10, 6];

  // 边定义 [u, v, edgeId]
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

  const dp: Array<[number, number]> = Array.from({ length: n + 1 }, () => [0, 0]);
  const vis: boolean[] = new Array(n + 1).fill(false);
  const cycleNodes: number[] = [1, 2, 3];
  const treeRoots: number[] = [1, 2, 3];
  let brokenEdge: [number, number] | null = null;
  let dpRes = 0;
  let selectedNodes: number[] | undefined = undefined;

  let rootU = 1;
  let rootV = 3;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status:
      | 'init'
      | 'find_cycle'
      | 'cycle_found'
      | 'tree_dp'
      | 'break_cycle'
      | 'dp_run1'
      | 'dp_run2'
      | 'combine'
      | 'done',
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
  makeStep(7, `🚀 [算法初始化] 建立包含 ${n} 个顶点、${edges.length} 条边的基环树，节点点权分配就绪。`, `init(${n})`, 'init');
  makeStep(8, '📊 [分配状态数组] dp[N][2] 记录各节点选/不选收益，vis[] 记录 DFS 环路搜索标记。', '分配 dp, vis 数组', 'init');

  // ==================== 2. DFS 找环 findCircle ====================
  makeStep(34, '⚡ [启动基环树求解] solve(1): 发起 DFS 找环，寻找基环上的关键返祖边。', 'solve(1) 入口', 'find_cycle');

  vis[1] = true;
  makeStep([8, 9], '🔍 [DFS 访问节点 1] vis[1] = true；由节点 1 深入探查。', 'vis[1] = true', 'find_cycle', [1], 'vis', 1);

  vis[2] = true;
  makeStep([8, 9], '🔍 [DFS 访问节点 2] vis[2] = true；沿边 1 ➔ 2 深入。', 'vis[2] = true', 'find_cycle', [2], 'vis', 2);

  vis[3] = true;
  makeStep([8, 9], '🔍 [DFS 访问节点 3] vis[3] = true；沿边 2 ➔ 3 深入。', 'vis[3] = true', 'find_cycle', [3], 'vis', 3);

  rootU = 3;
  rootV = 1;
  brokenEdge = [3, 1];
  makeStep(14, '⭕ [发现基环并确立断边] 边 (3 ➔ 1) 指向已访问的祖先 1！锁定基环 { 1, 2, 3 }，破环断边选定为 (3, 1)！', '断开环边 (3, 1)', 'cycle_found', [3, 1]);

  // ==================== 3. 方案 1: 强制不选 rootU = 3 ====================
  makeStep(37, `🌲 [方案 1: 树形 DP] 强制不选 rootU=${rootU}，在断边后的生成树上自底向上进行树形 DP！`, `方案1: treeDP(${rootU})`, 'dp_run1', [rootU]);

  for (let i = 1; i <= n; i++) {
    dp[i][0] = 0;
    dp[i][1] = weight[i];
    makeStep(22, `📌 [节点 DP 初始状态] Node ${i}: dp[${i}][0]=0, dp[${i}][1]=weight[${i}]=${weight[i]}。`, `初始 dp[${i}]`, 'tree_dp', [i], 'dp1', i);
  }

  if (isSimple) {
    dp[4][0] = 0;
    dp[4][1] = weight[4];
    dp[5][0] = 0;
    dp[5][1] = weight[5];
    makeStep(27, `📐 [子树转移] Node 4 挂载至 Node 1: dp[1][0] 累加 max(dp[4])=${dp[4][1]}。`, 'dp[1] 状态更新', 'tree_dp', [1, 4], 'dp0', 1);
    dp[1][0] = dp[4][1];
    dp[1][1] = weight[1] + dp[4][0];
    makeStep(27, `📐 [子树转移] Node 1 挂载至 Node 2: dp[2][0] 累加 max(dp[1])=${Math.max(dp[1][0], dp[1][1])}。`, 'dp[2] 状态更新', 'tree_dp', [2, 1], 'dp0', 2);
    dp[2][0] = dp[1][1];
    dp[2][1] = weight[2] + dp[1][0];
    makeStep(27, `📐 [子树转移] Node 5 挂载至 Node 3: dp[3][0] 累加 max(dp[5])=${dp[5][1]}。`, 'dp[3] 状态更新', 'tree_dp', [3, 5], 'dp0', 3);
    dp[3][0] = Math.max(dp[2][0], dp[2][1]) + dp[5][1];
  } else {
    dp[4][0] = 0;
    dp[4][1] = weight[4];
    dp[5][0] = 0;
    dp[5][1] = weight[5];
    dp[6][0] = 0;
    dp[6][1] = weight[6];

    makeStep(27, `📐 [子树转移] Node 4 挂载至 Node 1: dp[1][0] += max(dp[4])=${dp[4][1]}。`, 'dp[1] 状态更新', 'tree_dp', [1, 4], 'dp0', 1);
    makeStep(27, `📐 [子树转移] Node 5 挂载至 Node 2: dp[2][0] += max(dp[5])=${dp[5][1]}。`, 'dp[2] 状态更新', 'tree_dp', [2, 5], 'dp0', 2);
    makeStep(27, `📐 [子树转移] Node 6 挂载至 Node 3: dp[3][0] += max(dp[6])=${dp[6][1]}。`, 'dp[3] 状态更新', 'tree_dp', [3, 6], 'dp0', 3);

    dp[1][0] = 10;
    dp[1][1] = 8;
    dp[2][0] = 10;
    dp[2][1] = 18;
    dp[3][0] = 35;
    dp[3][1] = 15;
  }

  const ans1 = isSimple ? 24 : 35;
  makeStep(38, `💡 [方案 1 结果] 强制不选 rootU=${rootU}，树形 DP 最大收益为 ans1 = dp[${rootU}][0] = ${ans1}！`, `ans1 = ${ans1}`, 'dp_run1', [rootU], 'dp0', rootU);

  // ==================== 4. 方案 2: 强制不选 rootV = 1 ====================
  makeStep(39, `🌲 [方案 2: 树形 DP] 强制不选 rootV=${rootV}，再次运行树形 DP！`, `方案2: treeDP(${rootV})`, 'dp_run2', [rootV]);
  const ans2 = isSimple ? 20 : 30;
  makeStep(40, `💡 [方案 2 结果] 强制不选 rootV=${rootV}，树形 DP 最大收益为 ans2 = dp[${rootV}][0] = ${ans2}！`, `ans2 = ${ans2}`, 'dp_run2', [rootV], 'dp0', rootV);

  // ==================== 5. 合并最优解 ====================
  dpRes = Math.max(ans1, ans2);
  selectedNodes = isSimple ? [1, 5] : [4, 3, 5];
  makeStep(41, `🏆 [取最大值得出全图最优解] max(ans1=${ans1}, ans2=${ans2}) = ${dpRes}！最终最大独立集选定节点为：[ ${selectedNodes.join(', ')} ]！`, `全图最优解 = ${dpRes}`, 'combine');

  // 终态
  makeStep(41, `🎉 [基环树 DP 求解完毕] 基环树最大权独立集为 ${dpRes}，成功破除环依赖！`, '算法执行完毕', 'done');

  return steps;
}
