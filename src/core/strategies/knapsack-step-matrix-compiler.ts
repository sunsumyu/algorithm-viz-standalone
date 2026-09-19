import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree, buildKnapsackDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';
import {
  AbstractKnapsackRecursionCompiler,
  type KnapsackRecursionContext,
  type KnapsackBoundaryResult
} from './abstract-knapsack-recursion-compiler';

/**
 * 背包问题领域实体与值对象 (Knapsack Domain Models & Value Objects)
 */
export interface KnapsackItem {
  index: number;
  weight: number;
  value: number;
  label?: string;
  count?: number;
}

export type KnapsackKind =
  | 'partition-subset'   // 分割等和子集（布尔可达性 / 价值=重量）
  | '01-standard'        // 标准 0-1 背包（最大价值）
  | 'complete-standard'  // 完全背包（无限次选取，正序压缩）
  | 'coin-change-count'  // 零钱兑换 II (完全背包组合数累加)
  | 'coin-change-min'    // 零钱兑换 I (完全背包最少硬币数求 min)
  | 'last-stone-weight'  // 最后一块石头的重量 II (最大装载 capacity = sum/2)
  | 'target-sum'         // 目标和 (方案数累加)
  | 'multiple-knapsack'; // 多重背包 (有限件数多分支)

export interface KnapsackDomainConfig {
  modelId: string;
  kind: KnapsackKind;
  items: KnapsackItem[];
  capacity: number;
  anchorMap?: Record<string, number>;
  isMemo?: boolean;
  oddCheck?: {
    hasOddFail: boolean;
    sum: number;
    oddMessage?: string;
  };
  valueUnit?: string;
  weightUnit?: string;
}

class GenericKnapsackRecursionCompiler extends AbstractKnapsackRecursionCompiler {
  protected checkBoundary(i: number, curTarget: number, ctx: KnapsackRecursionContext): KnapsackBoundaryResult {
    const kind = ctx.config.kind;
    const n = ctx.n;
    const INF = 1000000;

    // Base Case 1: 完美装满 / 达到目标
    if (curTarget === 0) {
      const val = kind === 'partition-subset' ? true
        : (kind === 'target-sum' || kind === 'coin-change-count') ? 1
        : 0;
      return {
        isBase: true,
        val,
        lineKey: 'base_match',
        tag: kind === 'partition-subset' ? '🎯 目标达成: true' : `🎯 目标达成: ${val}`,
        log: `| 🎯 边界命中: curTarget = 0，方案成立，return ${val}`,
        msg: `🎯 边界命中：剩余金额/目标已精确扣减为 <code>0</code>，方案成立，返回 <strong>${val}</strong>。`
      };
    }

    // Base Case 2: 物品耗尽 或 容量超扣
    if (i >= n || curTarget < 0) {
      const val = kind === 'partition-subset' ? false
        : (kind === 'coin-change-min') ? INF
        : 0;
      return {
        isBase: true,
        val,
        lineKey: 'base_overflow',
        tag: curTarget < 0 ? `🚫 超重拦截: ${val === INF ? '∞' : val}` : `🚫 物品耗尽: ${val === INF ? '∞' : val}`,
        log: `| 🚫 边界拦截: ${curTarget < 0 ? `剩余容量 ${curTarget} < 0 超扣` : `物品已全部考察 (i=${i})`}, return ${val === INF ? '∞' : val}`,
        msg: `🚫 边界拦截：${curTarget < 0 ? `容量超扣为 <code>${curTarget} < 0</code>` : `物品已考察完毕 <code>i = ${i} >= ${n}</code>`}，当前分支不可行，返回 <strong>${val === INF ? '∞' : val}</strong>。`
      };
    }

    return { isBase: false };
  }

  protected computeTakeResult(subResult: any, item: KnapsackItem, ctx: KnapsackRecursionContext): any {
    const kind = ctx.config.kind;
    if (kind === 'partition-subset') return Boolean(subResult);
    if (kind === 'target-sum' || kind === 'coin-change-count') return Number(subResult) || 0;
    if (kind === 'coin-change-min') {
      const num = Number(subResult);
      return num >= 1000000 ? 1000000 : num + 1;
    }
    return (Number(subResult) || 0) + item.value;
  }

