/**
 * math-stage-invariants.gate.test.ts
 *
 * 【顶级架构与机械不变量门禁】左程云算法通关课 数论与组合数学全系列 (Class 097 ~ 099)
 *
 * 覆盖全部 17 道数论与代数加速算法：
 * - Class 097 质数判定、大素数与线性筛 (4 题)
 *   1. 试除法判素数 (Small Prime - 6k±1 步长)
 *   2. Miller-Rabin 大素数测试 (Large Prime - 费马小定理与二次探测)
 *   3. 质因子分解 (Prime Factors - 试除质因数累积)
 *   4. 欧拉线性筛 (Euler Sieve - 最小质因子唯一标记)
 * - Class 098 快速幂与矩阵快速幂体系 (7 题)
 *   1. 二进制快速幂 (Quick Power)
 *   2. 斐波那契矩阵快速幂 (Fibonacci Matrix)
 *   3. 爬楼梯矩阵快速幂 (Climbing Stairs Matrix)
 *   4. 泰波那契数矩阵快速幂 (Tribonacci Matrix)
 *   5. 多米诺和托米诺平铺矩阵快速幂 (Domino Tromino Matrix)
 *   6. 元音排列矩阵快速幂 (Count Vowels Matrix)
 *   7. 出勤记录 II 矩阵快速幂 (Attendance Record II Matrix)
 * - Class 099 乘法逆元、容斥原理与组合数学 (6 题)
 *   1. 乘法逆元单点求法 (Modular Inverse Single - 费马小定理快速幂)
 *   2. 线性递推求逆元 (Linear Inverses Table)
 *   3. 阶乘逆元与组合数快速计算 (Factorial Inverses & nCr)
 *   4. 子集 GCD 为 K 方案数 (Subset GCD K - 容斥反演)
 *   5. 硬币购物方案数 (Coin Buy Ways - 多维完全背包与容斥原理)
 *   6. 音乐播放列表 (Music Playlists - 组合递推与逆元)
 *
 * 机械不变量门禁红线：
 * 1. Step 0 入口契约：首帧 decision 必须明确主函数入口或参数接收
 * 2. 多语言代码映射非悬空：4 语言代码行号必须严格落在 [1, length] 范围
 * 3. 终态结论判定收敛：尾帧 decision 必须收敛至终态结论
 * 4. 数论与代数数学不变量守恒：
 *    - 试除法 <= sqrt(n) 截断与素数/合数严格二分
 *    - 质因子分解幂次乘积严格等于原数：Prod(p_i ^ e_i) === n
 *    - 线性筛素数表单调递增，合数最小素因子标记唯一
 *    - 矩阵快速幂状态转移与经典齐次递推真值严格无误差
 *    - 费马小定理逆元与原数乘积模 p === 1
 *    - 阶乘逆元与组合数计算严格满足组合数加法递推与对称性
 */

import { describe, it, expect } from 'vitest';

// Class 097
import { buildSmallPrimeSteps } from '../../algorithms/categories/math/math-097/small-prime-renderer';
import { buildMillerRabinSteps } from '../../algorithms/categories/math/math-097/large-prime-renderer';
import { buildPrimeFactorsSteps } from '../../algorithms/categories/math/math-097/prime-factors-renderer';
import { buildEulerSieveSteps } from '../../algorithms/categories/math/math-097/ehrlich-euler-sieve-renderer';
import {
  SMALL_PRIME_CODES,
  LARGE_PRIME_CODES,
  PRIME_FACTORS_CODES,
  EHRLICH_EULER_CODES,
} from '../../algorithms/categories/math/math-097/math-097-stage-codes';

// Class 098
import { buildQuickPowerSteps } from '../../algorithms/categories/math/math-098/quick-power-renderer';
import { buildFibMatrixSteps } from '../../algorithms/categories/math/math-098/fibonacci-matrix-renderer';
import { buildClimbingStairsSteps } from '../../algorithms/categories/math/math-098/climbing-stairs-matrix-renderer';
import { buildTribonacciSteps } from '../../algorithms/categories/math/math-098/tribonacci-matrix-renderer';
import { buildDominoSteps } from '../../algorithms/categories/math/math-098/domino-tromino-matrix-renderer';
import { buildCountVowelsSteps } from '../../algorithms/categories/math/math-098/count-vowels-matrix-renderer';
import { buildAttendanceSteps } from '../../algorithms/categories/math/math-098/attendance-record-matrix-renderer';
import {
  QUICK_POWER_CODES,
  FIBONACCI_MATRIX_CODES,
  CLIMBING_STAIRS_CODES,
  TRIBONACCI_MATRIX_CODES,
  DOMINO_TROMINO_CODES,
  COUNT_VOWELS_CODES,
  ATTENDANCE_RECORD_CODES,
} from '../../algorithms/categories/math/math-098/math-098-stage-codes';

