/**
 * RecursionTraceTracker — 递归步进骨架不变量语义回归
 *
 * 递归阶段生成器五项骨架（maxSteps 保险丝 / callStack 快照 / stepIndex /
 * totalSteps 回填 / 树深克隆）的唯一权威实现。任何此处回归 = 全部接入算法同时回归。
 */
import { describe, it, expect } from 'vitest';
import { RecursionTraceTracker } from './recursion-trace-tracker';
import type { RecursionStepBase } from '../step-types';
import type { HighlightTarget } from '../renderers/dark-code-terminal-presenter';

interface Frame { i: number; label: string }
interface TestStep extends RecursionStepBase<Frame> {
  i: number;
}

const line = (n: number) => ({ line: n }) as unknown as HighlightTarget;

const fields = (i: number) => ({
  i,
  decision: '',
  message: '',
  log: '',
  metrics: {},
});

describe('RecursionTraceTracker — 骨架不变量', () => {
  it('maxSteps 保险丝：超限步骤静默丢弃且不抛异常', () => {
    const t = new RecursionTraceTracker<TestStep, Frame>({ resolveLine: () => line(1), maxSteps: 3 });
    for (let i = 0; i < 10; i++) {
      t.pushStep('act', 'k', fields(i));
    }
    expect(t.steps.length).toBe(3);
    expect(t.exhausted).toBe(true);
  });

  it('callStack 快照逐步独立：push/pop 后历史步骤栈不被回写', () => {
    const t = new RecursionTraceTracker<TestStep, Frame>({ resolveLine: () => line(1) });
    t.enterFrame({ i: 1, label: 'a' });
    t.pushStep('enter', 'k', fields(1));
    t.enterFrame({ i: 2, label: 'b' });
    t.pushStep('enter', 'k', fields(2));
    t.exitFrame();
    t.pushStep('back', 'k', fields(1));

    expect(t.steps[0].callStack.map((f) => f.label)).toEqual(['a']);
    expect(t.steps[1].callStack.map((f) => f.label)).toEqual(['a', 'b']);
    expect(t.steps[2].callStack.map((f) => f.label)).toEqual(['a']);
    expect(t.steps[0].callStack).not.toBe(t.steps[2].callStack);
  });

  it('stepIndex 严格 1..N 自增、finalize 回填 totalSteps', () => {
    const t = new RecursionTraceTracker<TestStep, Frame>({ resolveLine: () => line(1) });
    for (let i = 0; i < 4; i++) {
      t.pushStep('act', 'k', fields(i));
    }
    const steps = t.finalize();
    expect(steps.map((s) => s.stepIndex)).toEqual([1, 2, 3, 4]);
    expect(steps.every((s) => s.totalSteps === 4)).toBe(true);
  });

  it('代码锚点经 resolveLine 解析进每步 codeLine', () => {
    const t = new RecursionTraceTracker<TestStep, Frame>({
      resolveLine: (a) => line(a.length),
    });
    t.pushStep('act', 'abc', fields(0));
    expect(t.steps[0].codeLine).toEqual({ line: 3 });
  });

  it('树模式：每步深克隆快照、activeNodeId 跟随 focus、spawnNode 挂载父子', () => {
    const t = new RecursionTraceTracker<TestStep, Frame>({ resolveLine: () => line(1) }, true);
    const root = t.spawnNode(null, 'dfs(0)');
    t.pushStep('enter', 'k', fields(0));
    const child = t.spawnNode(root, 'dfs(1)');
    t.pushStep('enter', 'k', fields(1));

    // 事后修改活动树不影响历史步骤快照
    child.status = 'visited';
    root.children.push({ id: 'later', label: 'x', val: 'x', status: 'visited', children: [] });

    const s0 = t.steps[0] as TestStep & { treeRoot: { children: unknown[] }; activeNodeId: string };
    const s1 = t.steps[1] as TestStep & { treeRoot: { children: { status: string }[] }; activeNodeId: string };
    expect(s0.treeRoot.children.length).toBe(0);
    expect(s1.treeRoot.children.length).toBe(1);
    expect(s1.treeRoot.children[0].status).toBe('current');
    expect(s0.activeNodeId).toBe(root.id);
    expect(s1.activeNodeId).toBe(child.id);
  });

  it('非树模式：不产出 treeRoot 字段、treeRoot 引用保持 null', () => {
    const t = new RecursionTraceTracker<TestStep, Frame>({ resolveLine: () => line(1) }, false);
    t.pushStep('act', 'k', fields(0));
    expect('treeRoot' in (t.steps[0] as object)).toBe(false);
    expect(t.treeRoot).toBeNull();
  });

  it('领域字段 Omit 类型：算法侧无法注入托管骨架字段（编译期防线）', () => {
    // 类型层面的约束 — 此测试的存在保证 RecursionDomainFields 的 Omit 不被意外放宽
    const t = new RecursionTraceTracker<TestStep, Frame>({ resolveLine: () => line(1) });
    // @ts-expect-error stepIndex 是托管字段，算法侧注入必须编译报错
    t.pushStep('act', 'k', { ...fields(0), stepIndex: 99 });
    expect(t.steps[0].stepIndex).toBe(1);
  });
});