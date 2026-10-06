import { describe, it, expect } from 'vitest';
import {
  generateTreeRecursionSteps,
  generateTreeBstSteps,
  generateTreeMaxDistSteps,
  getTree019PresetNodes,
} from './tree-recursion-019-step-compiler';

describe('TreeRecursion019StepCompiler (Class 019)', () => {
  it('正确处理空树边界（Stage 1, 2, 3 均产生空树返回步）', () => {
    const s1 = generateTreeRecursionSteps([]);
    expect(s1.length).toBe(1);
    expect(s1[0].collectedInfo.isBalanced).toBe(true);
    expect(s1[0].codeLine).toBeDefined();

    const s2 = generateTreeBstSteps([]);
    expect(s2.length).toBe(1);
    expect(s2[0].collectedInfo.isBST).toBe(true);

    const s3 = generateTreeMaxDistSteps([]);
    expect(s3.length).toBe(1);
    expect(s3[0].collectedInfo.maxDistance).toBe(0);
  });

  it('Stage 1 能够准确区分平衡树与非平衡退化单链树', () => {
    const balancedNodes = getTree019PresetNodes('balanced', 1);
    const sBalanced = generateTreeRecursionSteps(balancedNodes);
    const lastBalanced = sBalanced[sBalanced.length - 1];
    expect(lastBalanced.collectedInfo.isBalanced).toBe(true);
    expect(lastBalanced.statusBadge?.text).toContain('平衡');

    const unbalancedNodes = getTree019PresetNodes('unbalanced', 1);
    const sUnbalanced = generateTreeRecursionSteps(unbalancedNodes);
    const lastUnbalanced = sUnbalanced[sUnbalanced.length - 1];
    expect(lastUnbalanced.collectedInfo.isBalanced).toBe(false);
    expect(lastUnbalanced.statusBadge?.text).toBe('不平衡');
  });

  it('Stage 2 能够准确判定二叉搜索树合法性', () => {
    const validBst = getTree019PresetNodes('balanced', 2);
    const sValid = generateTreeBstSteps(validBst);
    expect(sValid[sValid.length - 1].collectedInfo.isBST).toBe(true);

    const invalidBst = getTree019PresetNodes('unbalanced', 2);
    const sInvalid = generateTreeBstSteps(invalidBst);
    expect(sInvalid[sInvalid.length - 1].collectedInfo.isBST).toBe(false);
  });

  it('Stage 3 准确计算二叉树中节点间最大距离', () => {
    const nodes = getTree019PresetNodes('balanced', 3);
    const s = generateTreeMaxDistSteps(nodes);
    const last = s[s.length - 1];
    expect(last.collectedInfo.maxDistance).toBeGreaterThan(0);
  });

  it('所有生成步骤均包含合法的 1-based 代码行号', () => {
    const nodes = getTree019PresetNodes('balanced', 1);
    const s = generateTreeRecursionSteps(nodes);
    for (const step of s) {
      expect(step.codeLine).toBeDefined();
    }
  });
});
