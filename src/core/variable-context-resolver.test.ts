import { describe, it, expect } from 'vitest';
import { VariableContextResolver } from './variable-context-resolver';

describe('VariableContextResolver Deep Module Unit Tests', () => {
  it('should cleanly extract variables from step.vars', () => {
    const step = {
      vars: [
        { name: 'i', value: '3', type: 'number' },
        { name: 'j', value: '1', type: 'number' },
        { name: 'ans', value: '10', type: 'number' },
      ],
    };

    const varsMap = VariableContextResolver.resolve(step);
    expect(varsMap.size).toBeGreaterThanOrEqual(3);

    const iVar = VariableContextResolver.getVariable(varsMap, 'i');
    expect(iVar).toBeDefined();
    expect(iVar?.value).toBe('3');

    const jVar = VariableContextResolver.getVariable(varsMap, 'j');
    expect(jVar?.value).toBe('1');
  });

  it('should parse metric key-values like metric-pos and metric-ans', () => {
    const step = {
      metrics: {
        'metric-pos': 'i=3, j=1',
        'metric-status': '向上分支探索',
        'metric-ans': '5',
      },
    };

    const varsMap = VariableContextResolver.resolve(step);
    const iVar = VariableContextResolver.getVariable(varsMap, 'i');
    expect(iVar).toBeDefined();
    expect(iVar?.value).toBe('3');

    const jVar = VariableContextResolver.getVariable(varsMap, 'j');
    expect(jVar).toBeDefined();
    expect(jVar?.value).toBe('1');

    const ansVar = VariableContextResolver.getVariable(varsMap, 'ans');
    expect(ansVar).toBeDefined();
    expect(ansVar?.value).toBe('5');
  });

  it('should extract direct primitive properties from step', () => {
    const step = {
      i: 4,
      j: 2,
      target: 9,
      nums: [1, 2, 3],
      decision: '忽略该属性',
    };

    const varsMap = VariableContextResolver.resolve(step);
    expect(VariableContextResolver.getVariable(varsMap, 'i')?.value).toBe('4');
    expect(VariableContextResolver.getVariable(varsMap, 'j')?.value).toBe('2');
    expect(VariableContextResolver.getVariable(varsMap, 'target')?.value).toBe('9');
    expect(VariableContextResolver.getVariable(varsMap, 'nums')?.value).toContain('[1, 2, 3]');
    expect(VariableContextResolver.getVariable(varsMap, 'decision')).toBeUndefined();
  });

  it('should handle cross-language camelCase and snake_case aliases', () => {
    const step = {
      vars: [
        { name: 'startIndex', value: '2' },
        { name: 'has_cycle', value: 'true' },
      ],
    };

    const varsMap = VariableContextResolver.resolve(step);

    // Python queries start_index -> should match startIndex
    const pyVar = VariableContextResolver.getVariable(varsMap, 'start_index');
    expect(pyVar).toBeDefined();
    expect(pyVar?.value).toBe('2');

    // Java queries hasCycle -> should match has_cycle
    const javaVar = VariableContextResolver.getVariable(varsMap, 'hasCycle');
    expect(javaVar).toBeDefined();
    expect(javaVar?.value).toBe('true');
  });

  it('should generate concise inline debugging summaries for code lines', () => {
    const step = {
      i: 3,
      j: 1,
      ans: 0,
    };
    const varsMap = VariableContextResolver.resolve(step);

    const lineCode = 'int p1 = f(a, b, i - 1, j);';
    const summary = VariableContextResolver.formatInlineSummary(varsMap, lineCode);

    expect(summary).toContain('//');
    expect(summary).toContain('i: 3');
    expect(summary).toContain('j: 1');
  });

  it('should accurately resolve l=0 from staticQueueState and scope without false positive from arithmetic r - l', () => {
    const step = {
      tree: { val: 3 },
      current: null,
      levelIndex: 0,
      levelSize: 1,
      staticQueueState: { array: [3], l: 0, r: 1, windowSize: 1 },
      scope: { l: 0, r: 1, size: 1 },
      decision: '锁定本层大小: size = r - l = 1 - 0 = 1',
      log: 'int size = r - l -> 1',
      codeLine: 11,
    };

    const varsMap = VariableContextResolver.resolve(step);
    const lVar = VariableContextResolver.getVariable(varsMap, 'l');
    const rVar = VariableContextResolver.getVariable(varsMap, 'r');
    const sizeVar = VariableContextResolver.getVariable(varsMap, 'size');

    expect(lVar?.value).toBe('0');
    expect(rVar?.value).toBe('1');
    expect(sizeVar?.value).toBe('1');

    const summary = VariableContextResolver.formatInlineSummary(varsMap, 'int size = r - l;');
    expect(summary).toContain('l: 0');
    expect(summary).toContain('r: 1');
    expect(summary).toContain('size: 1');
    expect(summary).not.toContain('l: 1');
  });

  it('should automatically unpack object-shaped step.vars and resolve graph semantic aliases', () => {
    const graphStep = {
      vars: {
        curNode: 2,
        distList: [Infinity, Infinity, 0, Infinity, Infinity],
        visitedList: [false, false, false, false, false],
        pqSnapshot: [{ u: 2, d: 0 }],
        maxDelaySoFar: 0,
      },
    };

    const varsMap = VariableContextResolver.resolve(graphStep);

    // 1. 验证 curNode 自动映射到 u
    const uVar = VariableContextResolver.getVariable(varsMap, 'u');
    expect(uVar).toBeDefined();
    expect(uVar?.value).toBe('2');

    // 2. 验证 distList 映射到 dist 与 distance
    const distVar = VariableContextResolver.getVariable(varsMap, 'dist');
    const distanceVar = VariableContextResolver.getVariable(varsMap, 'distance');
    expect(distVar).toBeDefined();
    expect(distanceVar).toBeDefined();
    expect(distVar?.value).toContain('∞');

    // 3. 验证 visitedList 映射到 visited
    const visVar = VariableContextResolver.getVariable(varsMap, 'visited');
    expect(visVar).toBeDefined();

    // 4. 验证 maxDelaySoFar 映射到 ans
    const ansVar = VariableContextResolver.getVariable(varsMap, 'ans');
    expect(ansVar).toBeDefined();
    expect(ansVar?.value).toBe('0');
  });

  it('should destructure activeEdge tuple into u, v, w and evaluate visited[u] expressions', () => {
    const stepWithEdge = {
      curNode: 2,
      activeEdge: [2, 3, 1],
      visited: [false, false, true, false, false],
      distance: [Infinity, Infinity, 0, Infinity, Infinity],
    };

    const varsMap = VariableContextResolver.resolve(stepWithEdge);

    expect(VariableContextResolver.getVariable(varsMap, 'u')?.value).toBe('2');
    expect(VariableContextResolver.getVariable(varsMap, 'v')?.value).toBe('3');
    expect(VariableContextResolver.getVariable(varsMap, 'w')?.value).toBe('1');

    // 复合表达式求值
    const visitedU = VariableContextResolver.getVariable(varsMap, 'visited[u]', stepWithEdge);
    expect(visitedU).toBeDefined();
    expect(visitedU?.value).toBe('true');

    const distanceU = VariableContextResolver.getVariable(varsMap, 'distance[u]', stepWithEdge);
    expect(distanceU).toBeDefined();
    expect(distanceU?.value).toBe('0');
  });

  it('should automatically resolve source parameter k and derive total node count n for graph algorithms', () => {
    const step = {
      curNode: 2,
      k: 2,
      distList: [Infinity, Infinity, 0, Infinity, Infinity],
    };

    const varsMap = VariableContextResolver.resolve(step);

    expect(VariableContextResolver.getVariable(varsMap, 'k')?.value).toBe('2');
    expect(VariableContextResolver.getVariable(varsMap, 'source')?.value).toBe('2');
    expect(VariableContextResolver.getVariable(varsMap, 'src')?.value).toBe('2');
    expect(VariableContextResolver.getVariable(varsMap, 'n')?.value).toBe('4');
  });

  it('should capture graph and adj adjacency lists without filtering them as ignored keys, and enrich with current node u出边', () => {
    const graphData = [
      [],
      [],
      [{ to: 1, w: 1 }, { to: 3, w: 1 }],
      [{ to: 4, w: 1 }],
      [],
    ];

    const graphStep = {
      curNode: 2,
      u: 2,
      graph: graphData,
      times: [[2, 1, 1], [2, 3, 1], [3, 4, 1]],
    };

    const varsMap = VariableContextResolver.resolve(graphStep);

    // 1. graph 与 adj 应双向解析为真实邻接表数据
    const graphVar = VariableContextResolver.getVariable(varsMap, 'graph', graphStep);
    expect(graphVar).toBeDefined();
    expect(graphVar?.type).toBe('array');
    expect(graphVar?.value).toContain('2: [[1, 1], [3, 1]]');
    expect(graphVar?.detail).toContain('5 节点邻接表');

    const adjVar = VariableContextResolver.getVariable(varsMap, 'adj', graphStep);
    expect(adjVar).toBeDefined();
    expect(adjVar?.value).toContain('2: [[1, 1], [3, 1]]');

    // 2. times 边集合应被解析为真实二维数组内容，而非文本概括
    const timesVar = VariableContextResolver.getVariable(varsMap, 'times', graphStep);
    expect(timesVar).toBeDefined();
    expect(timesVar?.value).toBe('[[2, 1, 1], [2, 3, 1], [3, 4, 1]]');
    expect(timesVar?.detail).toContain('[起点u, 终点v, 权重w]');

    // 3. graph.get(u) 表达式求值
    const getExpr = VariableContextResolver.getVariable(varsMap, 'graph.get(u)', graphStep);
    expect(getExpr).toBeDefined();
    expect(getExpr?.name).toBe('graph.get(2)');
  });

  it('should distinguish canvas layout object with nodes and edges from algorithmic graph array', () => {
    const canvasSceneStep = {
      graph: {
        nodes: [{ id: 1, x: 100, y: 100 }],
        edges: [{ from: 1, to: 2 }],
      },
      matrix: [
        [1, 2],
        [3, 4],
      ],
    };

    const varsMap = VariableContextResolver.resolve(canvasSceneStep);

    // Canvas scene graph 应该被忽略，避免 DOM/图元污染
    expect(varsMap.has('graph')).toBe(false);

    // 算法矩阵 matrix: number[][] 应当正常解析
    const matrixVar = VariableContextResolver.getVariable(varsMap, 'matrix');
    expect(matrixVar).toBeDefined();
    expect(matrixVar?.value).toBe('[2×2]');
  });

  it('automatically derives forward star data structures (next, head, to, weight) via top-level abstraction', () => {
    // 即使领域适配器 step 中完全没有显式提供 vars 或 scope，顶层抽象解析器也能从 edges/head 自动派生出所有变量
    const rawForwardStarStep = {
      action: 'update_head',
      u: 2,
      v: 4,
      w: 35,
      cnt: 1,
      prevHeadVal: -1,
      edges: [{ u: 2, to: 4, weight: 35, next: -1, index: 0 }],
      head: [-1, -1, 0, -1, -1],
    };

    const varsMap = VariableContextResolver.resolve(rawForwardStarStep);

    // 1. 核心变量捕获
    expect(VariableContextResolver.getVariable(varsMap, 'u')?.value).toBe('2');
    expect(VariableContextResolver.getVariable(varsMap, 'v')?.value).toBe('4');
    expect(VariableContextResolver.getVariable(varsMap, 'w')?.value).toBe('35');
    expect(VariableContextResolver.getVariable(varsMap, 'cnt')?.value).toBe('1');

    // 2. 关键链式指针捕获 (绝不出现未捕获)
    const nextVar = VariableContextResolver.getVariable(varsMap, 'next');
    expect(nextVar).toBeDefined();
    expect(nextVar?.value).toBe('0'); // prevHeadVal 为 -1 (空)，对应 1-based 下标 0

    const headVar = VariableContextResolver.getVariable(varsMap, 'head');
    expect(headVar).toBeDefined();
    expect(headVar?.value).toBe('1'); // update_head 步骤已动态更新为 cnt=1

    // 3. 下标复合表达式自动解析
    const nextExpr = VariableContextResolver.getVariable(varsMap, 'next[cnt]', rawForwardStarStep);
    expect(nextExpr).toBeDefined();
    expect(nextExpr?.value).toBe('0');

    const headExpr = VariableContextResolver.getVariable(varsMap, 'head[u]', rawForwardStarStep);
    expect(headExpr).toBeDefined();
    expect(headExpr?.value).toBe('1');
  });

  it('automatically resolves dp, memo, table and cell values from step.grid across all algorithms', () => {
    // 即使领域适配器 step 中完全没有显式提供 dp，顶层抽象解析器也能从 step.grid 和坐标自动求值
    const rawDpStep = {
      i: 1,
      j: 2,
      grid: [
        [0, 0, 0],
        [0, 10, 20],
      ],
    };

    const varsMap = VariableContextResolver.resolve(rawDpStep);

    // 1. 查询 dp 标识符：自动求值当前单元格 dp[1][2] = 20
    const dpVar = VariableContextResolver.getVariable(varsMap, 'dp', rawDpStep);
    expect(dpVar).toBeDefined();
    expect(dpVar?.value).toBe('[1][2] = 20');
    expect(dpVar?.detail).toContain('当前单元格 dp[1][2] = 20');

    // 2. 复合二维下标带算术求值: dp[i - 1][j] -> dp[0][2] = 0
    const prevCell = VariableContextResolver.getVariable(varsMap, 'dp[i - 1][j]', rawDpStep);
    expect(prevCell).toBeDefined();
    expect(prevCell?.value).toBe('0');

    // 3. 初始阶段（尚无 i / j 坐标时），查询 dp 显示表格整体规格
    const initialDpStep = {
      grid: [
        [0, 0, 0],
        [0, 0, 0],
      ],
    };
    const initVarsMap = VariableContextResolver.resolve(initialDpStep);
    const initDpVar = VariableContextResolver.getVariable(initVarsMap, 'dp', initialDpStep);
    expect(initDpVar).toBeDefined();
    expect(initDpVar?.value).toBe('[2×3]');
    expect(initDpVar?.detail).toContain('2 行 3 列');
  });

  it('correctly evaluates 2D item array expressions (arr[k][1], arr[k][0]) and provides rich Chinese semantic explanations', () => {
    // 模拟分组背包状态：k = 2, arr 包含物品三元组 [体积, 价值, 组号]
    const step = {
      i: 1,
      j: 20,
      k: 2,
      teams: 3,
      arr: [
        [0, 0, 0],
        [10, 10, 1],
        [20, 20, 2], // 物品 #2: 体积 20, 价值 20, 组号 2
        [30, 30, 2],
      ],
      grid: [
        [0, 0, 0, 0],
        [0, 0, 20, 20],
      ],
    };

    const varsMap = VariableContextResolver.resolve(step);

    // 1. 测试 2D 下标求值 arr[k][1] (收益价值)
    const valExpr = VariableContextResolver.getVariable(varsMap, 'arr[k][1]', step);
    expect(valExpr).toBeDefined();
    expect(valExpr?.name).toBe('arr[2][1]');
    expect(valExpr?.value).toBe('20');
    expect(valExpr?.detail).toContain('收益价值');
    expect(valExpr?.detail).toContain('[体积: 20, 价值: 20, 组号: 2]');

    // 2. 测试 2D 下标求值 arr[k][0] (消耗体积)
    const costExpr = VariableContextResolver.getVariable(varsMap, 'arr[k][0]', step);
    expect(costExpr).toBeDefined();
    expect(costExpr?.name).toBe('arr[2][0]');
    expect(costExpr?.value).toBe('20');
    expect(costExpr?.detail).toContain('消耗体积');
    expect(costExpr?.detail).toContain('[体积: 20, 价值: 20, 组号: 2]');

    // 3. 测试 2D 下标求值 arr[k][2] (所属组号)
    const groupExpr = VariableContextResolver.getVariable(varsMap, 'arr[k][2]', step);
    expect(groupExpr).toBeDefined();
    expect(groupExpr?.name).toBe('arr[2][2]');
    expect(groupExpr?.value).toBe('2');
    expect(groupExpr?.detail).toContain('所属组号');

    // 4. 测试 1D 下标求值 arr[k] (特征三元组)
    const item1D = VariableContextResolver.getVariable(varsMap, 'arr[k]', step);
    expect(item1D).toBeDefined();
    expect(item1D?.name).toBe('arr[2]');
    expect(item1D?.value).toBe('[20, 20, 2]');
    expect(item1D?.detail).toContain('特征三元组');
    expect(item1D?.detail).toContain('体积 20, 价值 20, 组号 2');

    // 5. 测试直接查询 arr 标识符 (当光标悬停在 arr 且 k=2 时展示全量数组与当前指针上下文)
    const arrIdent = VariableContextResolver.getVariable(varsMap, 'arr', step);
    expect(arrIdent).toBeDefined();
    expect(arrIdent?.name).toBe('arr');
    expect(arrIdent?.type).toBe('array');
    expect(arrIdent?.value).toContain('[10, 10, 1]');
    expect(arrIdent?.value).toContain('[20, 20, 2]');
    expect(arrIdent?.detail).toContain('特征三元组');
    expect(arrIdent?.detail).toContain('当前指针 k=2');
  });

  it('parses nested subscript expressions and evaluates complex DP transitions', () => {
    // 验证下标提取器对嵌套括号的健壮性
    const parsed = VariableContextResolver.parseSubscriptExpression('dp[i - 1][j - arr[k][0]]');
    expect(parsed).toBeDefined();
    expect(parsed?.tableName).toBe('dp');
    expect(parsed?.indices).toEqual(['i - 1', 'j - arr[k][0]']);

    const step = {
      i: 1,
      j: 20,
      k: 2,
      arr: [
        [0, 0, 0],
        [10, 10, 1],
        [20, 20, 2],
      ],
      grid: [
        [15, 0], // grid[0][0] = 15
        [0, 20],
      ],
    };
    const varsMap = VariableContextResolver.resolve(step);

    // 验证 evaluateIndexExpr 对 'j - arr[k][0]' 的求值: j=20, arr[2][0]=20 -> 20 - 20 = 0
    const colIdx = VariableContextResolver.evaluateIndexExpr('j - arr[k][0]', varsMap, step);
    expect(colIdx).toBe(0);

    // 验证 dp[i - 1][j - arr[k][0]] -> dp[0][0] = 15
    const transitionCell = VariableContextResolver.getVariable(varsMap, 'dp[i - 1][j - arr[k][0]]', step);
    expect(transitionCell).toBeDefined();
    expect(transitionCell?.name).toBe('dp[0][0]');
    expect(transitionCell?.value).toBe('15');
  });

  it('provides rich semantic descriptions from dictionary via getDescription', () => {
    expect(VariableContextResolver.getDescription('dp')).toBe('动态规划最优子结构状态备忘表');
    expect(VariableContextResolver.getDescription('end')).toBe('当前物品组终止边界 (双指针开区间终点)');
    expect(VariableContextResolver.getDescription('start')).toBe('当前物品组起始下标 (双指针区间起点)');
    expect(VariableContextResolver.getDescription('teams')).toBe('独立物品组总数 (按组互斥划分)');
    expect(VariableContextResolver.getDescription('arr')).toContain('二维物品三元组数组');
  });

  it('resolves piles and preSum variables with full structure and active pointer context', () => {
    const step = {
      i: 0,
      j: 2,
      c: 2,
      piles: [
        [1, 100, 3],
        [7, 8, 9],
      ],
      preSum: [0, 1, 101, 104],
    };
    const varsMap = VariableContextResolver.resolve(step);

    // 1. 查询 piles (硬币栈集合)
    const pilesVar = VariableContextResolver.getVariable(varsMap, 'piles', step);
    expect(pilesVar).toBeDefined();
    expect(pilesVar?.name).toBe('piles');
    expect(pilesVar?.type).toBe('array');
    expect(pilesVar?.value).toContain('[1, 100, 3]');
    expect(pilesVar?.value).toContain('[7, 8, 9]');
    expect(pilesVar?.detail).toContain('2 个独立栈');
    expect(pilesVar?.detail).toContain('当前指针 i=0');
    expect(pilesVar?.detail).toContain('抽取 c=2 枚');

    // 2. 查询 preSum (前缀和数组)
    const preSumVar = VariableContextResolver.getVariable(varsMap, 'preSum', step);
    expect(preSumVar).toBeDefined();
    expect(preSumVar?.name).toBe('preSum');
    expect(preSumVar?.type).toBe('array');
    expect(preSumVar?.value).toBe('[0, 1, 101, 104]');
    expect(preSumVar?.detail).toContain('前缀和');
    expect(preSumVar?.detail).toContain('当前连续拿取 c=2 枚面值收益 = 101');
  });

  it('resolves stones and sum variables for interval DP with range weight calculation', () => {
    const step = {
      i: 0,
      j: 3,
      k: 1,
      stones: [3, 2, 4, 1],
      sum: [0, 3, 5, 9, 10],
    };
    const varsMap = VariableContextResolver.resolve(step);

    // 1. 查询 stones (石子堆数组)
    const stonesVar = VariableContextResolver.getVariable(varsMap, 'stones', step);
    expect(stonesVar).toBeDefined();
    expect(stonesVar?.name).toBe('stones');
    expect(stonesVar?.type).toBe('array');
    expect(stonesVar?.value).toBe('[3, 2, 4, 1]');
    expect(stonesVar?.detail).toContain('4 堆');
    expect(stonesVar?.detail).toContain('考察区间 [0..3]');
    expect(stonesVar?.detail).toContain('切分点 k=1');

    // 2. 查询 sum (区间 DP 前缀和数组)
    const sumVar = VariableContextResolver.getVariable(varsMap, 'sum', step);
    expect(sumVar).toBeDefined();
    expect(sumVar?.name).toBe('sum');
    expect(sumVar?.type).toBe('array');
    expect(sumVar?.value).toBe('[0, 3, 5, 9, 10]');
    expect(sumVar?.detail).toContain('当前区间 [0..3] 总重量 = sum[4] - sum[0] = 10');
  });
});


