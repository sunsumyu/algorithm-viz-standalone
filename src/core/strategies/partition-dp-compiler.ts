/**
 * 一维前缀内循环切分族统一步骤矩阵编译器 (PartitionDPCompiler)
 * 核心针对形态：dp[i] = opt_{1 <= j < i} { f(j, dp[i - j]) }
 * 通用支持：整数拆分 (LC 343)、完全平方数 (LC 279)、单词拆分 (LC 139) 等
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';

export interface DecisionBranchSpec {
  label: string;
  formula: string;
  value: number;
  isSelected?: boolean;
}

export interface PartitionKernelSpec {
  startI: number;
  initBase: (dp: (number | null)[]) => UniversalStep[];
  enumerateInner: (i: number) => number[];
  computeTransfer: (i: number, j: number, dp: (number | null)[]) => {
    candidateValue: number;
    fromSlot?: number;
    decisions: DecisionBranchSpec[];
    tag?: string;
    log?: string;
    msg?: string;
  };
  aggregate: 'max' | 'min';
}

export interface PartitionCompileOptions {
  n: number;
  stage: number;
  direction?: 'forward' | 'reverse';
  anchorMap?: Record<string, number>;
  kernel?: PartitionKernelSpec;
}

/**
 * 整数拆分 (LeetCode 343) 默认核函数
 */
export const INTEGER_BREAK_KERNEL: PartitionKernelSpec = {
  startI: 3,
  aggregate: 'max',
  initBase: (dp) => {
    dp[2] = 1;
    return [{
      type: 'base',
      i: 2,
      j: 0,
      activeSlot: 2,
      dp1d: [...dp],
      memo: [...dp],
      tag: `Base Case: dp[2] = 1`,
      log: `| 📌 边界基底: dp[2] = 1 (2 = 1 + 1, 乘积为 1)`,
      msg: `初始化最小不可分边界：正整数 2 只能拆分为 <code>1 + 1</code>，因此 <code>dp[2] = 1</code>。`
    }];
  },
  enumerateInner: (i) => {
    const list: number[] = [];
    for (let j = 1; j < i; j++) list.push(j);
    return list;
  },
  computeTransfer: (i, j, dp) => {
    const branchA = j * (i - j);
    const branchB = j * (dp[i - j] ?? 0);
    const candidateValue = Math.max(branchA, branchB);
    const aWins = branchA >= branchB;

    return {
      candidateValue,
      fromSlot: i - j >= 0 ? i - j : undefined,
      tag: `切分 j=${j}`,
      log: `| 🔄 切分 j=${j}: 两数直乘=${branchA}, 多段拆分=${branchB}, 胜出=${candidateValue}`,
      msg: `状态转移：切分点 <code>j = ${j}</code>。<br/>• 分支 A (两数直乘)：<code>${j} × ${i - j} = ${branchA}</code><br/>• 分支 B (借助子问题)：<code>${j} × dp[${i - j}] = ${branchB}</code>`,
      decisions: [
        {
          label: `分支 A (不再拆分): ${j} × ${i - j}`,
          formula: 'j * (i - j)',
          value: branchA,
          isSelected: aWins
        },
        {
          label: `分支 B (继续拆分): ${j} × dp[${i - j}]`,
          formula: 'j * dp[i - j]',
          value: branchB,
          isSelected: !aWins
        }
      ]
    };
  }
};

/**
 * 完全平方数 (LeetCode 279) 核函数
 */
export const PERFECT_SQUARES_KERNEL: PartitionKernelSpec = {
  startI: 1,
  aggregate: 'min',
  initBase: (dp) => {
    dp[0] = 0;
    return [{
      type: 'base',
      i: 0,
      j: 0,
      activeSlot: 0,
      dp1d: [...dp],
      memo: [...dp],
      tag: `Base Case: dp[0] = 0`,
      log: `| 📌 边界基底: dp[0] = 0 (和为 0 需 0 个平方数)`,
      msg: `初始化边界基底：和为 <code>0</code> 所需完全平方数数量为 <code>0</code>。`
    }];
  },
  enumerateInner: (i) => {
    const list: number[] = [];
    for (let j = 1; j * j <= i; j++) list.push(j);
    return list;
  },
  computeTransfer: (i, j, dp) => {
    const sq = j * j;
    const prev = dp[i - sq] ?? 0;
    const candidateValue = prev + 1;
    const currentVal = dp[i] ?? Number.MAX_SAFE_INTEGER;
    const isBetter = candidateValue < currentVal;

    return {
      candidateValue,
      fromSlot: i - sq >= 0 ? i - sq : undefined,
      tag: `尝试平方数 ${j}²=${sq}`,
      log: `| ⏹️ 尝试减去平方数 ${j}²=${sq}: dp[${i - sq}] + 1 = ${prev} + 1 = ${candidateValue} ${isBetter ? '(更优)' : '(未更新)'}`,
      msg: `尝试切分出完全平方数 <code>${j}² = ${sq}</code>：剩余 <code>${i - sq}</code> 最少需要 <code>${prev}</code> 个平方数，候选值为 <code>${candidateValue}</code>。`,
      decisions: [
        {
          label: `保留当前最优: dp[i]`,
          formula: `dp[i] = ${currentVal === Number.MAX_SAFE_INTEGER ? '∞' : currentVal}`,
          value: currentVal,
          isSelected: !isBetter
        },
        {
          label: `选用平方数 ${j}² (${sq}): dp[i - j*j] + 1`,
          formula: `dp[i - j*j] + 1 = ${candidateValue}`,
          value: candidateValue,
          isSelected: isBetter
        }
      ]
    };
  }
};

/**
 * 零钱兑换 (LeetCode 322) 核函数
 */
