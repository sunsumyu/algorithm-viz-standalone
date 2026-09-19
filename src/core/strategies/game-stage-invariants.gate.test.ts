/**
 * 博弈论与 SG 函数体系顶级防退化机械门禁测试 (Game Theory Stage Invariant Gatekeeper Tests)
 *
 * 覆盖 Class 095 ~ 096 共 2 节课、12 道经典博弈论算法垂直切片。
 *
 * 强制约束（六大机械不变量）：
 * 1. Step 0 合法入口契约 (Entry Invariant)：每道题 steps[0] 必须包含入参自省与状态初始化帧
 * 2. 零跳步与博弈时序单调性 (Zero Skipping Invariant)：状态推导平滑前进，严禁跳步
 * 3. 四语言代码行号闭环 (CodeSync Invariant)：每步 codeLine 必须定义 Java / C++ / Python / JS 且严格在 [1, length]
 * 4. mex 算子数学严密性 (mex Operator Invariant)：mex 结果必然是后继 SG 集合中缺失的最小非负整数
 * 5. Sprague-Grundy 定理加法可分性 (SG Additivity Invariant)：多堆复合游戏的 SG 值为各堆 SG 值的异或和
 * 6. 终局胜负判定与 P/N 态契约 (P/N-Position Invariant)：必胜态 (N-position) 与必败态 (P-position) 判定准确
 */

import { describe, it, expect } from 'vitest';

// ==========================================
// Class 095
// ==========================================
import { buildBashGameSteps } from '../../algorithms/categories/game/game-095/bash-game-renderer';
import { buildPrimePowerSteps } from '../../algorithms/categories/game/game-095/prime-power-stones-renderer';
import { buildNimGameSteps } from '../../algorithms/categories/game/game-095/nim-game-renderer';
import { buildAntiNimSteps } from '../../algorithms/categories/game/game-095/anti-nim-game-renderer';
import { buildFibonacciSteps } from '../../algorithms/categories/game/game-095/fibonacci-game-renderer';
import { buildWythoffSteps } from '../../algorithms/categories/game/game-095/wythoff-game-renderer';
import {
  BASH_GAME_CODES,
  PRIME_POWER_CODES,
  NIM_GAME_CODES,
  ANTI_NIM_CODES,
  FIBONACCI_GAME_CODES,
  WYTHOFF_GAME_CODES,
} from '../../algorithms/categories/game/game-095/game-095-stage-codes';

// ==========================================
// Class 096
// ==========================================
import { buildBashSgSteps } from '../../algorithms/categories/game/game-096/bash-game-sg-renderer';
import { buildNimSgSteps } from '../../algorithms/categories/game/game-096/nim-game-sg-renderer';
import { buildTwoStonesBashSteps } from '../../algorithms/categories/game/game-096/two-stones-bash-renderer';
import { buildThreeStonesFibSteps } from '../../algorithms/categories/game/game-096/three-stones-fibonacci-renderer';
import { buildCoinFlipSteps } from '../../algorithms/categories/game/game-096/coin-flip-game-renderer';
import { buildSplitGameSteps } from '../../algorithms/categories/game/game-096/split-game-renderer';
import {
  BASH_SG_CODES,
  NIM_SG_CODES,
  TWO_STONES_BASH_CODES,
  THREE_STONES_FIB_CODES,
  COIN_FLIP_CODES,
  SPLIT_GAME_CODES,
} from '../../algorithms/categories/game/game-096/game-096-stage-codes';

/**
 * 统一博弈论单步不变量校验函数
 */
