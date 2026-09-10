import { describe, it, expect } from 'vitest';
import { buildBashSgSteps } from './bash-game-sg-renderer';
import { buildNimSgSteps } from './nim-game-sg-renderer';
import { buildTwoStonesBashSteps } from './two-stones-bash-renderer';
import { buildThreeStonesFibSteps } from './three-stones-fibonacci-renderer';
import { buildCoinFlipSteps } from './coin-flip-game-renderer';
import { buildSplitGameSteps } from './split-game-renderer';
import {
  BASH_SG_CODES,
  NIM_SG_CODES,
  TWO_STONES_BASH_CODES,
  THREE_STONES_FIB_CODES,
  COIN_FLIP_CODES,
  SPLIT_GAME_CODES,
} from './game-096-stage-codes';

function verifyLineMap(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  expect(steps[0].decision).toMatch(/(入口|准备)/);

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

describe('左神 SG 函数与综合博弈专题二 (game-096) 自动化测试套件', () => {
  it('1. 巴什博弈与 SG 函数打表 (Bash Game SG)', () => {
    // n=12, m=3 -> SG(12) = 12 % 4 = 0 (先手负)
    const steps12 = buildBashSgSteps(12, 3);
    verifyLineMap(steps12, BASH_SG_CODES);
    const last12 = steps12[steps12.length - 1];
    expect(last12.sgTable![12]).toBe(0);
    expect(last12.isFirstWin).toBe(false);

    // n=10, m=3 -> SG(10) = 10 % 4 = 2 (先手胜)
    const steps10 = buildBashSgSteps(10, 3);
    const last10 = steps10[steps10.length - 1];
    expect(last10.sgTable![10]).toBe(2);
    expect(last10.isFirstWin).toBe(true);
  });

  it('2. 尼姆博弈 SG 证明 (Nim Game SG)', () => {
    const n = 8;
    const steps = buildNimSgSteps(n);
    verifyLineMap(steps, NIM_SG_CODES);
    const last = steps[steps.length - 1];
    for (let i = 0; i <= n; i++) {
      expect(last.sgTable![i]).toBe(i);
    }
  });

  it('3. 双堆巴什博弈与 SG 矩阵 (Two Stones Bash)', () => {
    // (7, 5, m=3): 7%4=3, 5%4=1, 3^1=2 != 0 -> 胜
    const stepsWin = buildTwoStonesBashSteps(7, 5, 3);
    verifyLineMap(stepsWin, TWO_STONES_BASH_CODES);
    expect(stepsWin[stepsWin.length - 1].isFirstWin).toBe(true);

    // (7, 3, m=3): 7%4=3, 3%4=3, 3^3=0 -> 负
    const stepsLoss = buildTwoStonesBashSteps(7, 3, 3);
    verifyLineMap(stepsLoss, TWO_STONES_BASH_CODES);
    expect(stepsLoss[stepsLoss.length - 1].isFirstWin).toBe(false);
  });

  it('4. 三堆取斐波那契数 SG (Three Stones Fib)', () => {
    const steps = buildThreeStonesFibSteps(5, 7, 9);
    verifyLineMap(steps, THREE_STONES_FIB_CODES);
    const last = steps[steps.length - 1];
    expect(last.sgTable).toBeDefined();
    expect(last.isFirstWin).toBeDefined();
  });

  it('5. 欧几里得翻硬币博弈 (Coin Flip Game SG)', () => {
    // [1, 0, 1] -> 正面在 #1 和 #3 -> SG = 1 ^ 3 = 2 != 0 -> 先手胜
    const stepsWin = buildCoinFlipSteps([1, 0, 1]);
    verifyLineMap(stepsWin, COIN_FLIP_CODES);
    expect(stepsWin[stepsWin.length - 1].isFirstWin).toBe(true);

    // [1, 1, 0] -> 正面在 #1 和 #2 -> SG = 1 ^ 2 = 3 != 0 -> 先手胜
    const stepsLoss = buildCoinFlipSteps([0, 0, 0]);
    verifyLineMap(stepsLoss, COIN_FLIP_CODES);
    expect(stepsLoss[stepsLoss.length - 1].isFirstWin).toBe(false);
  });

  it('6. 分裂石子游戏 SG (Split Game)', () => {
    const steps = buildSplitGameSteps(8);
    verifyLineMap(steps, SPLIT_GAME_CODES);
    const last = steps[steps.length - 1];
    expect(last.sgTable![1]).toBe(0); // 1 无法分裂
    expect(last.sgTable![2]).toBe(1); // 2 分裂为 (1,1) -> SG(1)^SG(1)=0 -> mex=1
    expect(last.sgTable).toBeDefined();
  });
});
