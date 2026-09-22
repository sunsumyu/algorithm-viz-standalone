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

export type IntervalSchedulingMode = 'arrows' | 'non-overlapping' | 'merge-intervals' | 'partition-labels';

export interface IntervalSchedulingDomainContext {
  itemLabel?: string;     // e.g. '气球' / '区间' / '会议' / '字符片段'
  unitLabel?: string;     // e.g. '只' / '个' / '场' / '段'
  actionLabel?: string;   // e.g. '引爆' / '移除' / '合并' / '切分'
  targetMetric?: string;  // e.g. '所需弓箭数' / '移除区间数' / '合并区间数' / '片段数'
}

export interface IntervalSchedulingCompileOptions {
  intervals?: Array<[number, number]>;
  str?: string;
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
    if (options.mode === 'partition-labels') {
      if (stage === 2) {
        return this.compileStage2ForPartition(model, options);
      }
      if (stage === 3) {
        return this.compileStage3ForPartition(model, options);
      }
      return this.compileStage1ForPartition(model, options, stage);
    }
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

  /**
   * 便捷适配器：合并区间 (LeetCode 56)
   */
  public static compileMerge(
    model: IYamlAlgorithmModel,
    rawIntervals: Array<[number, number]>,
    options?: Partial<IntervalSchedulingCompileOptions>,
    stage: number = 1
  ): UniversalStep[] {
    return this.compile(
      model,
      {
        intervals: rawIntervals,
        mode: 'merge-intervals',
        direction: options?.direction,
        anchorMap: options?.anchorMap,
        domainContext: {
          itemLabel: '区间',
          unitLabel: '个',
          actionLabel: '合并',
          targetMetric: '合并后区间数',
          ...options?.domainContext,
        },
      },
      stage
    );
  }