  protected combineBranches(
    notTakeRes: any,
    takeRes: any,
    canTake: boolean,
    item: KnapsackItem,
    ctx: KnapsackRecursionContext
  ): any {
    const kind = ctx.config.kind;
    if (kind === 'partition-subset') {
      return Boolean(notTakeRes || (canTake && takeRes));
    }
    if (kind === 'target-sum' || kind === 'coin-change-count') {
      return (Number(notTakeRes) || 0) + (canTake ? (Number(takeRes) || 0) : 0);
    }
    if (kind === 'coin-change-min') {
      const valTake = canTake ? this.computeTakeResult(takeRes, item, ctx) : 1000000;
      return Math.min(Number(notTakeRes) || 0, valTake);
    }
    const valTake = canTake ? this.computeTakeResult(takeRes, item, ctx) : 0;
    return Math.max(Number(notTakeRes) || 0, valTake);
  }
}

const knapsackRecursionCompiler = new GenericKnapsackRecursionCompiler();

/**
 * 背包 DP 统一步骤矩阵编译器 (KnapsackStepMatrixCompiler) - 编译流水线深模块 (Deep Module)
 * 遵循领域驱动设计 (DDD) 与流水线模式 (Pipeline Pattern)，统领背包算法家族 4 阶段演进推导：
 * - 阶段 1: 纯递归决策树 (Pure DFS Tree)
 * - 阶段 2: 记忆化搜索与剪枝 (Memoized Search & Pruning)
 * - 阶段 3: 二维 DP 状态表推导与空间依赖箭头 (2D DP Tabulation & Transfer Vectors)
 * - 阶段 4: 一维空间压缩与滚动数组推导 (1D Rolling Space Optimization)
 */
export class KnapsackStepMatrixCompiler {
  /**
   * 编译入口：根据阶段与领域配置生成通用步骤
   */
  public static compile(config: KnapsackDomainConfig, stage: number): UniversalStep[] {
    switch (stage) {
      case 1:
      case 2:
        return this.compileStage1or2(config, Boolean(config.isMemo));
      case 3:
        return this.compileStage3(config);
      case 4:
        return this.compileStage4(config);
      default:
        return [];
    }
  }

  /**
   * 阶段 1 & 2: 递归分支树编译
   */
  public static compileStage1or2(config: KnapsackDomainConfig, isMemo: boolean = false): UniversalStep[] {
    return knapsackRecursionCompiler.compile(config, isMemo);
  }