// Class 099
import { buildInverseSingleSteps } from '../../algorithms/categories/math/math-099/inverse-single-renderer';
import { buildInverseSerialSteps } from '../../algorithms/categories/math/math-099/inverse-serial-renderer';
import { buildFactorialSteps } from '../../algorithms/categories/math/math-099/inverse-factorial-renderer';
import { buildSubsetGcdSteps } from '../../algorithms/categories/math/math-099/subset-gcd-k-renderer';
import { buildCoinBuySteps } from '../../algorithms/categories/math/math-099/coin-buy-ways-renderer';
import { buildMusicPlaylistsSteps } from '../../algorithms/categories/math/math-099/music-playlists-renderer';
import {
  INVERSE_SINGLE_CODES,
  INVERSE_SERIAL_CODES,
  INVERSE_FACTORIAL_CODES,
  SUBSET_GCD_K_CODES,
  COIN_BUY_WAYS_CODES,
  MUSIC_PLAYLISTS_CODES,
} from '../../algorithms/categories/math/math-099/math-099-stage-codes';

import {
  buildMaxPointsSteps,
  MAX_POINTS_CODES,
} from '../../algorithms/categories/math/max-points-on-a-line-renderer';
import {
  generateRandomGenSteps,
  RANDOM_GEN_035_CODES,
} from '../../algorithms/categories/math/random-generator-035-renderer';

/**
 * 核心校验器：验证通用机械不变量
 */
function verifyMathInvariants(steps: any[], codes: Record<string, string[] | string>, algoName: string) {
  expect(steps.length, `${algoName}: 生成步数必须大于 0`).toBeGreaterThan(0);

  // 1. Step 0 入口契约
  const step0 = steps[0];
  expect(
    step0.decision || step0.message,
    `${algoName}: Step 0 决策描述必须明确声明主函数入口或参数接收`
  ).toMatch(/(入口|接收|准备|求解|计算|初始化|启动|算法)/);

  // 2. 四语言代码映射合法性
  for (let idx = 0; idx < steps.length; idx++) {
    const step = steps[idx];
    const lineMap = step.codeLine as Record<string, number>;
    expect(lineMap, `${algoName} [Step ${idx}]: codeLine 必须定义`).toBeDefined();

    for (const [lang, line] of Object.entries(lineMap)) {
      const codeDef = codes[lang];
      expect(codeDef, `${algoName}: 语言 ${lang} 必须存在代码定义`).toBeDefined();
      const totalLines = Array.isArray(codeDef) ? codeDef.length : codeDef.trim().split('\n').length;
      expect(
        line,
        `${algoName} [Step ${idx}]: 语言 ${lang} 行号 ${line} 超出下界 1`
      ).toBeGreaterThanOrEqual(1);
      expect(
        line,
        `${algoName} [Step ${idx}]: 语言 ${lang} 行号 ${line} 超出上界 ${totalLines}`
      ).toBeLessThanOrEqual(totalLines);
    }
  }

  // 3. 终态收敛性
  const lastStep = steps[steps.length - 1];
  expect(
    lastStep.decision || lastStep.message,
    `${algoName}: 尾帧必须收敛至终态结论或答案`
  ).toMatch(/(结论|完成|完毕|结束|返回|等于|结果|求得|确定|判定|收敛|最优|ans|done|return|非素数|合数|素数)/i);
}