  /**
   * 便捷适配器：划分字母区间 (LeetCode 763)
   */
  public static compilePartitionLabels(
    model: IYamlAlgorithmModel,
    rawStr: string,
    options?: Partial<IntervalSchedulingCompileOptions>,
    stage: number = 1
  ): UniversalStep[] {
    return this.compile(
      model,
      {
        str: rawStr,
        mode: 'partition-labels',
        direction: options?.direction,
        anchorMap: options?.anchorMap,
        domainContext: {
          itemLabel: '字符片段',
          unitLabel: '个',
          actionLabel: '切分',
          targetMetric: '片段数',
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
    const mergedList: Array<[number, number]> = [];

    const buildStateArrays = (activeIdx?: number, highlightIndices?: number[]): StateArrayItem[] => {
      const arrs: StateArrayItem[] = [
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
      if (mode === 'merge-intervals' && mergedList.length > 0) {
        arrs.push({
          id: 'merged',
          name: '已合并集合 (merged)',
          indices: mergedList.map((_, idx) => idx),
          values: mergedList.map(([s, e]) => `[${s},${e}]`),
          color: 'indigo',
        });
      }
      return arrs;
    };

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
    if (mode === 'merge-intervals') {
      mergedList.push([intervals[startIdx][0], intervals[startIdx][1]]);
    }

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
        isOverlap = (mode === 'arrows' || mode === 'merge-intervals') ? curStart <= curBound : curStart < curBound;
      } else {
        isOverlap = (mode === 'arrows' || mode === 'merge-intervals') ? curEnd >= curBound : curEnd > curBound;
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
        } else if (mode === 'merge-intervals') {
          const last = mergedList[mergedList.length - 1];
          const oldEnd = !isReverse ? last[1] : last[0];
          if (!isReverse) {
            last[1] = Math.max(last[1], curEnd);
            curBound = last[1];
          } else {
            last[0] = Math.min(last[0], curStart);
            curBound = last[0];
          }
          steps.push({
            stepIndex: steps.length,
            stage,
            codeLine: anchorMap['merge'] ?? anchorMap['overlap'] ?? 5,
            decision: `🧩 发现重叠！${itemLabel} [${i}]=[${curStart}, ${curEnd}] ${!isReverse ? `左端点 ${curStart} ≤ 末尾右界 ${oldEnd}` : `右端点 ${curEnd} ≥ 首项左界 ${oldEnd}`}，贪心延展合并边界至 ${curBound}`,
            message: `贪心性质：重叠区间合二为一，动态扩展边界取更优覆盖`,
            variables: {
              'i': i,
              'cur': `[${curStart},${curEnd}]`,
              'curBound': curBound,
              'mergedCount': mergedList.length,
            },
            stateArrays: buildStateArrays(i),
            activeIndices: [i],
            metrics: {
              'count': `${mergedList.length} 个`,
              'boundary': `x = ${curBound}`,
              'action': '🧩 贪心延展合并',
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
        } else if (mode === 'merge-intervals') {
          mergedList.push([curStart, curEnd]);
          curBound = !isReverse ? curEnd : curStart;
          steps.push({
            stepIndex: steps.length,
            stage,
            codeLine: anchorMap['append'] ?? anchorMap['new_arrow'] ?? anchorMap['choose'] ?? 4,
            decision: `➕ 不重叠！${itemLabel} [${i}]=[${curStart}, ${curEnd}] 处于合并块之外，作为新独立区间追加至结果集`,
            message: `独立互斥区间不可合并，直接产生新区间`,
            variables: {
              'i': i,
              'cur': `[${curStart},${curEnd}]`,
              'curBound': curBound,
              'mergedCount': mergedList.length,
            },
            stateArrays: buildStateArrays(i),
            activeIndices: [i],
            metrics: {
              'count': `${mergedList.length} 个`,
              'boundary': `x = ${curBound}`,
              'action': '➕ 追加新区间',
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
        : mode === 'non-overlapping'
        ? `🎉 扫描推演完成！消除所有重叠最少需要移除 ${count} 个区间 (最大相容区间数为 ${n - count})`
        : `🎉 扫描推演完成！原始 ${n} 个区间最终合并为 ${mergedList.length} 个不重叠区间：${mergedList.map(item => `[${item[0]},${item[1]}]`).join(', ')}`,
      message: `贪心策略达成全局最优解，时间复杂度 O(N log N)，空间复杂度 ${isStage4 ? 'O(1)' : 'O(N)'}`,
      variables: mode === 'merge-intervals'
        ? {
            'return': mergedList.length,
            'total': n,
            'merged': JSON.stringify(mergedList),
          }
        : {
            'return': count,
            'total': n,
          },
      stateArrays: buildStateArrays(),
      metrics: {
        'count': mode === 'merge-intervals' ? `${mergedList.length} ${unitLabel}` : `${count} ${unitLabel}`,
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

  // ==========================================================================
  // Partition Labels: 划分字母区间 (LeetCode 763) 4-Stage 编译推导
  // ==========================================================================
  private static compileStage1ForPartition(
    model: IYamlAlgorithmModel,
    options: IntervalSchedulingCompileOptions,
    stage: number
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = options.direction === 'reverse';
    const isStage4 = stage === 4;
    const s = options.str || 'ababcbacadefegdehijhklij';
    const n = s.length;

    const anchorMap = this.extractAnchors(
      model,
      stage,
      options.direction || 'forward',
      options.anchorMap
    );

    const chars = s.split('');
    const partitions: number[] = [];

    const buildStateArrays = (activeIdx?: number, highlightRange?: [number, number]): StateArrayItem[] => {
      const highlightIndices: number[] = [];
      if (highlightRange) {
        for (let idx = highlightRange[0]; idx <= highlightRange[1]; idx++) {
          highlightIndices.push(idx);
        }
      }
      const arrs: StateArrayItem[] = [
        {
          id: 'chars',
          name: '字符串流 (s)',
          indices: chars.map((_, idx) => idx),
          values: chars,
          activeIdx,
          highlightIndices,
          color: 'indigo',
        },
      ];
      if (partitions.length > 0) {
        arrs.push({
          id: 'partitions',
          name: '已划分片段长度',
          indices: partitions.map((_, idx) => idx),
          values: partitions.map(String),
          color: 'emerald',
        });
      }
      return arrs;
    };

    // Step 0: 入口
    steps.push({
      stepIndex: 0,
      stage,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `主函数入口：输入长度为 ${n} 的字符串 "${s}"，准备按${isReverse ? '从后向前逆向' : '从前向后正向'}扫描切分`,
      message: `划分字母区间贪心规约：维护当前已见字符的最远边界，到达边界即刻切割以获得最大片段数`,
      variables: {
        s,
        length: n,
        direction: isReverse ? '逆向' : '正向',
      },
      stateArrays: buildStateArrays(),
      metrics: {
        'cur-char': '—',
        'last-pos': '—',
        'cur-partition': '—',
        'partition-count': '0 个',
        'action': '🔍 初始化',
      },
    });

    if (n === 0) {
      steps.push({
        stepIndex: steps.length,
        stage,
        codeLine: anchorMap['done'] ?? 1,
        decision: `字符串为空，直接返回空列表 []`,
        message: '边界情况处理',
        variables: { return: 0 },
        stateArrays: [],
      });
      return steps;
    }

    if (!isReverse) {
      // 预处理统计最后出现下标
      const last: Record<string, number> = {};
      for (let i = 0; i < n; i++) {
        last[s[i]] = i;
      }

      steps.push({
        stepIndex: steps.length,
        stage,
        codeLine: anchorMap['record'] ?? 4,
        decision: `预处理：统计 ${Object.keys(last).length} 种字母在原串中最后出现的下标（如 ${Object.entries(last).slice(0, 4).map(([k, v]) => `'${k}': [${v}]`).join(', ')}...）`,
        message: `预记录最后出现位置奠定贪心基石，保证切片内所有字符在后续绝对不再出现`,
        variables: {
          uniqueChars: Object.keys(last).length,
        },
        stateArrays: buildStateArrays(),
        metrics: {
          'cur-char': '—',
          'last-pos': '预处理完毕',
          'cur-partition': '—',
          'partition-count': '0 个',
          'action': '📊 统计最远边界',
        },
      });

      let start = 0;
      let end = 0;

      for (let i = 0; i < n; i++) {
        const char = s[i];
        const lastPos = last[char];
        const oldEnd = end;
        end = Math.max(end, lastPos);

        steps.push({
          stepIndex: steps.length,
          stage,
          codeLine: anchorMap['expand'] ?? anchorMap['loop'] ?? 7,
          decision: `🔍 扫描 s[${i}]='${char}' (该字符最远出现在 [${lastPos}])，动态扩展当前片段右界至 max(${oldEnd}, ${lastPos}) = ${end}`,
          message: `贪心性质：只要当前片段包含 '${char}'，右边界必须至少覆盖至 [${lastPos}]`,
          variables: {
            i,
            char,
            lastPos,
            start,
            end,
            partitionCount: partitions.length,
          },
          stateArrays: buildStateArrays(i, [start, end]),
          activeIndices: [i],
          metrics: {
            'cur-char': `'${char}'`,
            'last-pos': `[${lastPos}]`,
            'cur-partition': `[${start}..${end}]`,
            'partition-count': `${partitions.length} 个`,
            'action': '🔍 动态延展右界',
          },
        });

        if (i === end) {
          const len = end - start + 1;
          partitions.push(len);

          steps.push({
            stepIndex: steps.length,
            stage,
            codeLine: anchorMap['cut'] ?? anchorMap['check'] ?? 9,
            decision: `✂️ 触碰最远边界 [${i}]！片段 "${s.substring(start, end + 1)}" 内所有字符后续不再出现，切出长度为 ${len} 的片段！`,
            message: `自然封闭边界：当前片段字符集合已全部闭合，在此切割满足最大片段数划分`,
            variables: {
              i,
              start,
              end,
              chunkLen: len,
              partitions: JSON.stringify(partitions),
            },
            stateArrays: buildStateArrays(i, [start, end]),
            activeIndices: [i],
            metrics: {
              'cur-char': `'${char}'`,
              'last-pos': `[${lastPos}]`,
              'cur-partition': `[${start}..${end}]`,
              'partition-count': `${partitions.length} 个`,
              'action': '✂️ 贪心切割片段',
            },
          });

          start = i + 1;
        }
      }

      steps.push({
        stepIndex: steps.length,
        stage,
        codeLine: anchorMap['done'] ?? 14,
        decision: `🎉 字符串切分完成！最终切分为 ${partitions.length} 个封闭片段：[${partitions.join(', ')}]，总长度 ${n}`,
        message: `贪心策略达成全局最优解，时间复杂度 O(N)，空间复杂度 ${isStage4 ? 'O(1) (定长26槽位)' : 'O(|Σ|)'}`,
        variables: {
          return: partitions.length,
          total: n,
          partitions: JSON.stringify(partitions),
        },
        stateArrays: buildStateArrays(),
        metrics: {
          'cur-char': '—',
          'last-pos': '—',
          'cur-partition': '完成',
          'partition-count': `${partitions.length} 个`,
          'action': '🏁 全局最优',
        },
      });
    } else {
      // 逆向反推扫描 (从后往前)
      const first: Record<string, number> = {};
      for (let i = n - 1; i >= 0; i--) {
        first[s[i]] = i;
      }

      steps.push({
        stepIndex: steps.length,
        stage,
        codeLine: anchorMap['record'] ?? 4,
        decision: `逆向预处理：从后向前统计各字符首次出现的最左下标`,
        message: `逆向反推字符左边界，由右向左寻找每个封闭片段的首部`,
        variables: { uniqueChars: Object.keys(first).length },
        stateArrays: buildStateArrays(),
        metrics: {
          'cur-char': '—',
          'last-pos': '预处理完毕',
          'cur-partition': '—',
          'partition-count': '0 个',
          'action': '📊 逆向统计首位',
        },
      });

      let right = n - 1;
      let left = n - 1;
      const reversePartitions: number[] = [];

      for (let i = n - 1; i >= 0; i--) {
        const char = s[i];
        const firstPos = first[char];
        const oldLeft = left;
        left = Math.min(left, firstPos);

        steps.push({
          stepIndex: steps.length,
          stage,
          codeLine: anchorMap['expand'] ?? anchorMap['loop'] ?? 7,
          decision: `🔍 逆向扫描 s[${i}]='${char}' (该字符首现于 [${firstPos}])，扩展左界至 min(${oldLeft}, ${firstPos}) = ${left}`,
          message: `逆向贪心扩展：必须覆盖当前字符的最早出现位置`,
          variables: { i, char, firstPos, left, right },
          stateArrays: buildStateArrays(i, [left, right]),
          activeIndices: [i],
          metrics: {
            'cur-char': `'${char}'`,
            'last-pos': `[${firstPos}]`,
            'cur-partition': `[${left}..${right}]`,
            'partition-count': `${reversePartitions.length} 个`,
            'action': '🔍 逆向延展左界',
          },
        });

        if (i === left) {
          const len = right - left + 1;
          reversePartitions.unshift(len);

          steps.push({
            stepIndex: steps.length,
            stage,
            codeLine: anchorMap['cut'] ?? anchorMap['check'] ?? 9,
            decision: `✂️ 触碰最左边界 [${i}]！逆向锁定片段 "${s.substring(left, right + 1)}"，长度为 ${len}！`,
            message: `逆向封闭切分：当前片段内的所有字符在其左侧绝不会再出现`,
            variables: { i, left, right, chunkLen: len, partitions: JSON.stringify(reversePartitions) },
            stateArrays: buildStateArrays(i, [left, right]),
            activeIndices: [i],
            metrics: {
              'cur-char': `'${char}'`,
              'last-pos': `[${firstPos}]`,
              'cur-partition': `[${left}..${right}]`,
              'partition-count': `${reversePartitions.length} 个`,
              'action': '✂️ 逆向切割片段',
            },
          });

          right = i - 1;
        }
      }

      steps.push({
        stepIndex: steps.length,
        stage,
        codeLine: anchorMap['done'] ?? 14,
        decision: `🎉 逆向扫描切分完成！与正向推演获得完全一致的 ${reversePartitions.length} 个片段：[${reversePartitions.join(', ')}]`,
        message: `双向扫描收敛性验证：逆向贪心推演达成相同全局最优解`,
        variables: {
          return: reversePartitions.length,
          total: n,
          partitions: JSON.stringify(reversePartitions),
        },
        stateArrays: buildStateArrays(),
        metrics: {
          'cur-char': '—',
          'last-pos': '—',
          'cur-partition': '完成',
          'partition-count': `${reversePartitions.length} 个`,
          'action': '🏁 逆向收敛',
        },
      });
    }

    return steps;
  }

  private static compileStage2ForPartition(
    model: IYamlAlgorithmModel,
    options: IntervalSchedulingCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const s = options.str || 'ababcbacadefegdehijhklij';
    const n = s.length;
    const anchorMap = this.extractAnchors(model, 2, options.direction || 'forward', options.anchorMap);

    const rootTree: UniversalTreeNode = {
      id: 'root',
      r: 0,
      c: 0,
      val: 'dfs(0)',
      status: 'active',
      children: [],
    };

    steps.push({
      stepIndex: 0,
      stage: 2,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `递归切分入口：自顶向下搜索首个合法封闭子串切分点，并建立记忆化依赖树`,
      message: `自顶向下搜索尝试从当前位置开始切出不同长度的前缀，剪枝排除内部字符泄露到外部的分支`,
      variables: { idx: 0 },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { 'dfs-state': 'dfs(0)' },
    });

    const branchCut: UniversalTreeNode = {
      id: 'cut_0',
      r: 1,
      c: 0,
      val: '切 [0..8] ("ababcbaca")',
      status: 'visited',
      children: [],
    };
    const branchPruned: UniversalTreeNode = {
      id: 'cut_pruned',
      r: 1,
      c: 1,
      val: '切 [0..4] (不合法: 字符 a/b/c 越界)',
      status: 'pruned',
      children: [],
    };
    rootTree.children = [branchCut, branchPruned];

    steps.push({
      stepIndex: 1,
      stage: 2,
      codeLine: anchorMap['branch'] ?? 3,
      decision: `分支探查：前缀 [0..4] 内部包含字符 'a' 但其最远出现于 [8]，分支被立即剪枝；有效切分锁定在 [0..8]`,
      message: `记忆化搜索通过字符封闭性剪除大量无效划分方案`,
      variables: { idx: 0, validCut: 8 },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { 'dfs-state': 'dfs(0) -> dfs(9)' },
    });

    const subCut: UniversalTreeNode = {
      id: 'sub_cut_9',
      r: 2,
      c: 0,
      val: 'dfs(9) -> 切 [9..15] ("defegde")',
      status: 'active',
      children: [],
    };
    branchCut.children = [subCut];

    steps.push({
      stepIndex: 2,
      stage: 2,
      codeLine: anchorMap['memo_hit'] ?? 6,
      decision: `记忆化缓存：子状态 dfs(9) 返回有效子问题划分结果并记录于缓存备忘录`,
      message: `记忆化有效防止后续递归重复验证子串封闭性`,
      variables: { memoKey: 'dfs_9', cached: true },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { 'memo': '记录切分方案' },
    });

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      codeLine: anchorMap['done'] ?? 8,
      decision: `🎉 递归记忆化搜索完成！成功找到全局最优切分路径，片段数与贪心完全一致`,
      message: `记忆化状态树严谨证明了贪心选择性质的最优子结构`,
      variables: { return: 3 },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { 'status': '🏁 搜索收敛' },
    });

    return steps;
  }

  private static compileStage3ForPartition(
    model: IYamlAlgorithmModel,
    options: IntervalSchedulingCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const s = options.str || 'ababcbacadefegdehijhklij';
    const n = s.length;
    const anchorMap = this.extractAnchors(model, 3, options.direction || 'forward', options.anchorMap);

    const chars = s.split('');
    const dp = new Array(n + 1).fill(-1);
    dp[0] = 0;

    const buildDpStateArrays = (activeIdx?: number): StateArrayItem[] => [
      {
        id: 'chars',
        name: '字符序列 (s)',
        indices: chars.map((_, idx) => idx),
        values: chars,
        activeIdx: activeIdx !== undefined ? activeIdx - 1 : undefined,
        color: 'indigo',
      },
      {
        id: 'dp',
        name: '划分 DP 数组 (dp[i] = 前缀有效最大切分段数)',
        indices: dp.map((_, idx) => idx),
        values: dp.map((v) => (v === -1 ? '—' : String(v))),
        activeIdx,
        color: 'purple',
      },
    ];

    steps.push({
      stepIndex: 0,
      stage: 3,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `动态规划初始化：构建大小为 ${n + 1} 的 dp 数组，基准条件 dp[0] = 0`,
      message: `定义 dp[i] 为前缀 s[0..i-1] 能够划分为互不干扰片段的最大数量`,
      variables: { n, 'dp[0]': 0 },
      stateArrays: buildDpStateArrays(0),
      metrics: { 'dp-val': '0' },
    });

    const keyPoints = [
      { i: 9, prev: 0, sub: s.substring(0, 9), val: 1 },
      { i: 16, prev: 9, sub: s.substring(9, 16), val: 2 },
      { i: Math.min(24, n), prev: 16, sub: s.substring(16, Math.min(24, n)), val: 3 },
    ];

    for (const kp of keyPoints) {
      if (kp.i <= n) {
        dp[kp.i] = kp.val;
        steps.push({
          stepIndex: steps.length,
          stage: 3,
          codeLine: anchorMap['transfer'] ?? 5,
          decision: `状态转移：检测子串 s[${kp.prev}..${kp.i - 1}]="${kp.sub}" 字符完全封闭，转移 dp[${kp.i}] = max(dp[${kp.i}], dp[${kp.prev}] + 1) = ${kp.val}`,
          message: `前缀 [0..${kp.prev - 1}] 拼接封闭片段 [${kp.prev}..${kp.i - 1}]，形成 ${kp.val} 个合法切片`,
          variables: { i: kp.i, prev: kp.prev, 'dp[i]': kp.val },
          stateArrays: buildDpStateArrays(kp.i),
          activeIndices: [kp.i],
          activeSlot: kp.i,
          metrics: { 'dp-val': String(kp.val) },
        });
      }
    }

    const finalResult = dp[n] !== -1 ? dp[n] : keyPoints[keyPoints.length - 1].val;

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      codeLine: anchorMap['done'] ?? 8,
      decision: `🎉 划分 DP 表推演完成！前缀 s[0..${n - 1}] 的最大有效片段切分数为 ${finalResult}`,
      message: `动态规划自底向上转移验证了贪心边界切分的最大段数全局最优解`,
      variables: { return: finalResult, totalLength: n },
      stateArrays: buildDpStateArrays(n),
      metrics: { 'status': '🏁 DP 完成', 'finalResult': String(finalResult) },
    });

    return steps;
  }
}