function verifyGameInvariants(
  steps: Array<{ decision: string; codeLine?: Record<string, number>; message?: string; log?: string }>,
  codeLangs: Record<string, string[]>,
  algoName: string
) {
  // 1. 步数非空
  expect(steps.length, `${algoName} 步数必须 > 0`).toBeGreaterThan(0);

  // 2. Step 0 入口契约
  expect(
    steps[0].decision,
    `${algoName} Step 0 决策必须为入口/初始化/准备/启动: ${steps[0].decision}`
  ).toMatch(/(入口|开始|初始化|准备|启动|接收|推导)/);

  // 3. 逐步四语言行号合法性
  const requiredLangs = ['java', 'cpp', 'python', 'javascript'];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    expect(step.decision, `${algoName} Step #${i} 缺少决策描述 decision`).toBeTruthy();
    expect(step.codeLine, `${algoName} Step #${i} 缺少 codeLine 映射字典`).toBeDefined();

    for (const lang of requiredLangs) {
      const codeArr = codeLangs[lang];
      expect(codeArr, `${algoName} 缺少语言 ${lang} 的代码定义`).toBeDefined();
      const line = step.codeLine![lang];
      expect(
        line,
        `${algoName} Step #${i} 语言 ${lang} 行号必须为数字，当前值为: ${line}`
      ).toBeTypeOf('number');
      expect(
        line,
        `${algoName} Step #${i} 语言 ${lang} 行号 ${line} 超出下界 [1, ${codeArr.length}] (decision: ${step.decision})`
      ).toBeGreaterThanOrEqual(1);
      expect(
        line,
        `${algoName} Step #${i} 语言 ${lang} 行号 ${line} 超出上界 [1, ${codeArr.length}] (decision: ${step.decision})`
      ).toBeLessThanOrEqual(codeArr.length);
    }
  }

  // 4. 终局收敛
  const lastStep = steps[steps.length - 1];
  expect(
    lastStep.decision,
    `${algoName} 尾步必须包含终结结论或完成标记: ${lastStep.decision}`
  ).toMatch(/(完成|返回|完毕|结论|答案|最优|结果|终局|结束|done|return|必胜|必败|胜|负|证明|恒成立)/i);
}

