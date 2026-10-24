// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { BitmaskDpSandboxAdapter } from './bitmask-dp-sandbox-adapter';
import type { UniversalStep } from '../../universal-stage-engine';

describe('BitmaskDpSandboxAdapter 状压动态规划拟物沙盘适配器测试', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('isSupported 应精准识别 Class 080 及其规范别名', () => {
    expect(BitmaskDpSandboxAdapter.isSupported('can-i-win')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('class080-code01')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('leetcode-464')).toBe(true);

    expect(BitmaskDpSandboxAdapter.isSupported('matchsticks-to-square')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('class080-code02')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('leetcode-473')).toBe(true);

    expect(BitmaskDpSandboxAdapter.isSupported('partition-k-equal-subsets')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('class080-code03')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('leetcode-698')).toBe(true);

    expect(BitmaskDpSandboxAdapter.isSupported('tsp-bitmask-dp')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('class080-code04')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('traveling-salesperson')).toBe(true);

    // Class 081
    expect(BitmaskDpSandboxAdapter.isSupported('number-of-ways-wear-hats')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('class081-code01')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('leetcode-1434')).toBe(true);

    expect(BitmaskDpSandboxAdapter.isSupported('optimal-account-balancing')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('class081-code02')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('leetcode-465')).toBe(true);

    expect(BitmaskDpSandboxAdapter.isSupported('good-subsets')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('class081-code03')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('leetcode-1994')).toBe(true);

    expect(BitmaskDpSandboxAdapter.isSupported('distribute-repeating-integers')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('class081-code04')).toBe(true);
    expect(BitmaskDpSandboxAdapter.isSupported('leetcode-1655')).toBe(true);

    expect(BitmaskDpSandboxAdapter.isSupported('fibonacci')).toBe(false);
    expect(BitmaskDpSandboxAdapter.isSupported(undefined)).toBe(false);
  });

  it('1. 我能赢吗 (can-i-win) 拟物沙盘应正确渲染数字池芯片与博弈 Minimax 决策舱', () => {
    const step: UniversalStep = {
      stage: 3,
      line: 12,
      codeLine: 12,
      i: 3,
      j: 0,
      dp1d: [1, 2, 3],
      status: 5 as any,
      rest: 2 as any,
      candidate: 3 as any,
      tag: '尝试数字 3 (status=0101, rest=2)',
      log: '选 3 达成目标',
      msg: '计算完成',
    } as any;

    BitmaskDpSandboxAdapter.render(container, step, {
      modelId: 'can-i-win',
      params: { n: 4, m: 6 },
    });

    const html = container.innerHTML;
    expect(html).toContain('数字池抽取台与状态机');
    expect(html).toContain('博弈论 Minimax 决策舱');
    expect(html).toContain('目标累加和 ≥ 6');
    expect(html).toContain('二进制状态寄存器');
    expect(html).toContain('博弈论 Minimax 原则');
    expect(html).not.toContain('[object Object]');
    expect(html).not.toContain('NaN');
  });

  it('2. 旅行商问题 (tsp-bitmask-dp) 拟物沙盘应正确渲染城市环状几何拓扑与松弛演算舱', () => {
    const step: UniversalStep = {
      stage: 3,
      line: 14,
      codeLine: 14,
      i: 7, // s = 0b0111
      j: 2, // curr = 2
      dp1d: [35, 7, 2, 3],
      tag: '松弛飞往下一城市 j=3',
      log: '松弛计算完成',
      msg: '计算完成',
    };

    BitmaskDpSandboxAdapter.render(container, step, {
      modelId: 'tsp-bitmask-dp',
      params: { n: 4 },
    });

    const html = container.innerHTML;
    expect(html).toContain('城市拓扑网络与回路沙盘');
    expect(html).toContain('<svg');
    expect(html).toContain('停驻城市 #2');
    expect(html).toContain('状态压缩与松弛演算舱');
    expect(html).toContain('Bellman-Held-Karp');
    expect(html).not.toContain('[object Object]');
    expect(html).not.toContain('NaN');
  });

  it('3. 火柴拼正方形 (matchsticks-to-square) 拟物沙盘应正确渲染物理火柴装填与边长校验', () => {
    const step: UniversalStep = {
      stage: 3,
      line: 15,
      codeLine: 15,
      i: 3, // status
      j: 0,
      dp1d: [1, 2],
      tag: '放入第 1 根火柴',
      log: '装填计算',
      msg: '计算完成',
    };

    BitmaskDpSandboxAdapter.render(container, step, {
      modelId: 'matchsticks-to-square',
      params: { nums: [1, 1, 2, 2, 2] },
    });

    const html = container.innerHTML;
    expect(html).toContain('火柴拾取台与四边拼装沙盘');
    expect(html).toContain('装填可行性与剪枝决策舱');
    expect(html).toContain('每份目标 = 2');
    expect(html).not.toContain('[object Object]');
    expect(html).not.toContain('NaN');
  });

  it('4. 戴不同帽子方案数 (number-of-ways-wear-hats) 应正确渲染维度反转与 0-1 背包转移', () => {
    const step: UniversalStep = {
      stage: 3,
      line: 18,
      codeLine: 18,
      i: 4, // hat h = 4
      j: 1, // s = 0b001
      activeSlot: 1, // person p = 1
      dp1d: [1, 1, 0, 0],
      tag: '帽子4 分配给 人1',
      log: '状态转移',
      msg: '转移计算',
    };

    BitmaskDpSandboxAdapter.render(container, step, {
      modelId: 'number-of-ways-wear-hats',
      params: { hats: [[3, 4], [4, 5], [5]] },
    });

    const html = container.innerHTML;
    expect(html).toContain('帽子陈列台与人员受体沙盘');
    expect(html).toContain('Dimension Inversion');
    expect(html).toContain('0-1 背包式滚动转移方程');
    expect(html).toContain('当前决策帽子 #4');
    expect(html).not.toContain('[object Object]');
    expect(html).not.toContain('NaN');
  });

  it('5. 最优账单平衡 (optimal-account-balancing) 应正确渲染净结余银行卡与零和天平', () => {
    const step: UniversalStep = {
      stage: 3,
      line: 25,
      codeLine: 25,
      i: 3, // s = 0b011
      j: 3,
      dp1d: [0, 0, 0, 1],
      tag: 'dp[011b] = 1',
      log: '独立零和子集成立',
      msg: '结算转移',
    };

    BitmaskDpSandboxAdapter.render(container, step, {
      modelId: 'optimal-account-balancing',
      params: {
        transactions: [
          [0, 1, 10],
          [2, 0, 5],
          [1, 2, 5],
        ],
      },
    });

    const html = container.innerHTML;
    expect(html).toContain('账户净收支结余与子集天平沙盘');
    expect(html).toContain('债务清算与子集分解转化舱');
    expect(html).toContain('最小交易 = m - k');
    expect(html).not.toContain('[object Object]');
    expect(html).not.toContain('NaN');
  });

  it('6. 好子集的数目 (good-subsets) 应正确渲染 10 质因数质谱仪与无平方因子分子卡', () => {
    const step: UniversalStep = {
      stage: 3,
      line: 24,
      codeLine: 24,
      i: 6, // num = 6 = 2 * 3
      j: 4, // s = 0b0000000100 (prime 5)
      dp1d: [1, 2, 1],
      tag: '数字 6 质数掩码 0b0000000011',
      log: '0-1 背包转移',
      msg: '好子集累加',
    };

    BitmaskDpSandboxAdapter.render(container, step, {
      modelId: 'good-subsets',
      params: { nums: [1, 2, 3, 6] },
    });

    const html = container.innerHTML;
    expect(html).toContain('10 质因数质谱仪与无平方分子沙盘');
    expect(html).toContain('当前数字: 6');
    expect(html).toContain('质因数分解：2 × 3');
    expect(html).toContain('0-1 背包与乘数倍率舱');
    expect(html).not.toContain('[object Object]');
    expect(html).not.toContain('NaN');
  });

  it('7. 分配重复整数 (distribute-repeating-integers) 应正确渲染库存仓库与顾客订单推车', () => {
    const step: UniversalStep = {
      stage: 3,
      line: 22,
      codeLine: 22,
      i: 3, // count c = 3
      j: 3, // s = 0b11
      activeSlot: 2, // sub = 0b10
      dp1d: [1, 1, 1, 1],
      tag: '尝试为子集 sub=10 分配频次 3',
      log: '子掩码枚举',
      msg: '需求满足',
    };

    BitmaskDpSandboxAdapter.render(container, step, {
      modelId: 'distribute-repeating-integers',
      params: { nums: [1, 1, 1, 2, 2], quantity: [2, 1] },
    });

    const html = container.innerHTML;
    expect(html).toContain('库存频次仓库与顾客订单沙盘');
    expect(html).toContain('当前可用库存: 3');
    expect(html).toContain('顾客订单沙盘');
    expect(html).toContain('(sub-1)&amp;s 子掩码高效调度舱');
    expect(html).not.toContain('[object Object]');
    expect(html).not.toContain('NaN');
  });
});
