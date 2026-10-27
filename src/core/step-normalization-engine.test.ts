import { describe, it, expect } from 'vitest';
import { StepNormalizationEngine } from './step-normalization-engine';
import { TreeNode } from './renderers/tree-svg';

describe('StepNormalizationEngine (USNE) Deep Module Test Suite', () => {
  const dummyTree: TreeNode = {
    val: 1,
    left: null,
    right: { val: 2, left: null, right: null },
  };

  it('防断电卫士：对 current 为 null 的基底判空步骤自动补齐 nullProbe 与父节点次级高亮', () => {
    const rawSteps = [
      {
        tree: dummyTree,
        current: 1,
        action: 'recurse-left',
        message: '深入节点 1 的左子树',
        codeLine: 5,
      },
      {
        tree: dummyTree,
        current: null, // 模拟未处理的判空步骤，会导致画布全灰
        action: 'null-entry',
        message: '递归进入空节点判空 root == null',
        codeLine: 2,
      },
      {
        tree: dummyTree,
        current: null, // 模拟空节点返回
        action: 'null-return',
        message: '空节点返回 true',
        codeLine: 3,
      },
    ];

    const normalized = StepNormalizationEngine.normalize(rawSteps);
    expect(normalized.length).toBe(3);

    // 检查第 1 步 (索引 1)：应自动注入 nullProbe 指向父节点 1 的左分支
    const step1 = normalized[1] as any;
    expect(step1.nullProbe).toBeDefined();
    expect(step1.nullProbe.parentVal).toBe(1);
    expect(step1.nullProbe.branch).toBe('left');
    expect(step1.secondaryHighlightedNodes).toContain(1);

    // 检查第 2 步 (索引 2)：同样具备探针与高亮
    const step2 = normalized[2] as any;
    expect(step2.nullProbe).toBeDefined();
    expect(step2.nullProbe.parentVal).toBe(1);
    expect(step2.nullProbe.branch).toBe('left');
    expect(step2.secondaryHighlightedNodes).toContain(1);
  });

  it('防断电卫士：对非判空树步骤无任何高亮时，平滑延续上一活跃焦点', () => {
    const rawSteps = [
      {
        tree: dummyTree,
        current: 2,
        action: 'visit',
        message: '访问节点 2',
      },
      {
        tree: dummyTree,
        current: null, // 某个全局判定步骤
        action: 'check-global',
        message: '全局状态校验',
      },
    ];

    const normalized = StepNormalizationEngine.normalize(rawSteps);
    const step1 = normalized[1] as any;
    expect(step1.secondaryHighlightedNodes).toContain(2);
  });

  it('幽灵帧消除：连续完全相同的无意义卡顿帧被干净剔除', () => {
    const rawSteps = [
      {
        current: 1,
        codeLine: 10,
        action: 'step',
        phase: 'run',
        message: '执行中',
        decision: '继续',
      },
      {
        current: 1,
        codeLine: 10,
        action: 'step',
        phase: 'run',
        message: '执行中',
        decision: '继续',
      },
      {
        current: 2,
        codeLine: 11,
        action: 'next',
        phase: 'run',
        message: '下一步',
        decision: '完成',
      },
    ];

    const normalized = StepNormalizationEngine.normalize(rawSteps);
    expect(normalized.length).toBe(2);
    expect((normalized[0] as any).current).toBe(1);
    expect((normalized[1] as any).current).toBe(2);
  });

  it('零侵入安全：已经具备高品质探针与步骤的序列保持原样', () => {
    const rawSteps = [
      {
        tree: dummyTree,
        current: null,
        nullProbe: { parentVal: 1, branch: 'right' as const },
        secondaryHighlightedNodes: [1],
        action: 'custom-probe',
        message: '显式探针步骤',
      },
    ];

    const normalized = StepNormalizationEngine.normalize(rawSteps);
    expect(normalized.length).toBe(1);
    expect((normalized[0] as any).nullProbe.branch).toBe('right');
    expect((normalized[0] as any).secondaryHighlightedNodes).toEqual([1]);
  });
});