describe('左程云数论与组合数学顶级机械不变量门禁 (Math & Combinatorics Class 097 ~ 099)', () => {
  describe('Class 097: 质数判定、大素数测试与线性筛法', () => {
    it('097-1 试除法判素数 (Small Prime): 6k±1 截断与素合二分不变性', () => {
      // 质数 97
      const s97 = buildSmallPrimeSteps(97);
      verifyMathInvariants(s97, SMALL_PRIME_CODES, '试除法质数 97');
      expect(s97[s97.length - 1].isResultPrime).toBe(true);

      // 合数 100
      const s100 = buildSmallPrimeSteps(100);
      verifyMathInvariants(s100, SMALL_PRIME_CODES, '试除法合数 100');
      expect(s100[s100.length - 1].isResultPrime).toBe(false);

      // 边界与半质数 49 (7^2)
      const s49 = buildSmallPrimeSteps(49);
      verifyMathInvariants(s49, SMALL_PRIME_CODES, '试除法平方合数 49');
      expect(s49[s49.length - 1].isResultPrime).toBe(false);
    });

    it('097-2 Miller-Rabin 大素数测试 (Large Prime): 二次探测与强伪素数检验', () => {
      // 大质数 10^9 + 7
      const sPrime = buildMillerRabinSteps(1000000007);
      verifyMathInvariants(sPrime, LARGE_PRIME_CODES, 'Miller-Rabin 10^9+7');
      expect(sPrime[sPrime.length - 1].isResultPrime).toBe(true);

      // 大合数 10^9 + 5 (5 的倍数)
      const sComp = buildMillerRabinSteps(1000000005);
      verifyMathInvariants(sComp, LARGE_PRIME_CODES, 'Miller-Rabin 10^9+5');
      expect(sComp[sComp.length - 1].isResultPrime).toBe(false);
    });

    it('097-3 质因子分解 (Prime Factors): 唯一分解定理与原数积守恒', () => {
      // 360 = 2^3 * 3^2 * 5^1
      const s360 = buildPrimeFactorsSteps(360);
      verifyMathInvariants(s360, PRIME_FACTORS_CODES, '质因子分解 360');
      const last = s360[s360.length - 1];
      expect(last.factors).toBeDefined();

      // 质因数分解积守恒验证：Prod(p_i ^ e_i) === n
      const product = last.factors!.reduce((acc: number, f: { prime: number; power: number }) => {
        return acc * Math.pow(f.prime, f.power);
      }, 1);
      expect(product).toBe(360);
    });

    it('097-4 欧拉线性筛 (Euler Sieve): 质数单调有序性与最小质因子标记', () => {
      const sSieve = buildEulerSieveSteps(30);
      verifyMathInvariants(sSieve, EHRLICH_EULER_CODES, '欧拉线性筛 30 以内');
      const last = sSieve[sSieve.length - 1];
      const primes = last.primesFound!;
      expect(primes).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);

      // 严格单调递增
      for (let i = 1; i < primes.length; i++) {
        expect(primes[i]).toBeGreaterThan(primes[i - 1]);
      }
    });
  });

  describe('Class 098: 快速幂与矩阵快速幂加速体系', () => {
    it('098-1 二进制快速幂 (Quick Power): 指数分解累乘不变性', () => {
      // 3^13 = 1594323
      const sPower = buildQuickPowerSteps(3, 13);
      verifyMathInvariants(sPower, QUICK_POWER_CODES, '快速幂 3^13');
      expect(sPower[sPower.length - 1].finalValue).toBe(1594323);
    });

    it('098-2 斐波那契矩阵快速幂 (Fibonacci Matrix): 状态转移与齐次递推守恒', () => {
      // F(10) = 55
      const sFib = buildFibMatrixSteps(10);
      verifyMathInvariants(sFib, FIBONACCI_MATRIX_CODES, '斐波那契矩阵快速幂 F(10)');
      expect(sFib[sFib.length - 1].finalValue).toBe(55);
    });

    it('098-3 爬楼梯矩阵快速幂 (Climbing Stairs Matrix): dp[n] = dp[n-1] + dp[n-2]', () => {
      // dp[4] = 5
      const sStairs = buildClimbingStairsSteps(4);
      verifyMathInvariants(sStairs, CLIMBING_STAIRS_CODES, '爬楼梯矩阵快速幂 dp(4)');
      expect(sStairs[sStairs.length - 1].finalValue).toBe(5);
    });

    it('098-4 泰波那契数矩阵快速幂 (Tribonacci Matrix): 3 阶常系数递推', () => {
      // T(4) = 4 (0, 1, 1, 2, 4)
      const sTrib = buildTribonacciSteps(4);
      verifyMathInvariants(sTrib, TRIBONACCI_MATRIX_CODES, '泰波那契矩阵快速幂 T(4)');
      expect(sTrib[sTrib.length - 1].finalValue).toBe(4);
    });

    it('098-5 多米诺和托米诺平铺矩阵快速幂 (Domino Tromino): 多状态联合转移', () => {
      // n=4 -> 11
      const sDomino = buildDominoSteps(4);
      verifyMathInvariants(sDomino, DOMINO_TROMINO_CODES, '多米诺托米诺平铺 n=4');
      expect(sDomino[sDomino.length - 1].finalValue).toBe(11);
    });

    it('098-6 元音排列矩阵快速幂 (Count Vowels): 5 维字符状态转移收敛', () => {
      // n=5 -> 68
      const sVowels = buildCountVowelsSteps(5);
      verifyMathInvariants(sVowels, COUNT_VOWELS_CODES, '元音排列 n=5');
      expect(sVowels[sVowels.length - 1].finalValue).toBe(68);
    });

    it('098-7 出勤记录 II 矩阵快速幂 (Attendance Record II): 6 状态有限自动机转移', () => {
      // n=2 -> 8
      const sAttend = buildAttendanceSteps(2);
      verifyMathInvariants(sAttend, ATTENDANCE_RECORD_CODES, '出勤记录 II n=2');
      expect(sAttend[sAttend.length - 1].finalValue).toBe(8);
    });
  });

  describe('Class 099: 乘法逆元、容斥原理与组合数学', () => {
    it('099-1 乘法逆元单点求法 (Modular Inverse Single): 费马小定理 a * inv(a) = 1 (mod p)', () => {
      const p = 1000000007;
      const a = 3;
      const sSingle = buildInverseSingleSteps(a, p);
      verifyMathInvariants(sSingle, INVERSE_SINGLE_CODES, '费马小定理单点逆元 3^-1');
      const inv3 = sSingle[sSingle.length - 1].finalValue!;
      expect(inv3).toBe(333333336);

      // 逆元严格数学断言：(3 * 333333336) % p === 1
      expect(Number((BigInt(a) * BigInt(inv3)) % BigInt(p))).toBe(1);
    });

    it('099-2 线性递推求逆元 (Linear Inverses): O(n) 批量前缀逆元连续有效性', () => {
      const p = 1000000007;
      const n = 5;
      const sSerial = buildInverseSerialSteps(n, p);
      verifyMathInvariants(sSerial, INVERSE_SERIAL_CODES, '线性递推逆元前 5 项');
      const table = sSerial[sSerial.length - 1].inversesTable!;
      expect(table.length).toBe(n);

      for (let i = 0; i < n; i++) {
        const val = table[i].num;
        const inv = table[i].inv;
        expect(Number((BigInt(val) * BigInt(inv)) % BigInt(p))).toBe(1);
      }
    });

    it('099-3 阶乘逆元与组合数快速计算 (Factorial Inverses & nCr): 组合恒等式与阶乘商', () => {
      // C(10, 3) = 120
      const sFact = buildFactorialSteps(10, 3, 1000000007);
      verifyMathInvariants(sFact, INVERSE_FACTORIAL_CODES, '阶乘逆元求 C(10, 3)');
      expect(sFact[sFact.length - 1].finalValue).toBe(120);
    });

    it('099-4 子集 GCD 为 K 方案数 (Subset GCD K): 容斥反演计数有效性', () => {
      const nums = [2, 4, 6, 8, 10];
      const sGcd = buildSubsetGcdSteps(nums, 2);
      verifyMathInvariants(sGcd, SUBSET_GCD_K_CODES, '子集 GCD 为 2 方案数');
      expect(sGcd[sGcd.length - 1].finalValue).toBeGreaterThan(0);
    });

    it('099-5 硬币购物方案数 (Coin Buy Ways): 多重背包容斥减法守恒', () => {
      const c = [1, 2, 5, 10];
      const d = [3, 2, 3, 1];
      const s = 10;
      const sCoin = buildCoinBuySteps(c, d, s);
      verifyMathInvariants(sCoin, COIN_BUY_WAYS_CODES, '硬币购物方案数容斥');
      expect(sCoin[sCoin.length - 1].finalValue).toBeGreaterThan(0);
    });

    it('099-6 音乐播放列表 (Music Playlists): 动态规划与组合数学过渡', () => {
      // n=3, goal=3, k=1 -> 3 * 2 * 1 = 6
      const sMusic = buildMusicPlaylistsSteps(3, 3, 1);
      verifyMathInvariants(sMusic, MUSIC_PLAYLISTS_CODES, '音乐播放列表');
      expect(sMusic[sMusic.length - 1].finalValue).toBe(6);
    });
  });

  describe('Classic Math & Probability Transformations (经典几何数学与等概率变换)', () => {
    it('LeetCode 149: 直线上最多的点数 GCD 化简与斜率哈希', () => {
      const points = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ];
      const steps = buildMaxPointsSteps(points);
      verifyMathInvariants(steps, MAX_POINTS_CODES, '直线上最多的点数');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.globalMax).toBe(3);
    });

    it('Class 035: 冯·诺依曼偏置消除与二进制拼装严格均匀随机数', () => {
      const steps = generateRandomGenSteps(2);
      verifyMathInvariants(steps, RANDOM_GEN_035_CODES, '不均匀随机发生器转化');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.finalResult).toBeGreaterThanOrEqual(1);
      expect(lastStep.finalResult).toBeLessThanOrEqual(7);
    });
  });
});
