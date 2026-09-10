import { describe, it, expect } from 'vitest';
import { BacktrackTraceEngine } from './backtrack-trace-engine';

describe('BacktrackTraceEngine (DDD 领域推导引擎测试)', () => {
  it('正确推导简单组合问题的决策树与步骤流 (n=3, k=2)', () => {
    const res = BacktrackTraceEngine.compile<number>({
      name: '组合 (3, 2)',
      getCandidates: (path) => {
        const last = path.length === 0 ? 0 : path[path.length - 1];
        const res: number[] = [];
        for (let i = last + 1; i <= 3; i++) {
          res.push(i);
        }
        return res;
      },
      isSolution: (path) => path.length === 2,
    });

    expect(res.solutions).toEqual([
      [1, 2],
      [1, 3],
      [2, 3],
    ]);
    expect(res.steps.length).toBeGreaterThan(0);
    expect(res.root.children.length).toBe(3); // 1, 2, 3
  });

  it('支持声明式剪枝谓词并动态记录剪枝步', () => {
    const res = BacktrackTraceEngine.compile<number>({
      name: '剪枝组合 (4, 2)',
      getCandidates: (path) => {
        const last = path.length === 0 ? 0 : path[path.length - 1];
        const cand: number[] = [];
        for (let i = last + 1; i <= 4; i++) {
          cand.push(i);
        }
        return cand;
      },
      isSolution: (path) => path.length === 2,
      prunePredicate: (cand, path) => {
        const need = 2 - path.length;
        const upper = 4 - need + 1;
        return {
          pruned: cand > upper,
        };
      },
    });

    // 找到的所有解
    expect(res.solutions).toEqual([
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 3],
      [2, 4],
      [3, 4],
    ]);

    // 验证根节点第 4 分支在初始步骤未被剪枝，只有遍历到剪枝时才加入 prunedNodeIds
    expect(res.steps[0].prunedNodeIds.length).toBe(0);
    const pruneSteps = res.steps.filter((s) => s.message.includes('剪枝截断'));
    expect(pruneSteps.length).toBeGreaterThan(0);
    expect(pruneSteps[0].prunedNodeIds.length).toBeGreaterThan(0);
  });
});
