// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  MatrixFastPowerStepCompiler,
  IMatrixRecurrenceStrategy,
  fibonacciRecurrenceStrategy,
  climbingStairsRecurrenceStrategy,
  tribonacciRecurrenceStrategy,
  dominoTrominoRecurrenceStrategy,
  countVowelsRecurrenceStrategy,
  attendanceRecordRecurrenceStrategy,
} from './matrix-fast-power-step-compiler';
import { matrixPower098CanvasAdapter } from './matrix-power-098-canvas-adapter';

describe('MatrixFastPowerStepCompiler (Deep Module & Strategy Pattern)', () => {
  it('模板方法应严格保证生命周期五阶段与二进制位展开', () => {
    const steps = MatrixFastPowerStepCompiler.compile(fibonacciRecurrenceStrategy, 10);
    expect(steps.length).toBeGreaterThan(4);

    // 第一步必须是入口
    expect(steps[0].decision).toMatch(/(入口|计算|准备|求解)/);
    expect(steps[0].codeLine).toBeDefined();

    // 矩阵初始化步骤
    const initStep = steps.find((s) => s.decision.includes('构建') || s.decision.includes('转移矩阵'));
    expect(initStep).toBeDefined();
    expect(initStep?.curPowerMatrix).toEqual([
      [1, 1],
      [1, 0],
    ]);

    // 含有位权展开计算步骤
    const powerSteps = steps.filter((s) => s.curAnsMatrix);
    expect(powerSteps.length).toBeGreaterThan(0);

    // 最后一步收敛并产出标准 finalValue
    const last = steps[steps.length - 1];
    expect(last.finalValue).toBe(55);
    expect(last.decision).toContain('55');
  });

  it('策略模式：支持边界基底直接特判截断', () => {
    // F(0) = 0
    const s0 = MatrixFastPowerStepCompiler.compile(fibonacciRecurrenceStrategy, 0);
    expect(s0[s0.length - 1].finalValue).toBe(0);

    // F(2) = 1
    const s2 = MatrixFastPowerStepCompiler.compile(fibonacciRecurrenceStrategy, 2);
    expect(s2[s2.length - 1].finalValue).toBe(1);
  });

  it('多态扩展性：支持自定义线性递推策略', () => {
    // 构造一个简单的 2^n 快速幂测试策略 (1x1 状态转移)
    const powerOfTwoStrategy: IMatrixRecurrenceStrategy = {
      id: 'pow-2',
      name: '2的幂次递推',
      dimension: 1,
      lines: fibonacciRecurrenceStrategy.lines,
      getBaseMatrix: () => [[2]],
      checkBaseCase: (n) => (n === 0 ? { decision: '2^0 = 1', message: '基底', log: 'base', finalValue: 1 } : null),
      resolvePower: (n) => n,
      extractFinalResult: (ansMatrix) => ({
        ans: ansMatrix[0][0],
        formulaExplain: `2^n = ${ansMatrix[0][0]}`,
      }),
    };

    const steps = MatrixFastPowerStepCompiler.compile(powerOfTwoStrategy, 5);
    expect(steps[steps.length - 1].finalValue).toBe(32);
  });

  it('六大内置数学策略应产出精确值并保证 Canvas 适配器零报错', () => {
    const container = document.createElement('div');

    const cases = [
      { strategy: fibonacciRecurrenceStrategy, n: 10, expected: 55 },
      { strategy: climbingStairsRecurrenceStrategy, n: 4, expected: 5 },
      { strategy: tribonacciRecurrenceStrategy, n: 4, expected: 4 },
      { strategy: dominoTrominoRecurrenceStrategy, n: 4, expected: 11 },
      { strategy: countVowelsRecurrenceStrategy, n: 5, expected: 68 },
      { strategy: attendanceRecordRecurrenceStrategy, n: 2, expected: 8 },
    ];

    for (const c of cases) {
      const steps = MatrixFastPowerStepCompiler.compile(c.strategy, c.n);
      const last = steps[steps.length - 1];
      expect(last.finalValue, `${c.strategy.name} 计算错误`).toBe(c.expected);

      for (const step of steps) {
        expect(step.codeLine).toBeDefined();
        matrixPower098CanvasAdapter.render(container, step);
        expect(container.innerHTML).not.toContain('[object Object]');
        expect(container.innerHTML).not.toContain('undefined');
      }
    }
  });
});