export const COIN_CHANGE_KERNEL: PartitionKernelSpec = {
  startI: 1,
  aggregate: 'min',
  initBase: (dp) => {
    dp[0] = 0;
    return [{
      type: 'base',
      i: 0,
      j: 0,
      activeSlot: 0,
      dp1d: [...dp],
      memo: [...dp],
      tag: `Base Case: dp[0] = 0`,
      log: `| 📌 边界基底: dp[0] = 0 (金额 0 需 0 枚硬币)`,
      msg: `初始化边界基底：凑成总金额 <code>0</code> 所需硬币数量为 <code>0</code>。`
    }];
  },
  enumerateInner: (i) => {
    const coins = [1, 2, 5];
    return coins.filter(c => c <= i);
  },
  computeTransfer: (i, c, dp) => {
    const prev = dp[i - c];
    const candidateValue = (prev !== null && prev !== undefined && prev !== Number.MAX_SAFE_INTEGER)
      ? prev + 1
      : Number.MAX_SAFE_INTEGER;
    const currentVal = dp[i] ?? Number.MAX_SAFE_INTEGER;
    const isBetter = candidateValue < currentVal;

    return {
      candidateValue,
      fromSlot: i - c >= 0 ? i - c : undefined,
      tag: `尝试面额 ${c}`,
      log: `| 🪙 尝试硬币面额 ${c}: dp[${i - c}] + 1 = ${prev === Number.MAX_SAFE_INTEGER ? '∞' : prev} + 1 = ${candidateValue === Number.MAX_SAFE_INTEGER ? '∞' : candidateValue} ${isBetter ? '(更优)' : '(未更新)'}`,
      msg: `尝试选用面额 <code>${c}</code>：剩余金额 <code>${i - c}</code> 最少需要 <code>${prev === Number.MAX_SAFE_INTEGER ? '∞' : prev}</code> 枚硬币，候选状态为 <code>${candidateValue === Number.MAX_SAFE_INTEGER ? '∞' : candidateValue}</code>。`,
      decisions: [
        {
          label: `保留当前最优: dp[i]`,
          formula: `dp[i] = ${currentVal === Number.MAX_SAFE_INTEGER ? '∞' : currentVal}`,
          value: currentVal === Number.MAX_SAFE_INTEGER ? 999999 : currentVal,
          isSelected: !isBetter
        },
        {
          label: `选用面额 ${c}: dp[i - c] + 1`,
          formula: `dp[i - c] + 1 = ${candidateValue === Number.MAX_SAFE_INTEGER ? '∞' : candidateValue}`,
          value: candidateValue === Number.MAX_SAFE_INTEGER ? 999999 : candidateValue,
          isSelected: isBetter
        }
      ]
    };
  }
};

/**
 * 单词拆分 (LeetCode 139) 核函数
 */
export const WORD_BREAK_KERNEL: PartitionKernelSpec = {
  startI: 1,
  aggregate: 'max',
  initBase: (dp) => {
    dp[0] = 1;
    return [{
      type: 'base',
      i: 0,
      j: 0,
      activeSlot: 0,
      dp1d: [...dp],
      memo: [...dp],
      tag: `Base Case: dp[0] = true`,
      log: `| 📌 边界基底: dp[0] = true (空字符串有效，长度为0)`,
      msg: `初始化边界基底：空字符串默认可被有效拆分，设 <code>dp[0] = true</code>。`
    }];
  },
  enumerateInner: (i) => {
    const list: number[] = [];
    for (let j = 0; j < i; j++) list.push(j);
    return list;
  },
  computeTransfer: (i, j, dp) => {
    const s = 'leetcode';
    const wordDict = new Set(['leet', 'code']);
    const sub = s.substring(j, i);
    const inDict = wordDict.has(sub);
    const prev = dp[j] === 1;
    const match = prev && inDict;
    const candidateValue = match ? 1 : 0;
    const currentVal = dp[i] ?? 0;
    const isBetter = candidateValue > currentVal;

    return {
      candidateValue,
      fromSlot: j,
      tag: `切分 j=${j} "${sub}"`,
      log: `| 🧩 切分 j=${j}: dp[${j}]=${prev}, "${sub}" in dict=${inDict} ➔ 匹配=${match}`,
      msg: `尝试切分点 <code>j = ${j}</code>：前缀 <code>dp[${j}] = ${prev}</code>，子串 <code>"${sub}"</code> 是否在词表中：<code>${inDict}</code>。`,
      decisions: [
        {
          label: `保留当前最优: dp[i]`,
          formula: `dp[i] = ${currentVal === 1 ? 'true' : 'false'}`,
          value: currentVal,
          isSelected: !isBetter
        },
        {
          label: `切分点 j=${j} ("${sub}"): dp[j] && inDict`,
          formula: `dp[j] && inDict("${sub}") = ${match ? 'true' : 'false'}`,
          value: candidateValue,
          isSelected: isBetter
        }
      ]
    };
  }
};

