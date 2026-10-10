/**
 * 广义圆方树 (Block-Cut Tree / Round-Square Tree) 步骤编译器
 * 进阶图论: Tarjan 求点双连通分量 (v-BCC)、新建方点构建圆方二分树、所有简单路径必经割点转化 (洛谷 P4320 / P4630)
 * 提供 100% 纯中文语义日志与四语言代码行号精确联动
 */

export interface BlockCutStep {
  roundNodes: number[];
  squareNodes: string[];
  treeEdges: Array<{ u: string | number; v: string | number }>;
  activeBcc?: string[];
  cutVertices?: number[];
  pathRoundNodes?: number[];
  mustPassCutNodes?: number[];
  curNode?: number;
  dfnArray: number[];
  lowArray: number[];
  stackArray: number[];
  activeArray?: 'dfn' | 'low';
  activeSlot?: number;
  status: 'init' | 'tarjan_dfs' | 'bcc_found' | 'add_square' | 'bct_done' | 'query_path' | 'done';
  message: string;
  log: string;
  codeLine: number;
  codeLines?: {
    java: number;
    cpp: number;
    python: number;
    javascript: number;
  };
  metrics?: Record<string, string | number>;
}

export function buildBlockCutTreeSteps(preset: string = 'classic_6node'): BlockCutStep[] {
  const steps: BlockCutStep[] = [];
  const isSimple = preset === 'simple_4node';
  const n = isSimple ? 4 : 6;

  const roundNodes = Array.from({ length: n }, (_, i) => i + 1);
  const squareNodes: string[] = [];
  const treeEdges: Array<{ u: string | number; v: string | number }> = [];
  const cutVertices: number[] = [];
  const mustPassCutNodes: number[] = isSimple ? [3] : [3, 4];

  const dfn: number[] = new Array(n + 1).fill(0);
  const low: number[] = new Array(n + 1).fill(0);
  const stack: number[] = [];

  let dfnCnt = 0;
  let squareCnt = 0;
  let curNode: number | undefined = undefined;

  // 四语言映射行号字典 (java 必须 <= 42)
  const lineMap = {
    init: { cpp: 18, java: 7, python: 6, javascript: 6 },
    allocDfn: { cpp: 24, java: 9, python: 10, javascript: 7 },
    allocLow: { cpp: 24, java: 9, python: 11, javascript: 8 },
    allocStack: { cpp: 25, java: 10, python: 14, javascript: 11 },
    buildTree: { cpp: 60, java: 37, python: 38, javascript: 48 },
    visitNode: { cpp: 38, java: 13, python: 18, javascript: 24 },
    exploreEdge: { cpp: 41, java: 15, python: 20, javascript: 26 },
    backEdge: { cpp: 55, java: 31, python: 36, javascript: 43 },
    backtrackLow: { cpp: 44, java: 18, python: 23, javascript: 29 },
    bccCondition: { cpp: 45, java: 19, python: 24, javascript: 30 },
    newSquare: { cpp: 46, java: 20, python: 25, javascript: 31 },
    popStackConnect: { cpp: 49, java: 23, python: 29, javascript: 35 },
    connectCutVertex: { cpp: 52, java: 27, python: 33, javascript: 39 },
    done: { cpp: 64, java: 41, python: 41, javascript: 50 },
  };

  function makeStep(
    lines: { java: number; cpp: number; python: number; javascript: number },
    message: string,
    log: string,
    status: 'init' | 'tarjan_dfs' | 'bcc_found' | 'add_square' | 'bct_done' | 'query_path' | 'done',
    activeBcc?: string[],
    activeArray?: 'dfn' | 'low',
    activeSlot?: number
  ): void {
    const cutStr = cutVertices.length > 0 ? `{ ${cutVertices.join(', ')} }` : '尚未确定';
    const phaseStr =
      status === 'done'
        ? '圆方树构建完成'
        : status === 'query_path'
          ? '路径必经割点查询'
          : status === 'add_square'
            ? '圆方相间连边'
            : status === 'bcc_found'
              ? '发现点双连通分量'
              : status === 'tarjan_dfs'
                ? 'Tarjan 点双 DFS'
                : '算法初始化';

    steps.push({
      roundNodes: [...roundNodes],
      squareNodes: [...squareNodes],
      treeEdges: treeEdges.map((e) => ({ ...e })),
      activeBcc,
      cutVertices: [...cutVertices],
      pathRoundNodes: isSimple ? [1, 3, 4] : [1, 3, 4, 6],
      mustPassCutNodes: [...mustPassCutNodes],
      curNode,
      dfnArray: [...dfn],
      lowArray: [...low],
      stackArray: [...stack],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine: lines.java,
      codeLines: lines,
      metrics: {
        'metric-round-count': `${n} 个圆点`,
        'metric-square-count': `${squareNodes.length} 个方点`,
        'metric-cut-vertices': cutStr,
        'metric-bct-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(
    lineMap.init,
    `🚀 [算法初始化] 建立包含 ${n} 个原图节点的网络，准备运行 Tarjan 点双缩点算法构建广义圆方树。`,
    `初始化网络: ${n} 个节点`,
    'init'
  );

  makeStep(
    lineMap.allocDfn,
    '📊 [分配时间戳数组] dfn = new int[n + 1]; 记录 DFS 首次访问次序。',
    '分配时间戳 dfn 数组',
    'init',
    undefined,
    'dfn'
  );

  makeStep(
    lineMap.allocLow,
    '📊 [分配追溯数组] low = new int[n + 1]; 记录能够回溯到的最早祖先。',
    '分配追溯值 low 数组',
    'init',
    undefined,
    'low'
  );

  makeStep(
    lineMap.allocStack,
    '📦 [分配辅助栈] st = new ArrayDeque<>(); 维护当前搜索路径上的点双候选节点。',
    '分配点双辅助栈',
    'init'
  );

  // 2. buildTree 启动
  makeStep(
    lineMap.buildTree,
    '⚡ [启动圆方树构建] buildTree(): 遍历所有未访问节点发起 Tarjan 点双遍历。',
    '启动圆方树构建过程',
    'tarjan_dfs'
  );

  // 节点 1
  curNode = 1;
  dfn[1] = low[1] = ++dfnCnt;
  stack.push(1);
  makeStep(
    lineMap.visitNode,
    '⏱️ [访问节点 1] dfn[1] = low[1] = 1；节点 1 压入点双栈：[1]。',
    '访问节点 1 压入辅助栈',
    'tarjan_dfs',
    undefined,
    'dfn',
    1
  );

  makeStep(
    lineMap.exploreEdge,
    '🔍 [探索邻居] 节点 1 考察出边 (1 ➔ 2)。',
    '考察出边 (1, 2)',
    'tarjan_dfs'
  );

  // 节点 2
  curNode = 2;
  dfn[2] = low[2] = ++dfnCnt;
  stack.push(2);
  makeStep(
    lineMap.visitNode,
    '⏱️ [访问节点 2] dfn[2] = low[2] = 2；节点 2 压入点双栈：[1, 2]。',
    '访问节点 2 压入辅助栈',
    'tarjan_dfs',
    undefined,
    'dfn',
    2
  );

  makeStep(
    lineMap.exploreEdge,
    '🔍 [探索邻居] 节点 2 考察出边 (2 ➔ 3)。',
    '考察出边 (2, 3)',
    'tarjan_dfs'
  );

  // 节点 3
  curNode = 3;
  dfn[3] = low[3] = ++dfnCnt;
  stack.push(3);
  makeStep(
    lineMap.visitNode,
    '⏱️ [访问节点 3] dfn[3] = low[3] = 3；节点 3 压入点双栈：[1, 2, 3]。',
    '访问节点 3 压入辅助栈',
    'tarjan_dfs',
    undefined,
    'dfn',
    3
  );

  // 反向返祖边 3 -> 1
  makeStep(
    lineMap.exploreEdge,
    '🔍 [探索邻居] 节点 3 考察反向边 (3 ➔ 1)。',
    '考察反向返祖边 (3, 1)',
    'tarjan_dfs'
  );
  low[3] = Math.min(low[3], dfn[1]);
  makeStep(
    lineMap.backEdge,
    '🔄 [返祖回溯边 3 ➔ 1] low[3] 更新为 min(3, dfn[1]=1) = 1。',
    '更新追溯值 low[3]=1',
    'tarjan_dfs',
    undefined,
    'low',
    3
  );

  // 回溯到 2
  low[2] = Math.min(low[2], low[3]);
  makeStep(
    lineMap.backtrackLow,
    '📉 [回溯更新 low[2]] low[2] 更新为 min(2, low[3]=1) = 1。',
    '回溯更新 low[2]=1',
    'tarjan_dfs',
    undefined,
    'low',
    2
  );

  // 回溯到 1: 检查 low[2] >= dfn[1] (1 >= 1) -> 触发点双 v-BCC 1
  squareCnt++;
  const sq1 = `S${squareCnt}`;
  squareNodes.push(sq1);
  makeStep(
    lineMap.bccCondition,
    `🎉 [发现点双分量 1] 节点 1 处判定 low[2] >= dfn[1] (1 >= 1)！识别出环状点双 {1, 2, 3}，分配方点 ${sq1}！`,
    `发现点双分量 ${sq1}`,
    'bcc_found'
  );

  // 弹栈并连边
  treeEdges.push({ u: sq1, v: 3 }, { u: sq1, v: 2 }, { u: sq1, v: 1 });
  stack.pop(); // 3
  stack.pop(); // 2
  makeStep(
    lineMap.popStackConnect,
    `🟩 [圆方连边] 方点 ${sq1} 分别与点双内所有节点 {1, 2, 3} 连边！节点 3 作为后续连接点仍保留在原图。`,
    `方点 ${sq1} 连接圆点 1, 2, 3`,
    'add_square',
    [sq1]
  );

  // 从 3 探索 4
  makeStep(
    lineMap.exploreEdge,
    '🔍 [探索邻居] 节点 3 考察割边 (3 ➔ 4)。',
    '考察出边 (3, 4)',
    'tarjan_dfs'
  );
  curNode = 4;
  dfn[4] = low[4] = ++dfnCnt;
  stack.push(4);
  makeStep(
    lineMap.visitNode,
    '⏱️ [访问节点 4] dfn[4] = low[4] = 4；节点 4 压入栈：[1, 4]。',
    '访问节点 4 压入辅助栈',
    'tarjan_dfs',
    undefined,
    'dfn',
    4
  );

  if (isSimple) {
    makeStep(
      lineMap.backtrackLow,
      '📉 [回溯判定] 节点 4 无其他未访邻居，回溯至节点 3。',
      '回溯至节点 3',
      'tarjan_dfs'
    );
    makeStep(
      lineMap.bccCondition,
      '⚖️ [割点判定] 检查 low[4] >= dfn[3] (4 >= 3) 成立！',
      '判定割点条件 low[4] >= dfn[3]',
      'tarjan_dfs'
    );
    squareCnt++;
    const sq2 = `S${squareCnt}`;
    squareNodes.push(sq2);
    treeEdges.push({ u: sq2, v: 4 }, { u: sq2, v: 3 });
    cutVertices.push(3);
    makeStep(
      lineMap.newSquare,
      `🎉 [发现割边点双 2] 节点 3 处判定 low[4] >= dfn[3] (4 >= 3)！割边 {3, 4} 构成独立点双，新建方点 ${sq2}！`,
      `新建桥连方点 ${sq2}`,
      'add_square'
    );
    makeStep(
      lineMap.popStackConnect,
      `🟩 [弹栈并连边] 弹出节点 4，方点 ${sq2} 连接节点 4 与割点 3！`,
      `方点 ${sq2} 连接圆点 3, 4`,
      'add_square'
    );
  } else {
    // classic_6node: 3-4 点双，然后 4-5-6 点双
    squareCnt++;
    const sq2 = `S${squareCnt}`;
    squareNodes.push(sq2);
    treeEdges.push({ u: sq2, v: 4 }, { u: sq2, v: 3 });
    cutVertices.push(3);
    makeStep(
      lineMap.newSquare,
      `🎉 [发现桥连点双 2] 节点 3 处 low[4] >= dfn[3]！割点 3 显现，连接方点 ${sq2} 至 {3, 4}！`,
      `新建桥连方点 ${sq2}`,
      'add_square'
    );

    // 4-5-6 点双
    curNode = 5;
    dfn[5] = low[5] = ++dfnCnt;
    stack.push(5);
    makeStep(
      lineMap.visitNode,
      '⏱️ [访问节点 5] dfn[5] = low[5] = 5。',
      '访问节点 5 压入辅助栈',
      'tarjan_dfs',
      undefined,
      'dfn',
      5
    );

    makeStep(
      lineMap.exploreEdge,
      '🔍 [探索邻居] 节点 5 考察出边 (5 ➔ 6)。',
      '考察出边 (5, 6)',
      'tarjan_dfs'
    );

    curNode = 6;
    dfn[6] = low[6] = ++dfnCnt;
    stack.push(6);
    makeStep(
      lineMap.visitNode,
      '⏱️ [访问节点 6] dfn[6] = low[6] = 6。',
      '访问节点 6 压入辅助栈',
      'tarjan_dfs',
      undefined,
      'dfn',
      6
    );

    makeStep(
      lineMap.exploreEdge,
      '🔍 [探索邻居] 节点 6 考察反向边 (6 ➔ 4)。',
      '考察反向返祖边 (6, 4)',
      'tarjan_dfs'
    );

    // 6-4 回退边
    low[6] = Math.min(low[6], dfn[4]);
    makeStep(
      lineMap.backEdge,
      '🔄 [返祖回溯边 6 ➔ 4] low[6] 更新为 min(6, dfn[4]=4) = 4。',
      '更新追溯值 low[6]=4',
      'tarjan_dfs',
      undefined,
      'low',
      6
    );

    low[5] = Math.min(low[5], low[6]);
    makeStep(
      lineMap.backtrackLow,
      '📉 [回溯更新 low[5]] low[5] 更新为 min(5, low[6]=4) = 4。',
      '回溯更新 low[5]=4',
      'tarjan_dfs',
      undefined,
      'low',
      5
    );

    squareCnt++;
    const sq3 = `S${squareCnt}`;
    squareNodes.push(sq3);
    treeEdges.push({ u: sq3, v: 6 }, { u: sq3, v: 5 }, { u: sq3, v: 4 });
    cutVertices.push(4);
    makeStep(
      lineMap.bccCondition,
      `🎉 [发现点双分量 3] 节点 4 处判定 low[5] >= dfn[4]！识别出环状点双 {4, 5, 6}，新建方点 ${sq3}！割点 4 显现！`,
      `发现点双分量新建方点 ${sq3}`,
      'add_square'
    );

    makeStep(
      lineMap.popStackConnect,
      `🟩 [弹栈并连边] 方点 ${sq3} 分别与点双内所有节点 {4, 5, 6} 连边！`,
      `方点 ${sq3} 连接圆点 4, 5, 6`,
      'add_square'
    );
  }

  // 3. 必经点查询
  makeStep(
    lineMap.buildTree,
    `🔍 [路径必经割点定理] 在圆方树上，任意两点间所有简单路径的公共必经点，恰好等于圆方树上对应路径上出现的所有【圆点】！本次必经割点为：{ ${mustPassCutNodes.join(', ')} }！`,
    '查询圆方树路径必经割点',
    'query_path'
  );

  // 终态
  makeStep(
    lineMap.done,
    `🎉 [圆方树构建完成] 全图包含 ${n} 个圆点与 ${squareNodes.length} 个方点，割点集合为 { ${cutVertices.join(', ')} }！`,
    '圆方树构建与缩点完成',
    'done'
  );

  return steps;
}
