/**
 * 数字串翻译方案数步进生成器测试
 * 唯一测试接缝：纯函数生成器（buildRecursiveSteps / buildDpSteps / 树结构）。
 * 只断言外部可见行为：最终答案、步骤流不变量、树结构不变量。
 */

import { describe, it, expect } from 'vitest';
import {
  buildRecursiveSteps,
  buildDpSteps,
  REC_JAVA_CODE,
  DP_JAVA_CODE,
} from './decode-ways-steps';

/** LeetCode 91 公认用例 */
const CASES: Array<[string, number]> = [
  ['226', 3],
  ['12', 2],
  ['0', 0],
  ['06', 0],
  ['10', 1],
  ['100', 0],
  ['2101', 1],
  ['11106', 2],
  ['111111', 13],
];

describe('buildRecursiveSteps', () => {
  it.each(CASES)('"%s" 的最终答案为 %i', (input, expected) => {
    const { answer } = buildRecursiveSteps(input);
    expect(answer).toBe(expected);
  });

  it.each(CASES)('"%s" 首步 init、末步 done 且携带答案', (input, expected) => {
    const { steps } = buildRecursiveSteps(input);
    expect(steps[0].type).toBe('init');
    const last = steps[steps.length - 1];
    expect(last.type).toBe('done');
    expect(last.answer).toBe(expected);
  });

  it('两位分支标注与输入串切片一致', () => {
    const { steps } = buildRecursiveSteps('226');
    const branch2Steps = steps.filter((st) => st.type === 'branch-2' && st.twoDigit);
    expect(branch2Steps.length).toBeGreaterThan(0);
    for (const st of branch2Steps) {
      const td = st.twoDigit!;
      if (td.reason !== '越界') {
        expect(td.digits).toBe('226'.slice(st.i, st.i + 2));
        expect(td.value).toBe(Number(td.digits));
      }
    }
  });

  it.each([['0'], ['06'], ['100'], ['11106'], ['2101']])(
    '"%s" 含 0 输入存在返回 0 的死分支步骤',
    (input) => {
      const { steps } = buildRecursiveSteps(input);
      const dead = steps.filter((st) => st.type === 'dead-zero');
      expect(dead.length).toBeGreaterThan(0);
      for (const st of dead) {
        expect(st.returnValue).toBe(0);
      }
    },
  );

  it('树结构：非根节点均有父，同参数第二次及以后展开被标记为重复', () => {
    const { nodes, steps } = buildRecursiveSteps('111111');
    const byId = new Map(nodes.map((nd) => [nd.id, nd]));
    for (const nd of nodes) {
      if (nd.id !== nodes[0].id) {
        expect(nd.parentId).not.toBeNull();
        expect(byId.has(nd.parentId!)).toBe(true);
      }
    }
    // 按创建顺序统计每个参数 i 的出现次数，第二次及以后的节点应带重复标记
    const seen = new Map<number, number>();
    for (const nd of nodes) {
      const count = (seen.get(nd.i) ?? 0) + 1;
      seen.set(nd.i, count);
      expect(nd.isRepeated).toBe(count >= 2);
    }
    // 步骤中的重复统计与节点标记一致
    const repeatNodes = nodes.filter((nd) => nd.isRepeated).length;
    const lastStats = steps[steps.length - 1].stats;
    expect(lastStats.repeats).toBe(repeatNodes);
  });

  it('所有 call 步骤的 codeLine 都在递归代码行数范围内', () => {
    const { steps } = buildRecursiveSteps('226');
    for (const st of steps) {
      const lines = Array.isArray(st.codeLine) ? st.codeLine : [st.codeLine];
      for (const ln of lines) {
        expect(ln).toBeGreaterThanOrEqual(1);
        expect(ln).toBeLessThanOrEqual(REC_JAVA_CODE.length);
      }
    }
  });
});

describe('buildDpSteps', () => {
  it.each(CASES)('"%s" 的最终答案为 %i', (input, expected) => {
    const { answer } = buildDpSteps(input);
    expect(answer).toBe(expected);
  });

  it.each(CASES)('"%s" 首步 init、末步 done 且携带答案', (input, expected) => {
    const { steps } = buildDpSteps(input);
    expect(steps[0].type).toBe('init');
    expect(steps[0].dp[steps[0].i]).toBe(1); // dp[n] = 1 起点
    const last = steps[steps.length - 1];
    expect(last.type).toBe('done');
    expect(last.answer).toBe(expected);
  });

  it.each(CASES)('"%s" 与递归生成器答案一致', (input) => {
    const rec = buildRecursiveSteps(input).answer;
    const dp = buildDpSteps(input).answer;
    expect(dp).toBe(rec);
  });

  it('方向正确：i 从 n-1 递减到 0', () => {
    const { steps } = buildDpSteps('2101');
    const computeIs = steps
      .filter((st) => st.type === 'compute' || st.type === 'zero')
      .map((st) => st.i);
    expect(computeIs).toEqual([3, 2, 1, 0]);
  });

  it.each([['0'], ['06'], ['100'], ['11106'], ['2101']])(
    '"%s" 含 0 的格子产生 dp[i]=0 步骤且公式正确',
    (input) => {
      const { steps } = buildDpSteps(input);
      const zeros = steps.filter((st) => st.type === 'zero');
      expect(zeros.length).toBeGreaterThan(0);
      for (const st of zeros) {
        expect(input[st.i]).toBe('0');
        expect(st.dp[st.i]).toBe(0);
      }
    },
  );

  it('决策拆解数据完整：分支值与置灰原因、结论值', () => {
    const { steps } = buildDpSteps('226');
    const compute = steps.filter((st) => st.type === 'compute');
    expect(compute.length).toBeGreaterThan(0);
    for (const st of compute) {
      expect(st.branch1).toBeDefined();
      expect(st.branch1!.ok).toBe(true);
      expect(st.branch1!.depValue).toBe(st.dp[st.i + 1]);
      if (st.branch2!.ok) {
        expect(st.branch2!.depValue).toBe(st.dp[st.i + 2]!);
        expect(st.dp[st.i]).toBe(st.branch1!.depValue! + st.branch2!.depValue!);
      } else {
        expect(st.branch2!.reason).toBeDefined();
      }
    }
  });

  it('所有步骤的 codeLine 都在 DP 代码行数范围内', () => {
    const { steps } = buildDpSteps('226');
    for (const st of steps) {
      const lines = Array.isArray(st.codeLine) ? st.codeLine : [st.codeLine];
      for (const ln of lines) {
        expect(ln).toBeGreaterThanOrEqual(1);
        expect(ln).toBeLessThanOrEqual(DP_JAVA_CODE.length);
      }
    }
  });
});
