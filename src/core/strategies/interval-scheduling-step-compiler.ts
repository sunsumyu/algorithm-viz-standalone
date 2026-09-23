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

}