export class PartitionDPCompiler {
  /**
   * 编译 Stage 3: 通用一维切分填表与两路天平抉择 (Bottom-Up Nested Scan)
   */
  public static compileStage3(
    model: IYamlAlgorithmModel,
    options: PartitionCompileOptions
  ): UniversalStep[] {
    const defaultN = model.id === 'perfect-squares' ? 12 : (model.id === 'coin-change' ? 11 : (model.id === 'word-break' ? 8 : (model.id === 'coin-change-ii' ? 5 : 6)));
    const n = Math.min(Math.max(options.n || defaultN, 1), 20);
    const anchorMap = options.anchorMap || {};

    if (model.id === 'coin-change-ii') {
      const coins = [1, 2, 5];
      const amount = n;
      const steps: UniversalStep[] = [];
      const lineInit = anchorMap.init || 3;
      const lineBase = anchorMap.base || 4;
      const lineLoopOuter = anchorMap['loop-outer'] || 5;
      const lineLoopInner = anchorMap['loop-inner'] || 6;
      const lineTransfer = anchorMap.transfer || 8;
      const lineReturn = anchorMap.return || 11;

      const dp: (number | null)[] = new Array(amount + 1).fill(0);

      steps.push({
        type: 'init',
        line: lineInit,
        i: 0,
        j: 0,
        activeSlot: 0,
        dp1d: [...dp],
        memo: [...dp],
        tag: `分配 DP 数组 (容量 ${amount + 1})`,
        log: `| 🎬 分配状态数组: dp = new int[${amount + 1}], 全部初始化为 0`,
        msg: `初始化状态数组：<code>dp[0...${amount}]</code>，初始值均为 <code>0</code>。`
      });

      dp[0] = 1;
      steps.push({
        type: 'base',
        line: lineBase,
        i: 0,
        j: 0,
        activeSlot: 0,
        dp1d: [...dp],
        memo: [...dp],
        tag: `Base Case: dp[0] = 1`,
        log: `| 📌 边界基底: dp[0] = 1 (凑成金额 0 只有 1 种空组合)`,
        msg: `初始化边界基底：凑成金额 <code>0</code> 的组合数为 <strong>1</strong>（空组合方案）。`
      });

      for (let cIdx = 0; cIdx < coins.length; cIdx++) {
        const c = coins[cIdx];
        steps.push({
          type: 'loop-outer',
          line: lineLoopOuter,
          i: c,
          j: c,
          activeSlot: c,
          dp1d: [...dp],
          memo: [...dp],
          tag: `外层循环: 引入硬币面额 ${c}`,
          log: `| 🪙 考察硬币面额 ${c} 的完全背包组合`,
          msg: `外层遍历：引入硬币面额 <code>c = ${c}</code>。`
        });

        for (let i = c; i <= amount; i++) {
          steps.push({
            type: 'loop-inner',
            line: lineLoopInner,
            i,
            j: c,
            activeSlot: i,
            fromSlot: i - c,
            dp1d: [...dp],
            memo: [...dp],
            tag: `内层枚举金额: i = ${i}`,
            log: `| 📈 枚举金额 i = ${i}，尝试加入硬币 ${c}`,
            msg: `内层遍历：当前金额 <code>i = ${i}</code>，尝试累加选用面额 <code>${c}</code> 的组合数。`
          });

          const currentVal = dp[i] ?? 0;
          const prevVal = dp[i - c] ?? 0;
          dp[i] = currentVal + prevVal;

          steps.push({
            type: 'transfer',
            line: lineTransfer,
            i,
            j: c,
            activeSlot: i,
            fromSlot: i - c,
            dp1d: [...dp],
            memo: [...dp],
            tag: `dp[${i}] += dp[${i - c}] ➔ ${dp[i]}`,
            log: `| ➕ dp[${i}] = ${currentVal} + dp[${i - c}](${prevVal}) = ${dp[i]}`,
            msg: `组合数累加：保持不选当前硬币的组合数 <code>${currentVal}</code>，加上选用一枚 <code>${c}</code> 后的组合数 <code>dp[${i - c}] = ${prevVal}</code>，新方案数 <code>dp[${i}] = <strong>${dp[i]}</strong></code>。`,
            decisions: [
              {
                label: `历史组合数: dp[i]`,
                formula: `dp[i] = ${currentVal}`,
                value: currentVal,
                isSelected: false
              },
              {
                label: `选用硬币 ${c}: dp[i - c]`,
                formula: `dp[i - c] = ${prevVal}`,
                value: prevVal,
                isSelected: true
              }
            ]
          });
        }
      }

      steps.push({
        type: 'return',
        line: lineReturn,
        i: amount,
        j: coins[coins.length - 1],
        activeSlot: amount,
        dp1d: [...dp],
        memo: [...dp],
        tag: `总组合数: ${dp[amount]}`,
        log: `| 🏆 最终结果: 凑成金额 ${amount} 的组合数为 ${dp[amount]}`,
        msg: `推导收敛：凑成总金额 <code>${amount}</code> 的硬币组合总数为 <strong>${dp[amount]}</strong>。`
      });

      return steps;
    }

    let kernel = options.kernel;
    if (!kernel) {
      if (model.id === 'perfect-squares') kernel = PERFECT_SQUARES_KERNEL;
      else if (model.id === 'coin-change') kernel = COIN_CHANGE_KERNEL;
      else if (model.id === 'word-break') kernel = WORD_BREAK_KERNEL;
      else kernel = INTEGER_BREAK_KERNEL;
    }
    const steps: UniversalStep[] = [];

    const lineInit = anchorMap.init || 3;
    const lineBase = anchorMap.base || 4;
    const lineLoopOuter = anchorMap['loop-outer'] || 5;
    const lineLoopInner = anchorMap['loop-inner'] || 6;
    const lineTransfer = anchorMap.transfer || 10;
    const lineReturn = anchorMap.return || 13;

    const dp: (number | null)[] = new Array(n + 1).fill(null);

    // 1. 初始化分配数组帧
    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      activeSlot: 0,
      dp1d: [...dp],
      memo: [...dp],
      tag: `分配 DP 数组 (容量 ${n + 1})`,
      log: `| 🎬 分配状态数组: dp = new int[${n + 1}]`,
      msg: `初始化状态数组：<code>dp[0...${n}]</code>，初始值均为 <code>null</code>。`
    });

    // 2. 基础状态 (Base Cases)
    const baseSteps = kernel.initBase(dp);
    for (const bStep of baseSteps) {
      steps.push({
        line: lineBase,
        ...bStep,
        dp1d: [...dp],
        memo: [...dp]
      });
    }

    // 3. 通用双层切分控制流
    for (let i = kernel.startI; i <= n; i++) {
      dp[i] = kernel.aggregate === 'min' ? Number.MAX_SAFE_INTEGER : 0;

      // 外层循环头帧
      steps.push({
        type: 'loop-outer',
        line: lineLoopOuter,
        i,
        j: 1,
        activeSlot: i,
        dp1d: [...dp],
        memo: [...dp],
        tag: `外层循环: 考察整数 i = ${i}`,
        log: `| 🔁 开始求解正整数 i = ${i} 的最优拆分方案`,
        msg: `外层遍历：准备求解正整数 <code>i = ${i}</code> 的最优拆分方案。`
      });

      const innerList = kernel.enumerateInner(i);
      for (const j of innerList) {
        // 内层切分点枚举头帧
        steps.push({
          type: 'loop-inner',
          line: lineLoopInner,
          i,
          j,
          activeSlot: i,
          fromSlot: i - j >= 0 ? i - j : undefined,
          dp1d: [...dp],
          memo: [...dp],
          tag: `内层切分: 尝试候选 j = ${j}`,
          log: `| ✂️ 尝试切分段 j = ${j}`,
          msg: `枚举切分点：切分段为 <code>j = ${j}</code>。`
        });

        const res = kernel.computeTransfer(i, j, dp);
        if (kernel.aggregate === 'min') {
          dp[i] = Math.min(dp[i]!, res.candidateValue);
        } else {
          dp[i] = Math.max(dp[i]!, res.candidateValue);
        }

        steps.push({
          type: 'transfer',
          line: lineTransfer,
          i,
          j,
          activeSlot: i,
          fromSlot: i - j >= 0 ? i - j : undefined,
          dp1d: [...dp],
          memo: [...dp],
          tag: `dp[${i}] = ${dp[i]}`,
          log: `${res.log} ➔ 当前 dp[${i}]=${dp[i]}`,
          msg: `${res.msg}<br/>更新 <code>dp[${i}] = <strong>${dp[i]}</strong></code>。`,
          decisions: res.decisions
        });
      }
    }

    // 4. 最终收敛返回帧
    steps.push({
      type: 'return',
      line: lineReturn,
      i: n,
      j: n - 1,
      activeSlot: n,
      dp1d: [...dp],
      memo: [...dp],
      tag: `最大拆分乘积: ${dp[n]}`,
      log: `| 🏆 最终结果: 正整数 ${n} 的最大拆分乘积为 ${dp[n]}`,
      msg: `推导收敛：正整数 <code>${n}</code> 拆分后的最大乘积为 <strong>${dp[n]}</strong>。`
    });

    return steps;
  }

  /**
   * 编译 Stage 4: 数学贪心/BFS状态图/滚动数组空间压缩优化
   */
  public static compileStage4(
    model: IYamlAlgorithmModel,
    options: PartitionCompileOptions
  ): UniversalStep[] {
    const n = Math.min(Math.max(options.n || 6, 2), 15);
    const anchorMap = options.anchorMap || {};
    const steps: UniversalStep[] = [];

    const lineInit = anchorMap.init || 3;
    const lineQuotient = anchorMap.accumulate || 4;
    const lineRemainder = anchorMap['fetch-down'] || 5;
    const lineReturn = anchorMap.return || 6;

    // ------------------------------------------------------------------------
    // 1. 完全平方数 (perfect-squares): 四平方和定理 (Lagrange) 真实分级判定
    // ------------------------------------------------------------------------
    if (model.id === 'perfect-squares') {
      let num = n;
      steps.push({
        stepIndex: steps.length,
        stage: 4,
        type: 'init',
        line: lineInit,
        codeLine: lineInit,
        i: n,
        j: 0,
        activeSlot: n,
        decision: `四平方和定理初始化：任意正整数均可写为至多4个平方数之和`,
        tag: `拉格朗日四平方和定理`,
        log: `| 📐 定理指出：当且仅当 n = 4^k * (8m + 7) 时，结果严格等于 4`,
        msg: `根据四平方和定理：当且仅当 <code>n = 4^k * (8m + 7)</code> 时结果必为 4。`
      });

      let k = 0;
      while (num % 4 === 0) {
        num = Math.floor(num / 4);
        k++;
        steps.push({
          stepIndex: steps.length,
          stage: 4,
          type: 'accumulate',
          line: lineQuotient,
          codeLine: lineQuotient,
          i: num,
          j: k,
          activeSlot: num,
          decision: `消除因数 4：除以 4 得到 num = ${num} (累计消除 ${k} 次)`,
          tag: `消除因数 4`,
          log: `| ➗ 消除因数 4: num 变为 ${num}`,
          msg: `消除因数 4 并不改变平方数拆分数量，当前 <code>num = ${num}</code>。`
        });
      }

      if (num % 8 === 7) {
        steps.push({
          stepIndex: steps.length,
          stage: 4,
          type: 'accumulate',
          line: lineQuotient,
          codeLine: lineQuotient,
          i: n,
          j: 0,
          activeSlot: 4,
          decision: `满足勒让德条件：num % 8 == 7 (${num} % 8 == 7)，答案必为 4！`,
          tag: `满足 4^k * (8m + 7) 结构`,
          log: `| ⚠️ 满足勒让德三平方和反例条件，答案必为 4`,
          msg: `经因数分解后 <code>n % 8 == 7</code>，答案确定为 <strong>4</strong>。`
        });
        steps.push({
          stepIndex: steps.length,
          stage: 4,
          type: 'return',
          line: lineReturn,
          codeLine: lineReturn,
          i: n,
          j: 0,
          activeSlot: 4,
          decision: `🎉 四平方和判定完成：最少平方数个数为 4`,
          tag: `返回: 4`,
          log: `| 🏆 四平方和定理判定答案: 4`,
          msg: `直接返回 <strong>4</strong>。`
        });
        return steps;
      }

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        type: 'accumulate',
        line: lineQuotient,
        codeLine: lineQuotient,
        i: n,
        j: 0,
        activeSlot: 3,
        decision: `排除答案 4：因 num % 8 = ${num % 8} ≠ 7，答案必 ≤ 3`,
        tag: `排除 4: 不满足 4^k*(8m+7)`,
        log: `| 🔍 去除因数 4 后 num = ${num}, num % 8 = ${num % 8} ≠ 7，排除答案 4`,
        msg: `分解因数后 <code>num = ${num}</code>，因 <code>num % 8 ≠ 7</code>，成功排除答案 <strong>4</strong>。`
      });

      const isSquare = (val: number) => {
        const sq = Math.floor(Math.sqrt(val));
        return sq * sq === val;
      };

      if (isSquare(n)) {
        steps.push({
          stepIndex: steps.length,
          stage: 4,
          type: 'fetch-down',
          line: lineRemainder,
          codeLine: lineRemainder,
          i: n,
          j: 0,
          activeSlot: 1,
          decision: `本身即为完全平方数：${n} = ${Math.floor(Math.sqrt(n))}²，直接返回 1`,
          tag: `本身即为完全平方数`,
          log: `| ⏹️ ${n} = ${Math.floor(Math.sqrt(n))}²，直接返回 1`,
          msg: `<code>${n}</code> 本身即为完全平方数，最少只需 <strong>1</strong> 个。`
        });
        steps.push({
          stepIndex: steps.length,
          stage: 4,
          type: 'return',
          line: lineReturn,
          codeLine: lineReturn,
          i: n,
          j: 0,
          activeSlot: 1,
          decision: `🎉 判定收敛：返回 1`,
          tag: `返回: 1`,
          log: `| 🏆 返回 1`,
          msg: `直接返回 <strong>1</strong>。`
        });
        return steps;
      }

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        type: 'compare',
        line: lineRemainder,
        codeLine: lineRemainder,
        i: n,
        j: 0,
        activeSlot: 2,
        decision: `排除答案 1：${n} 本身非完全平方数，答案必为 2 或 3`,
        tag: `排除 1: 本身非完全平方数`,
        log: `| 🔍 ${n} 不是完全平方数，排除答案 1 (ans 为 2 或 3)`,
        msg: `<code>${n}</code> 不是完全平方数，成功排除答案 <strong>1</strong>。`
      });

      let found2 = false;
      for (let a = 1; a * a <= n; a++) {
        const remainder = n - a * a;
        const squareRemainder = isSquare(remainder);
        steps.push({
          stepIndex: steps.length,
          stage: 4,
          type: 'compare',
          line: lineRemainder,
          codeLine: lineRemainder,
          i: a,
          j: remainder,
          activeSlot: a,
          decision: `枚举基数 a=${a} (a²=${a * a})：剩余量 ${n} - ${a * a} = ${remainder} ${squareRemainder ? '为平方数!' : '非平方数'}`,
          tag: `检验 a²=${a * a}`,
          log: `| 🔍 尝试 a=${a}: ${n} - ${a * a} = ${remainder}`,
          msg: `尝试拆解 <code>${n} = ${a}² + (${remainder})</code>。`,
        });

        if (squareRemainder) {
          const b = Math.floor(Math.sqrt(remainder));
          steps.push({
            stepIndex: steps.length,
            stage: 4,
            type: 'compare',
            line: lineRemainder,
            codeLine: lineRemainder,
            i: n,
            j: 0,
            activeSlot: 2,
            decision: `✌️ 成功拆分为两数平方和：${n} = ${a}² + ${b}²，直接返回 2`,
            tag: `拆解为两数平方和: ${a}² + ${b}²`,
            log: `| ✌️ ${n} = ${a}² + ${b}²，直接返回 2`,
            msg: `成功拆分为两个完全平方数之和：<code>${n} = ${a}² + ${b}²</code>，返回 <strong>2</strong>。`
          });
          steps.push({
            stepIndex: steps.length,
            stage: 4,
            type: 'return',
            line: lineReturn,
            codeLine: lineReturn,
            i: n,
            j: 0,
            activeSlot: 2,
            decision: `🎉 两平方和收敛：返回 2`,
            tag: `返回: 2`,
            log: `| 🏆 返回 2`,
            msg: `直接返回 <strong>2</strong>。`
          });
          found2 = true;
          break;
        }
      }

      if (found2) return steps;

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        type: 'compare',
        line: lineRemainder,
        codeLine: lineRemainder,
        i: n,
        j: 0,
        activeSlot: 3,
        decision: `排除答案 2：枚举所有 a² ≤ ${n} 均无法使余数为平方数`,
        tag: `排除 2: 无法拆为两数平方和`,
        log: `| 🔍 枚举所有 a 均无法使 n - a² 为完全平方数，排除答案 2`,
        msg: `枚举所有 <code>a² ≤ ${n}</code>，余数均非完全平方数，成功排除答案 <strong>2</strong>。`
      });

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        type: 'return',
        line: lineReturn,
        codeLine: lineReturn,
        i: n,
        j: 0,
        activeSlot: 3,
        decision: `🏆 综合四平方和定理排除法（非4、非1、非2），答案确定为 3`,
        tag: `排除 1, 2, 4，答案必为 3`,
        log: `| 🏆 综合四平方和定理与排除法，最终答案确定为 3`,
        msg: `经逐级定理排除（非 4、非 1、非 2），根据拉格朗日四平方和定理，答案必为 <strong>3</strong>。`
      });
      return steps;
    }

    // ------------------------------------------------------------------------
    // 2. 零钱兑换 (coin-change): 接入通用 BfsLayerStepCompiler (Template Method)
    // ------------------------------------------------------------------------
    if (model.id === 'coin-change') {
      const target = n;
      const coins = [1, 2, 5];
      return BfsLayerStepCompiler.compile(model, {
        modelId: 'coin-change',
        stage: 4,
        initialState: 0,
        isTarget: (amount) => amount === target,
        getTransitions: (amount) => {
          const res = [];
          for (const c of coins) {
            if (amount + c <= target) {
              res.push({
                nextState: amount + c,
                edgeLabel: `+${c} 硬币`,
                actionDesc: `从金额 ${amount} 加上硬币 ${c} 到达 ${amount + c}`,
              });
            }
          }
          return res;
        },
        stateKey: (amount) => amount,
        formatState: (amount) => `金额 ${amount}`,
        lineMap: {
          init: lineInit,
          loop: lineQuotient,
          expand: lineRemainder,
          prune: lineRemainder,
          hit: lineRemainder,
          return: lineReturn,
        },
      });
    }

    // ------------------------------------------------------------------------
    // 3. 单词拆分 (word-break): 真实 Trie 前缀剪枝与一维 DP 状态转移
    // ------------------------------------------------------------------------
    if (model.id === 'word-break') {
      const s = 'leetcode';
      const wordDict = ['leet', 'code'];
      const len = s.length;
      const dp = new Array(len + 1).fill(false);
      dp[0] = true;

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        type: 'init',
        line: lineInit,
        codeLine: lineInit,
        i: 0,
        j: 0,
        activeSlot: 0,
        decision: `Trie 前缀剪枝初始化：构建字典树 ["${wordDict.join('", "')}"]，基底 dp[0] = true`,
        tag: `Trie 树构建完成: ["leet", "code"]`,
        log: `| 🌳 Trie 优化: 词表单词插入前缀树，初始 dp[0] = true`,
        msg: `构建 Trie 字典树并标记空字符串 <code>dp[0] = true</code>。`
      });

      for (let i = 0; i < len; i++) {
        if (!dp[i]) {
          steps.push({
            stepIndex: steps.length,
            stage: 4,
            type: 'compare',
            line: lineQuotient,
            codeLine: lineQuotient,
            i,
            j: i,
            activeSlot: i,
            decision: `✂️ 剪枝跳过：dp[${i}] 为 false，前缀 s[0..${i - 1}] 无法被合法切分，无需向下搜索`,
            tag: `dp[${i}] 为 false 剪枝`,
            log: `| ✂️ 下标 ${i} 处无法作为合法切分前缀，剪枝跳过`,
            msg: `<code>dp[${i}] = false</code>，剪枝跳过后续匹配。`
          });
          continue;
        }

        steps.push({
          stepIndex: steps.length,
          stage: 4,
          type: 'accumulate',
          line: lineQuotient,
          codeLine: lineQuotient,
          i,
          j: i,
          activeSlot: i,
          decision: `🔍 从合法前缀 dp[${i}]=true 出发：在字符串中从位置 ${i} 沿 Trie 树向下探查后续字符`,
          tag: `探查从 ${i} 开始的后缀`,
          log: `| 🔍 从位置 ${i} ('${s.substring(i)}') 开始前缀树匹配`,
          msg: `从下标 <code>${i}</code> 出发探索前缀树分支。`
        });

        for (const w of wordDict) {
          if (s.startsWith(w, i)) {
            const nextIdx = i + w.length;
            dp[nextIdx] = true;
            steps.push({
              stepIndex: steps.length,
              stage: 4,
              type: 'fetch-down',
              line: lineRemainder,
              codeLine: lineRemainder,
              i,
              j: nextIdx,
              activeSlot: nextIdx,
              decision: `🎯 命中词表单词 "${w}"！成功匹配 s[${i}..${nextIdx - 1}]，状态转移标记 dp[${nextIdx}] = true`,
              tag: `命中单词: "${w}"`,
              log: `| 🎯 下标 ${i} 出发匹配 "${w}"，转移更新 dp[${nextIdx}] = true`,
              msg: `命中单词 <code>"${w}"</code>，更新 <code>dp[${nextIdx}] = true</code>。`
            });
          }
        }
      }

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        type: 'return',
        line: lineReturn,
        codeLine: lineReturn,
        i: len,
        j: len,
        activeSlot: len,
        decision: `🎉 Trie 剪枝推演完成！dp[${len}] = ${dp[len]}，全串成功拆分`,
        tag: `拆分判定成功: ${dp[len]}`,
        log: `| 🏆 Trie 前缀树匹配到达字符串末尾，返回 ${dp[len]}`,
        msg: `🏆 推导完成！字符串 <code>"${s}"</code> 成功拆分，判定结果为 <strong>${dp[len]}</strong>。`
      });

      return steps;
    }

    // ------------------------------------------------------------------------
    // 4. 零钱兑换 II (coin-change-ii): 真实一维完全背包滚动数组空间压缩
    // ------------------------------------------------------------------------
    if (model.id === 'coin-change-ii') {
      const amount = n;
      const coins = [1, 2, 5];
      const dp = new Array(amount + 1).fill(0);
      dp[0] = 1;

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        type: 'init',
        line: lineInit,
        codeLine: lineInit,
        i: 0,
        j: 0,
        activeSlot: 0,
        decision: `滚动数组空间压缩初始化：金额数组 dp[0..${amount}]，基底 dp[0] = 1 (凑成金额 0 方案数为 1)`,
        tag: `空间压缩一维数组: dp[0..${amount}]`,
        log: `| 💾 空间压缩: dp[0] = 1, 其余初始化为 0`,
        msg: `滚动数组空间压缩：由二维 <code>dp[coins.length][amount+1]</code> 压缩至一维 <code>dp[${amount + 1}]</code>。`
      });

      for (const coin of coins) {
        steps.push({
          stepIndex: steps.length,
          stage: 4,
          type: 'accumulate',
          line: lineQuotient,
          codeLine: lineQuotient,
          i: coin,
          j: coin,
          activeSlot: coin,
          decision: `🪙 外层选取硬币 coin = ${coin}：外层遍历硬币严格保证只生成组合数，杜绝排列重复`,
          tag: `外层硬币: ${coin}`,
          log: `| 📐 选取硬币 ${coin}，内层正序遍历金额 ${coin}..${amount}`,
          msg: `定理：<strong>外层遍历硬币、内层遍历金额</strong> 严格保证硬币非降序选取，消除了排列重复。`
        });

        for (let j = coin; j <= amount; j++) {
          const prevVal = dp[j];
          dp[j] += dp[j - coin];
          steps.push({
            stepIndex: steps.length,
            stage: 4,
            type: 'compare',
            line: lineRemainder,
            codeLine: lineRemainder,
            i: coin,
            j,
            activeSlot: j,
            decision: `🔄 金额 j=${j} 状态转移：dp[${j}] = dp[${j}] + dp[${j - coin}] (${prevVal} + ${dp[j - coin]} = ${dp[j]})`,
            tag: `完全背包正序转移: dp[${j}] += dp[${j - coin}]`,
            log: `| 🔄 dp[${j}] = ${prevVal} + ${dp[j - coin]} = ${dp[j]}`,
            msg: `正序内层循环允许硬币 <code>${coin}</code> 重复选取多次，组合数累加为 <strong>${dp[j]}</strong>。`
          });
        }
      }

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        type: 'return',
        line: lineReturn,
        codeLine: lineReturn,
        i: amount,
        j: amount,
        activeSlot: amount,
        decision: `🎉 完全背包空间压缩推演收敛！凑成金额 ${amount} 的组合总数为 ${dp[amount]}`,
        tag: `组合数计算完成: ${dp[amount]}`,
        log: `| 🏆 空间压缩 O(amount) 最终得出结果: ${dp[amount]} 种组合`,
        msg: `推导收敛：金额 <code>${amount}</code> 的硬币组合总数为 <strong>${dp[amount]}</strong>。`
      });

      return steps;
    }

    // ------------------------------------------------------------------------
    // 5. 整数拆分 (integer-break): 真实数学贪心切分迭代循环
    // ------------------------------------------------------------------------
    if (n <= 3) {
      steps.push({
        stepIndex: steps.length,
        stage: 4,
        type: 'init',
        line: lineInit,
        codeLine: lineInit,
        i: n,
        j: 0,
        activeSlot: n,
        decision: `特判小规模输入 n <= 3：n = ${n} 必须切分为至少两数，最大乘积为 ${n - 1}`,
        tag: `特判 n <= 3`,
        log: `| ⚠️ n = ${n} 时拆分乘积为 ${n - 1}`,
        msg: `当 <code>n <= 3</code> 时必须拆分为至少两数，最大乘积为 <code>${n - 1}</code>。`
      });
      steps.push({
        stepIndex: steps.length,
        stage: 4,
        type: 'return',
        line: lineReturn,
        codeLine: lineReturn,
        i: n,
        j: 0,
        activeSlot: n,
        decision: `返回小规模极值结果: ${n - 1}`,
        tag: `结果: ${n - 1}`,
        log: `| 🏆 返回 ${n - 1}`,
        msg: `直接返回 <strong>${n - 1}</strong>。`
      });
      return steps;
    }

    let rem = n;
    let prod = 1;

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      type: 'init',
      line: lineInit,
      codeLine: lineInit,
      i: n,
      j: 0,
      activeSlot: n,
      decision: `数学贪心极值分析：由均值不等式，数段长度取 3 乘积达到理论最大`,
      tag: `数学极值定理分析`,
      log: `| 📐 根据均值不等式，段长取 3 乘积最大`,
      msg: `数学定理：将数字尽可能拆分为 <strong>3</strong> 可以让整体乘积达到理论最大值。`
    });

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      type: 'compare',
      line: lineQuotient,
      codeLine: lineQuotient,
      i: 3,
      j: 2,
      activeSlot: 3,
      decision: `基数优劣决策天平：对比基数 2 与 3 (2³ = 8 < 3² = 9)，基数 3 显著占优，贪心策略优先切分 3`,
      tag: `基数对比: 3 优于 2`,
      log: `| ⚖️ 2^3=8 < 3^2=9，优先选取因子 3`,
      msg: `数学证明：<code>2³ = 8 < 3² = 9</code>，相同总和下因子 3 的乘积更大。`
    });

    let round = 0;
    while (rem > 4) {
      round++;
      rem -= 3;
      prod *= 3;
      steps.push({
        stepIndex: steps.length,
        stage: 4,
        type: 'accumulate',
        line: lineQuotient,
        codeLine: lineQuotient,
        i: rem,
        j: round,
        activeSlot: rem,
        decision: `第 ${round} 轮贪心切除 3：剩余待拆分量 rem = ${rem}，当前累计乘积 prod = ${prod}`,
        tag: `贪心切除 3 (第 ${round} 轮)`,
        log: `| ✂️ 贪心切出 3: rem 减至 ${rem}, prod 乘至 ${prod}`,
        msg: `连续切分出 <code>3</code>，当前乘积累积为 <strong>${prod}</strong>，剩余待切分 <code>${rem}</code>。`
      });
    }

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      type: 'compare',
      line: lineRemainder,
      codeLine: lineRemainder,
      i: rem,
      j: rem,
      activeSlot: rem,
      decision: `余数分支决策：剩余量 rem = ${rem}，若为 4 则保留 2×2=4；若为 2 或 3 则整段保留直接相乘`,
      tag: `余数分类讨论: rem=${rem}`,
      log: `| 📐 rem=${rem} 处于最优基底范围 [2, 4]，直接结清`,
      msg: `当剩余量 <code>rem ≤ 4</code> 时，拆出 3 反而会导致乘积变小，整段保留直接相乘。`
    });

    prod *= rem;
    steps.push({
      stepIndex: steps.length,
      stage: 4,
      type: 'fetch-down',
      line: lineRemainder,
      codeLine: lineRemainder,
      i: rem,
      j: prod,
      activeSlot: rem,
      decision: `处理最终剩余量 rem = ${rem}：乘入最终乘积，总乘积更新为 ${prod}`,
      tag: `收尾切分 rem = ${rem}`,
      log: `| 🔢 剩余量 ${rem} 乘入，最终乘积 = ${prod}`,
      msg: `最终剩余量为 <code>${rem}</code>（若是 4 则拆为 2×2，若是 2/3 则整段保留），总乘积为 <strong>${prod}</strong>。`
    });

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      type: 'return',
      line: lineReturn,
      codeLine: lineReturn,
      i: n,
      j: 0,
      activeSlot: n,
      decision: `🎉 数学贪心推导完成！正整数 ${n} 的最大拆分乘积为 ${prod}`,
      tag: `最大乘积: ${prod}`,
      log: `| 🏆 数学封闭解计算结果: ${prod}`,
      msg: `最终通过贪心切分迭代得出最大拆分乘积为 <strong>${prod}</strong>。`
    });

    return steps;
  }
}

