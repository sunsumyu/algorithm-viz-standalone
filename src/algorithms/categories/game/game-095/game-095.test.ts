import { describe, it, expect } from 'vitest';
import { buildBashGameSteps } from './bash-game-renderer';
import { buildPrimePowerSteps } from './prime-power-stones-renderer';
import { buildNimGameSteps } from './nim-game-renderer';
import { buildAntiNimSteps } from './anti-nim-game-renderer';
import { buildFibonacciSteps } from './fibonacci-game-renderer';
import { buildWythoffSteps } from './wythoff-game-renderer';
import {
  BASH_GAME_CODES,
  PRIME_POWER_CODES,
  NIM_GAME_CODES,
  ANTI_NIM_CODES,
  FIBONACCI_GAME_CODES,
  WYTHOFF_GAME_CODES,
} from './game-095-stage-codes';

function verifyLineMap(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  expect(steps[0].decision).toMatch(/(入口|接收)/);

  for (const step of steps) {
    const lineMap = step.codeLine as Record<string, number>;
    expect(lineMap, 'Step must have codeLine').toBeDefined();
    for (const [lang, line] of Object.entries(lineMap)) {
      const codeArray = codes[lang];
      expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
      expect(
        line,
        `Language ${lang} line ${line} out of bounds [1, ${codeArray.length}] for decision: ${step.decision}`
      ).toBeGreaterThanOrEqual(1);
      expect(
        line,
        `Language ${lang} line ${line} out of bounds [1, ${codeArray.length}] for decision: ${step.decision}`
      ).toBeLessThanOrEqual(codeArray.length);
    }
  }
}

describe('左神经典博弈专题一 (game-095) 自动化测试套件', () => {
  it('1. 巴什博弈 (Bash Game)', () => {
    // 15 % (3+1) = 3 != 0 -> 胜
    const stepsWin = buildBashGameSteps(15, 3);
    verifyLineMap(stepsWin, BASH_GAME_CODES);
    expect(stepsWin[stepsWin.length - 1].isFirstWin).toBe(true);

    // 16 % (3+1) = 0 -> 负
    const stepsLoss = buildBashGameSteps(16, 3);
    verifyLineMap(stepsLoss, BASH_GAME_CODES);
    expect(stepsLoss[stepsLoss.length - 1].isFirstWin).toBe(false);
  });

  it('2. 素数幂石子博弈 (Prime Power Stones)', () => {
    // 14 % 6 = 2 != 0 -> 胜
    const stepsWin = buildPrimePowerSteps(14);
    verifyLineMap(stepsWin, PRIME_POWER_CODES);
    expect(stepsWin[stepsWin.length - 1].isFirstWin).toBe(true);

    // 18 % 6 = 0 -> 负
    const stepsLoss = buildPrimePowerSteps(18);
    verifyLineMap(stepsLoss, PRIME_POWER_CODES);
    expect(stepsLoss[stepsLoss.length - 1].isFirstWin).toBe(false);
  });

  it('3. 经典尼姆博弈 (Nim Game)', () => {
    // 3 ^ 4 ^ 5 = 2 != 0 -> 胜
    const stepsWin = buildNimGameSteps([3, 4, 5]);
    verifyLineMap(stepsWin, NIM_GAME_CODES);
    expect(stepsWin[stepsWin.length - 1].isFirstWin).toBe(true);

    // 1 ^ 2 ^ 3 = 0 -> 负
    const stepsLoss = buildNimGameSteps([1, 2, 3]);
    verifyLineMap(stepsLoss, NIM_GAME_CODES);
    expect(stepsLoss[stepsLoss.length - 1].isFirstWin).toBe(false);
  });

  it('4. 反尼姆博弈 (Anti-Nim / SJ 定理)', () => {
    // 纯孤立堆：4 堆 (偶数) -> 胜
    const stepsEvenOne = buildAntiNimSteps([1, 1, 1, 1]);
    verifyLineMap(stepsEvenOne, ANTI_NIM_CODES);
    expect(stepsEvenOne[stepsEvenOne.length - 1].isFirstWin).toBe(true);

    // 纯孤立堆：3 堆 (奇数) -> 负
    const stepsOddOne = buildAntiNimSteps([1, 1, 1]);
    verifyLineMap(stepsOddOne, ANTI_NIM_CODES);
    expect(stepsOddOne[stepsOddOne.length - 1].isFirstWin).toBe(false);

    // 充裕堆：3, 5, 7 -> XOR = 1 != 0 -> 胜
    const stepsGeneral = buildAntiNimSteps([3, 5, 7]);
    verifyLineMap(stepsGeneral, ANTI_NIM_CODES);
    expect(stepsGeneral[stepsGeneral.length - 1].isFirstWin).toBe(true);
  });

  it('5. 斐波那契博弈 (Fibonacci Game)', () => {
    // 13 为斐波那契数 -> 先手必败
    const stepsFib = buildFibonacciSteps(13);
    verifyLineMap(stepsFib, FIBONACCI_GAME_CODES);
    expect(stepsFib[stepsFib.length - 1].isFirstWin).toBe(false);

    // 16 非斐波那契数 -> 先手必胜
    const stepsNonFib = buildFibonacciSteps(16);
    verifyLineMap(stepsNonFib, FIBONACCI_GAME_CODES);
    expect(stepsNonFib[stepsNonFib.length - 1].isFirstWin).toBe(true);
  });

  it('6. 威佐夫博弈 (Wythoff Game)', () => {
    // (3, 5) 为奇异局势 -> 先手必败
    const stepsCold = buildWythoffSteps(3, 5);
    verifyLineMap(stepsCold, WYTHOFF_GAME_CODES);
    expect(stepsCold[stepsCold.length - 1].isFirstWin).toBe(false);

    // (4, 8) 非奇异局势 -> 先手必胜
    const stepsNonCold = buildWythoffSteps(4, 8);
    verifyLineMap(stepsNonCold, WYTHOFF_GAME_CODES);
    expect(stepsNonCold[stepsNonCold.length - 1].isFirstWin).toBe(true);
  });
});
