import { describe, it, expect } from 'vitest';
import {
  buildBstToGstStage1Steps,
  buildBstToGstStage2Steps,
  buildBstToGstStage3Steps,
  parseAndBuildBstToGstTree,
  cloneTree,
} from './bst-to-gst-step-compiler';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';

describe('BstToGstStepCompiler (LeetCode 538 / LC 1038)', () => {
  it('正确处理空树输入（Stage 1, 2, 3 均产生 1 步完成状态）', () => {
    const s1 = buildBstToGstStage1Steps(null);
    expect(s1.length).toBe(1);
    expect(s1[0].action).toBe('done');
    expect(s1[0].sum).toBe(0);
    expect(s1[0].codeLine).toBeDefined();

    const s2 = buildBstToGstStage2Steps(null);
    expect(s2.length).toBe(1);
    expect(s2[0].action).toBe('done');
    expect(s2[0].sum).toBe(0);

    const s3 = buildBstToGstStage3Steps(null);
    expect(s3.length).toBe(1);
    expect(s3[0].action).toBe('done');
    expect(s3[0].sum).toBe(0);
  });

  it('经典 BST [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8] 三阶段转换总和与根值完全一致', () => {
    const root1 = parseAndBuildBstToGstTree();
    const root2 = parseAndBuildBstToGstTree();
    const root3 = parseAndBuildBstToGstTree();

    const s1 = buildBstToGstStage1Steps(root1);
    const s2 = buildBstToGstStage2Steps(root2);
    const s3 = buildBstToGstStage3Steps(root3);

    // 经典树节点总和：0+1+2+3+4+5+6+7+8 = 36
    // 根节点 4 转换后新值为 >=4 的和：4+5+6+7+8 = 30
    const last1 = s1[s1.length - 1];
    const last2 = s2[s2.length - 1];
    const last3 = s3[s3.length - 1];

    expect(last1.sum).toBe(36);
    expect(last1.tree?.val).toBe(30);

    expect(last2.sum).toBe(36);
    expect(last2.tree?.val).toBe(30);

    expect(last3.sum).toBe(36);
    expect(last3.tree?.val).toBe(30);

    // 验证所有步骤的 1-based 代码行号
    for (const step of s1) {
      expect(step.codeLine).toBeDefined();
    }
    for (const step of s2) {
      expect(step.codeLine).toBeDefined();
    }
    for (const step of s3) {
      expect(step.codeLine).toBeDefined();
    }
  });

  it('Stage 3 Morris 遍历包含线索建立与拆除生命周期', () => {
    const root = buildTreeFromArr([1, 0, 2]);
    const steps = buildBstToGstStage3Steps(root);

    const threadBuildSteps = steps.filter((st) => st.action === 'thread-build');
    const threadCutSteps = steps.filter((st) => st.action === 'thread-cut');

    expect(threadBuildSteps.length).toBeGreaterThan(0);
    expect(threadCutSteps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].sum).toBe(3);
  });

  it('cloneTree 安全复制且独立', () => {
    const root = buildTreeFromArr([2, 1, 3]);
    const copy = cloneTree(root);
    expect(copy).not.toBe(root);
    expect(copy?.val).toBe(2);
    expect(copy?.left?.val).toBe(1);
    expect(copy?.right?.val).toBe(3);
  });
});
