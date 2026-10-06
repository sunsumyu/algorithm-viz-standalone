import { describe, it, expect } from 'vitest';
import {
  buildTreeLayout,
  buildPaperFoldingSteps,
  buildPaperFoldingStage2Steps,
  buildPaperFoldingStage3Steps,
} from './paper-folding-040-step-compiler';

describe('paper-folding-040-step-compiler', () => {
  it('buildTreeLayout generates correct number of nodes for N=3', () => {
    const nodes = buildTreeLayout(3);
    // 满二叉树节点数 = 2^3 - 1 = 7
    expect(nodes.length).toBe(7);
    expect(nodes[0].type).toBe('root');
  });

  it('buildPaperFoldingSteps produces valid in-order DFS steps for N=3', () => {
    const steps = buildPaperFoldingSteps(3);
    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('finish');
    expect(lastStep.creaseList.length).toBe(7);
    // 折痕序列应为: 凹 凹 凸 凹 凹 凸 凸
    const texts = lastStep.creaseList.map((c) => c.text);
    expect(texts).toEqual(['凹', '凹', '凸', '凹', '凹', '凸', '凸']);
  });

  it('buildPaperFoldingStage2Steps (explicit stack) matches in-order output', () => {
    const steps = buildPaperFoldingStage2Steps(3);
    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('finish');
    expect(lastStep.creaseList.length).toBe(7);
    const texts = lastStep.creaseList.map((c) => c.text);
    expect(texts).toEqual(['凹', '凹', '凸', '凹', '凹', '凸', '凸']);
  });

  it('buildPaperFoldingStage3Steps (layered physical folding) matches in-order output', () => {
    const steps = buildPaperFoldingStage3Steps(3);
    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('finish');
    expect(lastStep.creaseList.length).toBe(7);
    const texts = lastStep.creaseList.map((c) => c.text);
    expect(texts).toEqual(['凹', '凹', '凸', '凹', '凹', '凸', '凸']);
  });

  it('handles N=1 and N=2 boundary cases correctly', () => {
    const steps1 = buildPaperFoldingSteps(1);
    expect(steps1[steps1.length - 1].creaseList.length).toBe(1);
    expect(steps1[steps1.length - 1].creaseList[0].text).toBe('凹');

    const steps2 = buildPaperFoldingSteps(2);
    expect(steps2[steps2.length - 1].creaseList.length).toBe(3);
    expect(steps2[steps2.length - 1].creaseList.map((c) => c.text)).toEqual(['凹', '凹', '凸']);
  });
});
