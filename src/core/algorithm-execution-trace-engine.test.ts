import { describe, it, expect } from 'vitest';
import {
  AlgorithmExecutionTraceEngine,
  TraceRecorder,
} from './algorithm-execution-trace-engine';

describe('AlgorithmExecutionTraceEngine Deep Module', () => {
  const dummyCodeLanguages = {
    java: [
      'public int[] dijkstra(int n, int[][] edges) {',
      '    int[] dist = new int[n]; // @step:init',
      '    PriorityQueue<int[]> pq = new PriorityQueue<>(); // @step:pq',
      '    while (!pq.isEmpty()) { // @step:loop',
      '        int[] curr = pq.poll(); // @step:poll',
      '        // relax edges',
      '        dist[v] = d; // @step:relax',
      '    }',
      '    return dist; // @step:return',
      '}',
    ],
    python: [
      'def dijkstra(n, edges):',
      '    dist = [float("inf")] * n # @step:init',
      '    pq = [] # @step:pq',
      '    while pq: # @step:loop',
      '        d, u = heapq.heappop(pq) # @step:poll',
      '        # relax',
      '        dist[v] = d # @step:relax',
      '    return dist # @step:return',
    ],
    cpp: [
      'vector<int> dijkstra(int n, vector<vector<int>>& edges) {',
      '    vector<int> dist(n, INT_MAX); // @step:init',
      '    priority_queue<pair<int, int>> pq; // @step:pq',
      '    while (!pq.empty()) { // @step:loop',
      '        auto [d, u] = pq.top(); pq.pop(); // @step:poll',
      '        dist[v] = d; // @step:relax',
      '    }',
      '    return dist; // @step:return',
      '}',
    ],
    javascript: [
      'function dijkstra(n, edges) {',
      '    const dist = new Array(n).fill(Infinity); // @step:init',
      '    const pq = []; // @step:pq',
      '    while (pq.length > 0) { // @step:loop',
      '        const [d, u] = pq.shift(); // @step:poll',
      '        dist[v] = d; // @step:relax',
      '    }',
      '    return dist; // @step:return',
      '}',
    ],
  };

  it('should automatically compile @step:anchor tags to physical lines across 4 languages', () => {
    const steps = AlgorithmExecutionTraceEngine.trace(
      (recorder: TraceRecorder) => {
        recorder.step({
          anchor: '@step:init',
          message: '初始化距离数组',
          vars: { n: 4 },
        });

        recorder.step({
          anchor: 'relax', // without @step: prefix also works
          message: '松弛边 0 -> 1',
          vars: { u: 0, v: 1, dist: 5 },
          graph: {
            activeNodes: [0, 1],
            activeEdges: ['0->1'],
          },
        });

        recorder.step({
          anchor: '@step:return',
          message: '返回最终最短路结果',
          vars: { ans: [0, 5, 2, 8] },
        });
      },
      {
        codeLanguages: dummyCodeLanguages,
        specKey: 'test-dijkstra-spec',
      }
    );

    expect(steps).toHaveLength(3);

    // 1. 验证第 1 步 (init)
    const step1 = steps[0];
    expect(step1.stepIndex).toBe(1);
    expect(step1.anchor).toBe('init');
    expect(step1.codeLinesByLang.java).toBe(2);
    expect(step1.codeLinesByLang.python).toBe(2);
    expect(step1.codeLinesByLang.cpp).toBe(2);
    expect(step1.codeLinesByLang.javascript).toBe(2);
    expect(step1.vars).toEqual({ n: 4 });

    // 2. 验证第 2 步 (relax)
    const step2 = steps[1];
    expect(step2.stepIndex).toBe(2);
    expect(step2.anchor).toBe('relax');
    expect(step2.codeLinesByLang.java).toBe(7);
    expect(step2.codeLinesByLang.python).toBe(7);
    expect(step2.codeLinesByLang.cpp).toBe(6);
    expect(step2.codeLinesByLang.javascript).toBe(6);
    expect(step2.graph?.activeNodes).toEqual([0, 1]);
    expect(step2.graph?.activeEdges).toEqual(['0->1']);

    // 3. 验证第 3 步 (return)
    const step3 = steps[2];
    expect(step3.stepIndex).toBe(3);
    expect(step3.anchor).toBe('return');
    expect(step3.codeLinesByLang.java).toBe(9);
    expect(step3.codeLinesByLang.python).toBe(8);
    expect(step3.codeLinesByLang.cpp).toBe(8);
    expect(step3.codeLinesByLang.javascript).toBe(8);
  });

  it('should enforce immutable snapshot defense (mutations do not affect past steps)', () => {
    const mutableVars = { count: 0, items: [1, 2] };
    const mutableGraph = { activeNodes: [1], edgeWeights: { '1->2': 10 } };
    const mutableMatrix = { grid: [[1, 2], [3, 4]] };

    const steps = AlgorithmExecutionTraceEngine.trace((recorder) => {
      recorder.step({
        vars: mutableVars,
        graph: mutableGraph,
        matrix: mutableMatrix,
      });

      // 在后续步骤中直接原地破坏性修改对象
      mutableVars.count = 999;
      mutableVars.items.push(999);
      mutableGraph.activeNodes.push(999);
      mutableGraph.edgeWeights['1->2'] = 999;
      mutableMatrix.grid[0][0] = 999;

      recorder.step({
        vars: mutableVars,
        graph: mutableGraph,
        matrix: mutableMatrix,
      });
    });

    expect(steps).toHaveLength(2);

    // 第一步的快照必须保持原值，绝对未受破坏性修改影响
    expect(steps[0].vars?.count).toBe(0);
    expect(steps[0].vars?.items).toEqual([1, 2]);
    expect(steps[0].graph?.activeNodes).toEqual([1]);
    expect(steps[0].graph?.edgeWeights?.['1->2']).toBe(10);
    expect(steps[0].matrix?.grid?.[0][0]).toBe(1);

    // 第二步反映新值
    expect(steps[1].vars?.count).toBe(999);
    expect(steps[1].vars?.items).toEqual([1, 2, 999]);
    expect(steps[1].graph?.activeNodes).toEqual([1, 999]);
    expect(steps[1].graph?.edgeWeights?.['1->2']).toBe(999);
    expect(steps[1].matrix?.grid?.[0][0]).toBe(999);
  });

  it('should clean code lines and strip @step: annotations cleanly', () => {
    const clean = AlgorithmExecutionTraceEngine.cleanCode(dummyCodeLanguages);
    expect(clean.java[1]).toBe('    int[] dist = new int[n];');
    expect(clean.java[1]).not.toContain('@step:init');
    expect(clean.python[1]).toBe('    dist = [float("inf")] * n');
    expect(clean.python[1]).not.toContain('@step:init');
  });

  it('should run headless algorithm execution and support step introspection', () => {
    let recorderRef: TraceRecorder | null = null;
    const steps = AlgorithmExecutionTraceEngine.trace((recorder) => {
      recorderRef = recorder;
      for (let i = 0; i < 5; i++) {
        recorder.step({
          type: 'loop',
          message: `Iteration ${i}`,
          vars: { i, square: i * i },
        });
        expect(recorder.getStepCount()).toBe(i + 1);
        expect(recorder.getLastStep()?.vars?.square).toBe(i * i);
      }
    });

    expect(steps).toHaveLength(5);
    expect(steps[4].vars).toEqual({ i: 4, square: 16 });
  });
});