  /**
   * 阶段 3: 二维 DP 状态表推导与空间依赖连线
   */
  public static compileStage3(config: KnapsackDomainConfig): UniversalStep[] {
    const { items, capacity, kind, anchorMap, oddCheck } = config;
    const n = items.length;
    const steps: UniversalStep[] = [];

    const lineOddCheck = anchorMap?.odd_check || 4;
    const lineInit = anchorMap?.init || 4;
    const lineInitRow = anchorMap?.init_row || anchorMap?.init_val || 5;
    const lineLoopI = anchorMap?.loop_i || 6;
    const lineLoopJ = anchorMap?.loop_j || 7;
    const lineCond = anchorMap?.cond || 8;
    const lineTransferSkip = anchorMap?.transfer_skip || anchorMap?.init_val || (lineCond + 1);
    const lineTransferMax = anchorMap?.transfer_max || anchorMap?.transfer || (lineCond + 3);
    const lineReturn = anchorMap?.return || 15;

    if (oddCheck?.hasOddFail) {
      steps.push({
        type: 'init',
        line: lineOddCheck,
        i: 0,
        j: 0,
        grid: [[0]],
        tag: `奇数总和 ${oddCheck.sum} 无法平分`,
        log: `| ❌ 数组总和 sum = ${oddCheck.sum} 为奇数，无法等分为两个整数子集，直接 return false`,
        msg: `数组总和 <code>sum = ${oddCheck.sum}</code> 为奇数，无法平分成两个相等的整数子集，直接返回 <strong>false</strong>。`
      });
      return steps;
    }

    const dp: (number | null)[][] = Array.from({ length: n }, () => new Array(capacity + 1).fill(null));

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建二维 DP 表',
      log: `| 📋 初始化 dp[${n}][${capacity + 1}] 二维表格`,
      msg: `创建 <code>${n} × ${capacity + 1}</code> 的二维 DP 状态表。`
    });

    // 1. 初始化第 0 件物品行
    const w0 = items[0].weight;
    const v0 = items[0].value;
    const isCountKind = kind === 'target-sum' || kind === 'coin-change-count';
    const isMinKind = kind === 'coin-change-min';
    const isComplete = kind === 'complete-standard' || kind === 'coin-change-count' || kind === 'coin-change-min';
    if (isCountKind) {
      for (let j = 0; j <= capacity; j++) dp[0][j] = 0;
      if (kind === 'coin-change-count') {
        for (let j = 0; j <= capacity; j++) {
          if (j % w0 === 0) dp[0][j] = 1;
        }
      } else {
        dp[0][0] = 1;
        if (w0 <= capacity) dp[0][w0] = (dp[0][w0] ?? 0) + 1;
      }
    } else if (isMinKind) {
      for (let j = 0; j <= capacity; j++) {
        dp[0][j] = (j % w0 === 0) ? Math.floor(j / w0) : 1000000;
      }
    } else if (kind === 'multiple-knapsack') {
      const c0 = items[0].count ?? 1;
      for (let j = 0; j <= capacity; j++) {
        const k = Math.min(c0, Math.floor(j / w0));
        dp[0][j] = k * v0;
      }
    } else if (isComplete) {
      // 完全背包：物品 0 可复选装入多件
      for (let j = 0; j <= capacity; j++) {
        dp[0][j] = Math.floor(j / w0) * v0;
      }
    } else {
      for (let j = 0; j <= capacity; j++) {
        dp[0][j] = j >= w0 ? v0 : 0;
      }
    }

    steps.push({
      type: 'init-row',
      line: lineInitRow,
      i: 0,
      j: Math.min(w0, capacity),
      grid: JSON.parse(JSON.stringify(dp)),
      gridHighlight: { i: 0, j: Math.min(w0, capacity) },
      tag: `初始化第 0 行: item[0]=${w0}`,
      log: isComplete
        ? `| 🎯 完全背包初始化首行: 硬币/物品 ${w0} 可复选装入`
        : `| 🎯 初始化首行: 当容量 j >= ${w0} 时，第 0 件物品可装入，dp[0][j] = ${v0}`,
      msg: isComplete
        ? `初始化首行：面值/重量 <code>${w0}</code> 可重复选取。`
        : `初始化第 0 件物品行：当背包容量 <code>j >= ${w0}</code> 时，可装入物品 0，<code>dp[0][j] = ${v0}</code>。`
    });

    // 2. 双重循环填表 (强制发射 loop-outer -> loop-inner -> cond -> transfer 零跳步流水线)
    for (let i = 1; i < n; i++) {
      const wi = items[i].weight;
      const vi = items[i].value;

      steps.push({
        type: 'loop-outer',
        line: lineLoopI,
        i,
        j: 0,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `考察物品 item[${i}] (w=${wi}, v=${vi})`,
        log: `| 🔁 外层循环: 考察第 ${i} 件物品 (重量 ${wi}, 价值 ${vi})`,
        msg: `外层循环：考察物品 <code>item[${i}]</code>（重量 <code>${wi}</code>，价值 <code>${vi}</code>）。`,
        gridHighlight: { i, j: 0 }
      });

      for (let j = 0; j <= capacity; j++) {
        steps.push({
          type: 'loop-inner',
          line: lineLoopJ,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: `容量 j = ${j}`,
          log: `| ➡️ 内层循环: 考察背包容量 j = ${j}/${capacity}`,
          msg: `内层循环：当前背包容量 <code>j = ${j}</code>。`,
          gridHighlight: { i, j }
        });

        const isEnough = j >= wi;
        steps.push({
          type: 'cond',
          line: lineCond,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: isEnough ? `容量充足: ${j} >= ${wi}` : `容量不足: ${j} < ${wi}`,
          log: isEnough
            ? `| 🔍 容量检查: j=${j} >= w=${wi}，可尝试放入第 ${i} 件物品`
            : `| 🔍 容量检查: j=${j} < w=${wi}，容量不足无法放入`,
          msg: isEnough
            ? `容量充足：<code>j (${j}) >= w (${wi})</code>，可在「不放」与「放入」两决策中择优。`
            : `容量不足：<code>j (${j}) < w (${wi})</code>，无法放入该物品，直接继承上方状态。`,
          gridHighlight: { i, j }
        });

        if (!isEnough) {
          dp[i][j] = dp[i - 1][j] ?? (isMinKind ? 1000000 : 0);
          steps.push({
            type: 'transfer',
            line: lineTransferSkip,
            i,
            j,
            val: dp[i][j],
            topI: i - 1,
            topJ: j,
            grid: JSON.parse(JSON.stringify(dp)),
            gridHighlight: { i, j },
            tag: `容量不足继承: dp[${i}][${j}] = ${dp[i][j] === 1000000 ? '∞' : dp[i][j]}`,
            log: `| ⚠️ 容量不足 (j=${j} < w=${wi}): dp[${i}][${j}] 继承上方 dp[${i - 1}][${j}] = ${dp[i][j] === 1000000 ? '∞' : dp[i][j]}`,
            msg: `容量不足：直接继承上方旧值 <code>dp[${i - 1}][${j}] = <strong>${dp[i][j] === 1000000 ? '∞' : dp[i][j]}</strong></code>。`
          });
        } else {
          const valNotTake = dp[i - 1][j] ?? (isMinKind ? 1000000 : 0);
          if (kind === 'multiple-knapsack') {
            const count = items[i].count ?? 1;
            let best = valNotTake;
            let bestK = 0;
            for (let k = 1; k <= count && k * wi <= j; k++) {
              const cand = (dp[i - 1][j - k * wi] ?? 0) + k * vi;
              if (cand > best) {
                best = cand;
                bestK = k;
              }
            }
            dp[i][j] = best;
            steps.push({
              type: 'transfer',
              line: lineTransferMax,
              i,
              j,
              val: dp[i][j],
              topI: i - 1,
              topJ: j,
              leftI: i - 1,
              leftJ: j - bestK * wi,
              grid: JSON.parse(JSON.stringify(dp)),
              gridHighlight: { i, j },
              tag: `多重背包决策: 选${bestK}件, dp[${i}][${j}] = ${best}`,
              log: `| 📦 多重背包决策: 物品 ${i} 最佳选入 ${bestK} 件，dp[${i}][${j}] = ${best}`,
              msg: `多重背包转移：第 <code>${i}</code> 件物品最佳选入 <code>${bestK}</code> 件，<code>dp[${i}][${j}] = <strong>${best}</strong></code>。`
            });
          } else {
          // 完全背包依赖当前行 dp[i][j - wi]，0-1 背包依赖上一行 dp[i - 1][j - wi]
          const takePrevI = isComplete ? i : (i - 1);
          const rawSub = dp[takePrevI][j - wi] ?? (isMinKind ? 1000000 : 0);
          let combinedVal: number;
          if (isCountKind) {
            combinedVal = valNotTake + rawSub;
          } else if (isMinKind) {
            const valTake = rawSub >= 1000000 ? 1000000 : rawSub + 1;
            combinedVal = Math.min(valNotTake, valTake);
          } else {
            const valTake = rawSub + vi;
            combinedVal = Math.max(valNotTake, valTake);
          }
          dp[i][j] = combinedVal;

          steps.push({
            type: 'transfer',
            line: lineTransferMax,
            i,
            j,
            val: dp[i][j],
            topI: i - 1,
            topJ: j,
            leftI: takePrevI,
            leftJ: j - wi,
            grid: JSON.parse(JSON.stringify(dp)),
            gridHighlight: { i, j },
            tag: `决策转移: dp[${i}][${j}] = ${dp[i][j] === 1000000 ? '∞' : dp[i][j]}`,
            log: isComplete
              ? `| 📦 完全背包状态转移: dp[${i}][${j}] = ${dp[i][j] === 1000000 ? '∞' : dp[i][j]}`
              : `| 📦 状态转移: dp[${i}][${j}] = ${dp[i][j] === 1000000 ? '∞' : dp[i][j]}`,
            msg: isComplete
              ? `完全背包转移：<code>dp[${i}][${j}] = <strong>${dp[i][j] === 1000000 ? '∞' : dp[i][j]}</strong></code>。`
              : `状态转移：<code>dp[${i}][${j}] = <strong>${dp[i][j] === 1000000 ? '∞' : dp[i][j]}</strong></code>。`
          });
          }
        }
      }
    }

    const finalAnswer = dp[n - 1][capacity];
    const isTargetMatched = kind === 'partition-subset' ? finalAnswer === capacity : true;
    const finalDiff = kind === 'last-stone-weight' && config.oddCheck?.sum !== undefined
      ? config.oddCheck.sum - 2 * (finalAnswer ?? 0)
      : undefined;

    const tagDisplay = finalDiff !== undefined
      ? `两堆最小差值: ${finalDiff}`
      : `最终答案: ${kind === 'partition-subset' ? isTargetMatched : finalAnswer}`;
    const logDisplay = finalDiff !== undefined
      ? `| 🏆 最终判定: dp[${n - 1}][${capacity}] = ${finalAnswer}，两堆粉碎最小差值 = ${config.oddCheck?.sum} - 2*${finalAnswer} = ${finalDiff}`
      : `| 🏆 最终判定: dp[${n - 1}][${capacity}] = ${finalAnswer} ${kind === 'partition-subset' ? (isTargetMatched ? '== target 成立，判定为 true' : '!= target 不成立，判定为 false') : ''}`;
    const msgDisplay = finalDiff !== undefined
      ? `🏆 计算完成！最大子集装载重量为 <code>dp[${n - 1}][${capacity}] = ${finalAnswer}</code>，两堆石头碰撞粉碎后的最小剩余重量为 <code>${config.oddCheck?.sum} - 2 × ${finalAnswer} = <strong>${finalDiff}</strong></code>。`
      : `🏆 计算完成！最终结果 <code>dp[${n - 1}][${capacity}] = <strong>${finalAnswer}</strong></code>${kind === 'partition-subset' ? (isTargetMatched ? '（恰好等于目标容量，返回 <strong>true</strong>）' : '（无法达到目标容量，返回 <strong>false</strong>）') : ''}。`;

    steps.push({
      type: 'return',
      line: lineReturn,
      i: n - 1,
      j: capacity,
      grid: dp.map(row => [...row]),
      currentI: n - 1,
      currentJ: capacity,
      tag: tagDisplay,
      log: logDisplay,
      msg: msgDisplay
    });

    return steps;
  }

  public static compileStage4(config: KnapsackDomainConfig): UniversalStep[] {
    const { items, capacity, kind = 'standard', anchorMap, oddCheck } = config;
    const n = items.length;
    const steps: UniversalStep[] = [];

    const lineOddCheck = anchorMap?.odd_check || 2;
    if (oddCheck?.hasOddFail) {
      steps.push({
        type: 'init',
        line: lineOddCheck,
        i: 0,
        j: 0,
        dp1d: [0],
        tag: `奇数总和 ${oddCheck.sum} 无法平分`,
        log: `| ❌ 数组总和 sum = ${oddCheck.sum} 为奇数，无法等分为两个整数子集，直接 return false`,
        msg: `数组总和 <code>sum = ${oddCheck.sum}</code> 为奇数，无法平分成两个相等的整数子集，直接返回 <strong>false</strong>。`
      });
      return steps;
    }

    const lineInit = anchorMap?.init || 2;
    const lineOuter = anchorMap?.outer_loop || anchorMap?.loop_i || 4;
    const lineTransfer = anchorMap?.transfer || anchorMap?.transfer_max || 6;
    const lineReturn = anchorMap?.return || 10;

    const isCountKind = kind === 'target-sum' || kind === 'coin-change-count';
    const isMinKind = kind === 'coin-change-min';
    const dp: number[] = new Array(capacity + 1).fill(isMinKind ? 1000000 : 0);
    if (isCountKind) dp[0] = 1;
    if (isMinKind) dp[0] = 0;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      dp1d: isMinKind ? dp.map(v => (v === 1000000 ? -1 : v)) : [...dp],
      memoj: 0,
      highlightSlots: [0],
      tag: isMinKind ? 'dp[0]=0, 其余置 ∞' : `一维数组初始化 dp[0..${capacity}]`,
      log: isMinKind
        ? '| 📋 初始化一维数组 dp[0]=0，其余置为 ∞（求最小值）'
        : `| 📋 初始化一维滚动数组 dp[${capacity + 1}]，全部填充 0`,
      msg: isMinKind
        ? '初始化一维数组：<code>dp[0] = 0</code>，其余置为 $\\infty$。'
        : `初始化长度为 <code>${capacity + 1}</code> 的一维滚动数组，全部置 0。`
    });

    for (let i = 0; i < n; i++) {
      const wi = items[i].weight;
      const vi = items[i].value;

      steps.push({
        type: 'outer-loop',
        line: lineOuter,
        i,
        j: 0,
        dp1d: isMinKind ? dp.map(v => (v === 1000000 ? -1 : v)) : [...dp],
        memoj: dp[capacity] === 1000000 ? -1 : dp[capacity],
        currentI: i,
        tag: `考察第 ${i} 件物品: w=${wi}`,
        log: `| 🔄 外层循环: 考察第 ${i} 件物品 (重量 ${wi}, 价值 ${vi})`,
        msg: `外层循环：考察第 <code>${i}</code> 件物品（重量 <code>${wi}</code>，价值 <code>${vi}</code>）。`
      });

      // 0-1 背包从后向前逆序遍历，完全背包从前向后正序遍历
      const isReverse = kind !== 'complete-standard' && kind !== 'coin-change-count' && kind !== 'coin-change-min';

      if (kind === 'multiple-knapsack') {
        const count = items[i].count ?? 1;
        for (let j = capacity; j >= wi; j--) {
          const oldVal = dp[j];
          let best = oldVal;
          let bestK = 0;
          for (let k = 1; k <= count && k * wi <= j; k++) {
            const cand = dp[j - k * wi] + k * vi;
            if (cand > best) {
              best = cand;
              bestK = k;
            }
          }
          dp[j] = best;
          steps.push({
            type: 'update-1d',
            line: lineTransfer,
            i,
            j,
            dp1d: [...dp],
            memoj: dp[j],
            highlightSlots: [j],
            srcSlots: bestK > 0 ? [j - bestK * wi] : [j],
            currentI: i,
            currentJ: j,
            tag: `多重背包 dp[${j}] = ${dp[j]} (选${bestK}件)`,
            log: `| ⚡ 多重背包逆序更新 dp[${j}] = ${dp[j]} (选入 ${bestK} 件物品 ${i})`,
            msg: `逆序更新槽位 <code>dp[${j}] = <strong>${dp[j]}</strong></code>（选入 <code>${bestK}</code> 件该物品）。`
          });
        }
      } else if (isReverse) {
        for (let j = capacity; j >= wi; j--) {
          const oldVal = dp[j];
          const candidateVal = isCountKind ? dp[j - wi] : (dp[j - wi] + vi);
          dp[j] = isCountKind ? (oldVal + candidateVal) : Math.max(oldVal, candidateVal);

          steps.push({
            type: 'update-1d',
            line: lineTransfer,
            i,
            j,
            dp1d: isMinKind ? dp.map(v => (v === 1000000 ? -1 : v)) : [...dp],
            memoj: dp[j],
            highlightSlots: [j],
            srcSlots: [j - wi],
            currentI: i,
            currentJ: j,
            tag: `dp[${j}] = max(${oldVal}, dp[${j - wi}]+${vi}) = ${dp[j]}`,
            log: `| ⚡ 逆序更新 dp[${j}] = max(dp[${j}]:${oldVal}, dp[${j - wi}]+${vi}:${candidateVal}) = ${dp[j]}`,
            msg: `逆序更新槽位 <code>dp[${j}] = max(dp[${j}], dp[${j - wi}] + ${vi}) = <strong>${dp[j]}</strong></code>（依赖旧状态 <code>dp[${j - wi}]</code>，避免重复选取）。`
          });
        }
      } else {
        for (let j = wi; j <= capacity; j++) {
          const oldVal = dp[j];
          let candidateVal: number;
          if (isCountKind) {
            candidateVal = dp[j - wi];
            dp[j] = oldVal + candidateVal;
          } else if (isMinKind) {
            candidateVal = dp[j - wi] >= 1000000 ? 1000000 : (dp[j - wi] + 1);
            dp[j] = Math.min(oldVal, candidateVal);
          } else {
            candidateVal = dp[j - wi] + vi;
            dp[j] = Math.max(oldVal, candidateVal);
          }

          steps.push({
            type: 'update-1d',
            line: lineTransfer,
            i,
            j,
            dp1d: isMinKind ? dp.map(v => (v === 1000000 ? -1 : v)) : [...dp],
            memoj: isMinKind ? (dp[j] >= 1000000 ? -1 : dp[j]) : dp[j],
            highlightSlots: [j],
            srcSlots: [j - wi],
            currentI: i,
            currentJ: j,
            tag: `dp[${j}] = ${dp[j] === 1000000 ? '∞' : dp[j]}`,
            log: `| ⚡ 正序更新 dp[${j}] = ${dp[j] === 1000000 ? '∞' : dp[j]}`,
            msg: `正序更新槽位 <code>dp[${j}] = <strong>${dp[j] === 1000000 ? '∞' : dp[j]}</strong></code>（允许该物品多次装入）。`
          });
        }
      }
    }

    const finalAnswer = isMinKind && dp[capacity] >= 1000000 ? -1 : dp[capacity];
    const isTargetMatched = kind === 'partition-subset' ? finalAnswer === capacity : true;
    const finalDiff = kind === 'last-stone-weight' && config.oddCheck?.sum !== undefined
      ? config.oddCheck.sum - 2 * (finalAnswer ?? 0)
      : undefined;

    const tagDisplay = finalDiff !== undefined
      ? `一维压缩最小差值: ${finalDiff}`
      : `一维压缩最终结果: ${finalAnswer}`;
    const logDisplay = finalDiff !== undefined
      ? `| 🏆 一维空间压缩计算完成！dp[${capacity}] = ${finalAnswer}，两堆粉碎最小差值 = ${config.oddCheck?.sum} - 2*${finalAnswer} = ${finalDiff}`
      : `| 🏆 一维空间压缩计算完成！dp[${capacity}] = ${finalAnswer} ${kind === 'partition-subset' ? (isTargetMatched ? '== target 成立，判定为 true' : '!= target 不成立，判定为 false') : ''}`;
    const msgDisplay = finalDiff !== undefined
      ? `🏆 空间压缩推导完成！一维滚动数组最大装载 <code>dp[${capacity}] = ${finalAnswer}</code>，两堆石头碰撞粉碎后的最小剩余重量为 <code>${config.oddCheck?.sum} - 2 × ${finalAnswer} = <strong>${finalDiff}</strong></code>。`
      : `🏆 空间压缩推导完成！一维滚动数组最终结果 <code>dp[${capacity}] = <strong>${finalAnswer}</strong></code>${kind === 'partition-subset' ? (isTargetMatched ? '（恰好等于目标容量，返回 <strong>true</strong>）' : '（无法达到目标容量，返回 <strong>false</strong>）') : ''}。`;

    steps.push({
      type: 'return',
      line: lineReturn,
      i: n - 1,
      j: capacity,
      dp1d: isMinKind ? dp.map(v => (v === 1000000 ? -1 : v)) : [...dp],
      memoj: finalDiff !== undefined ? finalDiff : finalAnswer,
      highlightSlots: [capacity],
      tag: tagDisplay,
      log: logDisplay,
      msg: msgDisplay
    });

    return steps;
  }
}

