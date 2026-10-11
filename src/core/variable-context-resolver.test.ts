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
});

