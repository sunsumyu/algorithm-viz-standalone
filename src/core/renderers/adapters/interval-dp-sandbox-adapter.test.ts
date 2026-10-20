// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { IntervalDpSandboxAdapter } from './interval-dp-sandbox-adapter';
import type { UniversalStep } from '../../universal-stage-engine';

describe('IntervalDpSandboxAdapter 区间动态规划拟物沙盘适配器测试', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('isSupported 应精准识别 Class 076 / 077 及其规范别名', () => {
    expect(IntervalDpSandboxAdapter.isSupported('min-score-triangulation')).toBe(true);
    expect(IntervalDpSandboxAdapter.isSupported('class076-code01')).toBe(true);
    expect(IntervalDpSandboxAdapter.isSupported('leetcode-1039')).toBe(true);

    expect(IntervalDpSandboxAdapter.isSupported('predict-the-winner')).toBe(true);
    expect(IntervalDpSandboxAdapter.isSupported('class076-code02')).toBe(true);
    expect(IntervalDpSandboxAdapter.isSupported('cards-in-line')).toBe(true);

    expect(IntervalDpSandboxAdapter.isSupported('burst-balloons')).toBe(true);
    expect(IntervalDpSandboxAdapter.isSupported('class076-code03')).toBe(true);
    expect(IntervalDpSandboxAdapter.isSupported('leetcode-312')).toBe(true);

    expect(IntervalDpSandboxAdapter.isSupported('strange-printer')).toBe(true);
    expect(IntervalDpSandboxAdapter.isSupported('class076-code04')).toBe(true);
    expect(IntervalDpSandboxAdapter.isSupported('leetcode-664')).toBe(true);

    expect(IntervalDpSandboxAdapter.isSupported('fibonacci')).toBe(false);
    expect(IntervalDpSandboxAdapter.isSupported('knapsack-01')).toBe(false);
    expect(IntervalDpSandboxAdapter.isSupported(undefined)).toBe(false);
  });

  it('1. 多边形三角剖分 (min-score-triangulation) 拟物沙盘应正确渲染 SVG 多边形与决策舱', () => {
    const step: UniversalStep = {
      stage: 3,
      line: 15,
      codeLine: 15,
      i: 0,
      j: 3,
      grid: [
        [0, 0, 84, 144],
        [null, 0, 0, 140],
        [null, null, 0, 0],
        [null, null, null, 0],
      ],
      dp1d: [3, 7, 4, 5],
      deps: [
        { r: 0, c: 2, type: 'left', label: 'dp[0][2]=84' },
        { r: 2, c: 3, type: 'bottom' as any, label: 'dp[2][3]=0' },
      ],
      decision: '更新 dp[0][3]=144',
      tag: 'dp[0][3] = 144: 选点 k=2 构三角',
      log: '剖分收敛',
      msg: '计算完成',
    };

    IntervalDpSandboxAdapter.render(container, step, {
      modelId: 'min-score-triangulation',
      params: { values: [3, 7, 4, 5] },
    });

    const html = container.innerHTML;
    expect(html).toContain('凸多边形几何沙盘');
    expect(html).toContain('<svg');
    expect(html).toContain('底边起点 (i)');
    expect(html).toContain('底边终点 (j)');
    expect(html).toContain('剖分顶点 (k)');
    expect(html).toContain('中间三角形');
    expect(html).not.toContain('[object Object]');
    expect(html).not.toContain('NaN');
  });

  it('2. 预测赢家 / 纸牌博弈 (predict-the-winner) 拟物沙盘应正确渲染物理纸牌与极小化极大决策舱', () => {
    const step: UniversalStep = {
      stage: 3,
      line: 15,
      codeLine: 15,
      i: 0,
      j: 2,
      grid: [
        [1, 4, -2],
        [null, 5, 3],
        [null, null, 2],
      ],
      dp1d: [1, 5, 2],
      decision: '转移 [0, 2] 得 -2',
      tag: 'dp[0][2] = max(-2, 1) = -2',
      log: '博弈计算',
      msg: '计算完成',
    };

    IntervalDpSandboxAdapter.render(container, step, {
      modelId: 'predict-the-winner',
      params: { nums: [1, 5, 2] },
    });

    const html = container.innerHTML;
    expect(html).toContain('桌面连续纸牌博弈沙盘');
    expect(html).toContain('选左端');
    expect(html).toContain('选右端');
    expect(html).toContain('零和博弈极小化极大决策舱');
    expect(html).toContain('先手劣势');
    expect(html).not.toContain('[object Object]');
    expect(html).not.toContain('NaN');
  });

  it('3. 戳气球 (burst-balloons) 拟物沙盘应正确渲染气球架、虚拟边界与金币收益演算舱', () => {
    const step: UniversalStep = {
      stage: 3,
      line: 16,
      codeLine: 16,
      i: 0,
      j: 4,
      grid: [
        [0, 0, 15, 40, 135],
        [null, 0, 0, 30, 48],
        [null, null, 0, 0, 40],
        [null, null, null, 0, 0],
        [null, null, null, null, 0],
      ],
      dp1d: [1, 3, 1, 5, 1],
      deps: [
        { r: 0, c: 2, type: 'left', label: 'dp[0][2]=15' },
        { r: 2, c: 4, type: 'bottom' as any, label: 'dp[2][4]=40' },
      ],
      decision: 'dp[0][4] = 135',
      tag: '开区间 (0, 4) 最优气球: #2(值1)',
      log: '推导计算',
      msg: '计算完成',
    };

    IntervalDpSandboxAdapter.render(container, step, {
      modelId: 'burst-balloons',
      params: { nums: [3, 1, 5] },
    });

    const html = container.innerHTML;
    expect(html).toContain('气球陈列架沙盘');
    expect(html).toContain('虚拟边界');
    expect(html).toContain('最后戳破');
    expect(html).toContain('金币收益演算舱');
    expect(html).toContain('逆向思维神来之笔');
    expect(html).not.toContain('[object Object]');
    expect(html).not.toContain('NaN');
  });

  it('4. 奇怪的打印机 (strange-printer) 拟物沙盘应正确渲染色带与涂色贪心顺带覆盖监视器', () => {
    const step: UniversalStep = {
      stage: 3,
      line: 15,
      codeLine: 15,
      i: 0,
      j: 2,
      grid: [
        [1, 1, 1],
        [null, 1, 1],
        [null, null, 1],
      ],
      dp1d: [97, 97, 97],
      decision: '顺带覆盖 1',
      tag: "首尾相同 s[0]==s[2]('a'): dp[0][2] = dp[0][1] = 1",
      log: '顺带覆盖',
      msg: '计算完成',
    };

    IntervalDpSandboxAdapter.render(container, step, {
      modelId: 'strange-printer',
      params: { s: 'aaa' },
    });

    const html = container.innerHTML;
    expect(html).toContain('奇怪的打印机色带轨迹');
    expect(html).toContain('首尾同色顺带覆盖');
    expect(html).toContain('涂色策略与抵消决策舱');
    expect(html).not.toContain('[object Object]');
    expect(html).not.toContain('NaN');
  });
});
