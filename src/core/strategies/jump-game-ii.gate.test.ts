import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { JumpGameIIStepCompiler } from './jump-game-ii-compiler';
import { JumpGameIIStrategy } from './jump-game-ii-strategy';

describe('跳跃游戏 II 顶层抽象门禁验证 (Jump Game II Gate Tests)', () => {
  it('模型应在 AlgorithmModelRepository 正确静态注册', () => {
    expect(AlgorithmModelRepository.hasModel('jump-game-ii')).toBe(true);
    expect(AlgorithmModelRepository.hasModel('jump-game')).toBe(true);

    const model = AlgorithmModelRepository.getModel('jump-game-ii');
    expect(model.id).toBe('jump-game-ii');
    const stage1 = model.stages['stage-1'];
    expect(stage1).toBeDefined();
    const javaCode =
      stage1.code?.forward?.source || stage1.variants?.['standard']?.code?.forward?.source;
    expect(javaCode).toBeDefined();
    expect(javaCode).toContain('@step:entry');
    expect(javaCode).toContain('@step:jump');
  });

  it('策略应能接管 jump-game-ii 与 jump-game', () => {
    const strategy = new JumpGameIIStrategy();
    expect(strategy.canHandle('jump-game-ii')).toBe(true);
    expect(strategy.canHandle('jump-game')).toBe(true);
    expect(strategy.canHandle('fibonacci')).toBe(false);
  });

  it('Step 0 入口帧必须纯洁无脏数据且携带合法锚点与全局输入', () => {
    const model = AlgorithmModelRepository.getModel('jump-game-ii');
    const steps = JumpGameIIStepCompiler.compile(model, { nums: [2, 3, 1, 1, 4] });

    expect(steps.length).toBeGreaterThan(0);
    const step0 = steps[0];

    expect(step0.phase).toBe('entry');
    expect(step0.vars).toBeDefined();
    expect(step0.vars?.some((v: any) => v.name === 'nums.length')).toBe(true);
    expect(step0.metrics?.['cur-boundary']).toBe('[0]');
    expect(step0.decisions).toBeDefined();
    expect(step0.decisions?.length).toBeGreaterThan(0);
  });

  it('贪心计算结果必须精确符合预期 (nums=[2,3,1,1,4] -> 2步)', () => {
    const model = AlgorithmModelRepository.getModel('jump-game-ii');
    const steps = JumpGameIIStepCompiler.compile(model, { nums: [2, 3, 1, 1, 4] });

    const finalStep = steps[steps.length - 1];
    expect(finalStep.phase).toBe('complete');
    expect(finalStep.vars?.find((v: any) => v.name === 'return steps')?.value).toBe('2');
    expect(finalStep.metrics?.['jumps']).toBe('2 步');
  });

  it('单元素特判用例应正确直接返回 0', () => {
    const model = AlgorithmModelRepository.getModel('jump-game-ii');
    const steps = JumpGameIIStepCompiler.compile(model, { nums: [7] });

    expect(steps.length).toBe(2); // entry + complete
    const finalStep = steps[1];
    expect(finalStep.phase).toBe('complete');
    expect(finalStep.metrics?.['jumps']).toBe('0 步');
  });

  it('全量 step 必须包含有效 line 字段且 line > 0（代码高亮接缝保证）', () => {
    const model = AlgorithmModelRepository.getModel('jump-game-ii');
    for (const stage of [1, 2, 3, 4]) {
      const steps = JumpGameIIStepCompiler.compile(model, { nums: [2, 3, 1, 1, 4] }, stage);
      expect(steps.length).toBeGreaterThan(0);
      for (const s of steps) {
        expect(s.line, `Stage ${stage} step missing valid line`).toBeGreaterThan(0);
        expect(s.msg, `Stage ${stage} step missing msg`).toBeDefined();
        expect(s.flowPhase, `Stage ${stage} step missing flowPhase`).toBeDefined();
      }
    }
  });

  it('Stage 2 (记忆化搜索) 必须生成合法 UniversalTreeNode 状态树与调用栈', () => {
    const model = AlgorithmModelRepository.getModel('jump-game-ii');
    const steps = JumpGameIIStepCompiler.compile(model, { nums: [2, 3, 1, 1, 4] }, 2);

    expect(steps.length).toBeGreaterThan(0);
    const stepsWithTree = steps.filter((s) => s.treeRoot !== undefined && s.treeRoot !== null);
    expect(stepsWithTree.length).toBeGreaterThan(0);

    const firstTreeStep = stepsWithTree[0];
    expect(firstTreeStep.treeRoot?.val).toBe('dfs(0)');

    const finalStep = steps[steps.length - 1];
    expect(finalStep.flowPhase).toBe('terminal');
    expect(finalStep.vars?.find((v: any) => v.name === 'return')?.value).toBe('2');
  });

  it('Stage 3 (DP 递推) 必须生成完整 1D DP 状态表与逆推回溯', () => {
    const model = AlgorithmModelRepository.getModel('jump-game-ii');
    const steps = JumpGameIIStepCompiler.compile(model, { nums: [2, 3, 1, 1, 4] }, 3);

    expect(steps.length).toBeGreaterThan(0);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.dp1d).toBeDefined();
    expect(finalStep.dp1d?.[0]).toBe(2);
    expect(finalStep.dp1d?.[4]).toBe(0);
  });
});
