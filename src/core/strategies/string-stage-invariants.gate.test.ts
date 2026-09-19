/**
 * string-stage-invariants.gate.test.ts
 *
 * 【顶级架构与机械不变量门禁】左程云算法通关课 高阶字符串专题全系列 (Class 100 ~ 105)
 *
 * 覆盖全部 6 种高阶字符串与模式匹配算法：
 * - Class 100: KMP 算法核心原理 (Next 数组前缀后缀匹配与 O(N+M) 线性搜索)
 * - Class 101: KMP 循环节与周期串检测 (错位平移与整除真周期定理)
 * - Class 102: AC 自动机多模式串匹配 (Trie 树与 Fail 失配树融合单次线性多模扫描)
 * - Class 103: Manacher 最长回文子串算法 (# 扩展、对称中心 C、右边界 R 与镜像 i' 继承)
 * - Class 104: 扩展 KMP / Z 算法 (Z-Box 匹配盒机制与全后缀 LCP 数组)
 * - Class 105: 字符串哈希与滚动哈希 (多项式哈希、模数溢出防护与 O(1) 子串判等)
 *
 * 机械不变量门禁红线：
 * 1. Step 0 入口契约：首帧 decision 必须明确主函数入口或参数接收
 * 2. 多语言代码映射非悬空：4 语言代码行号必须严格落在 [1, length] 范围
 * 3. 终态结论判定收敛：尾帧 decision 必须收敛至终态结论或匹配结果
 * 4. 字符串与匹配算法机械不变量守恒：
 *    - Next 数组前后缀对称守恒：s2[0..next[i]-1] === s2[i-next[i]..i-1]
 *    - KMP 匹配正确性：s1.slice(foundIndex, foundIndex + s2.length) === s2
 *    - KMP 周期性：isDivisible ➔ n % periodLen === 0 且模式串无缝平铺
 *    - AC 自动机多模覆盖性：匹配出的每个 pattern 必为 text 的真子串
 *    - Manacher 回文自反性：提取出的最长回文串与自身反转严格恒等
 *    - Z 算法 LCP 严格性：s.slice(i, i + Z[i]) === s.slice(0, Z[i]) 且 s[i + Z[i]] != s[Z[i]]
 *    - 字符串哈希守恒：相同子串哈希严格一致，不同子串无平凡碰撞
 */

import { describe, it, expect } from 'vitest';

import { buildKmpSteps, computeNextArray } from '../../algorithms/categories/string/string-100-105/kmp-renderer';
import { buildKmpPeriodSteps } from '../../algorithms/categories/string/string-100-105/kmp-period-renderer';
import { buildACAutomatonSteps } from '../../algorithms/categories/string/string-100-105/ac-automaton-renderer';
import { buildManacherSteps } from '../../algorithms/categories/string/string-100-105/manacher-renderer';
import { buildZAlgorithmSteps } from '../../algorithms/categories/string/string-100-105/z-algorithm-renderer';
import { buildStringHashSteps } from '../../algorithms/categories/string/string-100-105/string-hash-renderer';

import {
  KMP_CODES,
  KMP_PERIOD_CODES,
  AC_AUTOMATON_CODES,
  MANACHER_CODES,
  Z_ALGORITHM_CODES,
  STRING_HASH_CODES,
} from '../../algorithms/categories/string/string-100-105/string-100-105-stage-codes';

/**
 * 字符串通用机械不变量校验器
 */
function verifyStringInvariants(steps: any[], codes: Record<string, string[]>, algoName: string) {
  expect(steps.length, `${algoName}: 生成步数必须大于 0`).toBeGreaterThan(0);

  // 1. Step 0 入口契约
  const step0 = steps[0];
  expect(
    step0.decision,
    `${algoName}: Step 0 决策描述必须明确声明主函数入口或参数接收`
  ).toMatch(/(入口|接收|准备|初始化|启动)/);

  // 2. 四语言代码映射合法性
  for (let idx = 0; idx < steps.length; idx++) {
    const step = steps[idx];
    const lineMap = step.codeLine as Record<string, number>;
    expect(lineMap, `${algoName} [Step ${idx}]: codeLine 必须定义`).toBeDefined();

    for (const lang of ['java', 'cpp', 'python', 'javascript']) {
      const line = lineMap[lang];
      const codeArray = codes[lang];
      expect(codeArray, `${algoName}: 语言 ${lang} 必须存在代码定义`).toBeDefined();
      expect(
        line,
        `${algoName} [Step ${idx}]: 语言 ${lang} 行号 ${line} 超出下界 1`
      ).toBeGreaterThanOrEqual(1);
      expect(
        line,
        `${algoName} [Step ${idx}]: 语言 ${lang} 行号 ${line} 超出上界 ${codeArray.length}`
      ).toBeLessThanOrEqual(codeArray.length);
    }
  }

  // 3. 终态收敛性
  const lastStep = steps[steps.length - 1];
  expect(
    lastStep.decision,
    `${algoName}: 尾帧必须收敛至终态结论或答案`
  ).toMatch(/(结论|完成|完毕|结束|返回|成功|失败|一致|不一致|结果|求得|确定|判定|收敛|最优|ans|done|return)/i);
}