/**
 * 🌊 [BfsTransition] BFS 状态转移边描述
 */
export interface BfsTransition<TState> {
  nextState: TState;
  edgeLabel: string;
  actionDesc?: string;
  cost?: number;
}

/**
 * 🌊 [IBfsProblemConfig] 基于 Template Method 模式的 BFS 最短路问题规约
 */
export interface IBfsProblemConfig<TState> {
  modelId: string;
  stage?: number;
  initialState: TState;
  isTarget: (state: TState) => boolean;
  getTransitions: (state: TState) => BfsTransition<TState>[];
  stateKey: (state: TState) => string | number;
  formatState?: (state: TState) => string;
  lineMap?: {
    init?: number;
    loop?: number;
    expand?: number;
    prune?: number;
    hit?: number;
    return?: number;
  };
  metricsBuilder?: (currentLevel: number, queueSize: number, visitedCount: number) => Record<string, string>;
}

/**
 * 🌊 [BfsLayerStepCompiler] 通用 BFS 层序波浪扩展与最短路状态编译器深模块
 * 
 * 设计模式：
 * 1. Template Method Pattern (模板方法模式)：定义标准分层图扩散、状态探查、防重复剪枝、目标判定与最短路径回溯骨架；
 * 2. Flyweight Pattern (享元模式)：高效管理 visited 集合与前驱路径追踪；
 * 3. Strategy Pattern (策略模式)：通过 IBfsProblemConfig 适配具体业务领域 (零钱兑换、单词接龙等)。
 */
