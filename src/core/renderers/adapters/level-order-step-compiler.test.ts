import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import { LevelOrderStepCompiler } from './level-order-step-compiler';
import {
  LEVEL_ORDER_STAGE2_LINES,
  LEVEL_ORDER_STATIC_ARRAY_LINES,
  LEVEL_ORDER_HASH_MAP_LINES,
  LEVEL_ORDER_STAGE1_LINES,
} from '../../../algorithms/categories/tree/binary-tree-level-stage-codes';

describe('LevelOrderStepCompiler (二叉树层序遍历通用步进推演深模块)', () => {
  const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);

  it('Stage 1 标准队列推演能够正确分层，最终得到 [[3], [9, 20], [15, 7]]', () => {
    const steps = LevelOrderStepCompiler.compileStandardQueueSteps(root, LEVEL_ORDER_STAGE2_LINES);
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.result).toEqual([[3], [9, 20], [15, 7]]);
    expect(steps.every((s) => s.codeLine != null)).toBe(true);
  });

  it('Stage 2 静态连续数组推演能够对齐 l/r 指针与层序结果', () => {
    const steps = LevelOrderStepCompiler.compileStaticArraySteps(root, LEVEL_ORDER_STATIC_ARRAY_LINES);
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.result).toEqual([[3], [9, 20], [15, 7]]);
    expect(last.staticQueueState).toBeDefined();
    expect(last.staticQueueState!.l).toBe(last.staticQueueState!.r);
  });

  it('Stage 3 哈希表层级推演记录 5 个节点与其所在层级', () => {
    const steps = LevelOrderStepCompiler.compileHashMapSteps(root, LEVEL_ORDER_HASH_MAP_LINES);
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.result).toEqual([[3], [9, 20], [15, 7]]);
    expect(last.hashMapState?.entries.length).toBe(5);
  });

  it('Stage 4 DFS 递归深度优先分层能够正确推演前序遍历深度定位', () => {
    const steps = LevelOrderStepCompiler.compileDfsSteps(root, LEVEL_ORDER_STAGE1_LINES);
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.result).toEqual([[3], [9, 20], [15, 7]]);
  });

  it('空树边界严密收敛：所有阶段均返回空结果集 []', () => {
    expect(LevelOrderStepCompiler.compileStandardQueueSteps(null, LEVEL_ORDER_STAGE2_LINES).pop()?.result).toEqual([]);
    expect(LevelOrderStepCompiler.compileStaticArraySteps(null, LEVEL_ORDER_STATIC_ARRAY_LINES).pop()?.result).toEqual([]);
    expect(LevelOrderStepCompiler.compileHashMapSteps(null, LEVEL_ORDER_HASH_MAP_LINES).pop()?.result).toEqual([]);
    expect(LevelOrderStepCompiler.compileDfsSteps(null, LEVEL_ORDER_STAGE1_LINES).pop()?.result).toEqual([]);
  });
});
