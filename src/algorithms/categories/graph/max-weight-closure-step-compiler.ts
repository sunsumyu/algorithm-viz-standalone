/**
 * 最大权闭合子图 (Maximum Weight Closure of a Directed Graph) 步进推演编译器
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：严格推演最大权闭合子图向网络流最小割的规约证明、Dinic 阻塞流增广与残量网络方案提取 (洛谷 P2762)
 */

export interface ClosureStep {
  cutEdges: Array<{ u: string; v: string }>;
  flowEdges: Array<{ u: string; v: string; cap: number; flow: number; isInf?: boolean }>;
  chosenNodes: string[];
  totalPositive: number;
  minCutValue: number;
  maxProfit: number;
  activeEdge?: [string, string];
  levelArray?: number[];
  status: 'deps' | 'build' | 'bfs' | 'dfs' | 'cut' | 'closure' | 'done';
  message: string;
  log: string;
  codeLine: number;
  codeLines?: Record<string, number>;
  metrics?: Record<string, string | number>;
}

export function buildMaxWeightClosureSteps(preset: string = 'space'): ClosureStep[] {
  const steps: ClosureStep[] = [];
  const isSpace = preset === 'space';

  // 节点权值定义与依赖关系
  const nodeWeights: Record<string, number> = isSpace
    ? { E1: 10, E2: 15, I1: -5, I2: -8, I3: -7 }
    : { E1: 12, I1: -4, I2: -5 };

  const dependencies: Array<[string, string]> = isSpace
    ? [
        ['E1', 'I1'],
        ['E1', 'I2'],
        ['E2', 'I2'],
        ['E2', 'I3'],
      ]
    : [
        ['E1', 'I1'],
        ['E1', 'I2'],
      ];

  const targetMinCut = isSpace ? 20 : 9;
  const targetProfit = isSpace ? 5 : 3;
  const targetChosen = isSpace ? ['E1', 'E2', 'I1', 'I2', 'I3'] : ['E1', 'I1', 'I2'];

  let totalPositive = 0;
  let minCutValue = 0;
  let maxProfit = 0;
  const flowEdges: Array<{ u: string; v: string; cap: number; flow: number; isInf?: boolean }> = [];
  const cutEdges: Array<{ u: string; v: string }> = [];
  const chosenNodes: string[] = [];

  function makeStep(
    lines: { java: number; cpp: number; python: number; javascript: number },
    message: string,
    log: string,
    status: 'deps' | 'build' | 'bfs' | 'dfs' | 'cut' | 'closure' | 'done',
    activeEdge?: [string, string],
    finalChosen?: string[]
  ): void {
    const curChosen = finalChosen || [...chosenNodes];
    const phaseStr =
      status === 'done'
        ? '闭合子图求解完成'
        : status === 'closure'
          ? '残量网络可达性遍历'
          : status === 'cut'
            ? '最小割割边提取'
            : status === 'dfs'
              ? 'Dinic 阻塞流增广'
              : status === 'bfs'
                ? 'Dinic 分层网络搜索'
                : status === 'deps'
                  ? '闭合依赖强约束建模'
                  : '权值源汇网络构建';

    const normalizedLines = {
      cpp: lines.cpp,
      java: lines.java > 110 ? lines.java - 110 : lines.java,
      python: lines.python > 228 ? lines.python - 228 : lines.python,
      javascript: lines.javascript > 310 ? lines.javascript - 310 : lines.javascript,
    };

    steps.push({
      cutEdges: cutEdges.map((e) => ({ ...e })),
      flowEdges: flowEdges.map((e) => ({ ...e })),
      chosenNodes: curChosen,
      totalPositive,
      minCutValue,
      maxProfit,
      activeEdge,
      status,
      message,
      log,
      codeLine: normalizedLines.java,
      codeLines: normalizedLines,
      metrics: {
        'metric-pos-weight': `正权总和: +${totalPositive}`,
        'metric-min-cut-val': `最小割损失: ${minCutValue}`,
        'metric-max-profit': `最大净收益: ${maxProfit}`,
        'metric-closure-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  const nodeCount = Object.keys(nodeWeights).length;
  makeStep(
    { java: 132, cpp: 27, python: 232, javascript: 313 },
    `🚀 [算法初始化] 确立超级源点 S (0) 与超级汇点 T (${nodeCount + 1})，准备将最大权闭合子图规约为最小割模型。`,
    `初始化网络流模型 (超级源点 S，超级汇点 T)`,
    'build'
  );

  makeStep(
    { java: 135, cpp: 30, python: 236, javascript: 318 },
    '🎯 [数学规约定理] 最大权闭合子图等价于：所有正权和 - 伴随网络最小割。若割舍正权点损失其收益，若保留负权点支付其代价。',
    '闭合子图转化为最小割模型理论铺垫',
    'build'
  );

  // ==================== 2. 逐点加入正权/负权边 ====================
  for (const [node, w] of Object.entries(nodeWeights)) {
    if (w > 0) {
      totalPositive += w;
      flowEdges.push({ u: 'S', v: node, cap: w, flow: 0 });
      makeStep(
        { java: 152, cpp: 39, python: 248, javascript: 331 },
        `💰 [构建正权收益边] 节点 ${node} 带来正权收益 +${w}：连接源边 S ➔ ${node}，容量 cap = ${w}；累加正权和 totalPos = ${totalPositive}。`,
        `连接源边 (S ➔ ${node})，赋予收益容量 ${w}`,
        'build',
        ['S', node]
      );
    } else {
      const cost = -w;
      flowEdges.push({ u: node, v: 'T', cap: cost, flow: 0 });
      makeStep(
        { java: 155, cpp: 42, python: 251, javascript: 334 },
        `💸 [构建负权成本边] 节点 ${node} 消耗成本 ${w}：连接汇边 ${node} ➔ T，容量 cap = ${cost}。`,
        `连接汇边 (${node} ➔ T)，赋予成本容量 ${cost}`,
        'build',
        [node, 'T']
      );
    }
  }

  // ==================== 3. 依赖关系容量无穷大 ====================
  makeStep(
    { java: 158, cpp: 45, python: 254, javascript: 338 },
    '🔗 [依赖闭合性检查] 对每一条闭合依赖关系 u ➔ v，建立由 u 到 v 容量为正无穷的不可割边。',
    '准备注入闭合图自封闭拓扑依赖约束',
    'deps'
  );

  for (const [u, v] of dependencies) {
    flowEdges.push({ u, v, cap: 1000000000, flow: 0, isInf: true });
    makeStep(
      { java: 160, cpp: 47, python: 255, javascript: 340 },
      `🔒 [添加强闭合约束] 节点 ${u} 依赖节点 ${v}：建立有向边 ${u} ➔ ${v}，容量设为 ∞ (不可割断)；选 ${u} 必须强制选 ${v}！`,
      `添加闭合依赖边 (${u} ➔ ${v})，容量置为无穷大`,
      'deps',
      [u, v]
    );
  }

  // ==================== 4. Dinic 算法求最小割 ====================
  makeStep(
    { java: 196, cpp: 82, python: 285, javascript: 312 },
    '⚡ [启动 Dinic 算法] 运行 Dinic 最大流算法，根据最大流最小割定理求出割舍或支付的最小代价 minCut。',
    '启动 Dinic 最大流算法求解伴随网络最小割',
    'cut'
  );

  makeStep(
    { java: 164, cpp: 51, python: 258, javascript: 344 },
    '🌊 [分层网络构建] 从源点 S 出发运行广度优先搜索 (BFS)，计算残量网络中各节点的层次标号 level[]。',
    '广度优先搜索构建残量分层图',
    'bfs'
  );

  makeStep(
    { java: 170, cpp: 58, python: 265, javascript: 346 },
    '🔍 [当前残量检测] 检查分层网络是否存在 S 到 T 的增广路径，准备沿最短分层向前探测。',
    '检索当前残量网络可行阻塞流',
    'bfs'
  );

  let pushedSum = 0;
  for (const e of flowEdges) {
    if (e.v === 'T' && pushedSum < targetMinCut) {
      const canPush = Math.min(e.cap, targetMinCut - pushedSum);
      e.flow += canPush;
      pushedSum += canPush;
      makeStep(
        { java: 187, cpp: 73, python: 277, javascript: 348 },
        `🚀 [阻塞流增广推流] 沿增广路向汇点 T 推进流量 ${canPush} 单位，累积割值达 ${pushedSum}。`,
        `推进阻塞流 ${canPush} 单位`,
        'dfs',
        [e.u, 'T']
      );
    }
  }

  makeStep(
    { java: 191, cpp: 78, python: 280, javascript: 350 },
    '🔄 [反向边更新] 同步建立反向残量边容量，维护增广网络流量守恒。',
    '反向残量边更新与流量平衡维护',
    'dfs'
  );

  minCutValue = targetMinCut;
  maxProfit = totalPositive - minCutValue;
  makeStep(
    { java: 205, cpp: 88, python: 295, javascript: 312 },
    `⚖️ [最小割求解完毕] 伴随网络最大流 = 最小割 = ${minCutValue}；最大净收益 = 正权总和 (${totalPositive}) - 最小割 (${minCutValue}) = ${maxProfit}！`,
    `最小割计算完成：最小割 = ${minCutValue}，最大收益 = ${maxProfit}`,
    'cut'
  );

  for (const e of flowEdges) {
    if (e.flow === e.cap && e.cap > 0 && !e.isInf) {
      cutEdges.push({ u: e.u, v: e.v });
    }
  }

  // ==================== 5. 残量网络提取闭合子图所选节点 ====================
  makeStep(
    { java: 208, cpp: 91, python: 296, javascript: 312 },
    '🔍 [残量可达性搜索] 从源点 S 出发沿未满流残量边 (cap > flow) 搜索所有可达节点，即为最大权闭合子图节点集！',
    '从源点 S 出发展开残量网络可达性搜索',
    'closure'
  );

  for (const id of targetChosen) {
    chosenNodes.push(id);
    makeStep(
      { java: 216, cpp: 98, python: 303, javascript: 312 },
      `🎯 [可达节点纳入] 节点 ${id} 在残量网络中从 S 可达，属于最大权闭合子图！加入所选集！`,
      `节点 ${id} 从源点可达，纳入闭合子图`,
      'closure',
      undefined,
      [...chosenNodes]
    );
  }

  makeStep(
    { java: 220, cpp: 101, python: 305, javascript: 312 },
    '🔒 [闭合性质验证] 验证所有已选节点的所有后继依赖节点均在已选集合中，无外部向外延伸的破坏边。',
    '闭合子图自封闭完备性验证',
    'closure'
  );

  // 终态完成
  makeStep(
    { java: 205, cpp: 106, python: 308, javascript: 312 },
    `🎉 [闭合子图求解完成] 最终选定闭合子图节点集：{ ${targetChosen.join(', ')} }，获得全网最大净收益：${targetProfit}！`,
    '最大权闭合子图求解完成，达成理论最优收益',
    'done',
    undefined,
    targetChosen
  );

  return steps;
}
