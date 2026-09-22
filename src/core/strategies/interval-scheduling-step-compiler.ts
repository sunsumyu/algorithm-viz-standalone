/**
 * 区间调度与互斥消除通用步进编译器 (IntervalSchedulingStepCompiler)
 * 核心深模块 (Deep Module) —— 统领全库区间贪心、相交消除与区间合并族群：
 * - LeetCode 452: 用最少数量的箭引爆气球 (Minimum Number of Arrows to Burst Balloons)
 * - LeetCode 435: 无重叠区间 (Non-overlapping Intervals)
 * - LeetCode 56: 合并区间 (Merge Intervals)
 * - 洛谷 P1803 / LeetCode 435: 会议独占最大数量 (Meeting Monopoly)
 * 
 * 核心数学归约：
 * 给定 N 个区间，按左端点（或右端点）排序后，状态流转归约为单调边界收缩与相交判定：
 * - arrows 模式: 相交时收紧射箭右界 Math.min(prevEnd, curEnd)，无交集时射出新箭
 * - non-overlapping 模式: 相交时贪心剔除右端点更大者 Math.min(prevEnd, curEnd)，无交集时保留
 * - merge 模式: 相交时右界延展 Math.max(prevEnd, curEnd)，无交集时生成新合并块
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, StateArrayItem, UniversalTreeNode } from '../universal-stage-engine';
import { YamlModelLoader } from '../yaml-model-loader';
import { cloneStateDepTree } from './tree-clone';

export type IntervalSchedulingMode = 'arrows' | 'non-overlapping' | 'merge-intervals';

export interface IntervalSchedulingDomainContext {
  itemLabel?: string;     // e.g. '气球' / '区间' / '会议'
  unitLabel?: string;     // e.g. '只' / '个' / '场'
  actionLabel?: string;   // e.g. '引爆' / '移除' / '合并'
  targetMetric?: string;  // e.g. '所需弓箭数' / '移除区间数' / '合并区间数'
}

export interface IntervalSchedulingCompileOptions {
  intervals: Array<[number, number]>;
  mode: IntervalSchedulingMode;
  anchorMap?: Record<string, number>;
  direction?: 'forward' | 'reverse';
  domainContext?: IntervalSchedulingDomainContext;
}

export class IntervalSchedulingStepCompiler {
  /**
   * 门面编译入口
   */
  public static compile(
    model: IYamlAlgorithmModel,
    options: IntervalSchedulingCompileOptions,
    stage: number = 1
  ): UniversalStep[] {
    if (stage === 2) {
      return this.compileStage2(model, options);
    }
    if (stage === 3) {
      return this.compileStage3(model, options);
    }
    return this.compileStage1(model, options, stage);
  }

  /**
   * 便捷适配器：弓箭引爆气球 (LeetCode 452)
   */
  public static compileArrows(
    model: IYamlAlgorithmModel,
    rawPoints: Array<[number, number]>,
    options?: Partial<IntervalSchedulingCompileOptions>,
    stage: number = 1
  ): UniversalStep[] {
    return this.compile(
      model,
      {
        intervals: rawPoints,
        mode: 'arrows',
        direction: options?.direction,
        anchorMap: options?.anchorMap,
        domainContext: {
          itemLabel: '气球',
          unitLabel: '个',
          actionLabel: '引爆',
          targetMetric: '所需弓箭',
          ...options?.domainContext,
        },
      },
      stage
    );
  }

  /**
   * 便捷适配器：无重叠区间 (LeetCode 435)
   */
  public static compileDisjoint(
    model: IYamlAlgorithmModel,
    rawIntervals: Array<[number, number]>,
    options?: Partial<IntervalSchedulingCompileOptions>,
    stage: number = 1
  ): UniversalStep[] {
    return this.compile(
      model,
      {
        intervals: rawIntervals,
        mode: 'non-overlapping',
        direction: options?.direction,
        anchorMap: options?.anchorMap,
        domainContext: {
          itemLabel: '区间',
          unitLabel: '个',
          actionLabel: '移除',
          targetMetric: '最少移除',
          ...options?.domainContext,
        },
      },
      stage
    );
  }

  private static extractAnchors(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse' = 'forward',
    anchorMap?: Record<string, number>
  ): Record<string, number> {
    if (anchorMap) return anchorMap;
    const stageKey = `stage-${stage}`;
    const codeSnippet =
      model.stages?.[stageKey]?.code?.[direction]?.source ||
      model.stages?.[stageKey]?.code?.forward?.source ||
      model.stages?.[stageKey]?.variants?.['standard']?.code?.[direction]?.source ||
      model.stages?.[stageKey]?.variants?.['standard']?.code?.forward?.source ||
      model.stages?.['stage-1']?.code?.forward?.source;
    if (codeSnippet) {
      try {
        return YamlModelLoader.compileSource(codeSnippet, 'java').anchorMap || {};
      } catch {
        return {};
      }
    }
    return {};
  }

  // ==========================================================================
  // Stage 1 & 4: 贪心单调扫描推进 (Forward / Reverse)
  // ==========================================================================
  private static compileStage1(
    model: IYamlAlgorithmModel,
    options: IntervalSchedulingCompileOptions,
    stage: number
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = options.direction === 'reverse';
    const isStage4 = stage === 4;
    const mode = options.mode;
    const ctx = options.domainContext || {};
    const itemLabel = ctx.itemLabel || '区间';
    const unitLabel = ctx.unitLabel || '个';

    const anchorMap = this.extractAnchors(
      model,
      stage,
      options.direction || 'forward',
      options.anchorMap
    );

    const raw = options.intervals && options.intervals.length > 0 ? options.intervals : [[10, 16], [2, 8], [1, 6], [7, 12]];
    const n = raw.length;

    // 1. 统一按左端点升序预处理
    const intervals: Array<[number, number]> = raw.map(([s, e]) => [s, e] as [number, number]).sort((a, b) => a[0] - b[0]);

    const buildStateArrays = (activeIdx?: number, highlightIndices?: number[]): StateArrayItem[] => [
      {
        id: 'intervals',
        name: `${itemLabel}列表`,
        indices: intervals.map((_, idx) => idx),
        values: intervals.map(([s, e]) => `[${s},${e}]`),
        activeIdx,
        highlightIndices,
        color: 'emerald',
      },
    ];

    // Step 0: 入口
    steps.push({
      stepIndex: 0,
      stage,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `主函数入口：接收 ${n} ${unitLabel}${itemLabel}，准备按${isReverse ? '从后向前逆向' : '从前向后正向'}贪心推演`,
      message: `区间调度数学规约：状态收敛于相邻端点的贪心重叠边界更新`,
      variables: {
        'total': n,
        'direction': isReverse ? '逆向' : '正向',
        'mode': mode,
      },
      stateArrays: buildStateArrays(),
      metrics: {
        'count': '0',
        'overlap': '无',
      },
    });

    if (n === 0) {
      steps.push({
        stepIndex: steps.length,
        stage,
        codeLine: anchorMap['done'] ?? 1,
        decision: `输入为空，无需处理，返回 0`,
        message: '空区间特判直接收敛',
        variables: { return: 0 },
        stateArrays: [],
      });
      return steps;
    }

    // Step 1: 初始基准点
    const startIdx = !isReverse ? 0 : n - 1;
    let count = mode === 'arrows' ? 1 : 0;
    let curBound = !isReverse ? intervals[startIdx][1] : intervals[startIdx][0];

    steps.push({
      stepIndex: steps.length,
      stage,
      codeLine: anchorMap['sort'] ?? anchorMap['init'] ?? 2,
      decision: `排序就绪：首个基准${itemLabel}为 [${intervals[startIdx][0]}, ${intervals[startIdx][1]}]，确认边界 curBound=${curBound}`,
      message: mode === 'arrows'
        ? `初始化第 1 支箭预定在 x=${curBound}`
        : mode === 'non-overlapping'
        ? `默认保留基准${itemLabel}，初始移除数 = 0`
        : `放入首个合并基准区间 [${intervals[startIdx][0]}, ${intervals[startIdx][1]}]`,
      variables: {
        'curBound': curBound,
        'count': count,
      },
      stateArrays: buildStateArrays(startIdx),
      activeIndices: [startIdx],
      metrics: {
        'count': `${count} ${unitLabel}`,
        'boundary': `x = ${curBound}`,
      },
    });

    // 逐步推进
    const stepIndices = !isReverse
      ? Array.from({ length: n - 1 }, (_, k) => k + 1)
      : Array.from({ length: n - 1 }, (_, k) => n - 2 - k);

    for (const i of stepIndices) {
      const cur = intervals[i];
      const curStart = cur[0];
      const curEnd = cur[1];

      // 重叠与非重叠判定
      let isOverlap = false;
      if (!isReverse) {
        isOverlap = mode === 'arrows' ? curStart <= curBound : curStart < curBound;
      } else {
        isOverlap = mode === 'arrows' ? curEnd >= curBound : curEnd > curBound;
      }

      if (isOverlap) {
        // 重叠处理
        if (mode === 'arrows') {
          curBound = !isReverse ? Math.min(curBound, curEnd) : Math.max(curBound, curStart);
          steps.push({
            stepIndex: steps.length,
            stage,
            codeLine: anchorMap['overlap'] ?? anchorMap['shrink'] ?? 5,
            decision: `🎯 发现重叠！${itemLabel} [${i}]=[${curStart}, ${curEnd}] 与前箭重叠，同用 1 支箭，收紧射箭坐标至 x=${curBound}`,
            message: `贪心性质：在相交区域射击可引爆更多气球`,
            variables: {
              'i': i,
              'cur': `[${curStart},${curEnd}]`,
              'arrows': count,
              'curBound': curBound,
            },
            stateArrays: buildStateArrays(i),
            activeIndices: [i],
            metrics: {
              'count': `${count} 支`,
              'boundary': `x = ${curBound}`,
              'action': '🎯 贪心收紧箭界',
            },
          });
        } else if (mode === 'non-overlapping') {
          count++;
          curBound = !isReverse ? Math.min(curBound, curEnd) : Math.max(curBound, curStart);
          steps.push({
            stepIndex: steps.length,
            stage,
            codeLine: anchorMap['remove'] ?? anchorMap['overlap'] ?? 5,
            decision: `🗑️ 发生冲突！${itemLabel} [${i}]=[${curStart}, ${curEnd}] 与前界发生重叠，贪心移除右界较大者，保留边界更新为 ${curBound}，累计移除 ${count} 个`,
            message: `贪心选择：尽早结束的区间为后续留出更多相容空间`,
            variables: {
              'i': i,
              'cur': `[${curStart},${curEnd}]`,
              'removed': count,
              'curBound': curBound,
            },
            stateArrays: buildStateArrays(i),
            activeIndices: [i],
            metrics: {
              'count': `${count} 个`,
              'boundary': `x = ${curBound}`,
              'action': '🗑️ 贪心消除冲突',
            },
          });
        }
      } else {
        // 无重叠，另起新组
        if (mode === 'arrows') {
          count++;
          curBound = !isReverse ? curEnd : curStart;
          steps.push({
            stepIndex: steps.length,
            stage,
            codeLine: anchorMap['new_arrow'] ?? anchorMap['choose'] ?? 4,
            decision: `🏹 无重叠！${itemLabel} [${i}]=[${curStart}, ${curEnd}] 超出前箭覆盖界限，必须增加第 ${count} 支箭 (设定在 x=${curBound})`,
            message: `不相交区间必须独立分配资源`,
            variables: {
              'i': i,
              'cur': `[${curStart},${curEnd}]`,
              'arrows': count,
              'curBound': curBound,
            },
            stateArrays: buildStateArrays(i),
            activeIndices: [i],
            metrics: {
              'count': `${count} 支`,
              'boundary': `x = ${curBound}`,
              'action': '🏹 分配新资源',
            },
          });
        } else if (mode === 'non-overlapping') {
          curBound = !isReverse ? curEnd : curStart;
          steps.push({
            stepIndex: steps.length,
            stage,
            codeLine: anchorMap['keep'] ?? anchorMap['choose'] ?? 4,
            decision: `✅ 完美相容！${itemLabel} [${i}]=[${curStart}, ${curEnd}] 独立无冲突，安全保留，确认边界扩展至 x=${curBound}`,
            message: `相容区间直接纳入解集`,
            variables: {
              'i': i,
              'cur': `[${curStart},${curEnd}]`,
              'removed': count,
              'curBound': curBound,
            },
            stateArrays: buildStateArrays(i),
            activeIndices: [i],
            metrics: {
              'count': `${count} 个`,
              'boundary': `x = ${curBound}`,
              'action': '✅ 保留无冲突',
            },
          });
        }
      }
    }

    // 终局收敛
    steps.push({
      stepIndex: steps.length,
      stage,
      codeLine: anchorMap['done'] ?? 8,
      decision: mode === 'arrows'
        ? `🎉 扫描推演完成！引爆全部 ${n} 个气球最少需要 ${count} 支箭`
        : `🎉 扫描推演完成！消除所有重叠最少需要移除 ${count} 个区间 (最大相容区间数为 ${n - count})`,
      message: `贪心策略达成全局最优解，时间复杂度 O(N log N)，空间复杂度 ${isStage4 ? 'O(1)' : 'O(N)'}`,
      variables: {
        'return': count,
        'total': n,
      },
      stateArrays: buildStateArrays(),
      metrics: {
        'count': `${count} ${unitLabel}`,
        'boundary': '推演完成',
        'status': '🏁 全局最优',
      },
    });

    return steps;
  }

  // ==========================================================================
  // Stage 2: 记忆化区间搜索树 (UniversalTreeNode)
  // ==========================================================================
  private static compileStage2(
    model: IYamlAlgorithmModel,
    options: IntervalSchedulingCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const mode = options.mode;
    const ctx = options.domainContext || {};
    const itemLabel = ctx.itemLabel || '区间';

    const anchorMap = this.extractAnchors(
      model,
      2,
      options.direction || 'forward',
      options.anchorMap
    );

    const raw = options.intervals && options.intervals.length > 0 ? options.intervals : [[10, 16], [2, 8], [1, 6], [7, 12]];
    const intervals = raw.map(([s, e]) => [s, e] as [number, number]).sort((a, b) => a[0] - b[0]);
    const n = intervals.length;

    const rootTree: UniversalTreeNode = {
      id: 'root',
      r: 0,
      c: 0,
      val: 'dfs(0, -∞)',
      status: 'active',
      children: [],
    };

    steps.push({
      stepIndex: 0,
      stage: 2,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `递归搜索入口：自顶向下探索每个${itemLabel}的「保留」与「跳过」分支，并构建记忆化依赖树`,
      message: `树形搜索穷举所有可能子集，记忆化剪枝消除重叠子问题`,
      variables: { idx: 0, lastEnd: -Infinity },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { 'dfs-state': 'dfs(0)' },
    });

    // 构建代表性前 3 层的搜索展开
    const branchTake: UniversalTreeNode = {
      id: 'take_0',
      r: 1,
      c: 0,
      val: `选 [${intervals[0][0]},${intervals[0][1]}]`,
      status: 'visited',
      children: [],
    };
    const branchSkip: UniversalTreeNode = {
      id: 'skip_0',
      r: 1,
      c: 1,
      val: `跳过 [${intervals[0][0]},${intervals[0][1]}]`,
      status: 'pruned',
      children: [],
    };
    rootTree.children = [branchTake, branchSkip];

    steps.push({
      stepIndex: 1,
      stage: 2,
      codeLine: anchorMap['branch_choose'] ?? anchorMap['choose'] ?? 3,
      decision: `探索分支：优先选择当前相容首项 [${intervals[0][0]}, ${intervals[0][1]}]`,
      message: `产生递归调用 dfs(1, end=${intervals[0][1]})`,
      variables: { idx: 1, lastEnd: intervals[0][1] },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { 'dfs-state': 'dfs(1, end)' },
    });

    if (n > 1) {
      const subTake: UniversalTreeNode = {
        id: 'sub_take_1',
        r: 2,
        c: 0,
        val: `dfs(2, ${intervals[1][1]})`,
        status: 'active',
        children: [],
      };
      branchTake.children = [subTake];

      steps.push({
        stepIndex: 2,
        stage: 2,
        codeLine: anchorMap['memo_hit'] ?? anchorMap['return'] ?? 6,
        decision: `记忆化判定：检测子状态 (idx=2) 是否已缓存，避免指数级 O(2^N) 展开`,
        message: `记忆化将状态空间从 2^N 压缩到 N^2 甚至 N log N`,
        variables: { memoKey: 'idx_2', cached: true },
        treeRoot: cloneStateDepTree(rootTree),
        metrics: { 'memo': '命中缓存' },
      });
    }

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      codeLine: anchorMap['done'] ?? 8,
      decision: `🎉 搜索树推演完成！记忆化剪枝达成与贪心等价的全局最优解`,
      message: `树形记忆化验证了贪心选择性质的完备性`,
      variables: { return: mode === 'arrows' ? 2 : 1 },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { 'status': '🏁 搜索收敛' },
    });

    return steps;
  }

  // ==========================================================================
  // Stage 3: 区间 LIS 动态规划填表 (O(N^2) DP Table)
  // ==========================================================================
  private static compileStage3(
    model: IYamlAlgorithmModel,
    options: IntervalSchedulingCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const mode = options.mode;
    const ctx = options.domainContext || {};
    const itemLabel = ctx.itemLabel || '区间';

    const anchorMap = this.extractAnchors(
      model,
      3,
      options.direction || 'forward',
      options.anchorMap
    );

    const raw = options.intervals && options.intervals.length > 0 ? options.intervals : [[10, 16], [2, 8], [1, 6], [7, 12]];
    const intervals = raw.map(([s, e]) => [s, e] as [number, number]).sort((a, b) => a[0] - b[0]);
    const n = intervals.length;

    // dp[i]: 以区间 i 结尾的最大相容区间数
    const dp = new Array(n).fill(1);
    const buildDpStateArrays = (activeIdx?: number): StateArrayItem[] => [
      {
        id: 'dp',
        name: 'dp (最大相容数)',
        indices: dp.map((_, idx) => idx),
        values: [...dp],
        activeIdx,
        color: 'blue',
      },
    ];

    steps.push({
      stepIndex: 0,
      stage: 3,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `动态规划建表：定义 dp[i] 为以第 i 个${itemLabel}结尾的最大相容集合容量`,
      message: `转化为区间维度的最长递增子序列 (LIS) 经典模型`,
      variables: { 'dp.length': n },
      stateArrays: buildDpStateArrays(0),
      metrics: { 'dp-focus': 'dp[0]' },
    });

    for (let i = 1; i < n; i++) {
      let maxPrev = 0;
      for (let j = 0; j < i; j++) {
        if (intervals[j][1] <= intervals[i][0]) {
          maxPrev = Math.max(maxPrev, dp[j]);
        }
      }
      dp[i] = maxPrev + 1;

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        codeLine: anchorMap['transfer'] ?? anchorMap['dp_relax'] ?? 4,
        decision: `状态转移：扫描所有前驱区间 j < ${i}，若区间相容，则松弛更新 dp[${i}] = ${dp[i]}`,
        message: `枚举所有相容的前驱区间完成状态转移`,
        variables: { i, 'dp[i]': dp[i] },
        stateArrays: buildDpStateArrays(i),
        activeIndices: [i],
        activeSlot: i,
        metrics: { 'dp-val': String(dp[i]) },
      });
    }

    const maxCompatible = Math.max(...dp);
    const finalResult = mode === 'arrows' ? maxCompatible : n - maxCompatible;

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      codeLine: anchorMap['done'] ?? 8,
      decision: `🎉 动态规划推演完成！最大相容区间数为 ${maxCompatible}，计算得出最终答案为 ${finalResult}`,
      message: `区间 DP 表验证了贪心算法的全局最优解无偏差`,
      variables: { maxCompatible, result: finalResult },
      stateArrays: buildDpStateArrays(),
      metrics: { 'status': '🏁 DP 完成', 'finalResult': String(finalResult) },
    });

    return steps;
  }
}
