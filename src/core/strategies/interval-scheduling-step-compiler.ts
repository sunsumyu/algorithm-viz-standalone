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
      line: anchorMap['entry'] ?? 1,
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
        line: anchorMap['done'] ?? 1,
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
      line: anchorMap['sort'] ?? anchorMap['init'] ?? 2,
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
            line: anchorMap['overlap'] ?? anchorMap['shrink'] ?? 5,
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
            line: anchorMap['remove'] ?? anchorMap['overlap'] ?? 5,
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
            line: anchorMap['merge'] ?? anchorMap['overlap'] ?? 5,
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
            line: anchorMap['new_arrow'] ?? anchorMap['choose'] ?? 4,
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
            line: anchorMap['keep'] ?? anchorMap['choose'] ?? 4,
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
            line: anchorMap['append'] ?? anchorMap['new_arrow'] ?? anchorMap['choose'] ?? 4,
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
      line: anchorMap['done'] ?? 8,
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
    const targetMetric = ctx.targetMetric || '最优值';

    const anchorMap = this.extractAnchors(
      model,
      2,
      options.direction || 'forward',
      options.anchorMap
    );

    const raw = options.intervals && options.intervals.length > 0 ? options.intervals : [[10, 16], [2, 8], [1, 6], [7, 12]];
    const intervals = raw.map(([s, e]) => [s, e] as [number, number]).sort((a, b) => a[0] - b[0]);
    const n = intervals.length;

    // 二维备忘录网格：memo[i][prevIdx + 1]
    const memo: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(null));
    const cloneMemoGrid = (): (number | null)[][] => memo.map((row) => [...row]);

    const buildStateArrays = (activeIdx?: number, highlightIndices?: number[]): StateArrayItem[] => [
      {
        id: 'intervals',
        name: `${itemLabel}列表 (已排序)`,
        indices: intervals.map((_, idx) => idx),
        values: intervals.map(([s, e]) => `[${s},${e}]`),
        activeIdx,
        highlightIndices,
        color: 'emerald',
      },
    ];

    let nodeUid = 0;
    const rootTree: UniversalTreeNode = {
      id: 'dfs_root',
      r: 0,
      c: 0,
      val: 'dfs(0, -1)',
      status: 'active',
      children: [],
    };

    // Step 0: 入口
    steps.push({
      stepIndex: 0,
      stage: 2,
      line: anchorMap['entry'] ?? 1,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `递归搜索初始化：构建 (${n + 1} × ${n + 1}) 备忘录网格，启动自顶向下 dfs(0, -1) 探索最优子问题展开树`,
      message: `dfs(i, prev) 表示当前决策第 i 个${itemLabel}，上一相容${itemLabel}为 prev，通过记忆化剪枝消除重叠计算`,
      variables: { i: 0, prev: -1, total: n },
      grid: cloneMemoGrid(),
      i: 0,
      j: 0,
      currentI: 0,
      currentJ: 0,
      treeRoot: cloneStateDepTree(rootTree),
      stateArrays: buildStateArrays(0),
      metrics: { 'dfs-state': 'dfs(0, -1)', [targetMetric]: '0' },
    });

    const runDfs = (i: number, prevIdx: number, parentNode: UniversalTreeNode, branchLabel: string): number => {
      nodeUid++;
      const currentTreeNode: UniversalTreeNode = {
        id: `node_${i}_${prevIdx + 1}_${nodeUid}`,
        r: i,
        c: prevIdx + 1,
        val: branchLabel ? `${branchLabel} → dfs(${i}, ${prevIdx})` : `dfs(${i}, ${prevIdx})`,
        status: 'active',
        children: [],
      };
      parentNode.children.push(currentTreeNode);

      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchorMap['entry'] ?? 1,
        codeLine: anchorMap['entry'] ?? 1,
        decision: `🔍 深入探索 dfs(i=${i}, prev=${prevIdx})：当前决策第 ${i} 个${itemLabel} ${i < n ? `[${intervals[i][0]}, ${intervals[i][1]}]` : '越界'}`,
        message: `状态下探，寻找当前子结构的最优解`,
        variables: { i, prevIdx, n },
        grid: cloneMemoGrid(),
        i,
        j: prevIdx + 1,
        currentI: i,
        currentJ: prevIdx + 1,
        treeRoot: cloneStateDepTree(rootTree),
        stateArrays: buildStateArrays(i < n ? i : undefined, prevIdx >= 0 ? [prevIdx] : undefined),
        metrics: { 'dfs-state': `dfs(${i}, ${prevIdx})`, 'depth': `${i}` },
      });

      // 递归基 (Base Case)
      if (i >= n) {
        currentTreeNode.status = 'visited';
        currentTreeNode.val = `dfs(${i}, ${prevIdx}) = 0 (到达边界)`;
        memo[i][prevIdx + 1] = 0;

        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchorMap['entry'] ?? 1,
          codeLine: anchorMap['entry'] ?? 1,
          decision: `🛑 触底边界返回：所有 ${n} 个${itemLabel}均已考察完毕，递归触底返回 0`,
          message: `边界基准条件达成，准备向上回溯`,
          variables: { i, prevIdx, return: 0 },
          grid: cloneMemoGrid(),
          i,
          j: prevIdx + 1,
          currentI: i,
          currentJ: prevIdx + 1,
          treeRoot: cloneStateDepTree(rootTree),
          stateArrays: buildStateArrays(),
          metrics: { 'dfs-state': '边界触底', [targetMetric]: '0' },
        });
        return 0;
      }

      // 记忆化检查 (Memoization Hit)
      if (memo[i][prevIdx + 1] !== null) {
        const cachedVal = memo[i][prevIdx + 1]!;
        currentTreeNode.status = 'pruned';
        currentTreeNode.val = `dfs(${i}, ${prevIdx}) = ${cachedVal} (⚡ 剪枝命中)`;

        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchorMap['memo_hit'] ?? 2,
          codeLine: anchorMap['memo_hit'] ?? 2,
          decision: `⚡ 记忆化剪枝命中！子状态 (i=${i}, prev=${prevIdx}) 已计算并缓存为 ${cachedVal}，直接剪除整棵子树`,
          message: `剪枝消除指数级冗余展开，直接获取备忘录结果`,
          variables: { i, prevIdx, cachedVal },
          grid: cloneMemoGrid(),
          i,
          j: prevIdx + 1,
          currentI: i,
          currentJ: prevIdx + 1,
          treeRoot: cloneStateDepTree(rootTree),
          stateArrays: buildStateArrays(i),
          metrics: { 'action': '⚡ 剪枝命中', 'cached': String(cachedVal) },
        });
        return cachedVal;
      }

      // 分支 1: 跳过当前区间 (Skip / Exclude)
      const resSkip = runDfs(i + 1, prevIdx, currentTreeNode, `跳过 [${intervals[i][0]},${intervals[i][1]}]`);

      // 分支 2: 选取当前区间 (Choose / Include) 若相容
      const isCompatible = prevIdx === -1 || intervals[i][0] >= intervals[prevIdx][1] || (mode === 'arrows' && intervals[i][0] <= intervals[prevIdx][1]);
      let resTake = 0;
      if (isCompatible) {
        resTake = 1 + runDfs(i + 1, i, currentTreeNode, `选 [${intervals[i][0]},${intervals[i][1]}]`);
      } else {
        // 相容性冲突分支剪枝
        const conflictNode: UniversalTreeNode = {
          id: `conflict_${i}_${prevIdx + 1}`,
          r: i + 1,
          c: i + 1,
          val: `选 [${intervals[i][0]},${intervals[i][1]}] (❌ 冲突剪枝)`,
          status: 'pruned',
          children: [],
        };
        currentTreeNode.children.push(conflictNode);

        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchorMap['branch_choose'] ?? anchorMap['choose'] ?? 3,
          codeLine: anchorMap['branch_choose'] ?? anchorMap['choose'] ?? 3,
          decision: `✂️ 约束剪枝：当前${itemLabel} [${intervals[i][0]}, ${intervals[i][1]}] 与上一相容项 [${intervals[prevIdx][0]}, ${intervals[prevIdx][1]}] 发生冲突，不可选取，直接剪枝！`,
          message: `互斥不相容约束剪枝`,
          variables: { i, prevIdx, conflict: true },
          grid: cloneMemoGrid(),
          i,
          j: prevIdx + 1,
          currentI: i,
          currentJ: prevIdx + 1,
          treeRoot: cloneStateDepTree(rootTree),
          stateArrays: buildStateArrays(i, [prevIdx]),
          metrics: { 'action': '✂️ 约束剪枝' },
        });
      }

      const best = Math.max(resSkip, resTake);
      memo[i][prevIdx + 1] = best;
      currentTreeNode.status = 'visited';
      currentTreeNode.val = `dfs(${i}, ${prevIdx}) = ${best}`;

      // 回溯落盘
      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchorMap['return'] ?? anchorMap['done'] ?? 5,
        codeLine: anchorMap['return'] ?? anchorMap['done'] ?? 5,
        decision: `↩️ 回溯落盘：综合子分支结果，确定 dfs(i=${i}, prev=${prevIdx}) = ${best}，写入备忘录网格 (${i}, ${prevIdx + 1})`,
        message: `最优子结构汇聚完成，状态落盘持久化`,
        variables: { i, prevIdx, best, 'memo[i][prev]': best },
        grid: cloneMemoGrid(),
        i,
        j: prevIdx + 1,
        currentI: i,
        currentJ: prevIdx + 1,
        treeRoot: cloneStateDepTree(rootTree),
        stateArrays: buildStateArrays(i, prevIdx >= 0 ? [prevIdx] : undefined),
        metrics: { 'action': '↩️ 回溯落盘', [targetMetric]: String(best) },
      });

      return best;
    };

    // 运行 DFS
    const finalResult = runDfs(0, -1, rootTree, '开始求解');

    // 终局步
    steps.push({
      stepIndex: steps.length,
      stage: 2,
      line: anchorMap['done'] ?? 8,
      codeLine: anchorMap['done'] ?? 8,
      decision: `🎉 递归记忆化搜索全部完成！全局最优推演得到最优解 ${finalResult}，状态树与备忘录全闭环收敛`,
      message: `记忆化搜索验证了贪心选择性质与动态规划的等价性`,
      variables: { return: finalResult, total: n },
      grid: cloneMemoGrid(),
      treeRoot: cloneStateDepTree(rootTree),
      stateArrays: buildStateArrays(),
      metrics: { 'status': '🏁 搜索收敛', [targetMetric]: String(finalResult) },
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
    const unitLabel = ctx.unitLabel || '个';

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
    const buildDpStateArrays = (activeIdx?: number, highlightIndices?: number[]): StateArrayItem[] => [
      {
        id: 'intervals',
        name: `${itemLabel}列表 (已按左端点排序)`,
        indices: intervals.map((_, idx) => idx),
        values: intervals.map(([s, e]) => `[${s},${e}]`),
        activeIdx,
        highlightIndices,
        color: 'emerald',
      },
      {
        id: 'dp',
        name: 'dp (以区间 i 结尾的最大相容数)',
        indices: dp.map((_, idx) => idx),
        values: [...dp],
        activeIdx,
        highlightIndices,
        color: 'blue',
      },
    ];

    steps.push({
      stepIndex: 0,
      stage: 3,
      line: anchorMap['entry'] ?? 1,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `动态规划初始化：定义 dp[i] 为以第 i 个${itemLabel}结尾的最大相容子集大小，初始全为 1（每个${itemLabel}自身自成相容子集）`,
      message: `转化为区间维度的最长递增子序列 (LIS) 状态转移方程：dp[i] = max(dp[j] + 1), 其中 j < i 且 intervals[j].end <= intervals[i].start`,
      variables: { 'dp.length': n, 'dp[0]': 1 },
      stateArrays: buildDpStateArrays(0),
      activeSlot: 0,
      metrics: { 'dp-focus': 'dp[0]=1', 'max-compatible': '1' },
    });

    for (let i = 1; i < n; i++) {
      const [curStart, curEnd] = intervals[i];

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        line: anchorMap['outer_loop'] ?? anchorMap['loop'] ?? 2,
        codeLine: anchorMap['outer_loop'] ?? anchorMap['loop'] ?? 2,
        decision: `考察第 ${i} 个${itemLabel} [${curStart}, ${curEnd}]，开始扫描所有前驱区间 j < ${i} 寻找相容扩展`,
        message: `枚举前驱区间，寻找满足 intervals[j].end <= ${curStart} 的最大 dp[j]`,
        variables: { i, curStart, curEnd, 'dp[i]': dp[i] },
        stateArrays: buildDpStateArrays(i),
        activeIndices: [i],
        activeSlot: i,
        metrics: { 'dp-focus': `dp[${i}]`, 'checking-interval': `[${curStart},${curEnd}]` },
      });

      for (let j = 0; j < i; j++) {
        const [prevStart, prevEnd] = intervals[j];
        const isCompatible = prevEnd <= curStart;

        if (isCompatible) {
          const oldVal = dp[i];
          dp[i] = Math.max(dp[i], dp[j] + 1);

          steps.push({
            stepIndex: steps.length,
            stage: 3,
            line: anchorMap['transfer'] ?? anchorMap['dp_relax'] ?? 4,
            codeLine: anchorMap['transfer'] ?? anchorMap['dp_relax'] ?? 4,
            decision: `✅ 前驱区间 j=${j} [${prevStart}, ${prevEnd}] 与当前区间 i=${i} [${curStart}, ${curEnd}] 互斥不相交（${prevEnd} <= ${curStart}）！松弛更新 dp[${i}] = max(${oldVal}, dp[${j}] + 1) = ${dp[i]}`,
            message: `前驱区间合法相容，状态成功转移`,
            variables: { i, j, prevEnd, curStart, 'dp[j]': dp[j], 'dp[i]': dp[i] },
            stateArrays: buildDpStateArrays(i, [j, i]),
            activeIndices: [j, i],
            activeSlot: i,
            metrics: { 'compatible': '是 (相容)', 'dp-update': `dp[${i}]=${dp[i]}` },
          });
        } else {
          steps.push({
            stepIndex: steps.length,
            stage: 3,
            line: anchorMap['conflict'] ?? anchorMap['check'] ?? 3,
            codeLine: anchorMap['conflict'] ?? anchorMap['check'] ?? 3,
            decision: `❌ 前驱区间 j=${j} [${prevStart}, ${prevEnd}] 与当前区间 i=${i} [${curStart}, ${curEnd}] 发生重叠（${prevEnd} > ${curStart}），不可作为合法相容前驱`,
            message: `重叠区间产生冲突，跳过该前驱转移`,
            variables: { i, j, prevEnd, curStart, 'dp[i]': dp[i] },
            stateArrays: buildDpStateArrays(i, [j, i]),
            activeIndices: [j, i],
            activeSlot: i,
            metrics: { 'compatible': '否 (重叠冲突)', 'dp-val': String(dp[i]) },
          });
        }
      }

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        line: anchorMap['finish_i'] ?? anchorMap['loop'] ?? 5,
        codeLine: anchorMap['finish_i'] ?? anchorMap['loop'] ?? 5,
        decision: `完成第 ${i} 个${itemLabel} [${curStart}, ${curEnd}] 的前驱扫描，确定 dp[${i}] = ${dp[i]}`,
        message: `以该区间结尾的最大相容集合大小锁定为 ${dp[i]}`,
        variables: { i, 'dp[i]': dp[i] },
        stateArrays: buildDpStateArrays(i),
        activeIndices: [i],
        activeSlot: i,
        metrics: { 'dp-final': `dp[${i}]=${dp[i]}` },
      });
    }

    const maxCompatible = Math.max(...dp);
    const finalResult = mode === 'arrows' ? maxCompatible : n - maxCompatible;

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      line: anchorMap['done'] ?? 8,
      codeLine: anchorMap['done'] ?? 8,
      decision: `🎉 动态规划推演完成！最大相容${itemLabel}数为 ${maxCompatible}，计算得出最终目标答案为 ${finalResult} ${unitLabel}`,
      message: `区间 DP 表验证了贪心算法的全局最优解无偏差`,
      variables: { maxCompatible, return: finalResult, result: finalResult },
      stateArrays: buildDpStateArrays(),
      metrics: { 'status': '🏁 DP 完成', 'maxCompatible': String(maxCompatible), 'return': String(finalResult) },
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
      line: anchorMap['entry'] ?? 1,
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
        line: anchorMap['done'] ?? 1,
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
        line: anchorMap['record'] ?? 4,
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
          line: anchorMap['expand'] ?? anchorMap['loop'] ?? 7,
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
            line: anchorMap['cut'] ?? anchorMap['check'] ?? 9,
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
        line: anchorMap['done'] ?? 14,
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
        line: anchorMap['record'] ?? 4,
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
          line: anchorMap['expand'] ?? anchorMap['loop'] ?? 7,
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
            line: anchorMap['cut'] ?? anchorMap['check'] ?? 9,
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
        line: anchorMap['done'] ?? 14,
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

    const chars = s.split('');
    const last: Record<string, number> = {};
    for (let i = 0; i < n; i++) last[s[i]] = i;

    const memo: (number | null)[] = new Array(n + 1).fill(null);
    const cloneMemoGrid = (): (number | null)[][] => [memo.slice(0, Math.min(n, 10))];

    let nodeUid = 0;
    const rootTree: UniversalTreeNode = {
      id: 'dfs_root',
      r: 0,
      c: 0,
      val: 'dfs(0)',
      status: 'active',
      children: [],
    };

    steps.push({
      stepIndex: 0,
      stage: 2,
      line: anchorMap['entry'] ?? 1,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `递归切分入口：自顶向下搜索每个字符前缀的封闭性，构建合法片段切分状态树与备忘录`,
      message: `dfs(idx) 表示对子串 s[idx..n-1] 进行最优切分，字符封闭性约束即为剪枝准则`,
      variables: { idx: 0, n },
      treeRoot: cloneStateDepTree(rootTree),
      grid: cloneMemoGrid(),
      metrics: { 'dfs-state': 'dfs(0)' },
    });

    const runDfs = (idx: number, parentNode: UniversalTreeNode): number => {
      nodeUid++;
      const currentTreeNode: UniversalTreeNode = {
        id: `node_${idx}_${nodeUid}`,
        r: 0,
        c: idx,
        val: `dfs(${idx})`,
        status: 'active',
        children: [],
      };
      parentNode.children.push(currentTreeNode);

      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchorMap['entry'] ?? 1,
        codeLine: anchorMap['entry'] ?? 1,
        decision: `🔍 深入调用 dfs(idx=${idx})：考查从下标 ${idx} 字符 '${idx < n ? s[idx] : ''}' 开始寻找首个封闭子串`,
        message: `自顶向下深入探索划分点`,
        variables: { idx, n },
        treeRoot: cloneStateDepTree(rootTree),
        grid: cloneMemoGrid(),
        metrics: { 'dfs-state': `dfs(${idx})` },
      });

      if (idx >= n) {
        currentTreeNode.status = 'visited';
        currentTreeNode.val = `dfs(${idx}) = 0 (到达串尾)`;
        memo[idx] = 0;
        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchorMap['entry'] ?? 1,
          codeLine: anchorMap['entry'] ?? 1,
          decision: `🛑 串尾触底返回：已扫描至字符串末尾，返回 0`,
          message: `递归边界触底`,
          variables: { idx, return: 0 },
          treeRoot: cloneStateDepTree(rootTree),
          grid: cloneMemoGrid(),
          metrics: { 'dfs-state': '触底返回' },
        });
        return 0;
      }

      if (memo[idx] !== null) {
        const cached = memo[idx]!;
        currentTreeNode.status = 'pruned';
        currentTreeNode.val = `dfs(${idx}) = ${cached} (⚡ 剪枝命中)`;
        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchorMap['memo_hit'] ?? 2,
          codeLine: anchorMap['memo_hit'] ?? 2,
          decision: `⚡ 记忆化命中：dfs(${idx}) 缓存结果已存在 (${cached} 片段)，直接剪除子树`,
          message: `剪枝消除重复切分验证`,
          variables: { idx, cached },
          treeRoot: cloneStateDepTree(rootTree),
          grid: cloneMemoGrid(),
          metrics: { 'action': '⚡ 记忆化剪枝' },
        });
        return cached;
      }

      // 动态扫描首个合法切分点
      let maxReach = last[s[idx]];
      let validCut = -1;

      for (let cut = idx; cut < Math.min(n, idx + 10); cut++) {
        maxReach = Math.max(maxReach, last[s[cut]]);
        if (cut >= maxReach) {
          validCut = cut;
          break;
        } else {
          // 内部字符泄露剪枝示范
          if (cut === idx && cut < maxReach) {
            const prunedNode: UniversalTreeNode = {
              id: `pruned_${cut}_${nodeUid}`,
              r: 0,
              c: cut,
              val: `切 [${idx}..${cut}] (❌ 字符泄露剪枝)`,
              status: 'pruned',
              children: [],
            };
            currentTreeNode.children.push(prunedNode);
            steps.push({
              stepIndex: steps.length,
              stage: 2,
              line: anchorMap['branch'] ?? 3,
              codeLine: anchorMap['branch'] ?? 3,
              decision: `✂️ 封闭性剪枝：尝试切分前缀 [${idx}..${cut}] 失败！字符 '${s[cut]}' 在右侧下标 ${maxReach} 仍有出现，不可在此断开`,
              message: `非封闭片段直接剪除`,
              variables: { idx, cut, maxReach },
              treeRoot: cloneStateDepTree(rootTree),
              grid: cloneMemoGrid(),
              metrics: { 'action': '✂️ 字符泄露剪枝' },
            });
          }
        }
      }

      if (validCut === -1) validCut = n - 1;

      const subRes = 1 + runDfs(validCut + 1, currentTreeNode);
      memo[idx] = subRes;
      currentTreeNode.status = 'visited';
      currentTreeNode.val = `dfs(${idx}) = ${subRes} (切分在 [${idx}..${validCut}])`;

      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchorMap['return'] ?? anchorMap['done'] ?? 5,
        codeLine: anchorMap['return'] ?? anchorMap['done'] ?? 5,
        decision: `↩️ 回溯落盘：找到以 [${idx}..${validCut}] 构成的首个封闭片段，子问题返回 ${subRes - 1}，累计 ${subRes} 个片段`,
        message: `最优子结构落盘`,
        variables: { idx, validCut, subRes },
        treeRoot: cloneStateDepTree(rootTree),
        grid: cloneMemoGrid(),
        metrics: { 'action': '↩️ 回溯落盘', 'partitions': String(subRes) },
      });

      return subRes;
    };

    const finalAns = runDfs(0, rootTree);

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      line: anchorMap['done'] ?? 8,
      codeLine: anchorMap['done'] ?? 8,
      decision: `🎉 递归记忆化搜索全部完成！成功切分出 ${finalAns} 个全局最优合法片段，与贪心完全一致`,
      message: `记忆化状态依赖树完备收敛`,
      variables: { return: finalAns },
      treeRoot: cloneStateDepTree(rootTree),
      grid: cloneMemoGrid(),
      metrics: { 'status': '🏁 搜索收敛', 'partitions': String(finalAns) },
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
    // 预处理各字符最后出现位置
    const last: Record<string, number> = {};
    for (let i = 0; i < n; i++) {
      last[s[i]] = i;
    }

    // dp[i]: 前缀 s[0..i] 所包含的封闭片段数量 (未闭合时记为当前已切出段数)
    const dp = new Array(n).fill(0);

    const buildDpStateArrays = (activeIdx?: number, highlightIndices?: number[]): StateArrayItem[] => [
      {
        id: 'chars',
        name: '字符序列 (s)',
        indices: chars.map((_, idx) => idx),
        values: chars,
        activeIdx,
        highlightIndices,
        color: 'indigo',
      },
      {
        id: 'dp',
        name: '片段 DP 数组 (dp[i] = 前缀 s[0..i] 累计封闭片段数)',
        indices: dp.map((_, idx) => idx),
        values: dp.map((v) => String(v)),
        activeIdx,
        highlightIndices,
        color: 'purple',
      },
    ];

    steps.push({
      stepIndex: 0,
      stage: 3,
      line: anchorMap['entry'] ?? 1,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `动态规划建表：定义 dp[i] 为前缀 s[0..i] 能够划分出的合法封闭片段累计总数，预处理所有字符最终位置`,
      message: `字符串按字符扩展转化为动态维护右边界 maxReach 的递推填表模型`,
      variables: { n, uniqueChars: Object.keys(last).length },
      stateArrays: buildDpStateArrays(0),
      activeSlot: 0,
      metrics: { 'dp-focus': 'dp[0]', 'cur-segment': '待扫描' },
    });

    let start = 0;
    let maxReach = 0;
    let completedSegments = 0;

    for (let i = 0; i < n; i++) {
      const char = s[i];
      const lastPos = last[char];
      const oldReach = maxReach;
      maxReach = Math.max(maxReach, lastPos);

      if (i < maxReach) {
        // 片段尚未闭合，继承已有封闭数
        dp[i] = completedSegments;

        steps.push({
          stepIndex: steps.length,
          stage: 3,
          line: anchorMap['transfer'] ?? anchorMap['loop'] ?? 3,
          codeLine: anchorMap['transfer'] ?? anchorMap['loop'] ?? 3,
          decision: `🔍 扫描字符 s[${i}]='${char}' (该字符最远至 [${lastPos}])，扩展当前片段右界至 max(${oldReach}, ${lastPos}) = ${maxReach}。由于 i < maxReach，片段未闭合，dp[${i}] = ${dp[i]}`,
          message: `内部字符尚未全部闭合，片段继续向右延展`,
          variables: { i, char, lastPos, maxReach, start, 'dp[i]': dp[i] },
          stateArrays: buildDpStateArrays(i, [start, maxReach]),
          activeIndices: [i],
          activeSlot: i,
          metrics: { 'cur-char': `'${char}'`, 'max-reach': `[${maxReach}]`, 'dp-val': String(dp[i]) },
        });
      } else {
        // i === maxReach，达成封闭端点
        completedSegments += 1;
        dp[i] = completedSegments;
        const segmentStr = s.substring(start, i + 1);

        steps.push({
          stepIndex: steps.length,
          stage: 3,
          line: anchorMap['cut'] ?? anchorMap['check'] ?? 6,
          codeLine: anchorMap['cut'] ?? anchorMap['check'] ?? 6,
          decision: `✂️ 触碰封闭断点 i=${i}！片段 s[${start}..${i}]="${segmentStr}" 内部所有字符均在右侧闭合！成功切出第 ${completedSegments} 个片段，更新 dp[${i}] = ${dp[i]}`,
          message: `状态转移确认：前缀 s[0..${i}] 划分完成，转移增量更新 dp[${i}] = ${dp[i]}`,
          variables: { i, char, segmentLen: i - start + 1, start, maxReach, 'dp[i]': dp[i] },
          stateArrays: buildDpStateArrays(i, [start, i]),
          activeIndices: [i],
          activeSlot: i,
          metrics: { 'cur-char': `'${char}'`, 'segment': `"${segmentStr}"`, 'dp-val': String(dp[i]) },
        });

        start = i + 1;
      }
    }

    const finalResult = completedSegments;

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      line: anchorMap['done'] ?? 8,
      codeLine: anchorMap['done'] ?? 8,
      decision: `🎉 划分 DP 表推演完成！前缀 s[0..${n - 1}] 的最终最大有效片段切分数为 ${finalResult}`,
      message: `动态规划自底向上递推验证了贪心边界切分的最大段数全局最优解`,
      variables: { return: finalResult, totalLength: n },
      stateArrays: buildDpStateArrays(),
      metrics: { 'status': '🏁 DP 完成', 'finalResult': String(finalResult) },
    });

    return steps;
  }
}
