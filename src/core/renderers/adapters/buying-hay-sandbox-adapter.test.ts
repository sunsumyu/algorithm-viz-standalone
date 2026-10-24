// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { BuyingHaySandboxAdapter, type HaySupplier } from './buying-hay-sandbox-adapter';
import type { UniversalStep } from '../../universal-stage-engine';

describe('BuyingHaySandboxAdapter 购买足量干草拟物沙盘测试', () => {
  it('应能正确解析供货商数据、目标需求 H 与安全扩充容量 m', () => {
    const step: UniversalStep = {
      stage: 3,
      i: 1,
      j: 16,
      hTarget: 15,
      expandedCapacity: 31,
      cost: [10, 12],
      val: [8, 16],
    } as any;

    const data = BuyingHaySandboxAdapter.parseHayData(step, { modelId: 'buying-hay-min-cost' });
    expect(data.hTarget).toBe(15);
    expect(data.expandedCapacity).toBe(31);
    expect(data.suppliers).toHaveLength(2);
    expect(data.suppliers[0].cost).toBe(10);
    expect(data.suppliers[0].val).toBe(8);
    expect(data.suppliers[0].unitCost).toBe(1.25);
    expect(data.suppliers[1].cost).toBe(12);
    expect(data.suppliers[1].val).toBe(16);
    expect(data.suppliers[1].unitCost).toBe(0.75);
  });

  it('应能通过 selectedItems 正确回溯已采购干草清单', () => {
    const suppliers: HaySupplier[] = [
      { id: 1, cost: 10, val: 8, unitCost: 1.25, name: '供货商 #1' },
      { id: 2, cost: 12, val: 16, unitCost: 0.75, name: '供货商 #2' },
    ];

    const selectedItems = [
      { supplierIdx: 2, cost: 12, val: 16 },
      { supplierIdx: 2, cost: 12, val: 16 },
    ];

    const inventory = BuyingHaySandboxAdapter.backtrackHay(2, 32, suppliers, undefined, selectedItems);
    expect(inventory).toHaveLength(1);
    expect(inventory[0].supplierId).toBe(2);
    expect(inventory[0].count).toBe(2);
    expect(inventory[0].totalVal).toBe(32);
    expect(inventory[0].totalCost).toBe(24);
  });

  it('应能通过 grid 网格推导精准回溯干草采购清单', () => {
    const suppliers: HaySupplier[] = [
      { id: 1, cost: 10, val: 8, unitCost: 1.25, name: '供货商 #1' },
      { id: 2, cost: 12, val: 16, unitCost: 0.75, name: '供货商 #2' },
    ];

    // 构造 dp[i][j]:
    // dp[0]: [0, INF, ...]
    // dp[1]: j=0:0, j=8:10, j=16:20
    // dp[2]: j=0:0, j=8:10, j=16:12 (选商#2更优)
    const INF = 1_000_000_000;
    const grid: number[][] = [
      new Array(17).fill(INF),
      new Array(17).fill(INF),
      new Array(17).fill(INF),
    ];
    grid[0][0] = 0;
    grid[1][0] = 0;
    grid[1][8] = 10;
    grid[1][16] = 20;
    grid[2][0] = 0;
    grid[2][8] = 10;
    grid[2][16] = 12;

    const inventory = BuyingHaySandboxAdapter.backtrackHay(2, 16, suppliers, grid);
    expect(inventory).toHaveLength(1);
    expect(inventory[0].supplierId).toBe(2);
    expect(inventory[0].count).toBe(1);
    expect(inventory[0].totalCost).toBe(12);
  });

  it('应能正确渲染拟物沙盘 DOM (含 7 列货架 + 5 列粮仓货舱与 H 需求基准线)', () => {
    const container = document.createElement('div');
    const step: UniversalStep = {
      stage: 3,
      i: 2,
      j: 16,
      hTarget: 15,
      expandedCapacity: 31,
      cost: [10, 12],
      val: [8, 16],
      msg: '供货商 #2 (16磅/12元) 转移：dp[2][16] = 12 元',
      selectedItems: [{ supplierIdx: 2, cost: 12, val: 16 }],
    } as any;

    BuyingHaySandboxAdapter.render(container, step, {
      modelId: 'buying-hay-min-cost',
      currentStage: 'stage-3',
    });

    const html = container.innerHTML;
    expect(html).toContain('购买足量干草最小花费沙盘');
    expect(html).toContain('农场干草供应商货架');
    expect(html).toContain('奶牛粮仓货舱');
    expect(html).toContain('供货商 #1');
    expect(html).toContain('供货商 #2');
    expect(html).toContain('无限供应 ∞');
    expect(html).toContain('H 目标 (15磅)');
    expect(html).toContain('16 磅 / 目标 15 磅');
    expect(html).toContain('已满足目标');
    expect(html).toContain('12 元');
  });
});