describe('左程云高阶字符串顶级机械不变量门禁 (String Algorithms Class 100 ~ 105)', () => {
  it('100. KMP 模式匹配算法: Next 数组最长前后缀对称与线性检索', () => {
    // 1. Next 数组对称守恒断言
    const pattern = 'ABABC';
    const next = computeNextArray(pattern);
    expect(next).toEqual([-1, 0, 0, 1, 2]);

    for (let i = 2; i < pattern.length; i++) {
      const len = next[i];
      if (len > 0) {
        // 前缀 pattern[0..len-1] 与后缀 pattern[i-len..i-1] 严格相同
        expect(pattern.slice(0, len)).toBe(pattern.slice(i - len, i));
      }
    }

    // 2. 匹配成功用例与下标切片守恒
    const s1 = 'ABABABCABA';
    const s2 = 'ABABC';
    const sFound = buildKmpSteps(s1, s2);
    verifyStringInvariants(sFound, KMP_CODES, 'KMP 匹配成功');
    const lastFound = sFound[sFound.length - 1];
    expect(lastFound.foundIndex).toBe(2);
    expect(s1.slice(lastFound.foundIndex, lastFound.foundIndex + s2.length)).toBe(s2);

    // 3. 匹配失配用例
    const sNotFound = buildKmpSteps('AAAAAA', 'B');
    verifyStringInvariants(sNotFound, KMP_CODES, 'KMP 匹配失配');
    expect(sNotFound[sNotFound.length - 1].foundIndex).toBe(-1);
  });

  it('101. KMP 周期串与循环节检测: 错位平移与整除真周期定理', () => {
    // 完美周期串 abcabcabc -> n=9, next[9]=6 -> period=3 -> repeatCount=3
    const sPeriodic = buildKmpPeriodSteps('abcabcabc');
    verifyStringInvariants(sPeriodic, KMP_PERIOD_CODES, 'KMP 完美周期串');
    const lastPeriodic = sPeriodic[sPeriodic.length - 1];
    expect(lastPeriodic.isDivisible).toBe(true);
    expect(lastPeriodic.periodLen).toBe(3);
    expect(lastPeriodic.repeatCount).toBe(3);
    // 平铺验证
    const rep = 'abc'.repeat(lastPeriodic.repeatCount);
    expect(rep).toBe('abcabcabc');

    // 无真周期串 abcab -> n=5, next[5]=2 -> period=3, 5 % 3 != 0
    const sNonPeriodic = buildKmpPeriodSteps('abcab');
    verifyStringInvariants(sNonPeriodic, KMP_PERIOD_CODES, 'KMP 非整除串');
    const lastNonPeriodic = sNonPeriodic[sNonPeriodic.length - 1];
    expect(lastNonPeriodic.isDivisible).toBe(false);
  });

  it('102. AC 自动机多模式串匹配: 单次线性扫描与多模匹配覆盖性', () => {
    const text = 'abcefabcd';
    const patterns = ['ab', 'bc', 'abcd', 'ef'];
    const sAc = buildACAutomatonSteps(text, patterns);
    verifyStringInvariants(sAc, AC_AUTOMATON_CODES, 'AC 自动机');
    const last = sAc[sAc.length - 1];
    expect(last.matchedCount).toBe(4);
    for (const pat of patterns) {
      expect(last.matchedList).toContain(pat);
      expect(text).toContain(pat);
    }
  });

  it('103. Manacher 算法: 扩展串对称中心维护与最长回文自反性', () => {
    const testCases = ['babad', 'cbbd', 'abacaba'];
    for (const s of testCases) {
      const steps = buildManacherSteps(s);
      verifyStringInvariants(steps, MANACHER_CODES, `Manacher (${s})`);
      const last = steps[steps.length - 1];
      const pal = last.longestPalindrome;
      expect(pal).toBeDefined();
      // 回文自反性：pal 必与自身反转严格一致
      const reversed = pal.split('').reverse().join('');
      expect(pal).toBe(reversed);
      // pal 必为原串 s 的真子串
      expect(s).toContain(pal);
      expect(pal.length).toBe(last.maxLen);
    }
  });

  it('104. 扩展 KMP / Z 算法: Z-Box 匹配盒机制与 LCP 前缀合法性', () => {
    const s = 'abacaba';
    const sZ = buildZAlgorithmSteps(s);
    verifyStringInvariants(sZ, Z_ALGORITHM_CODES, 'Z 算法 abacaba');
    const last = sZ[sZ.length - 1];
    const z = last.zArr;
    expect(z).toEqual([7, 0, 1, 0, 3, 0, 1]);

    // 严格 LCP 机械检验
    for (let i = 0; i < s.length; i++) {
      const len = z[i];
      if (len > 0) {
        expect(s.slice(i, i + len)).toBe(s.slice(0, len));
      }
      if (i + len < s.length) {
        // 下一个字符必须不相等（最大匹配）
        expect(s[i + len]).not.toBe(s[len]);
      }
    }
  });

  it('105. 字符串哈希与滚动哈希: 模数多项式不变性与 O(1) 判等', () => {
    const s = 'abcdeabcf';
    // s[0..2] === 'abc', s[5..7] === 'abc' ➔ 相同
    const sSame = buildStringHashSteps(s, 0, 2, 5, 7);
    verifyStringInvariants(sSame, STRING_HASH_CODES, '字符串哈希相同子串');
    expect(sSame[sSame.length - 1].isEqual).toBe(true);

    // s[0..2] === 'abc', s[1..3] === 'bcd' ➔ 不同
    const sDiff = buildStringHashSteps(s, 0, 2, 1, 3);
    verifyStringInvariants(sDiff, STRING_HASH_CODES, '字符串哈希不同子串');
    expect(sDiff[sDiff.length - 1].isEqual).toBe(false);
  });
});