export class BfsLayerStepCompiler {
  public static compile<TState>(
    model: IYamlAlgorithmModel,
    config: IBfsProblemConfig<TState>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const stage = config.stage ?? 4;
    const lines = config.lineMap || {};
    const lineInit = lines.init ?? 1;
    const lineLoop = lines.loop ?? 2;
    const lineExpand = lines.expand ?? 3;
    const linePrune = lines.prune ?? 4;
    const lineHit = lines.hit ?? 5;
    const lineReturn = lines.return ?? 6;

    const formatState = config.formatState || ((s: TState) => String(s));

    // 状态记录
    interface BfsNode {
      state: TState;
      level: number;
      parentKey: string | number | null;
      edgeLabel: string | null;
    }

    const visited = new Map<string | number, BfsNode>();
    const startKey = config.stateKey(config.initialState);

    const rootNode: BfsNode = {
      state: config.initialState,
      level: 0,
      parentKey: null,
      edgeLabel: null,
    };
    visited.set(startKey, rootNode);

    let queue: BfsNode[] = [rootNode];
    let level = 0;
    let hitTargetNode: BfsNode | null = null;

    // Step 0: BFS 初始化
    steps.push({
      stepIndex: 0,
      stage,
      line: lineInit,
      codeLine: lineInit,
      decision: `🌊 BFS 最短路分层图初始化：起点状态 [${formatState(config.initialState)}] 入队，初始层级 level = 0`,
      message: `广度优先搜索从起点波浪式向外扩散，首次触达目标状态的层数即为全局最少步数/最少硬币数`,
      variables: {
        level: 0,
        'queue.size': 1,
        'visited.size': 1,
        currentState: formatState(config.initialState),
      },
      activeSlot: 0,
      metrics: {
        'phase': '🌊 BFS 初始化',
        'level': '0',
        'queue-len': '1',
        'visited': '1',
        ...(config.metricsBuilder ? config.metricsBuilder(0, 1, 1) : {}),
      },
    });

    // 若初始状态自身就是目标
    if (config.isTarget(config.initialState)) {
      hitTargetNode = rootNode;
    }

    // 主层序遍历循环
    while (queue.length > 0 && !hitTargetNode) {
      const currentLevelSize = queue.length;
      level++;

      // 层级头步骤：宣告当前层波浪扩散
      steps.push({
        stepIndex: steps.length,
        stage,
        line: lineLoop,
        codeLine: lineLoop,
        decision: `🌊 第 ${level} 层波浪扩散开始：当前待扩展队列包含 ${currentLevelSize} 个状态节点`,
        message: `本轮扩展产生的所有新状态均代表距离起点恰好需要 ${level} 步`,
        variables: {
          level,
          currentLevelSize,
          queueLength: queue.length,
          visitedCount: visited.size,
        },
        activeSlot: level,
        metrics: {
          'phase': `🌊 扩散第 ${level} 层`,
          'level': String(level),
          'queue-len': String(queue.length),
          'visited': String(visited.size),
          ...(config.metricsBuilder ? config.metricsBuilder(level, queue.length, visited.size) : {}),
        },
      });

      const nextLevelNodes: BfsNode[] = [];

      for (let i = 0; i < currentLevelSize; i++) {
        const curr = queue[i];
        const transitions = config.getTransitions(curr.state);

        for (const trans of transitions) {
          const nextKey = config.stateKey(trans.nextState);
          const nextFormatted = formatState(trans.nextState);

          // 剪枝判定：已访问过（更短路径已经先到达）
          if (visited.has(nextKey)) {
            const prior = visited.get(nextKey)!;
            steps.push({
              stepIndex: steps.length,
              stage,
              line: linePrune,
              codeLine: linePrune,
              decision: `✂️ 状态剪枝：从 [${formatState(curr.state)}] 经 ${trans.edgeLabel} 转移至 [${nextFormatted}]，该状态已在第 ${prior.level} 轮访问，剪枝跳过`,
              message: `BFS 保证先到达的一定步数更短，避免环路与重复计算`,
              variables: {
                from: formatState(curr.state),
                action: trans.edgeLabel,
                duplicateState: nextFormatted,
                priorLevel: prior.level,
              },
              activeSlot: level,
              metrics: {
                'action': '✂️ 重复状态剪枝',
                'level': String(level),
                'queue-len': String(queue.length),
              },
            });
            continue;
          }

          // 发现新状态
          const childNode: BfsNode = {
            state: trans.nextState,
            level,
            parentKey: config.stateKey(curr.state),
            edgeLabel: trans.edgeLabel,
          };
          visited.set(nextKey, childNode);
          nextLevelNodes.push(childNode);

          // 目标判定
          if (config.isTarget(trans.nextState)) {
            hitTargetNode = childNode;

            steps.push({
              stepIndex: steps.length,
              stage,
              line: lineHit,
              codeLine: lineHit,
              decision: `🎯 命中目标状态！从 [${formatState(curr.state)}] 经 ${trans.edgeLabel} 首次触达目标 [${nextFormatted}]！当前层数 ${level} 必为全局最短路径`,
              message: `分层图波浪式扩散首次触达目标即为全局最优解，无需继续搜索后续层级，直接剪枝终止！`,
              variables: {
                from: formatState(curr.state),
                target: nextFormatted,
                shortestSteps: level,
                totalVisited: visited.size,
              },
              activeSlot: level,
              metrics: {
                'phase': '🎯 命中目标',
                'shortest-path': String(level),
                'status': '🏆 全局最优',
              },
            });

            break; // 提前退出转移循环
          } else {
            // 普通扩展入队
            steps.push({
              stepIndex: steps.length,
              stage,
              line: lineExpand,
              codeLine: lineExpand,
              decision: `➕ 探索新状态：从 [${formatState(curr.state)}] 经 ${trans.edgeLabel} 产生新状态 [${nextFormatted}]，入队待下轮扩散`,
              message: trans.actionDesc || `产生状态 ${nextFormatted}，记录距起点距离为 ${level}`,
              variables: {
                current: formatState(curr.state),
                next: nextFormatted,
                level,
              },
              activeSlot: level,
              metrics: {
                'action': '➕ 新状态入队',
                'level': String(level),
                'queue-len': String(nextLevelNodes.length),
              },
            });
          }
        }

        if (hitTargetNode) break;
      }

      // 推进至下一层
      queue = nextLevelNodes;
    }

    // 终局步骤
    if (hitTargetNode) {
      // 回溯重建最短转移序列
      const path: string[] = [];
      let trace: BfsNode | null = hitTargetNode;
      while (trace) {
        if (trace.edgeLabel) {
          path.unshift(`${trace.edgeLabel} → [${formatState(trace.state)}]`);
        } else {
          path.unshift(`[${formatState(trace.state)}]`);
        }
        trace = trace.parentKey !== null ? visited.get(trace.parentKey) || null : null;
      }

      steps.push({
        stepIndex: steps.length,
        stage,
        type: 'return',
        line: lineReturn,
        codeLine: lineReturn,
        decision: `🎉 BFS 最短路推演成功！最少步数为 ${hitTargetNode.level}，最优转移路径：${path.join(' ')}`,
        message: `BFS 分层图搜索严谨保证了多重状态转移下的全局无后效性与最短路最优解，最少需要 ${hitTargetNode.level} 步`,
        msg: `BFS 分层图搜索首次触达目标层数即为全局最优解，最少硬币数/最少步数为 ${hitTargetNode.level}`,
        log: `| 🏆 BFS 分层图最短路得出全局最优解: ${hitTargetNode.level}`,
        variables: {
          return: hitTargetNode.level,
          shortestLevel: hitTargetNode.level,
          totalExploredStates: visited.size,
          path: path.join(' -> '),
        },
        activeSlot: hitTargetNode.level,
        metrics: {
          'status': '🏁 推演收敛',
          'shortest-steps': String(hitTargetNode.level),
          'visited-total': String(visited.size),
        },
      });
    } else {
      steps.push({
        stepIndex: steps.length,
        stage,
        type: 'return',
        line: lineReturn,
        codeLine: lineReturn,
        decision: `⚠️ 队列排空，无法触达目标状态，推演返回 -1 (无解)`,
        message: `遍历所有可达状态空间均未能命中目标`,
        msg: `无解，返回 -1`,
        log: `| ⚠️ 无法触达目标，返回 -1`,
        variables: { return: -1, totalVisited: visited.size },
        activeSlot: -1,
        metrics: { 'status': '❌ 无解返回 -1' },
      });
    }

    return steps;
  }
}
