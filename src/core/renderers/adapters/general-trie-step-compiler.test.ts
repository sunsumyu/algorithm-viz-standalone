import { describe, it, expect } from 'vitest';
import { GeneralTrieStepCompiler } from './general-trie-step-compiler';

describe('GeneralTrieStepCompiler (26-Trie 步进推演核心编译器门禁)', () => {
  it('1. compileDynamicPointerSteps 应正确统计经过数 pass 与词尾频次 end', () => {
    const words = ['apple', 'app', 'apply', 'banana'];
    const steps = GeneralTrieStepCompiler.compileDynamicPointerSteps(words, 'app', true);

    expect(steps.length).toBeGreaterThan(10);
    expect(steps[0].operation).toBe('insert');
    expect(steps[0].activeNodeId).toBe(1);

    const sLast = steps[steps.length - 1];
    expect(sLast.operation).toBe('prefixNumber');
    expect(sLast.resultCount).toBe(3); // apple, app, apply -> prefix 'app' = 3
    expect(sLast.stageId).toBe('stage-1');
  });

  it('2. compileStaticArraySteps 应生成竞赛连续静态数组 tree[N][26] 映射与快速剪枝', () => {
    const words = ['code', 'coder', 'coding', 'codec'];
    const steps = GeneralTrieStepCompiler.compileStaticArraySteps(words, 'code');

    expect(steps.length).toBeGreaterThan(8);
    const sLast = steps[steps.length - 1];
    expect(sLast.operation).toBe('search');
    expect(sLast.resultCount).toBe(1); // 'code' 出现 1 次
    expect(sLast.staticTable).toBeDefined();
    expect(sLast.staticTable?.rows.length).toBeGreaterThan(4);
    expect(sLast.stageId).toBe('stage-2');
  });

  it('3. compileMultiQuerySteps 多模式串探测断裂剪枝', () => {
    const steps = GeneralTrieStepCompiler.compileMultiQuerySteps();

    expect(steps.length).toBeGreaterThan(8);
    const sLast = steps[steps.length - 1];
    expect(sLast.resultCount).toBe(3);
  });
});
