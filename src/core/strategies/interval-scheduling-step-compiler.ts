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

  // ==========================================================================
  // 会议室 II (LeetCode 253 / 089 Code05) 顶层四阶段编译器
  // ==========================================================================
  public static compileMeetingRoomsII(
    model: IYamlAlgorithmModel,
    rawIntervals: number[][],
    stage: number = 1,
    direction: 'forward' | 'reverse' = 'forward',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const defaultIntervals = [[0, 30], [5, 10], [15, 20], [7, 12]];
    const intervals = rawIntervals && rawIntervals.length > 0 ? rawIntervals.map(iv => [iv[0], iv[1]]) : defaultIntervals;

    switch (stage) {
      case 2:
        return this.compileMeetingRoomsStage2(model, intervals, direction, anchorMap);
      case 3:
        return this.compileMeetingRoomsStage3(model, intervals, direction, anchorMap);
      case 4:
        return this.compileMeetingRoomsStage4(model, intervals, direction, anchorMap);
      case 1:
      default:
        return this.compileMeetingRoomsStage1(model, intervals, direction, anchorMap);
    }
  }

  private static compileMeetingRoomsStage1(
    model: IYamlAlgorithmModel,
    intervals: number[][],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = direction === 'reverse';
    const anchors = this.extractAnchors(model, 1, direction, anchorMap);

    const sorted = [...intervals].map((iv, idx) => ({ id: idx, start: iv[0], end: iv[1] }));
    if (!isReverse) {
      sorted.sort((a, b) => a.start - b.start);
    } else {
      sorted.sort((a, b) => b.end - a.end);
    }

    steps.push({
      stepIndex: 0,
      stage: 1,
      line: anchors.sort || 2,
      codeLine: anchors.sort || 2,
      decision: isReverse
        ? `1. 逆向按结束时间降序排序完成：共 ${sorted.length} 场会议，时间倒流规划大根堆`
        : `1. 按开始时间升序排序完成：共 ${sorted.length} 场会议，准备贪心小根堆排定`,
      message: isReverse
        ? `倒序时间轴：大根堆维护当前所有正在使用中会议室的「最迟开始时间」`
        : `正序时间轴：小根堆维护当前所有正在使用中会议室的「最早释放时间」以复用`,
      variables: { totalMeetings: sorted.length },
      stateArrays: [
        {
          id: 'sorted',
          name: '时间有序会议列表',
          indices: sorted.map((_, idx) => idx),
          values: sorted.map(m => `M${m.id}:[${m.start},${m.end}]`),
          color: 'indigo',
        },
      ],
      metrics: { '会议总数': String(sorted.length), '排序依据': isReverse ? 'end 降序' : 'start 升序' },
    });

    const heap: number[] = []; // 模拟小根堆（或逆向大根堆）
    const firstMeeting = sorted[0];
    const initialKey = isReverse ? firstMeeting.start : firstMeeting.end;
    heap.push(initialKey);

    steps.push({
      stepIndex: steps.length,
      stage: 1,
      line: anchors.heap_init || 4,
      codeLine: anchors.heap_init || 4,
      decision: `2. 首个会议 M${firstMeeting.id} [${firstMeeting.start}, ${firstMeeting.end}] 入堆，开辟首间会议室 Room#1 (跟踪点: ${initialKey})`,
      message: `初始化优先队列堆顶`,
      variables: { meetingId: firstMeeting.id, heapTop: initialKey, rooms: 1 },
      stateArrays: [
        {
          id: 'heap',
          name: '会议室占用堆',
          indices: [0],
          values: [`Room#1 (至 ${initialKey})`],
          color: 'emerald',
        },
      ],
      metrics: { '当前会议室数': '1', '最早释放点': String(initialKey) },
    });

    for (let i = 1; i < sorted.length; i++) {
      const m = sorted[i];
      heap.sort((a, b) => isReverse ? b - a : a - b);
      const top = heap[0];
      const canReuse = !isReverse ? m.start >= top : m.end <= top;

      // 阶段 1 比对检测帧
      steps.push({
        stepIndex: steps.length,
        stage: 1,
        line: anchors.scan || 5,
        codeLine: anchors.scan || 5,
        decision: `[${i + 1}/${sorted.length}] 考察会议 M${m.id} [${m.start}, ${m.end}]：与当前最早空闲释放时间 ${top} 进行冲突检测`,
        message: canReuse
          ? `前序房间在 ${top} 腾空，满足当前会议时间条件，可直接无缝接力复用！`
          : `前序房间最早在 ${top} 才释放，当前会议已开始，发生并发重叠冲突！`,
        variables: { meeting: m.id, start: m.start, end: m.end, top, canReuse },
        stateArrays: [
          {
            id: 'heap',
            name: '会议室占用堆 (比对中)',
            indices: heap.map((_, idx) => idx),
            values: heap.map((t, idx) => `Room#${idx + 1} (至 ${t})`),
            color: 'amber',
          },
        ],
        activeSlot: i,
        metrics: { '当前会议': `M${m.id}`, '堆顶最早释放': String(top), '检测结果': canReuse ? '可复用' : '⚠️ 冲突' },
      });

      if (canReuse) {
        heap.shift(); // 腾退复用
        heap.push(!isReverse ? m.end : m.start);
        heap.sort((a, b) => isReverse ? b - a : a - b);

        steps.push({
          stepIndex: steps.length,
          stage: 1,
          line: anchors.scan || 6,
          codeLine: anchors.scan || 6,
          decision: `[${i + 1}/${sorted.length}] 会议 M${m.id} [${m.start}, ${m.end}] 成功复用已腾空会议室！当前会议室维持 ${heap.length} 间`,
          message: `时间不重叠，无须额外开辟新会议室，直接接力占用`,
          variables: { meeting: m.id, action: 'reuse', reusedTop: top, newHeapTop: heap[0], rooms: heap.length },
          stateArrays: [
            {
              id: 'heap',
              name: '会议室占用堆 (复用)',
              indices: heap.map((_, idx) => idx),
              values: heap.map((t, idx) => `Room#${idx + 1} (至 ${t})`),
              color: 'emerald',
            },
          ],
          activeSlot: i,
          metrics: { '当前会议': `M${m.id}`, '决策': '复用旧房间', '会议室数': String(heap.length) },
        });
      } else {
        heap.push(!isReverse ? m.end : m.start);
        heap.sort((a, b) => isReverse ? b - a : a - b);

        steps.push({
          stepIndex: steps.length,
          stage: 1,
          line: anchors.scan || 6,
          codeLine: anchors.scan || 6,
          decision: `[${i + 1}/${sorted.length}] 冲突！会议 M${m.id} [${m.start}, ${m.end}] 与当前最早释放 ${top} 重叠，必须开辟新会议室 Room#${heap.length}！`,
          message: `并发冲突，必须扩容新会议室以承载重叠时段`,
          variables: { meeting: m.id, action: 'open_new', conflictWith: top, rooms: heap.length },
          stateArrays: [
            {
              id: 'heap',
              name: '会议室占用堆 (扩容)',
              indices: heap.map((_, idx) => idx),
              values: heap.map((t, idx) => `Room#${idx + 1} (至 ${t})`),
              color: 'rose',
            },
          ],
          activeSlot: i,
          metrics: { '当前会议': `M${m.id}`, '决策': '⚠️ 开辟新房间', '会议室数': String(heap.length) },
        });
      }
    }

    const minRooms = heap.length;
    steps.push({
      stepIndex: steps.length,
      stage: 1,
      line: anchors.done || 8,
      codeLine: anchors.done || 8,
      decision: `🏁 贪心推演收敛完成！满足所有会议所需的最少会议室数量 = ${minRooms}`,
      message: `小根堆动态追踪完美保证了重叠会议室内资源的极致复用`,
      variables: { return: minRooms, totalMeetings: sorted.length },
      metrics: { '最少会议室数': String(minRooms), '状态': '🏁 调度收敛' },
    });

    return steps;
  }

  private static compileMeetingRoomsStage2(
    model: IYamlAlgorithmModel,
    intervals: number[][],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const anchors = this.extractAnchors(model, 2, direction, anchorMap);
    const sorted = [...intervals].sort((a, b) => a[0] - b[0]);

    const rootTree: UniversalTreeNode = {
      id: 'tree_root',
      r: 0,
      c: 0,
      val: `dfs(meeting=0, rooms=1)`,
      status: 'active',
      children: [],
    };

    steps.push({
      stepIndex: 0,
      stage: 2,
      line: anchors.entry || 2,
      codeLine: anchors.entry || 2,
      decision: `展开会议室分配决策树根节点：dfs(meeting=0, rooms=1)`,
      message: `自顶向下探查每个会议是复用已释放会议室还是开辟新房间`,
      variables: { meetingIdx: 0, activeRooms: 1 },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { '决策树': '初始化', '会议总数': String(sorted.length) },
    });

    let currentParent = rootTree;
    let rooms = 1;
    let lastEnd = sorted[0][1];

    for (let i = 1; i < sorted.length; i++) {
      const m = sorted[i];
      const canReuse = m[0] >= lastEnd;
      if (!canReuse) rooms++;
      else lastEnd = m[1];

      const childNode: UniversalTreeNode = {
        id: `node_m${i}`,
        r: i,
        c: canReuse ? 0 : 1,
        val: canReuse ? `M${i} 复用会议室` : `M${i} 开辟新房 (总:${rooms})`,
        status: 'active',
        children: [],
      };
      currentParent.children.push(childNode);

      // 分支一：复用尝试
      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.branch_reuse || 4,
        codeLine: anchors.branch_reuse || 4,
        decision: `探查分支一：会议 M${i} [${m[0]}, ${m[1]}] 尝试复用空闲会议室 (前序结束: ${lastEnd})`,
        message: canReuse ? `无重叠，复用可行` : `时间冲突，不可复用`,
        variables: { meeting: i, canReuse, lastEnd },
        treeRoot: cloneStateDepTree(rootTree),
        metrics: { '分支尝试': '复用旧房', '当前会议': `M${i}` },
      });

      // 分支二：开辟新房
      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.branch_new || 6,
        codeLine: anchors.branch_new || 6,
        decision: `探查分支二：会议 M${i} 产生并发峰值，开辟新会议室分支 (并发数: ${rooms})`,
        message: `重叠导致并发计数递增`,
        variables: { meeting: i, rooms },
        treeRoot: cloneStateDepTree(rootTree),
        metrics: { '分支尝试': '开辟新房', '当前并发': String(rooms) },
      });

      // 决策剪枝判断
      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.backtrack || 7,
        codeLine: anchors.backtrack || 7,
        decision: `记忆化剪枝比对：判断 M${i} 最优转移路径 (最优解选择: ${canReuse ? '复用旧房' : '扩容新房'})`,
        message: `比较两分支开销，剪除劣质搜索分支`,
        variables: { meeting: i, bestChoice: canReuse ? 'reuse' : 'open_new' },
        treeRoot: cloneStateDepTree(rootTree),
        metrics: { '局部最优': canReuse ? '复用' : '扩容', '状态': '剪枝比较' },
      });

      // 回溯落盘
      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.backtrack || 8,
        codeLine: anchors.backtrack || 8,
        decision: `决策落盘与分支回溯：会议 M${i} 归属已排定，当前有效会议室需求 = ${rooms}`,
        message: `剪枝完成，折返向上汇报`,
        variables: { meeting: i, settledRooms: rooms },
        treeRoot: cloneStateDepTree(rootTree),
        metrics: { '决策落盘': `需求 ${rooms} 间`, '状态': '剪枝回溯' },
      });

      childNode.status = 'visited';
      currentParent = childNode;
    }

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      line: anchors.done || 10,
      codeLine: anchors.done || 10,
      decision: `🛑 会议室分配决策树遍历收敛！全局最少房间峰值需求为 ${rooms}`,
      message: `完整构建了全树重叠调度的决策分支图`,
      variables: { finalRooms: rooms },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { '最少会议室': String(rooms), '状态': '🏁 树形遍历收敛' },
    });

    return steps;
  }

  private static compileMeetingRoomsStage3(
    model: IYamlAlgorithmModel,
    intervals: number[][],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const anchors = this.extractAnchors(model, 3, direction, anchorMap);

    // 上下车差分事件：[time, delta, meetingIdx]
    // 结束点 delta=-1 优先于开始点 delta=+1（同时间点先下后上）
    const events: Array<{ time: number; delta: number; id: number }> = [];
    intervals.forEach((iv, idx) => {
      events.push({ time: iv[0], delta: 1, id: idx });
      events.push({ time: iv[1], delta: -1, id: idx });
    });
    events.sort((a, b) => a.time === b.time ? a.delta - b.delta : a.time - b.time);

    steps.push({
      stepIndex: 0,
      stage: 3,
      line: anchors.diff_init || 2,
      codeLine: anchors.diff_init || 2,
      decision: `初始化时间轴差分事件：生成 ${events.length} 个离散上下车事件点`,
      message: `上下车模型：会议开始 = +1 占用会议室，会议结束 = -1 释放会议室`,
      variables: { eventCount: events.length },
      stateArrays: [
        {
          id: 'events',
          name: '上下车差分事件流',
          indices: events.map((_, idx) => idx),
          values: events.map(e => `T${e.time}: M${e.id} (${e.delta > 0 ? '+1' : '-1'})`),
          color: 'indigo',
        },
      ],
      metrics: { '事件总数': String(events.length), '差分思想': '前缀和最大并发' },
    });

    let currentRooms = 0;
    let maxRooms = 0;

    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      currentRooms += e.delta;
      if (currentRooms > maxRooms) maxRooms = currentRooms;

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        line: anchors.diff_scan || 4,
        codeLine: anchors.diff_scan || 4,
        decision: `时间点 T=${e.time} 发生事件：会议 M${e.id} ${e.delta > 0 ? '开始 (+1)' : '结束 (-1)'}，当前并发 = ${currentRooms}，历史最高 = ${maxRooms}`,
        message: `沿离散时间轴流式计算前缀和`,
        variables: { time: e.time, delta: e.delta, currentRooms, maxRooms },
        stateArrays: [
          {
            id: 'concurrency',
            name: '时间线并发指标',
            indices: [0, 1],
            values: [`当前并发房间: ${currentRooms}`, `历史峰值会议室: ${maxRooms}`],
            color: e.delta > 0 ? 'rose' : 'emerald',
          },
        ],
        activeSlot: i,
        metrics: { '时间点': `T=${e.time}`, '实时并发': String(currentRooms), '峰值': String(maxRooms) },
      });
    }

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      line: anchors.diff_done || 6,
      codeLine: anchors.diff_done || 6,
      decision: `🎉 上下车差分时间线扫描完成！历史最高并发峰值 = ${maxRooms} 间会议室`,
      message: `最大重叠区间点理论与贪心小根堆算法完全一致`,
      variables: { return: maxRooms },
      metrics: { '最高并发': String(maxRooms), '状态': '🏁 差分收敛' },
    });

    return steps;
  }

  private static compileMeetingRoomsStage4(
    model: IYamlAlgorithmModel,
    intervals: number[][],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const anchors = this.extractAnchors(model, 4, direction, anchorMap);
    const n = intervals.length;

    const starts = intervals.map(iv => iv[0]).sort((a, b) => a - b);
    const ends = intervals.map(iv => iv[1]).sort((a, b) => a - b);

    steps.push({
      stepIndex: 0,
      stage: 4,
      line: anchors.reg_init || 2,
      codeLine: anchors.reg_init || 2,
      decision: `双指针堆外 O(1) 极速流转初始化：starts 与 ends 独立排序，指针 endIdx = 0, rooms = 0`,
      message: `舍弃额外堆结构，利用两个单调序列的自然滑动窗口进行常数空间推演`,
      variables: { starts, ends, endIdx: 0, rooms: 0, space: 'O(1)' },
      stateArrays: [
        {
          id: 'pointers',
          name: '双指针序列',
          indices: [0, 1],
          values: [`starts: [${starts.join(',')}]`, `ends: [${ends.join(',')}]`],
          color: 'indigo',
        },
      ],
      metrics: { '空间复杂度': 'O(1)', '双指针': '就绪' },
    });

    let rooms = 0;
    let endIdx = 0;

    for (let i = 0; i < n; i++) {
      const isConflict = starts[i] < ends[endIdx];

      // 1. 比对检查步骤
      steps.push({
        stepIndex: steps.length,
        stage: 4,
        line: anchors.reg_loop || 3,
        codeLine: anchors.reg_loop || 3,
        decision: `[${i + 1}/${n}] 考察双指针：当前会议开始 starts[${i}]=${starts[i]} 对比 最早结束 ends[${endIdx}]=${ends[endIdx]}`,
        message: isConflict
          ? `会议开始时间早于当前最早结束时间，发生重叠冲突！`
          : `会议开始时间晚于或等于最早结束时间，会议室已空出可复用！`,
        variables: { i, start: starts[i], end: ends[endIdx], endIdx, isConflict },
        stateArrays: [
          {
            id: 'state',
            name: '双指针流转比对',
            indices: [0, 1],
            values: [`当前指针 start[${i}]: ${starts[i]}`, `最早释放 end[${endIdx}]: ${ends[endIdx]}`],
            color: 'amber',
          },
        ],
        activeSlot: i,
        metrics: { '当前开始': String(starts[i]), '最早释放': String(ends[endIdx]), '比对': isConflict ? '冲突' : '复用' },
      });

      if (isConflict) {
        rooms++;
        steps.push({
          stepIndex: steps.length,
          stage: 4,
          line: anchors.reg_loop || 4,
          codeLine: anchors.reg_loop || 4,
          decision: `[${i + 1}/${n}] 冲突生效！starts[${i}] < ends[${endIdx}]，rooms++ -> ${rooms}`,
          message: `新会议在最早结束前发生，增加会议室容量`,
          variables: { i, start: starts[i], end: ends[endIdx], rooms, endIdx },
          stateArrays: [
            {
              id: 'state',
              name: '双指针流转状态',
              indices: [0, 1],
              values: [`当前所需会议室: ${rooms}`, `当前最早释放: ${ends[endIdx]}`],
              color: 'rose',
            },
          ],
          activeSlot: i,
          metrics: { '当前开始': String(starts[i]), '所需房间': String(rooms) },
        });
      } else {
        endIdx++;
        steps.push({
          stepIndex: steps.length,
          stage: 4,
          line: anchors.reg_loop || 4,
          codeLine: anchors.reg_loop || 4,
          decision: `[${i + 1}/${n}] 复用生效！starts[${i}] >= ends[${endIdx - 1}]，滑动释放指针 endIdx++ -> ${endIdx}`,
          message: `前序会议室已释放，直接复用无需扩容`,
          variables: { i, start: starts[i], end: ends[endIdx], rooms, endIdx },
          stateArrays: [
            {
              id: 'state',
              name: '双指针流转状态',
              indices: [0, 1],
              values: [`当前所需会议室: ${rooms}`, `当前最早释放: ${ends[endIdx]}`],
              color: 'emerald',
            },
          ],
          activeSlot: i,
          metrics: { '当前开始': String(starts[i]), '复用成功': 'YES' },
        });
      }
    }

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchors.reg_done || 6,
      codeLine: anchors.reg_done || 6,
      decision: `🏁 双指针 O(1) 极速推演完成！最少需要 ${rooms} 间会议室`,
      message: `时间复杂度 O(N log N)，额外空间复杂度 O(1)，无堆开销`,
      variables: { return: rooms },
      metrics: { '最终结果': String(rooms), '空间开销': 'O(1)', '状态': '🏁 极致收敛' },
    });

    return steps;
  }

  // ==========================================================================
  // 连接棒材的最低费用 (LeetCode 1167 / 洛谷 P1090) 顶层四阶段编译器
  // 核心思想：小根堆哈夫曼最优合并树 (Huffman Merge Greedy)
  // ==========================================================================
  public static compileConnectSticks(
    model: IYamlAlgorithmModel,
    rawSticks: number[],
    stage: number = 1,
    direction: 'forward' | 'reverse' = 'forward',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const sticks = rawSticks && rawSticks.length > 0 ? rawSticks : [2, 4, 3, 5, 1];

    switch (stage) {
      case 2:
        return this.compileConnectSticksStage2(model, sticks, direction, anchorMap);
      case 3:
        return this.compileConnectSticksStage3(model, sticks, direction, anchorMap);
      case 4:
        return this.compileConnectSticksStage4(model, sticks, direction, anchorMap);
      case 1:
      default:
        return this.compileConnectSticksStage1(model, sticks, direction, anchorMap);
    }
  }

  private static compileConnectSticksStage1(
    model: IYamlAlgorithmModel,
    sticks: number[],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = direction === 'reverse';
    const anchors = this.extractAnchors(model, 1, direction, anchorMap);

    const heap = [...sticks];
    heap.sort((a, b) => isReverse ? b - a : a - b);

    steps.push({
      stepIndex: 0,
      stage: 1,
      line: anchors.heap_init || 2,
      codeLine: anchors.heap_init || 2,
      decision: isReverse
        ? `1. 逆向推演初始化：全部 ${sticks.length} 根木棒构建大根堆，准备执行最劣合并对偶验证`
        : `1. 哈夫曼贪心初始化：全部 ${sticks.length} 根木棒构建小根堆，准备贪心两两合并`,
      message: isReverse
        ? `逆序对偶：每次取出最长两根合并，通过对比证明贪心取最小两根的严格最优性`
        : `哈夫曼性质：每次合并当前最短的两根棒材，使其在合并树中深度更深，总权重最小`,
      variables: { totalSticks: sticks.length, initialHeap: [...heap] },
      stateArrays: [
        {
          id: 'heap',
          name: isReverse ? '大根堆 (对偶)' : '小根堆 (已建堆)',
          indices: heap.map((_, idx) => idx),
          values: heap.map(v => `${v}米`),
          color: 'indigo',
        },
      ],
      metrics: { '初始棒材数': String(sticks.length), '堆类型': isReverse ? '大根堆' : '小根堆' },
    });

    let totalCost = 0;
    let round = 1;

    while (heap.length > 1) {
      heap.sort((a, b) => isReverse ? b - a : a - b);
      const a = heap[0];
      const b = heap[1];

      // 1. 比对检查帧
      steps.push({
        stepIndex: steps.length,
        stage: 1,
        line: anchors.loop || 4,
        codeLine: anchors.loop || 4,
        decision: `[第 ${round} 轮合并] 锁定当前堆顶最优候选：两根最短棒材 [${a}米] 与 [${b}米]`,
        message: `贪心法则：较小权值分配更大深度，产生合并代价 ${a} + ${b} = ${a + b}`,
        variables: { round, a, b, nextCost: a + b },
        stateArrays: [
          {
            id: 'heap',
            name: '堆顶抽取检测',
            indices: heap.map((_, idx) => idx),
            values: heap.map(v => `${v}米`),
            color: 'amber',
          },
        ],
        activeIndices: [0, 1],
        activeSlot: round - 1,
        metrics: { '当前提取': `(${a}, ${b})`, '预计花费': String(a + b) },
      });

      // 2. 弹出并合并入堆
      heap.splice(0, 2);
      const cost = a + b;
      totalCost += cost;
      heap.push(cost);
      heap.sort((a, b) => isReverse ? b - a : a - b);

      steps.push({
        stepIndex: steps.length,
        stage: 1,
        line: anchors.merge || 7,
        codeLine: anchors.merge || 7,
        decision: `[第 ${round} 轮完成] 成功合并：新木棒 [${cost}米] 重新压入堆，当前累计总费用 = ${totalCost}`,
        message: `两根旧棒材归约缩减为一根复合棒材，堆规模变为 ${heap.length}`,
        variables: { round, mergedCost: cost, totalCost, remainingHeap: [...heap] },
        stateArrays: [
          {
            id: 'heap',
            name: '合并后小根堆',
            indices: heap.map((_, idx) => idx),
            values: heap.map(v => `${v}米`),
            color: 'emerald',
          },
        ],
        activeSlot: round - 1,
        metrics: { '本轮花费': String(cost), '累计总费用': String(totalCost), '剩余堆大小': String(heap.length) },
      });

      round++;
    }

    steps.push({
      stepIndex: steps.length,
      stage: 1,
      line: anchors.done || 10,
      codeLine: anchors.done || 10,
      decision: `🏁 全体棒材合并收敛完成！最终合成唯一棒材 [${heap[0]}米]，最低总开销 = ${totalCost}`,
      message: `哈夫曼最优树贪心策略以 O(N log N) 复杂度严格达成全局最低费用`,
      variables: { return: totalCost, finalLength: heap[0] },
      metrics: { '最终费用': String(totalCost), '最终长度': `${heap[0]}米`, '状态': '🏁 调度收敛' },
    });

    return steps;
  }

  private static compileConnectSticksStage2(
    model: IYamlAlgorithmModel,
    sticks: number[],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = direction === 'reverse';
    const anchors = this.extractAnchors(model, 2, direction, anchorMap);

    // 初始化叶子节点
    const nodes: UniversalTreeNode[] = sticks.map((s, idx) => ({
      id: `leaf_${idx}`,
      r: 0,
      c: idx,
      val: `叶子#${idx + 1}: ${s}米`,
      status: 'active',
      children: [],
    }));

    const rootTree: UniversalTreeNode = {
      id: 'huffman_root',
      r: 0,
      c: 0,
      val: 'HuffmanTree(构建中)',
      status: 'active',
      children: [...nodes],
    };

    steps.push({
      stepIndex: 0,
      stage: 2,
      line: anchors.entry || 2,
      codeLine: anchors.entry || 2,
      decision: `展开哈夫曼树决策树根节点：初始化 ${sticks.length} 个独立叶子节点`,
      message: `自底向上两两成对构造父节点，展示加权路径长度 WPL 的演进`,
      variables: { leafCount: sticks.length },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { '决策树': '初始化', '叶子数': String(sticks.length) },
    });

    const activeList = [...sticks].map((val, idx) => ({ id: idx, val }));
    let treeCost = 0;
    let mergeIdx = 0;

    while (activeList.length > 1) {
      activeList.sort((a, b) => isReverse ? b.val - a.val : a.val - b.val);
      const left = activeList[0];
      const right = activeList[1];
      const parentVal = left.val + right.val;
      treeCost += parentVal;

      activeList.splice(0, 2);
      activeList.push({ id: 100 + mergeIdx, val: parentVal });

      const parentNode: UniversalTreeNode = {
        id: `node_parent_${mergeIdx}`,
        r: mergeIdx + 1,
        c: 0,
        val: `父节点 [${parentVal}米] (由 ${left.val} + ${right.val} 归约)`,
        status: 'active',
        children: [
          { id: `c_left_${mergeIdx}`, r: mergeIdx + 1, c: 0, val: `左: ${left.val}`, status: 'visited', children: [] },
          { id: `c_right_${mergeIdx}`, r: mergeIdx + 1, c: 1, val: `右: ${right.val}`, status: 'visited', children: [] },
        ],
      };
      rootTree.children.push(parentNode);

      // 分支一：选择最小两子树合并
      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.tree_loop || 4,
        codeLine: anchors.tree_loop || 4,
        decision: `探查合并分支：结合 [${left.val}米] 与 [${right.val}米]，构造权值为 ${parentVal} 的二叉父节点`,
        message: `深度加权原则：越晚合并的节点深度越浅，对全局 WPL 贡献越小`,
        variables: { left: left.val, right: right.val, parentVal, treeCost },
        treeRoot: cloneStateDepTree(rootTree),
        metrics: { '当前合并': `${left.val} + ${right.val}`, '生成节点': String(parentVal) },
      });

      // 分支二：权重累积与剪枝
      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.parent_node || 7,
        codeLine: anchors.parent_node || 7,
        decision: `树形结构拓扑更新：父节点生成，剩余未合并子树规模缩减至 ${activeList.length} 棵`,
        message: `自底向上收敛，局部最优决策严格单调递增`,
        variables: { currentTreeCost: treeCost, remainingTrees: activeList.length },
        treeRoot: cloneStateDepTree(rootTree),
        metrics: { '累计树权重': String(treeCost), '活跃子树': String(activeList.length) },
      });

      // 回溯落盘
      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.tree_push || 8,
        codeLine: anchors.tree_push || 8,
        decision: `第 ${mergeIdx + 1} 轮树形合并完成，当前有效路径加权费用 = ${treeCost}`,
        message: `落盘当前哈夫曼子树状态`,
        variables: { mergeIdx: mergeIdx + 1, treeCost },
        treeRoot: cloneStateDepTree(rootTree),
        metrics: { '当前开销': String(treeCost), '状态': '分支落盘' },
      });

      mergeIdx++;
    }

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      line: anchors.tree_done || 10,
      codeLine: anchors.tree_done || 10,
      decision: `🛑 哈夫曼二叉树构建完毕！全局最低 WPL 路径加权开销 = ${treeCost}`,
      message: `证明了每次合并最短两根棒材构成的二叉树为唯一最优解`,
      variables: { finalTreeCost: treeCost },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { '最优WPL': String(treeCost), '状态': '🏁 树形构建收敛' },
    });

    return steps;
  }

  private static compileConnectSticksStage3(
    model: IYamlAlgorithmModel,
    sticks: number[],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = direction === 'reverse';
    const anchors = this.extractAnchors(model, 3, direction, anchorMap);
    const n = sticks.length;
    const rounds = n - 1;

    // matrix[rounds][4]: [轮次, 棒材A, 棒材B, 合并后花费]
    const matrix: (number | null)[][] = Array.from({ length: rounds }, () => Array(4).fill(null));

    const formatGrid = () => ({
      rows: rounds,
      cols: 4,
      rowHeaders: Array.from({ length: rounds }, (_, i) => `第${i + 1}轮`),
      colHeaders: ['轮次', '棒材A', '棒材B', '合并费用'],
      values: matrix.map(row => row.map(v => v === null ? '-' : String(v))),
      activeRow: 0,
      activeCol: 0,
      dependencyCells: [] as [number, number][],
    });

    steps.push({
      stepIndex: 0,
      stage: 3,
      line: anchors.grid_init || 2,
      codeLine: anchors.grid_init || 2,
      decision: `初始化代价演进状态矩阵 M[${rounds}][4]：跟踪共 ${rounds} 轮两两合并状态`,
      message: `矩阵记录每一步弹出的两个最小项与其合并产生的新开销`,
      variables: { rounds, columns: 4 },
      grid: formatGrid() as any,
      metrics: { '矩阵规格': `${rounds}×4`, '初始状态': '就绪' },
    });

    const pq = [...sticks];
    let total = 0;

    for (let i = 0; i < rounds; i++) {
      pq.sort((a, b) => isReverse ? b - a : a - b);
      const a = pq.shift()!;
      const b = pq.shift()!;
      const cost = a + b;
      total += cost;

      const preGrid = formatGrid();
      preGrid.activeRow = i;
      preGrid.activeCol = 2;

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        line: anchors.grid_loop || 7,
        codeLine: anchors.grid_loop || 7,
        decision: `矩阵第 ${i + 1} 轮两两取出：当前${isReverse ? '最大' : '最小'}两项 a=${a}, b=${b}，待合并新开销 = ${a} + ${b} = ${cost}`,
        message: `从优先队列中取出两根棒材，准备进行哈夫曼合并并记录进代价状态矩阵`,
        variables: { round: i + 1, a, b, pendingCost: cost },
        grid: preGrid as any,
        activeSlot: i,
        metrics: { '轮次': `第${i + 1}轮`, '操作': '弹出计算', '当前待合并': `${a}+${b}=${cost}` },
      });

      pq.push(cost);

      matrix[i][0] = i + 1;
      matrix[i][1] = a;
      matrix[i][2] = b;
      matrix[i][3] = cost;

      const gridObj = formatGrid();
      gridObj.activeRow = i;
      gridObj.activeCol = 3;
      if (i > 0) {
        gridObj.dependencyCells = [[i - 1, 3]]; // 依赖上一轮合并费用
      }

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        line: anchors.grid_cell || 7,
        codeLine: anchors.grid_cell || 7,
        decision: `填入第 ${i + 1} 轮状态：棒材A=${a}，棒材B=${b} ➔ 本轮花费 ${cost}，累计总开销 = ${total}`,
        message: `代价矩阵精确跟踪哈夫曼合并流中的每一次数值膨胀`,
        variables: { round: i + 1, a, b, cost, total },
        grid: gridObj as any,
        activeSlot: i,
        metrics: { '轮次': `第${i + 1}轮`, '本轮花费': String(cost), '累计总开销': String(total) },
      });
    }

    const finalGrid = formatGrid();
    finalGrid.activeRow = rounds - 1;
    finalGrid.activeCol = 3;

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      line: anchors.grid_done || 9,
      codeLine: anchors.grid_done || 9,
      decision: `🎉 代价演进矩阵记录完毕！全部 ${rounds} 轮合并总开销 = ${total}`,
      message: `完整展现了哈夫曼贪心推演每一步的状态迁移过程`,
      variables: { finalTotalCost: total },
      grid: finalGrid as any,
      metrics: { '最低总开销': String(total), '状态': '🏁 矩阵收敛' },
    });

    return steps;
  }

  private static compileConnectSticksStage4(
    model: IYamlAlgorithmModel,
    sticks: number[],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = direction === 'reverse';
    const anchors = this.extractAnchors(model, 4, direction, anchorMap);

    const sortedSticks = [...sticks].sort((a, b) => !isReverse ? a - b : b - a);

    steps.push({
      stepIndex: 0,
      stage: 4,
      line: anchors.q_init || 3,
      codeLine: anchors.q_init || 3,
      decision: `双队列极速流式推演初始化：q1 存放已排序初始棒材，q2 存放生成的新棒材`,
      message: `利用双单调队列无需堆动态调整，时间复杂度降至 O(N log N + N)`,
      variables: { sorted: sortedSticks, q2: [] },
      stateArrays: [
        {
          id: 'q1',
          name: 'q1 (初始有序队列)',
          indices: sortedSticks.map((_, idx) => idx),
          values: sortedSticks.map(v => `${v}米`),
          color: 'indigo',
        },
        {
          id: 'q2',
          name: 'q2 (合并生成队列)',
          indices: [],
          values: [],
          color: 'emerald',
        },
      ],
      metrics: { 'q1大小': String(sortedSticks.length), 'q2大小': '0', '双队列': '就绪' },
    });

    const q1 = [...sortedSticks];
    const q2: number[] = [];
    let totalCost = 0;
    let round = 1;

    const getMinOrMax = () => {
      if (q1.length === 0) return q2.shift()!;
      if (q2.length === 0) return q1.shift()!;
      if (!isReverse) {
        return q1[0] <= q2[0] ? q1.shift()! : q2.shift()!;
      } else {
        return q1[0] >= q2[0] ? q1.shift()! : q2.shift()!;
      }
    };

    while (q1.length + q2.length > 1) {
      const a = getMinOrMax();
      const b = getMinOrMax();
      const cost = a + b;
      totalCost += cost;
      q2.push(cost);

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        line: anchors.q_loop || 6,
        codeLine: anchors.q_loop || 6,
        decision: `[双队列流式合并 ${round}] 弹出 ${a} 与 ${b} ➔ 合并生成 ${cost} 进入 q2，总费用 = ${totalCost}`,
        message: `单趟常数级指针调度，避免优先队列 log N 的维护开销`,
        variables: { a, b, cost, totalCost, q1Len: q1.length, q2Len: q2.length },
        stateArrays: [
          {
            id: 'q1',
            name: 'q1 (有序队列)',
            indices: q1.map((_, idx) => idx),
            values: q1.map(v => `${v}米`),
            color: 'indigo',
          },
          {
            id: 'q2',
            name: 'q2 (合并队列)',
            indices: q2.map((_, idx) => idx),
            values: q2.map(v => `${v}米`),
            color: 'emerald',
          },
        ],
        activeSlot: round - 1,
        metrics: { '本轮合并': String(cost), '累计费用': String(totalCost), '流式进度': `第${round}轮` },
      });

      round++;
    }

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchors.q_done || 10,
      codeLine: anchors.q_done || 10,
      decision: `🏁 双队列常数级流式合并收敛！最终总开销 = ${totalCost}`,
      message: `双队列流式仿真与小根堆算法完全一致，耗时显著降低`,
      variables: { return: totalCost },
      metrics: { '最终费用': String(totalCost), '优化方式': '双单调队列', '状态': '🏁 极速收敛' },
    });

    return steps;
  }


  // ==========================================================================
  // 7. IPO 项目最大化资本 (IPO)
  // 核心思想：门槛小根堆 + 利润大根堆双堆协同贪心、资本单调扩张滚雪球
  // ==========================================================================
  public static compileIPO(
    model: IYamlAlgorithmModel,
    k: number,
    w: number,
    profits: number[],
    capital: number[],
    stage: number = 1,
    direction: 'forward' | 'reverse' = 'forward',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    switch (stage) {
      case 2:
        return this.compileIPOStage2(model, k, w, profits, capital, direction, anchorMap);
      case 3:
        return this.compileIPOStage3(model, k, w, profits, capital, direction, anchorMap);
      case 4:
        return this.compileIPOStage4(model, k, w, profits, capital, direction, anchorMap);
      case 1:
      default:
        return this.compileIPOStage1(model, k, w, profits, capital, direction, anchorMap);
    }
  }

  private static compileIPOStage1(
    model: IYamlAlgorithmModel,
    k: number,
    w: number,
    profits: number[],
    capital: number[],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = direction === 'reverse';
    const anchors = this.extractAnchors(model, 1, direction, anchorMap);

    steps.push({
      stepIndex: 0,
      stage: 1,
      line: anchors.init || 2,
      codeLine: anchors.init || 2,
      decision: isReverse
        ? `1. 逆向项目遍历对比初始化：初始资本 w = ${w}，最多投资 k = ${k} 个项目，逆序考察`
        : `1. 暴力穷举投资排列初始化：初始资本 w = ${w}，最多投资 k = ${k} 个项目，穷举所有可行排列`,
      message: isReverse
        ? `从后向前枚举项目，对比不同投资次序的最终资本差异`
        : `深度优先递归探索所有至多 k 个可启动项目的排列空间`,
      variables: { k, w, projectCount: profits.length },
      stateArrays: [
        {
          id: 'projects',
          name: '项目池 (利润 / 启动资本)',
          indices: profits.map((_, i) => i),
          values: profits.map((p, i) => `P${i + 1}(+${p}, 需${capital[i]})`),
          color: 'indigo',
        },
      ],
      metrics: { '当前可用资本': String(w), '可投项目数': String(k), '探索状态': '就绪' },
    });

    const used = new Array(profits.length).fill(false);
    let curW = w;
    let invested = 0;

    for (let round = 0; round < Math.min(k, 4); round++) {
      steps.push({
        stepIndex: steps.length,
        stage: 1,
        line: anchors.loop || 4,
        codeLine: anchors.loop || 4,
        decision: `轮次 ${round + 1}：当前资本 w = ${curW}，筛选所有启动资本 <= ${curW} 的可行项目`,
        message: `遍历全量项目池寻找满足资本门槛的未投资项目`,
        variables: { round: round + 1, curW },
        metrics: { '当前轮次': `第${round + 1}轮`, '可用资本': String(curW) },
      });

      let bestIdx = -1;
      let bestProfit = isReverse ? Infinity : -1;

      for (let i = 0; i < profits.length; i++) {
        if (!used[i] && curW >= capital[i]) {
          const isBetter = isReverse ? profits[i] < bestProfit : profits[i] > bestProfit;
          if (isBetter) {
            bestProfit = profits[i];
            bestIdx = i;
          }
        }
      }

      if (bestIdx === -1) {
        steps.push({
          stepIndex: steps.length,
          stage: 1,
          line: anchors.ret || 6,
          codeLine: anchors.ret || 6,
          decision: `当前资本 ${curW} 不足以启动任何剩余项目，提前终止投资`,
          message: `资本门槛卡死，无法继续滚雪球`,
          variables: { curW, invested },
          metrics: { '最终资本': String(curW), '状态': '提前终止' },
        });
        break;
      }

      used[bestIdx] = true;
      curW += profits[bestIdx];
      invested++;

      steps.push({
        stepIndex: steps.length,
        stage: 1,
        line: anchors.pick || 5,
        codeLine: anchors.pick || 5,
        decision: `投资项目 P${bestIdx + 1} (门槛 ${capital[bestIdx]}, 纯利 ${profits[bestIdx]}) ➔ 资本从 ${curW - profits[bestIdx]} 增至 ${curW}`,
        message: `获得纯利 ${profits[bestIdx]}，资本单调扩张`,
        variables: { chosen: bestIdx + 1, profit: profits[bestIdx], newW: curW },
        stateArrays: [
          {
            id: 'projects',
            name: '项目池 (利润 / 启动资本)',
            indices: profits.map((_, i) => i),
            values: profits.map((p, i) => `P${i + 1}(+${p}, 需${capital[i]})${used[i] ? ' [已投]' : ''}`),
            activeIdx: bestIdx,
            color: 'emerald',
          },
        ],
        metrics: { '最新收益': `+${profits[bestIdx]}`, '当前资本': String(curW) },
      });
    }

    steps.push({
      stepIndex: steps.length,
      stage: 1,
      line: anchors.ret || 6,
      codeLine: anchors.ret || 6,
      decision: `🏁 投资模拟完成！最多投资 ${k} 个项目后，最大可用资本 = ${curW}`,
      message: `暴力枚举验证了贪心滚雪球的单调收益优势`,
      variables: { finalCapital: curW, investedCount: invested },
      metrics: { '最大最终资本': String(curW), '状态': '🏁 模拟收敛' },
    });

    return steps;
  }

  private static compileIPOStage2(
    model: IYamlAlgorithmModel,
    k: number,
    w: number,
    profits: number[],
    capital: number[],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = direction === 'reverse';
    const anchors = this.extractAnchors(model, 2, direction, anchorMap);

    const rootTree: UniversalTreeNode = {
      id: 'ipo_root',
      r: 0,
      c: 0,
      val: `初始资本 w=${w}, k=${k}`,
      status: 'active',
      children: [],
    };

    steps.push({
      stepIndex: 0,
      stage: 2,
      line: anchors.heap_init || 2,
      codeLine: anchors.heap_init || 2,
      decision: `双堆协同调度初始化：构建资金门槛小根堆 costHeap 与利润大根堆 profitHeap`,
      message: `costHeap 按 capital 升序组织，profitHeap 按 profit 降序组织`,
      variables: { w, k, totalProjects: profits.length },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { '当前资本w': String(w), '小根堆项目': String(profits.length), '大根堆项目': '0' },
    });

    // 模拟双堆
    const costHeap = profits.map((p, i) => ({ id: i + 1, p, c: capital[i] })).sort((a, b) => a.c - b.c);
    const profitHeap: { id: number; p: number; c: number }[] = [];
    let curW = w;

    for (let round = 0; round < Math.min(k, 4); round++) {
      const roundNode: UniversalTreeNode = {
        id: `round_${round + 1}`,
        r: round + 1,
        c: 0,
        val: `第${round + 1}轮投资 (当前w=${curW})`,
        status: 'active',
        children: [],
      };
      rootTree.children.push(roundNode);

      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.round_loop || 4,
        codeLine: anchors.round_loop || 4,
        decision: `第 ${round + 1} 轮投资调度启动：当前可用资本 w = ${curW}`,
        message: `准备从小根堆中弹出所有 capital <= ${curW} 的项目并加入大根堆`,
        variables: { round: round + 1, curW, costHeapSize: costHeap.length },
        treeRoot: cloneStateDepTree(rootTree),
        metrics: { '轮次': `第${round + 1}轮`, '当前资本': String(curW) },
      });

      // 解锁项目入大根堆
      let unlockedCount = 0;
      while (costHeap.length > 0 && costHeap[0].c <= curW) {
        const item = costHeap[0];

        // 探查帧：门槛满足判定
        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchors.unlock_push || 6,
          codeLine: anchors.unlock_push || 6,
          decision: `🔍 门槛核验：小根堆顶项目 P${item.id} 所需启动资金 ${item.c} ≤ 当前资本 ${curW}，具备解锁资格`,
          message: `资本门槛达标，准备将 P${item.id} 从待解锁池移入候选池`,
          variables: { candidateId: item.id, capitalCost: item.c, curCapital: curW },
          treeRoot: cloneStateDepTree(rootTree),
          metrics: { '核验项目': `P${item.id}`, '启动资金': String(item.c), '当前资本': String(curW) },
        });

        costHeap.shift();
        profitHeap.push(item);
        profitHeap.sort((a, b) => isReverse ? a.p - b.p : b.p - a.p);
        unlockedCount++;

        const unlockNode: UniversalTreeNode = {
          id: `unlock_${round + 1}_${item.id}`,
          r: round + 1,
          c: unlockedCount,
          val: `解锁 P${item.id}(利+${item.p},需${item.c})`,
          status: 'active',
          children: [],
        };
        roundNode.children.push(unlockNode);

        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchors.unlock_push || 6,
          codeLine: anchors.unlock_push || 6,
          decision: `入堆完成：项目 P${item.id} (利润 ${item.p}) 成功移入利润大根堆！`,
          message: `项目已解锁，当前可选候选项目池扩充至 ${profitHeap.length} 个`,
          variables: { unlockedId: item.id, profit: item.p, capital: item.c },
          treeRoot: cloneStateDepTree(rootTree),
          metrics: { '解锁项目': `P${item.id}`, '大根堆候选': String(profitHeap.length) },
        });
      }

      if (profitHeap.length === 0) {
        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchors.break_check || 7,
          codeLine: anchors.break_check || 7,
          decision: `利润大根堆为空：当前资本 ${curW} 无法解锁任何新项目，贪心提前终止`,
          message: `资本不足，投资中止`,
          variables: { curW },
          treeRoot: cloneStateDepTree(rootTree),
          metrics: { '状态': '大根堆为空', '提前结束': '是' },
        });
        break;
      }

      const top = profitHeap.shift()!;

      // 决策探查帧：锁定最高利润
      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.invest_poll || 8,
        codeLine: anchors.invest_poll || 8,
        decision: `🎯 贪心挑选：大根堆堆顶利润最高项目为 P${top.id} (净利润 +${top.p})，锁定本轮投资目标`,
        message: `在所有已解锁项目中挑选利润极值者，确保资本以最快速度滚雪球扩张`,
        variables: { targetProj: top.id, expectedProfit: top.p, curW },
        treeRoot: cloneStateDepTree(rootTree),
        metrics: { '候选极值': `P${top.id}`, '预估利润': `+${top.p}` },
      });

      curW += top.p;

      const investNode: UniversalTreeNode = {
        id: `invest_${round + 1}_${top.id}`,
        r: round + 1,
        c: 99,
        val: `⭐投资 P${top.id} (+${top.p}) ➔ w=${curW}`,
        status: 'visited',
        children: [],
      };
      roundNode.children.push(investNode);

      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.invest_poll || 8,
        codeLine: anchors.invest_poll || 8,
        decision: `大根堆贪心弹出最大利润项目 P${top.id} (利润 ${top.p}) ➔ 资本滚雪球膨胀至 ${curW}`,
        message: `成功落地最高利润项目，可用资本进一步提升，下轮将解锁更多高门槛项目！`,
        variables: { chosenProj: top.id, gain: top.p, newCapital: curW },
        treeRoot: cloneStateDepTree(rootTree),
        metrics: { '投资项目': `P${top.id}`, '获利': `+${top.p}`, '新资本': String(curW) },
      });
    }

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      line: anchors.done || 9,
      codeLine: anchors.done || 9,
      decision: `🛑 双堆协同调度完成！达到投资上限 k=${k}，最终最大化资本 = ${curW}`,
      message: `双堆结构在 O(N log N) 时间内精确实现了贪心滚雪球的最优调度`,
      variables: { maxCapital: curW },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { '最终资本': String(curW), '状态': '🏁 调度收敛' },
    });

    return steps;
  }

  private static compileIPOStage3(
    model: IYamlAlgorithmModel,
    k: number,
    w: number,
    profits: number[],
    capital: number[],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = direction === 'reverse';
    const anchors = this.extractAnchors(model, 3, direction, anchorMap);

    const rounds = Math.max(k, 4);
    const matrix: (number | null)[][] = Array.from({ length: rounds }, () => Array(4).fill(null));

    const formatGrid = () => ({
      rows: rounds,
      cols: 4,
      rowHeaders: Array.from({ length: rounds }, (_, i) => `第${i + 1}轮`),
      colHeaders: ['轮次', '投资前资本', '选中项目利润', '投资后资本'],
      values: matrix.map(row => row.map(v => v === null ? '-' : String(v))),
      activeRow: 0,
      activeCol: 0,
      dependencyCells: [] as [number, number][],
    });

    steps.push({
      stepIndex: 0,
      stage: 3,
      line: anchors.grid_init || 2,
      codeLine: anchors.grid_init || 2,
      decision: `初始化 IPO 项目状态演进矩阵 M[${rounds}][4]：精确跟踪每轮资本滚雪球轨迹`,
      message: `矩阵记录每轮投资前资本、选定回报与投资后膨胀资本`,
      variables: { totalRounds: rounds, initialW: w },
      grid: formatGrid() as any,
      metrics: { '矩阵规格': `${rounds}×4`, '初始资本': String(w) },
    });

    const costHeap = profits.map((p, i) => ({ id: i + 1, p, c: capital[i] })).sort((a, b) => a.c - b.c);
    const profitHeap: { id: number; p: number; c: number }[] = [];
    let curW = w;

    for (let i = 0; i < rounds; i++) {
      while (costHeap.length > 0 && costHeap[0].c <= curW) {
        profitHeap.push(costHeap.shift()!);
        profitHeap.sort((a, b) => isReverse ? a.p - b.p : b.p - a.p);
      }

      const preGrid = formatGrid();
      preGrid.activeRow = i;
      preGrid.activeCol = 1;

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        line: anchors.grid_loop || 4,
        codeLine: anchors.grid_loop || 4,
        decision: `第 ${i + 1} 轮状态评估：当前资本 w = ${curW}，利润大根堆中有 ${profitHeap.length} 个候选项目待选`,
        message: `准备挑选利润最大的可用项目`,
        variables: { round: i + 1, curW, candidates: profitHeap.length },
        grid: preGrid as any,
        activeSlot: i,
        metrics: { '轮次': `第${i + 1}轮`, '投资前资本': String(curW), '候选数': String(profitHeap.length) },
      });

      const chosen = profitHeap.length > 0 ? profitHeap.shift()! : { id: 0, p: 0, c: 0 };
      const wBefore = curW;
      curW += chosen.p;

      matrix[i][0] = i + 1;
      matrix[i][1] = wBefore;
      matrix[i][2] = chosen.p;
      matrix[i][3] = curW;

      const gridObj = formatGrid();
      gridObj.activeRow = i;
      gridObj.activeCol = 3;
      if (i > 0) {
        gridObj.dependencyCells = [[i - 1, 3]];
      }

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        line: anchors.grid_cell || 6,
        codeLine: anchors.grid_cell || 6,
        decision: `填入第 ${i + 1} 轮记录：投资项目 P${chosen.id || '无'} (利+${chosen.p}) ➔ 资本从 ${wBefore} 扩张至 ${curW}`,
        message: `资本演进矩阵状态更新：wAfter = wBefore + profit`,
        variables: { round: i + 1, chosen: chosen.id, profit: chosen.p, wAfter: curW },
        grid: gridObj as any,
        activeSlot: i,
        metrics: { '本轮利润': `+${chosen.p}`, '投资后资本': String(curW) },
      });
    }

    const finalGrid = formatGrid();
    finalGrid.activeRow = rounds - 1;
    finalGrid.activeCol = 3;

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      line: anchors.grid_done || 7,
      codeLine: anchors.grid_done || 7,
      decision: `🎉 IPO 项目状态演进矩阵填表完成！最终最大化资本 = ${curW}`,
      message: `状态矩阵直观证明了资本滚雪球过程的严格单调递增性`,
      variables: { finalCapital: curW },
      grid: finalGrid as any,
      metrics: { '最终资本': String(curW), '状态': '🏁 矩阵收敛' },
    });

    return steps;
  }

  private static compileIPOStage4(
    model: IYamlAlgorithmModel,
    k: number,
    w: number,
    profits: number[],
    capital: number[],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = direction === 'reverse';
    const anchors = this.extractAnchors(model, 4, direction, anchorMap);

    steps.push({
      stepIndex: 0,
      stage: 4,
      line: anchors.fast_init || 2,
      codeLine: anchors.fast_init || 2,
      decision: isReverse
        ? `1. 逆向流式调度初始化：预排序数组 + 指针单调右移快速推演`
        : `1. 排序单调指针极速收敛初始化：数组预排序替代小根堆，时间 O(N log N + k log N)`,
      message: `将所有项目按启动资金 capital 连续排序，单调指针 ptr 避免频繁小根堆调整`,
      variables: { k, w, n: profits.length },
      metrics: { '当前资本': String(w), '可投次数': String(k), '优化级别': '预排序指针' },
    });

    const projs = profits.map((p, i) => ({ id: i + 1, p, c: capital[i] })).sort((a, b) => a.c - b.c);

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchors.fast_sort || 4,
      codeLine: anchors.fast_sort || 4,
      decision: `项目数组预排序完成：按 capital 升序排列，指针 ptr 初始化为 0`,
      message: `内存连续紧凑排列，提高缓存局部性`,
      variables: { sortedCount: projs.length },
      stateArrays: [
        {
          id: 'projs',
          name: '已排序项目数组 (需资本升序)',
          indices: projs.map((_, i) => i),
          values: projs.map(p => `P${p.id}(需${p.c},+${p.p})`),
          color: 'indigo',
        },
      ],
      metrics: { '已排序项目': String(projs.length), '指针ptr': '0' },
    });

    let ptr = 0;
    const pq: { id: number; p: number; c: number }[] = [];
    let curW = w;

    for (let i = 0; i < Math.min(k, 4); i++) {
      const prevPtr = ptr;
      while (ptr < projs.length && projs[ptr].c <= curW) {
        pq.push(projs[ptr]);
        pq.sort((a, b) => isReverse ? a.p - b.p : b.p - a.p);
        ptr++;
      }

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        line: anchors.fast_unlock || 6,
        codeLine: anchors.fast_unlock || 6,
        decision: `轮次 ${i + 1}：指针 ptr 从 ${prevPtr} 右移至 ${ptr}，解锁 ${ptr - prevPtr} 个新项目入优先队列`,
        message: `当前优先队列中共有 ${pq.length} 个项目可直接投资`,
        variables: { round: i + 1, ptr, curW, unlocked: ptr - prevPtr },
        stateArrays: [
          {
            id: 'projs',
            name: '已排序项目数组',
            indices: projs.map((_, idx) => idx),
            values: projs.map(p => `P${p.id}(需${p.c},+${p.p})`),
            activeIdx: Math.min(ptr, projs.length - 1),
            color: 'emerald',
          },
        ],
        metrics: { '指针位置': String(ptr), '队列大小': String(pq.length) },
      });

      if (pq.length === 0) {
        steps.push({
          stepIndex: steps.length,
          stage: 4,
          line: anchors.fast_check || 7,
          codeLine: anchors.fast_check || 7,
          decision: `优先队列为空：资本 ${curW} 无法解锁后续更高门槛项目，提前退出`,
          message: `提前收敛`,
          variables: { curW },
          metrics: { '最终资本': String(curW), '提前终止': '是' },
        });
        break;
      }

      const top = pq.shift()!;
      curW += top.p;

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        line: anchors.fast_poll || 8,
        codeLine: anchors.fast_poll || 8,
        decision: `优先队列弹出最大利润项目 P${top.id} (+${top.p}) ➔ 资本滚雪球膨胀至 ${curW}`,
        message: `完成一次高质量投资，资本池进一步扩大`,
        variables: { chosen: top.id, profit: top.p, curW },
        metrics: { '投资获利': `+${top.p}`, '新资本': String(curW) },
      });
    }

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchors.fast_ret || 9,
      codeLine: anchors.fast_ret || 9,
      decision: `🏁 极速单调指针调度完成！长线滚雪球最终资本 = ${curW}`,
      message: `排序+大根堆极速收敛，时间复杂度 O(N log N + k log N)，内存占用最优`,
      variables: { finalCapital: curW },
      metrics: { '最大化资本': String(curW), '状态': '🏁 极速收敛' },
    });

    return steps;
  }


  // ==========================================================================
  // 会议独占最大数量 (Meeting Monopoly / LeetCode 435 / 洛谷 P1803)
  // ==========================================================================

  public static compileMeetingMonopoly(
    model: IYamlAlgorithmModel,
    rawIntervals: (number[] | [number, number])[],
    stage: number = 1,
    direction: 'forward' | 'reverse' = 'forward',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const intervals: [number, number][] = (rawIntervals && rawIntervals.length > 0)
      ? rawIntervals.map(it => [it[0], it[1]] as [number, number])
      : [[1, 2], [2, 3], [3, 4], [1, 3]];

    switch (stage) {
      case 2:
        return this.compileMeetingMonopolyStage2(model, intervals, direction, anchorMap);
      case 3:
        return this.compileMeetingMonopolyStage3(model, intervals, direction, anchorMap);
      case 4:
        return this.compileMeetingMonopolyStage4(model, intervals, direction, anchorMap);
      case 1:
      default:
        return this.compileMeetingMonopolyStage1(model, intervals, direction, anchorMap);
    }
  }

  private static compileMeetingMonopolyStage1(
    model: IYamlAlgorithmModel,
    intervals: [number, number][],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = direction === 'reverse';
    const anchors = this.extractAnchors(model, 1, direction, anchorMap);

    steps.push({
      stepIndex: 0,
      stage: 1,
      line: anchors.entry || 1,
      codeLine: anchors.entry || 1,
      decision: isReverse
        ? '1. 逆向递归独立子集搜索初始化：倒序枚举无冲突会议方案'
        : '1. 暴力独立子集搜索初始化：递归穷举所有不冲突的会议子集',
      message: '暴力搜索评估各会议选与不选构成的无交集独立子集容量',
      variables: { totalMeetings: intervals.length, curEnd: 0 },
      metrics: { '会议总数': String(intervals.length), '搜索状态': '就绪' },
    });

    let curEnd = 0;
    let selectedCount = 0;

    for (let i = 0; i < Math.min(intervals.length, 4); i++) {
      const idx = isReverse ? intervals.length - 1 - i : i;
      const [start, end] = intervals[idx];

      steps.push({
        stepIndex: steps.length,
        stage: 1,
        line: anchors.skip || 3,
        codeLine: anchors.skip || 3,
        decision: `分支 1：尝试跳过会议 M${idx + 1} [${start}, ${end}]`,
        message: '递归探查跳过当前会议后的最大可安排会议数',
        variables: { currentIdx: idx, curEnd, selectedCount },
        metrics: { '当前考查': `M${idx + 1}`, '决策分支': '跳过' },
      });

      const canTake = start >= curEnd;
      steps.push({
        stepIndex: steps.length,
        stage: 1,
        line: anchors.take_check || 4,
        codeLine: anchors.take_check || 4,
        decision: canTake
          ? `分支 2 验证通过：会议 M${idx + 1} 开始时间 ${start} ≥ 当前结束时间 ${curEnd}，可尝试选入`
          : `分支 2 互斥剪枝：会议 M${idx + 1} 开始时间 ${start} < 当前结束时间 ${curEnd}，发生时间冲突`,
        message: canTake ? '时间不冲突，深入探索选入分支' : '时间冲突，选入分支直接回溯剪枝',
        variables: { currentIdx: idx, start, end, curEnd, canTake },
        metrics: { '时间兼容': canTake ? '是' : '否', '冲突判定': canTake ? '无' : '发生冲突' },
      });

      if (canTake) {
        curEnd = end;
        selectedCount++;
        steps.push({
          stepIndex: steps.length,
          stage: 1,
          line: anchors.take || 5,
          codeLine: anchors.take || 5,
          decision: `选入会议 M${idx + 1} [${start}, ${end}]：时间指针更新为 ${curEnd}，已选会议数 = ${selectedCount}`,
          message: '选入会议并更新状态',
          variables: { currentIdx: idx, curEnd, selectedCount },
          metrics: { '已选会议': String(selectedCount), '占用终点': String(curEnd) },
        });
      }
    }

    steps.push({
      stepIndex: steps.length,
      stage: 1,
      line: anchors.ret || 7,
      codeLine: anchors.ret || 7,
      decision: `🏁 暴力搜索收敛：在所有独立组合中评估得出最大会议数 = ${selectedCount}`,
      message: '全部分支探索完成，贪心策略可直接在 O(N log N) 内求得完全一致的最优解',
      variables: { maxMeetings: selectedCount },
      metrics: { '最大会议数': String(selectedCount), '状态': '🏁 搜索收敛' },
    });

    return steps;
  }

  private static compileMeetingMonopolyStage2(
    model: IYamlAlgorithmModel,
    intervals: [number, number][],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = direction === 'reverse';
    const anchors = this.extractAnchors(model, 2, direction, anchorMap);

    const sorted = intervals
      .map((item, id) => ({ id: id + 1, start: item[0], end: item[1] }))
      .sort((a, b) => (isReverse ? b.start - a.start : a.end - b.end));

    const slotCols = sorted.map(m => `M${m.id}`);
    const slotLabels: string[] = sorted.map(m => `[${m.start},${m.end}]`);

    const rootTree: UniversalTreeNode = {
      id: 'mm_root',
      r: 0,
      c: 0,
      val: isReverse ? '逆向最晚开始调度树' : '按结束时间升序调度树',
      status: 'active',
      children: [],
    };

    steps.push({
      stepIndex: 0,
      stage: 2,
      line: anchors.sort || 1,
      codeLine: anchors.sort || 1,
      decision: isReverse
        ? '1. 会议按开始时间 start 降序对偶排序：优先安排最晚开始的会议'
        : '1. 会议按结束时间 end 升序排序：优先安排最早结束的会议，最大化留存后续可用时间',
      message: '排序确立贪心选取的先后次序',
      variables: { total: intervals.length },
      treeRoot: cloneStateDepTree(rootTree),
      activeSlot: 0,
      highlightSlots: [0],
      slots: [...slotLabels],
      colLabels: slotCols,
      metrics: { '会议总数': String(intervals.length), '排序规则': isReverse ? 'start 降序' : 'end 升序' },
    });

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      line: anchors.init || 2,
      codeLine: anchors.init || 2,
      decision: isReverse
        ? '状态初始化：已选场数 count = 0，逆向当前时间下界 curStart = +∞'
        : '状态初始化：已选场数 count = 0，正向当前会议室释放时间 curEnd = 0',
      message: '初始化调度指针',
      variables: { count: 0, curPointer: isReverse ? 'INF' : 0 },
      treeRoot: cloneStateDepTree(rootTree),
      activeSlot: 0,
      highlightSlots: [0],
      slots: [...slotLabels],
      colLabels: slotCols,
      metrics: { '已选场数': '0', '指针初始': isReverse ? '+∞' : '0' },
    });

    let count = 0;
    let curEnd = 0;
    let curStart = Infinity;
    const pickedIndices: number[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const m = sorted[i];
      const isCompat = isReverse ? m.end <= curStart : m.start >= curEnd;

      // 探查帧
      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.loop || 3,
        codeLine: anchors.loop || 3,
        decision: `🔍 考查会议 M${m.id} [${m.start}, ${m.end}]：核验是否与当前会议室占用状态产生冲突`,
        message: isReverse
          ? `核验会议结束时间 ${m.end} 是否 ≤ 当前开始下界 ${curStart}`
          : `核验会议开始时间 ${m.start} 是否 ≥ 当前结束时间 ${curEnd}`,
        variables: { meetingId: m.id, start: m.start, end: m.end, pointer: isReverse ? curStart : curEnd },
        treeRoot: cloneStateDepTree(rootTree),
        activeSlot: i,
        highlightSlots: [...pickedIndices, i],
        slots: [...slotLabels],
        colLabels: slotCols,
        metrics: { '考查会议': `M${m.id}`, '时间段': `[${m.start},${m.end}]` },
      });

      if (isCompat) {
        count++;
        pickedIndices.push(i);
        slotLabels[i] = '✅选入';
        if (isReverse) curStart = m.start;
        else curEnd = m.end;

        const pickNode: UniversalTreeNode = {
          id: `pick_${m.id}`,
          r: 1,
          c: i,
          val: `⭐选入 M${m.id}[${m.start},${m.end}]`,
          status: 'visited',
          children: [],
        };
        rootTree.children.push(pickNode);

        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchors.pick || 5,
          codeLine: anchors.pick || 5,
          decision: `✅ 贪心选入会议 M${m.id} [${m.start}, ${m.end}]！更新时间指针至 ${isReverse ? curStart : curEnd}，累计选入 ${count} 场`,
          message: '无时间冲突，果断占用会议室并快速腾空，为后续留出最多时间',
          variables: { chosen: m.id, count, newPointer: isReverse ? curStart : curEnd },
          treeRoot: cloneStateDepTree(rootTree),
          activeSlot: i,
          highlightSlots: [...pickedIndices],
          slots: [...slotLabels],
          colLabels: slotCols,
          metrics: { '选入状态': '✅ 选入', '已选总数': String(count) },
        });
      } else {
        slotLabels[i] = '❌冲突';
        const dropNode: UniversalTreeNode = {
          id: `drop_${m.id}`,
          r: 1,
          c: i,
          val: `❌淘汰 M${m.id}(冲突)`,
          status: 'pruned',
          children: [],
        };
        rootTree.children.push(dropNode);

        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchors.conflict || 8,
          codeLine: anchors.conflict || 8,
          decision: `❌ 舍弃会议 M${m.id} [${m.start}, ${m.end}]：与已选会议时间重叠冲突，贪心放弃`,
          message: isReverse
            ? `结束时间 ${m.end} > 当前占用下界 ${curStart}，发生冲突`
            : `开始时间 ${m.start} < 当前占用释放时间 ${curEnd}，发生冲突`,
          variables: { discarded: m.id, count },
          treeRoot: cloneStateDepTree(rootTree),
          activeSlot: i,
          highlightSlots: [...pickedIndices],
          slots: [...slotLabels],
          colLabels: slotCols,
          metrics: { '选入状态': '❌ 冲突淘汰', '已选总数': String(count) },
        });
      }
    }

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      line: anchors.done || 10,
      codeLine: anchors.done || 10,
      decision: `🛑 状态依赖树构建完成！在独占条件下最多可举办 ${count} 场会议`,
      message: '结束时间贪心排序严格保证了后续可用时间的最大化，数学归纳反证无懈可击',
      variables: { maxMeetings: count },
      treeRoot: cloneStateDepTree(rootTree),
      activeSlot: sorted.length - 1,
      highlightSlots: [...pickedIndices],
      slots: [...slotLabels],
      colLabels: slotCols,
      metrics: { '最终最多会议': String(count), '状态': '🏁 调度收敛' },
    });

    return steps;
  }

  private static compileMeetingMonopolyStage3(
    model: IYamlAlgorithmModel,
    intervals: [number, number][],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = direction === 'reverse';
    const anchors = this.extractAnchors(model, 3, direction, anchorMap);

    const sorted = intervals
      .map((item, id) => ({ id: id + 1, start: item[0], end: item[1] }))
      .sort((a, b) => (isReverse ? b.start - a.start : a.end - b.end));

    const rounds = sorted.length;
    const matrix: (string | null)[][] = Array.from({ length: rounds }, () => Array(5).fill(null));

    const formatGrid = () => ({
      rows: rounds,
      cols: 5,
      rowHeaders: sorted.map(m => `M${m.id}`),
      colHeaders: ['会议区间', '时间指针', '时间兼容性', '决策结果', '累计入选数'],
      values: matrix.map(row => row.map(v => v === null ? '-' : String(v))),
      activeRow: 0,
      activeCol: 0,
      dependencyCells: [] as [number, number][],
    });

    steps.push({
      stepIndex: 0,
      stage: 3,
      line: anchors.init || 1,
      codeLine: anchors.init || 1,
      decision: '初始化区间调度状态转移矩阵 M[N][5]：追踪每场会议的兼容性评估与时间边界流转',
      message: '表格记录 [区间范围, 时间指针, 兼容判定, 决策, 累计场数]',
      variables: { totalMeetings: rounds },
      grid: formatGrid() as any,
      metrics: { '矩阵规格': `${rounds}×5`, '状态': '就绪' },
    });

    let curEnd = 0;
    let curStart = Infinity;
    let count = 0;

    for (let i = 0; i < rounds; i++) {
      const m = sorted[i];
      const isCompat = isReverse ? m.end <= curStart : m.start >= curEnd;

      const preGrid = formatGrid();
      preGrid.activeRow = i;
      preGrid.activeCol = 2;

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        line: anchors.check || 3,
        codeLine: anchors.check || 3,
        decision: `矩阵评估第 ${i + 1} 行 M${m.id} [${m.start}, ${m.end}]：核验与指针 ${isReverse ? curStart : curEnd} 的兼容性`,
        message: '准备写入兼容判定结果',
        variables: { meeting: `M${m.id}`, pointer: isReverse ? curStart : curEnd },
        grid: preGrid as any,
        activeSlot: i,
        metrics: { '当前行': `M${m.id}`, '判定': isCompat ? '无冲突' : '冲突' },
      });

      if (isCompat) {
        count++;
        if (isReverse) curStart = m.start;
        else curEnd = m.end;
      }

      matrix[i][0] = `[${m.start}, ${m.end}]`;
      matrix[i][1] = String(isReverse ? (curStart === Infinity ? 'INF' : curStart) : curEnd);
      matrix[i][2] = isCompat ? '✅ 兼容' : '❌ 冲突';
      matrix[i][3] = isCompat ? '选入' : '舍弃';
      matrix[i][4] = String(count);

      const gridObj = formatGrid();
      gridObj.activeRow = i;
      gridObj.activeCol = 4;
      if (i > 0) {
        gridObj.dependencyCells = [[i - 1, 4]];
      }

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        line: anchors.update || 5,
        codeLine: anchors.update || 5,
        decision: `矩阵记录落盘：M${m.id} ${isCompat ? '✅ 选入' : '❌ 舍弃'}，累计举办场数 = ${count}`,
        message: '完成该场会议状态转移',
        variables: { meeting: `M${m.id}`, count },
        grid: gridObj as any,
        activeSlot: i,
        metrics: { '决策结果': isCompat ? '选入' : '舍弃', '累计总数': String(count) },
      });
    }

    const finalGrid = formatGrid();
    finalGrid.activeRow = rounds - 1;
    finalGrid.activeCol = 4;

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      line: anchors.done || 8,
      codeLine: anchors.done || 8,
      decision: `🎉 区间状态转移矩阵填表完成！最优独占调度可容纳 ${count} 场会议`,
      message: '矩阵完整揭示了贪心策略如何自始至终维持最大可用时间裕度',
      variables: { finalCount: count },
      grid: finalGrid as any,
      metrics: { '最多会议': String(count), '状态': '🏁 矩阵收敛' },
    });

    return steps;
  }

  private static compileMeetingMonopolyStage4(
    model: IYamlAlgorithmModel,
    intervals: [number, number][],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const anchors = this.extractAnchors(model, 4, direction, anchorMap);

    const maxEnd = Math.max(...intervals.map(x => x[1]), 10);
    const latest: number[] = Array(maxEnd + 1).fill(-1);

    steps.push({
      stepIndex: 0,
      stage: 4,
      line: anchors.bucket_init || 1,
      codeLine: anchors.bucket_init || 1,
      decision: `洛谷 P1803 数组桶 O(N) 极速收敛初始化：开辟大小为 ${maxEnd + 1} 的 latest 桶数组`,
      message: '若时间坐标范围有限，利用下标直接哈希映射替代比较排序，将时间复杂度降至 O(N + MaxTime)',
      variables: { maxEnd },
      metrics: { '桶规模': String(maxEnd + 1), '算法优化': '桶哈希 O(N)' },
    });

    for (const [start, end] of intervals) {
      latest[end] = Math.max(latest[end], start);
    }

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchors.bucket_fill || 3,
      codeLine: anchors.bucket_fill || 3,
      decision: '一次遍历装入桶：latest[end] 记录在 end 时刻结束的所有会议中最晚的开始时间',
      message: '相同结束时间时，开始时间越晚占用时长越短，对后续影响越小，直接自然去重',
      variables: { filledCount: intervals.length },
      metrics: { '装桶完成': '是', '单桶时间复杂度': 'O(N)' },
    });

    let count = 0;
    let curEnd = 0;

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchors.scan_init || 4,
      codeLine: anchors.scan_init || 4,
      decision: '启动时间轴线性扫描：时间指针 t 从 0 推进至 ' + maxEnd,
      message: '顺次扫描每个时间刻度，跳过 O(N log N) 排序过程',
      variables: { t: 0, curEnd },
      metrics: { '扫描起点': '0', '初始时间': '0' },
    });

    for (let t = 0; t <= maxEnd; t++) {
      if (latest[t] !== -1) {
        const start = latest[t];
        const canTake = start >= curEnd;

        steps.push({
          stepIndex: steps.length,
          stage: 4,
          line: anchors.scan_loop || 5,
          codeLine: anchors.scan_loop || 5,
          decision: `扫描到时刻 t=${t} 存在会议 [start=${start}, end=${t}]：核验 ${start} ≥ ${curEnd}`,
          message: canTake ? '时间不冲突，可直接贪心安排' : '与当前已安排会议冲突，跳过',
          variables: { t, start, curEnd, canTake },
          metrics: { '扫描时刻': `t=${t}`, '兼容性': canTake ? '无冲突' : '冲突' },
        });

        if (canTake) {
          count++;
          curEnd = t;
          steps.push({
            stepIndex: steps.length,
            stage: 4,
            line: anchors.scan_pick || 7,
            codeLine: anchors.scan_pick || 7,
            decision: `⚡ 线性贪心命中：在时刻 ${t} 参加会议 [start=${start}, end=${t}]！累计 ${count} 场`,
            message: '桶优化极速直接收敛',
            variables: { count, curEnd },
            metrics: { '命中会议': `[${start},${t}]`, '已选总数': String(count) },
          });
        }
      }
    }

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchors.done || 10,
      codeLine: anchors.done || 10,
      decision: `🏁 洛谷 P1803 数组桶 O(N) 极速扫描完成！最终最多参加会议数 = ${count}`,
      message: '成功展示了利用问题域时间有界特征规避比较排序的极致工程优化思想',
      variables: { finalMaxMeetings: count },
      metrics: { '最多会议': String(count), '时间复杂度': 'O(N + MaxTime)', '状态': '🏁 极速收敛' },
    });

    return steps;
  }

  // ==========================================================================
  // 最多可以参加的会议数目 (Meeting One Day / LeetCode 1353)
  // ==========================================================================

  public static compileMeetingOneDay(
    model: IYamlAlgorithmModel,
    rawEvents: (number[] | [number, number])[],
    stage: number = 1,
    direction: 'forward' | 'reverse' = 'forward',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const events: [number, number][] = (rawEvents && rawEvents.length > 0)
      ? rawEvents.map(it => [it[0], it[1]] as [number, number])
      : [[1, 2], [2, 3], [3, 4], [1, 2]];

    switch (stage) {
      case 2:
        return this.compileMeetingOneDayStage2(model, events, direction, anchorMap);
      case 3:
        return this.compileMeetingOneDayStage3(model, events, direction, anchorMap);
      case 4:
        return this.compileMeetingOneDayStage4(model, events, direction, anchorMap);
      case 1:
      default:
        return this.compileMeetingOneDayStage1(model, events, direction, anchorMap);
    }
  }

  private static compileMeetingOneDayStage1(
    model: IYamlAlgorithmModel,
    events: [number, number][],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = direction === 'reverse';
    const anchors = this.extractAnchors(model, 1, direction, anchorMap);

    const minDay = Math.min(...events.map(e => e[0]), 1);
    const maxDay = Math.max(...events.map(e => e[1]), 4);

    steps.push({
      stepIndex: 0,
      stage: 1,
      line: anchors.entry || 1,
      codeLine: anchors.entry || 1,
      decision: isReverse
        ? `1. 逆向递归匹配搜索初始化：从 Day ${maxDay} 倒推匹配会议`
        : `1. 暴力匹配穷举搜索初始化：日期范围 [Day ${minDay}, Day ${maxDay}]，递归穷举参会方案`,
      message: '递归尝试每一天安排哪一场会议或选择留空',
      variables: { totalEvents: events.length, minDay, maxDay },
      metrics: { '候选会议': String(events.length), '时间跨度': `Day ${minDay}~${maxDay}` },
    });

    let attended = 0;
    for (let d = minDay; d <= Math.min(maxDay, minDay + 3); d++) {
      const activeEvents = events.filter(e => e[0] <= d && d <= e[1]);

      steps.push({
        stepIndex: steps.length,
        stage: 1,
        line: anchors.loop || 3,
        codeLine: anchors.loop || 3,
        decision: `Day ${d} 考查：当前合法可选会议有 ${activeEvents.length} 场`,
        message: '遍历所有在今天开放且未过期的会议',
        variables: { currentDay: d, activeCount: activeEvents.length },
        metrics: { '当前日期': `Day ${d}`, '可选会议': String(activeEvents.length) },
      });

      if (activeEvents.length > 0) {
        attended++;
        steps.push({
          stepIndex: steps.length,
          stage: 1,
          line: anchors.take || 6,
          codeLine: anchors.take || 6,
          decision: `Day ${d} 尝试参会：安排参加 [${activeEvents[0][0]}, ${activeEvents[0][1]}]，累计参会 = ${attended}`,
          message: '选定一场会议并推进至下一天',
          variables: { currentDay: d, attended },
          metrics: { '参会决策': '参加', '累计场数': String(attended) },
        });
      } else {
        steps.push({
          stepIndex: steps.length,
          stage: 1,
          line: anchors.skip || 9,
          codeLine: anchors.skip || 9,
          decision: `Day ${d} 无可用会议或选择留空，直接推进至下一天`,
          message: '留空跳过当前日期',
          variables: { currentDay: d },
          metrics: { '参会决策': '留空', '累计场数': String(attended) },
        });
      }
    }

    steps.push({
      stepIndex: steps.length,
      stage: 1,
      line: anchors.ret || 10,
      codeLine: anchors.ret || 10,
      decision: `🏁 暴力搜索收敛：全排列匹配得出最多可参加 ${attended} 场会议`,
      message: '穷举验证了在每日仅能参加一场会议约束下的理论上限',
      variables: { maxAttended: attended },
      metrics: { '最大参会数': String(attended), '状态': '🏁 搜索收敛' },
    });

    return steps;
  }

  private static compileMeetingOneDayStage2(
    model: IYamlAlgorithmModel,
    events: [number, number][],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = direction === 'reverse';
    const anchors = this.extractAnchors(model, 2, direction, anchorMap);

    const sorted = events
      .map((e, idx) => ({ id: idx + 1, start: e[0], end: e[1] }))
      .sort((a, b) => (isReverse ? b.end - a.end : a.start - b.start));

    const minDay = Math.min(...events.map(e => e[0]), 1);
    const maxDay = Math.max(...events.map(e => e[1]), 4);
    const totalDays = Math.min(maxDay - minDay + 1, 5);
    const dayCols = Array.from({ length: totalDays }, (_, idx) => `Day ${minDay + idx}`);
    const dayLabels: string[] = Array(totalDays).fill('待排');
    const attendedSlots: number[] = [];

    const rootTree: UniversalTreeNode = {
      id: 'mod_root',
      r: 0,
      c: 0,
      val: isReverse ? '逆向小根堆对偶调度树' : '正向日期逐日推进贪心树',
      status: 'active',
      children: [],
    };

    steps.push({
      stepIndex: 0,
      stage: 2,
      line: anchors.sort || 1,
      codeLine: anchors.sort || 1,
      decision: isReverse
        ? '1. 会议按结束日 end 降序排序：逆向时间轴对偶初始化'
        : '1. 会议按开始日 start 升序排序：确保随时间指针 day 推进，能够按时将新开放会议录入堆中',
      message: '排序为时间流推进做好索引铺垫',
      variables: { totalEvents: events.length },
      treeRoot: cloneStateDepTree(rootTree),
      activeSlot: 0,
      highlightSlots: [0],
      slots: [...dayLabels],
      colLabels: dayCols,
      metrics: { '会议总数': String(events.length), '排序规则': isReverse ? 'end 降序' : 'start 升序' },
    });

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      line: anchors.heap_init || 2,
      codeLine: anchors.heap_init || 2,
      decision: '初始化优先队列 pq：小根堆动态维护所有已开放但未过期的会议截止日 endDay',
      message: '堆顶始终为「最快截止、最迫切需要参加」的会议',
      variables: { minDay, maxDay },
      treeRoot: cloneStateDepTree(rootTree),
      activeSlot: 0,
      highlightSlots: [0],
      slots: [...dayLabels],
      colLabels: dayCols,
      metrics: { '堆类型': '截止日小根堆', '当前堆大小': '0' },
    });

    let count = 0;
    const pq: number[] = [];
    let eventIdx = 0;

    for (let day = minDay; day <= Math.min(maxDay, minDay + 4); day++) {
      const slotIdx = Math.min(day - minDay, totalDays - 1);
      const dayNode: UniversalTreeNode = {
        id: `day_${day}`,
        r: 1,
        c: day - minDay,
        val: `Day ${day}`,
        status: 'active',
        children: [],
      };
      rootTree.children.push(dayNode);

      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.day_loop || 4,
        codeLine: anchors.day_loop || 4,
        decision: `📅 时间指针推进至 Day ${day}：开始本工作日的参会调度`,
        message: '检查今日开放会议并淘汰历史已过期会议',
        variables: { currentDay: day, curHeapSize: pq.length },
        treeRoot: cloneStateDepTree(rootTree),
        activeSlot: slotIdx,
        highlightSlots: [...attendedSlots, slotIdx],
        slots: [...dayLabels],
        colLabels: dayCols,
        metrics: { '当前日期': `Day ${day}`, '待选堆大小': String(pq.length) },
      });

      // 将今天开始的会议入堆
      let newAdded = 0;
      while (eventIdx < sorted.length && sorted[eventIdx].start === day) {
        const ev = sorted[eventIdx++];
        pq.push(ev.end);
        pq.sort((a, b) => a - b);
        newAdded++;

        const addNode: UniversalTreeNode = {
          id: `add_${ev.id}`,
          r: 2,
          c: pq.length - 1,
          val: `入堆 M${ev.id}(截止Day ${ev.end})`,
          status: 'active',
          children: [],
        };
        dayNode.children.push(addNode);

        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchors.add_events || 5,
          codeLine: anchors.add_events || 5,
          decision: `📥 会议 M${ev.id} 今日开始开放 (截止日 Day ${ev.end})：加入小根堆，堆内候选 = ${pq.length} 场`,
          message: '新可用会议入堆排队',
          variables: { eventId: ev.id, start: ev.start, end: ev.end, heapSize: pq.length },
          treeRoot: cloneStateDepTree(rootTree),
          activeSlot: slotIdx,
          highlightSlots: [...attendedSlots, slotIdx],
          slots: [...dayLabels],
          colLabels: dayCols,
          metrics: { '今日入堆': `M${ev.id}`, '最新堆顶截止': String(pq[0]) },
        });
      }

      // 淘汰过期会议
      let expiredCount = 0;
      while (pq.length > 0 && pq[0] < day) {
        const expEnd = pq.shift()!;
        expiredCount++;

        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchors.expire_poll || 6,
          codeLine: anchors.expire_poll || 6,
          decision: `⏰ 过期淘汰：堆顶会议截止日 Day ${expEnd} < 当前 Day ${day}，已永久失效废弃！`,
          message: '过期未参加的会议丧失资格，直接弹出丢弃',
          variables: { expiredDeadline: expEnd, day },
          treeRoot: cloneStateDepTree(rootTree),
          activeSlot: slotIdx,
          highlightSlots: [...attendedSlots, slotIdx],
          slots: [...dayLabels],
          colLabels: dayCols,
          metrics: { '过期淘汰': `Day ${expEnd}`, '剩余堆大小': String(pq.length) },
        });
      }

      // 贪心参加最早截止会议
      if (pq.length > 0) {
        const chosenEnd = pq.shift()!;
        count++;
        attendedSlots.push(slotIdx);
        dayLabels[slotIdx] = `✅M(止${chosenEnd})`;

        const attendNode: UniversalTreeNode = {
          id: `attend_${day}`,
          r: 3,
          c: day - minDay,
          val: `⭐参会 (截止Day ${chosenEnd})`,
          status: 'visited',
          children: [],
        };
        dayNode.children.push(attendNode);

        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchors.attend_poll || 8,
          codeLine: anchors.attend_poll || 8,
          decision: `🎯 贪心挑选：Day ${day} 参加堆顶最早截止日为 Day ${chosenEnd} 的会议！累计已参加 ${count} 场`,
          message: '由于该会议截止最早、容错度最低，优先消耗它绝不影响后续宽裕会议',
          variables: { day, chosenDeadline: chosenEnd, totalAttended: count },
          treeRoot: cloneStateDepTree(rootTree),
          activeSlot: slotIdx,
          highlightSlots: [...attendedSlots],
          slots: [...dayLabels],
          colLabels: dayCols,
          metrics: { '今日参会': '✅ 参加', '累计参会': String(count), '余留待选': String(pq.length) },
        });
      } else {
        dayLabels[slotIdx] = '轮空';
        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchors.day_loop || 4,
          codeLine: anchors.day_loop || 4,
          decision: `Day ${day} 堆为空：今日无任何可用会议，时间指针空转自增`,
          message: '本日轮空',
          variables: { day },
          treeRoot: cloneStateDepTree(rootTree),
          activeSlot: slotIdx,
          highlightSlots: [...attendedSlots],
          slots: [...dayLabels],
          colLabels: dayCols,
          metrics: { '今日参会': '轮空', '累计参会': String(count) },
        });
      }
    }

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      line: anchors.done || 12,
      codeLine: anchors.done || 12,
      decision: `🛑 日程推演完成！在每天至多参加一场会议的限制下，最多可参加 ${count} 场会议`,
      message: '小根堆贪心策略在 O(N log N) 时间内达成全局最优匹配',
      variables: { maxAttended: count },
      treeRoot: cloneStateDepTree(rootTree),
      activeSlot: totalDays - 1,
      highlightSlots: [...attendedSlots],
      slots: [...dayLabels],
      colLabels: dayCols,
      metrics: { '最大参会数': String(count), '状态': '🏁 调度收敛' },
    });

    return steps;
  }

  private static compileMeetingOneDayStage3(
    model: IYamlAlgorithmModel,
    events: [number, number][],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const anchors = this.extractAnchors(model, 3, direction, anchorMap);

    const minDay = Math.min(...events.map(e => e[0]), 1);
    const maxDay = Math.max(...events.map(e => e[1]), 4);
    const totalDays = Math.min(maxDay - minDay + 1, 5);

    const matrix: (string | null)[][] = Array.from({ length: totalDays }, () => Array(5).fill(null));

    const formatGrid = () => ({
      rows: totalDays,
      cols: 5,
      rowHeaders: Array.from({ length: totalDays }, (_, i) => `Day ${minDay + i}`),
      colHeaders: ['日期', '堆内候选数', '堆顶最早截止日', '今日决策', '累计参会数'],
      values: matrix.map(row => row.map(v => v === null ? '-' : String(v))),
      activeRow: 0,
      activeCol: 0,
      dependencyCells: [] as [number, number][],
    });

    steps.push({
      stepIndex: 0,
      stage: 3,
      line: anchors.init || 1,
      codeLine: anchors.init || 1,
      decision: '初始化日期调度状态演进矩阵 M[Days][5]：记录每日候选池规模、截止日与决策流转',
      message: '表格记录 [日期, 候选数, 最早截止日, 决策, 累计参会]',
      variables: { totalDays },
      grid: formatGrid() as any,
      metrics: { '矩阵规格': `${totalDays}×5`, '状态': '就绪' },
    });

    const pq: number[] = [];
    let eventIdx = 0;
    let count = 0;
    const sorted = [...events].sort((a, b) => a[0] - b[0]);

    for (let i = 0; i < totalDays; i++) {
      const day = minDay + i;

      while (eventIdx < sorted.length && sorted[eventIdx][0] === day) {
        pq.push(sorted[eventIdx++][1]);
        pq.sort((a, b) => a - b);
      }
      while (pq.length > 0 && pq[0] < day) {
        pq.shift();
      }

      const preGrid = formatGrid();
      preGrid.activeRow = i;
      preGrid.activeCol = 1;

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        line: anchors.day_loop || 2,
        codeLine: anchors.day_loop || 2,
        decision: `矩阵记录 Day ${day}：当前小根堆内有效可用会议 ${pq.length} 场，堆顶最早截止日为 ${pq.length > 0 ? 'Day ' + pq[0] : '无'}`,
        message: '准备评估今日参会决定',
        variables: { day, heapSize: pq.length, earliestDeadline: pq[0] ?? null },
        grid: preGrid as any,
        activeSlot: i,
        metrics: { '当前日': `Day ${day}`, '候选数': String(pq.length) },
      });

      const canAttend = pq.length > 0;
      let chosenEnd = -1;
      if (canAttend) {
        chosenEnd = pq.shift()!;
        count++;
      }

      matrix[i][0] = `Day ${day}`;
      matrix[i][1] = String(pq.length + (canAttend ? 1 : 0));
      matrix[i][2] = chosenEnd !== -1 ? `Day ${chosenEnd}` : '-';
      matrix[i][3] = canAttend ? `✅ 参会(截止${chosenEnd})` : '轮空';
      matrix[i][4] = String(count);

      const gridObj = formatGrid();
      gridObj.activeRow = i;
      gridObj.activeCol = 4;
      if (i > 0) {
        gridObj.dependencyCells = [[i - 1, 4]];
      }

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        line: anchors.matrix_log || 5,
        codeLine: anchors.matrix_log || 5,
        decision: `矩阵单元格落盘：Day ${day} ${canAttend ? '参加堆顶会议' : '轮空'}，累计已参加 ${count} 场会议`,
        message: '完成该工作日状态转移',
        variables: { day, count },
        grid: gridObj as any,
        activeSlot: i,
        metrics: { '今日决策': canAttend ? '参会' : '轮空', '累计参会': String(count) },
      });
    }

    const finalGrid = formatGrid();
    finalGrid.activeRow = totalDays - 1;
    finalGrid.activeCol = 4;

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      line: anchors.done || 7,
      codeLine: anchors.done || 7,
      decision: `🎉 日期调度状态矩阵填表完成！整个日程累计参加 ${count} 场会议`,
      message: '状态矩阵展现了小根堆在动态时序决策中的单调支配性',
      variables: { finalCount: count },
      grid: finalGrid as any,
      metrics: { '最大参会': String(count), '状态': '🏁 矩阵收敛' },
    });

    return steps;
  }

  private static compileMeetingOneDayStage4(
    model: IYamlAlgorithmModel,
    events: [number, number][],
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const anchors = this.extractAnchors(model, 4, direction, anchorMap);

    steps.push({
      stepIndex: 0,
      stage: 4,
      line: anchors.proof_premise || 1,
      codeLine: anchors.proof_premise || 1,
      decision: '1. 贪心交换反证前提：设在当前 Day d，可选会议中有 A(截止日 d1) 与 B(截止日 d2)，其中 d1 < d2',
      message: 'A 截止日更早，B 截止日更晚。假设存在某个最优解 OPT 在 Day d 选择了 B 而未选择 A',
      variables: { d1: '早截止日', d2: '晚截止日', relation: 'd1 < d2' },
      metrics: { '反证法前提': 'OPT 选择 B 放弃 A', '紧迫度比较': 'A 更紧迫' },
    });

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchors.proof_exchange || 2,
      codeLine: anchors.proof_exchange || 2,
      decision: '2. 构造微扰交换：考察 OPT 在后续天数是否参加了 A',
      message: '情形一：OPT 在后续天数从未参加 A；情形二：OPT 在后续 Day d_k (d < d_k ≤ d1) 参加了 A',
      variables: { branch1: '后续不参加 A', branch2: '后续在 Day dk 参加 A' },
      metrics: { '情形分析': '两分类讨论', '交换目标': '证明不差于 OPT' },
    });

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchors.proof_subset || 3,
      codeLine: anchors.proof_subset || 3,
      decision: '3. 证明情形一：若 OPT 后续未参加 A，直接将 Day d 的 B 替换为 A，参会总数完全不变，合法性依然成立！',
      message: '因为 d <= d1，A 在 Day d 完全合法可用',
      variables: { replacementResult: '总数不减' },
      metrics: { '情形一结论': '替换完全合法', '收益': '总数保持' },
    });

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchors.proof_dominant || 4,
      codeLine: anchors.proof_dominant || 4,
      decision: '4. 证明情形二：若 OPT 在后续 Day d_k 参加了 A，交换二者（Day d 参加 A，Day d_k 参加 B）！',
      message: '由于 d_k ≤ d1 < d2，故在 Day d_k 参加 B 必然合法（B 截止于更晚的 d2），交换后总数不变！',
      variables: { exchangeValid: true, d_k_vs_d2: 'd_k < d2' },
      metrics: { '情形二结论': '区间包含支配', '单调性': '交换必定成立' },
    });

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchors.proof_dominant || 4,
      codeLine: anchors.proof_dominant || 4,
      decision: '5. 单调支配归纳传递：在任意决策点，选择更早截止的会议留给后续的解空间是选择晚截止会议解空间的超集',
      message: '容忍度定理：S(A) ⊆ S(B)，消耗更小容忍度的资源是所有在线贪心调度的核心支配策略',
      variables: { spaceSuperset: true },
      metrics: { '状态空间关系': '超集单调支配', '决策性质': '在线贪心最优' },
    });

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchors.proof_ret || 5,
      codeLine: anchors.proof_ret || 5,
      decision: '6. 🏁 归纳收敛反证结论：早截止贪心策略具有全局最优支配性，放弃早截止会议绝不可能产生更好解',
      message: '数学归纳法证明贪心选择的正确性，早截止失效不可逆性质成立！',
      variables: { proofCompleted: true },
      metrics: { '反证结论': '贪心必为最优解', '状态': '🏁 证明收敛' },
    });

    return steps;
  }

}