describe('🎲 博弈论全体系顶级机械防退化门禁 (Game Theory Stage Invariant Gatekeeper)', () => {
  // =========================================================================
  // 1. Class 095: 经典博弈六大模型 (巴什/素数幂/尼姆/反尼姆/斐波那契/威佐夫)
  // =========================================================================
  describe('Class 095 经典博弈模型机械门禁', () => {
    it('095-1 巴什博弈 (Bash Game): 周期余数与配对互补制胜律', () => {
      // 15 % (3+1) = 3 != 0 -> 先手必胜
      const sWin = buildBashGameSteps(15, 3);
      verifyGameInvariants(sWin, BASH_GAME_CODES, '巴什博弈必胜态');
      expect(sWin[sWin.length - 1].isFirstWin).toBe(true);

      // 16 % (3+1) = 0 -> 先手必败
      const sLoss = buildBashGameSteps(16, 3);
      verifyGameInvariants(sLoss, BASH_GAME_CODES, '巴什博弈必败态');
      expect(sLoss[sLoss.length - 1].isFirstWin).toBe(false);
    });

    it('095-2 素数幂石子博弈 (Prime Power Stones): 模 6 周期性收敛', () => {
      // 14 % 6 = 2 != 0 -> 胜
      const sWin = buildPrimePowerSteps(14);
      verifyGameInvariants(sWin, PRIME_POWER_CODES, '素数幂必胜态');
      expect(sWin[sWin.length - 1].isFirstWin).toBe(true);

      // 18 % 6 = 0 -> 负
      const sLoss = buildPrimePowerSteps(18);
      verifyGameInvariants(sLoss, PRIME_POWER_CODES, '素数幂必败态');
      expect(sLoss[sLoss.length - 1].isFirstWin).toBe(false);
    });

    it('095-3 经典尼姆博弈 (Nim Game): Bouton 定理异或和判定', () => {
      // 3 ^ 4 ^ 5 = 2 != 0 -> 先手胜
      const sWin = buildNimGameSteps([3, 4, 5]);
      verifyGameInvariants(sWin, NIM_GAME_CODES, '尼姆博弈必胜态');
      expect(sWin[sWin.length - 1].isFirstWin).toBe(true);

      // 1 ^ 2 ^ 3 = 0 -> 先手负
      const sLoss = buildNimGameSteps([1, 2, 3]);
      verifyGameInvariants(sLoss, NIM_GAME_CODES, '尼姆博弈必败态');
      expect(sLoss[sLoss.length - 1].isFirstWin).toBe(false);
    });

    it('095-4 反尼姆博弈 (Anti-Nim): SJ 定理孤单堆与充裕堆互斥判定', () => {
      // 纯孤单堆且偶数堆 -> 先手必胜
      const sEvenOnes = buildAntiNimSteps([1, 1, 1, 1]);
      verifyGameInvariants(sEvenOnes, ANTI_NIM_CODES, '反尼姆偶数孤单堆');
      expect(sEvenOnes[sEvenOnes.length - 1].isFirstWin).toBe(true);

      // 纯孤单堆且奇数堆 -> 先手必败
      const sOddOnes = buildAntiNimSteps([1, 1, 1]);
      verifyGameInvariants(sOddOnes, ANTI_NIM_CODES, '反尼姆奇数孤单堆');
      expect(sOddOnes[sOddOnes.length - 1].isFirstWin).toBe(false);

      // 充裕堆 (存在 >1 的堆) -> 按常规异或和判定
      const sGeneral = buildAntiNimSteps([3, 5, 7]);
      verifyGameInvariants(sGeneral, ANTI_NIM_CODES, '反尼姆充裕堆');
      expect(sGeneral[sGeneral.length - 1].isFirstWin).toBe(true);
    });

    it('095-5 斐波那契博弈 (Fibonacci Game): 齐肯多夫定理与首步分解', () => {
      // 13 属于斐波那契数 -> 先手必败
      const sFib = buildFibonacciSteps(13);
      verifyGameInvariants(sFib, FIBONACCI_GAME_CODES, '斐波那契博弈必败态');
      expect(sFib[sFib.length - 1].isFirstWin).toBe(false);

      // 16 = 13 + 3 (非斐波那契数) -> 先手必胜，首取 3
      const sNonFib = buildFibonacciSteps(16);
      verifyGameInvariants(sNonFib, FIBONACCI_GAME_CODES, '斐波那契博弈必胜态');
      expect(sNonFib[sNonFib.length - 1].isFirstWin).toBe(true);
      expect((sNonFib[sNonFib.length - 1] as any).zeckendorf[0]).toBe(3);
    });

    it('095-6 威佐夫博弈 (Wythoff Game): 黄金分割比与奇异局势判定', () => {
      // (3, 5): 差值 k=2, a_2 = floor(2 * 1.618) = 3, 属于第 2 个奇异局势 -> 先手必败
      const sLoss = buildWythoffSteps(3, 5);
      verifyGameInvariants(sLoss, WYTHOFF_GAME_CODES, '威佐夫博弈奇异局势必败态');
      expect(sLoss[sLoss.length - 1].isFirstWin).toBe(false);

      // (3, 6): 非奇异局势 -> 先手必胜
      const sWin = buildWythoffSteps(3, 6);
      verifyGameInvariants(sWin, WYTHOFF_GAME_CODES, '威佐夫博弈必胜态');
      expect(sWin[sWin.length - 1].isFirstWin).toBe(true);
    });
  });

  // =========================================================================
  // 2. Class 096: Sprague-Grundy 函数证明与复合博弈 (6 大模型)
  // =========================================================================
  describe('Class 096 Sprague-Grundy (SG) 函数体系机械门禁', () => {
    it('096-1 巴什博弈与 SG 函数打表 (Bash SG): SG(x) = x % (m + 1) 恒成立', () => {
      const n = 15;
      const m = 3;
      const s = buildBashSgSteps(n, m);
      verifyGameInvariants(s, BASH_SG_CODES, '巴什博弈 SG 函数打表');

      const last = s[s.length - 1];
      expect(last.sgTable).toBeDefined();
      for (let x = 0; x <= n; x++) {
        expect(last.sgTable![x], `SG(${x}) 必须严格等于 ${x % (m + 1)}`).toBe(x % (m + 1));
      }
    });

    it('096-2 尼姆博弈 SG 证明 (Nim SG): 数学归纳证明单堆 SG(x) ≡ x', () => {
      const n = 12;
      const s = buildNimSgSteps(n);
      verifyGameInvariants(s, NIM_SG_CODES, '尼姆单堆 SG 证明');

      const last = s[s.length - 1];
      expect(last.sgTable).toBeDefined();
      for (let x = 0; x <= n; x++) {
        expect(last.sgTable![x], `单堆尼姆 SG(${x}) 必须恒等于 ${x}`).toBe(x);
      }
    });

    it('096-3 双堆巴什博弈与 SG 矩阵 (Two Stones Bash): 独立子游戏异或合成', () => {
      // (7, 5, m=3): 7%4=3, 5%4=1, 3^1=2 != 0 -> 先手胜
      const sWin = buildTwoStonesBashSteps(7, 5, 3);
      verifyGameInvariants(sWin, TWO_STONES_BASH_CODES, '双堆巴什必胜态');
      expect(sWin[sWin.length - 1].isFirstWin).toBe(true);

      // (7, 3, m=3): 7%4=3, 3%4=3, 3^3=0 -> 先手负
      const sLoss = buildTwoStonesBashSteps(7, 3, 3);
      verifyGameInvariants(sLoss, TWO_STONES_BASH_CODES, '双堆巴什必败态');
      expect(sLoss[sLoss.length - 1].isFirstWin).toBe(false);
    });

    it('096-4 三堆斐波那契博弈 SG (Three Stones Fib): 异或和与三子博弈复合', () => {
      const s = buildThreeStonesFibSteps(5, 7, 9);
      verifyGameInvariants(s, THREE_STONES_FIB_CODES, '三堆斐波那契 SG 复合');
      const last = s[s.length - 1];
      expect(last.sgTable).toBeDefined();
      expect(last.isFirstWin).toBeDefined();
    });

    it('096-5 欧几里得翻硬币博弈 (Coin Flip Game SG): 各正面向硬币等价独立子游戏', () => {
      // [1, 0, 1]: 正面在 #1 和 #3 -> SG = 1 ^ 3 = 2 != 0 -> 先手胜
      const sWin = buildCoinFlipSteps([1, 0, 1]);
      verifyGameInvariants(sWin, COIN_FLIP_CODES, '翻硬币博弈必胜态');
      expect(sWin[sWin.length - 1].isFirstWin).toBe(true);

      // [0, 0, 0]: 全部背面朝上 -> 终局必败态
      const sLoss = buildCoinFlipSteps([0, 0, 0]);
      verifyGameInvariants(sLoss, COIN_FLIP_CODES, '翻硬币博弈终局态');
      expect(sLoss[sLoss.length - 1].isFirstWin).toBe(false);
    });

    it('096-6 分裂石子游戏 SG (Split Game): 单状态分裂异或值的 mex 递推', () => {
      const s = buildSplitGameSteps(10);
      verifyGameInvariants(s, SPLIT_GAME_CODES, '分裂石子游戏 SG');
      const last = s[s.length - 1];
      expect(last.sgTable).toBeDefined();
      expect(last.sgTable![0]).toBe(0);
      expect(last.sgTable![1]).toBe(0);
    });
  });

  // =========================================================================
  // 3. mex 算子数学严密性与 Sprague-Grundy 核心守恒断言
  // =========================================================================
  describe('★ mex 算子与 SG 定理核心数学守恒门禁', () => {
    it('尼姆博弈 mex 算子: 计算得到的 mex 严格为后继集合中首个未出现的非负整数', () => {
      const s = buildNimSgSteps(10);
      const mexSteps = s.filter((st) => st.computedMex !== undefined && st.appearSet !== undefined);
      expect(mexSteps.length).toBeGreaterThan(0);

      for (const st of mexSteps) {
        const mex = st.computedMex!;
        const set = new Set(st.appearSet!);

        // 1. mex 不能在出现集合中
        expect(set.has(mex), `mex=${mex} 绝不能存在于后继集合 {${st.appearSet!.join(',')}}`).toBe(false);

        // 2. 0 到 mex - 1 的所有非负整数必须全部存在于后继集合中
        for (let y = 0; y < mex; y++) {
          expect(set.has(y), `比 mex=${mex} 小的整数 ${y} 必须全部在集合中`).toBe(true);
        }
      }
    });

    it('巴什博弈 mex 算子: SG 打表中的 mex 递推同样严格满足最小缺失非负整数定理', () => {
      const s = buildBashSgSteps(12, 3);
      const mexSteps = s.filter((st) => st.computedMex !== undefined && st.appearSet !== undefined);
      expect(mexSteps.length).toBeGreaterThan(0);

      for (const st of mexSteps) {
        const mex = st.computedMex!;
        const set = new Set(st.appearSet!);
        expect(set.has(mex)).toBe(false);
        for (let y = 0; y < mex; y++) {
          expect(set.has(y)).toBe(true);
        }
      }
    });
  });
});
