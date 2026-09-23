/**
 * 双向前后缀分解与邻域扫描通用步进编译器 (TwoPassNeighborStepCompiler)
 * 核心深模块 (Deep Module) —— 统领全库双向扫描、前后缀分解与相邻约束传播族群：
 * - LeetCode 135: 分发糖果 (Candy)
 * - LeetCode 42: 接雨水 (Trapping Rain Water - left_max & right_max)
 * - LeetCode 238: 除自身以外数组的乘积 (Product of Array Except Self)
 * 
 * 核心数学归约：
 * 将双边相邻约束（左右两侧同时限制）解耦为两次独立的单向扫描：
 * 1. Forward Pass: 从左往右推进，确保每一个元素满足左侧历史约束
 * 2. Reverse Pass: 从右往左推进，确保每一个元素满足右侧未来约束
 * 3. Fusion: 取局部极值或代数融合（例如 max(L[i], R[i]) 或 min(L[i], R[i]) - h[i]）
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, StateArrayItem, UniversalTreeNode } from '../universal-stage-engine';
import { YamlModelLoader } from '../yaml-model-loader';
import { cloneStateDepTree } from './tree-clone';
import { UniversalStepBuilder } from '../builders/universal-step-builder';

export interface TwoPassCompileOptions {
  direction?: 'forward' | 'reverse';
  anchorMap?: Record<string, number>;
}

export class TwoPassNeighborStepCompiler {
  /**
   * 分发糖果 (LeetCode 135) 四阶段全演进编译入口
   */
  public static compileCandy(
    model: IYamlAlgorithmModel,
    rawRatings: number[],
    options?: TwoPassCompileOptions,
    stage: number = 1
  ): UniversalStep[] {
    const ratings = rawRatings && rawRatings.length > 0 ? rawRatings : [1, 2, 87, 87, 87, 2, 1];
    
    if (stage === 2) {
      return this.compileCandyStage2(model, ratings, options);
    }
    if (stage === 3) {
      return this.compileCandyStage3(model, ratings, options);
    }
    if (stage === 4) {
      return this.compileCandyStage4(model, ratings, options);
    }
    return this.compileCandyStage1(model, ratings, options);
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
  // Stage 1: 双向两次贪心扫描 (Two-Pass Greedy)
  // ==========================================================================
  private static compileCandyStage1(
    model: IYamlAlgorithmModel,
    ratings: number[],
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = ratings.length;
    const isReverse = options?.direction === 'reverse';
    const anchorMap = this.extractAnchors(model, 1, options?.direction || 'forward', options?.anchorMap);

    const left = new Array(n).fill(1);
    const right = new Array(n).fill(1);
    const finalCandies = new Array(n).fill(1);

    const buildStateArrays = (activeIdx?: number, highlightIndices?: number[]): StateArrayItem[] => [
      {
        id: 'ratings',
        name: '孩子评分 (ratings)',
        indices: ratings.map((_, i) => i),
        values: ratings.map(String),
        activeIdx,
        highlightIndices,
        color: 'indigo',
      },
      {
        id: 'left',
        name: '左→右规则约束 L[i]',
        indices: left.map((_, i) => i),
        values: left.map(String),
        activeIdx,
        color: 'emerald',
      },
      {
        id: 'right',
        name: '右→左规则约束 R[i]',
        indices: right.map((_, i) => i),
        values: right.map(String),
        activeIdx,
        color: 'amber',
      },
      {
        id: 'candies',
        name: '最终糖果分配 max(L, R)',
        indices: finalCandies.map((_, i) => i),
        values: finalCandies.map(String),
        activeIdx,
        color: 'purple',
      },
    ];

    // Step 0: 入口
    steps.push({
      stepIndex: 0,
      stage: 1,
      line: anchorMap['entry'] ?? 1,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `主函数入口：输入 ${n} 个孩子的评分列表 [${ratings.join(', ')}]，准备按${isReverse ? '右向左先行' : '左向右先行'}双向两次贪心推演`,
      message: `数学规约：相邻双边约束拆解为单向独立求解，分别满足左邻与右邻，最终取并集 max 达成全局最优`,
      variables: { totalChildren: n, direction: isReverse ? '逆向先行' : '正向先行' },
      stateArrays: buildStateArrays(),
      metrics: {
        'phase': '初始化',
        'cur-child': '—',
        'total-candies': `${n} 颗`,
        'status': '基准分发',
      },
    });

    if (n <= 1) {
      steps.push({
        stepIndex: steps.length,
        stage: 1,
        line: anchorMap['done'] ?? 14,
        codeLine: anchorMap['done'] ?? 14,
        decision: `边界情况：仅 1 个孩子，最少需要 1 颗糖果`,
        message: '单一孩子基准收敛',
        variables: { return: n },
        stateArrays: buildStateArrays(),
        metrics: { 'total-candies': `${n} 颗`, 'status': '🏁 全局最优' },
      });
      return steps;
    }

    // 阶段一：从左向右扫描 (若当前孩子评分 > 左边孩子，则 L[i] = L[i-1] + 1)
    for (let i = 1; i < n; i++) {
      const prev = ratings[i - 1];
      const cur = ratings[i];

      if (cur > prev) {
        left[i] = left[i - 1] + 1;
        steps.push({
          stepIndex: steps.length,
          stage: 1,
          line: anchorMap['left_inc'] ?? anchorMap['left_loop'] ?? 4,
          codeLine: anchorMap['left_inc'] ?? anchorMap['left_loop'] ?? 4,
          decision: `📈 [左向右扫描] 孩子 [${i}] 评分 ${cur} > 左边 [${i - 1}] 评分 ${prev}，贪心满足左邻约束：L[${i}] = L[${i - 1}] + 1 = ${left[i]}`,
          message: `贪心性质：评分严格更高者糖果数必须至少比左边多 1 颗`,
          variables: { i, ratings_cur: cur, ratings_prev: prev, 'L[i]': left[i] },
          stateArrays: buildStateArrays(i, [i - 1, i]),
          actorState: { currentSlot: i, action: 'walk' },
          activeIndices: [i],
          activeSlot: i,
          metrics: {
            'phase': '➡️ 从左向右扫描',
            'cur-child': `[${i}] (评分: ${cur})`,
            'total-candies': '推演中',
            'status': '📈 右高递增',
          },
        });
      } else {
        steps.push({
          stepIndex: steps.length,
          stage: 1,
          line: anchorMap['left_check'] ?? 3,
          codeLine: anchorMap['left_check'] ?? 3,
          decision: `⏩ [左向右扫描] 孩子 [${i}] 评分 ${cur} ≤ 左边 [${i - 1}] 评分 ${prev}，不触发递增，保持基准 L[${i}] = 1`,
          message: `评分不高于左邻时，仅需满足「至少 1 颗糖果」的底线要求`,
          variables: { i, ratings_cur: cur, ratings_prev: prev, 'L[i]': left[i] },
          stateArrays: buildStateArrays(i, [i - 1, i]),
          actorState: { currentSlot: i, action: 'idle' },
          activeIndices: [i],
          activeSlot: i,
          metrics: {
            'phase': '➡️ 从左向右扫描',
            'cur-child': `[${i}] (评分: ${cur})`,
            'total-candies': '推演中',
            'status': '⏩ 保持基准 1',
          },
        });
      }
    }

    // 阶段二：从右向左扫描 (若当前孩子评分 > 右边孩子，则 R[i] = R[i+1] + 1，同时结算 max(L[i], R[i]))
    let runningSum = 0;
    for (let i = n - 1; i >= 0; i--) {
      if (i < n - 1 && ratings[i] > ratings[i + 1]) {
        right[i] = right[i + 1] + 1;
      }
      finalCandies[i] = Math.max(left[i], right[i]);
      runningSum += finalCandies[i];

      const isInc = i < n - 1 && ratings[i] > ratings[i + 1];
      steps.push({
        stepIndex: steps.length,
        stage: 1,
        line: anchorMap['fuse'] ?? anchorMap['right_loop'] ?? 10,
        codeLine: anchorMap['fuse'] ?? anchorMap['right_loop'] ?? 10,
        decision: `📉 [右向左扫描 & 融合] 孩子 [${i}] 评分 ${ratings[i]} ${isInc ? `> 右邻 [${i + 1}] 评分 ${ratings[i + 1]} (R[${i}]=${right[i]})` : `≤ 右邻 (R[${i}]=1)`}，双向融合 max(L[${i}]=${left[i]}, R[${i}]=${right[i]}) = ${finalCandies[i]} 颗糖果`,
        message: `双向交汇：只有同时取 max(L[i], R[i])，才能在同时满足左侧和右侧严格偏序的同时保证糖果总数最少`,
        variables: {
          i,
          'ratings[i]': ratings[i],
          'L[i]': left[i],
          'R[i]': right[i],
          'candies[i]': finalCandies[i],
          runningTotal: runningSum,
        },
        stateArrays: buildStateArrays(i, i < n - 1 ? [i, i + 1] : [i]),
        actorState: { currentSlot: i, action: 'walk' },
        activeIndices: [i],
        activeSlot: i,
        metrics: {
          'phase': '⬅️ 从右向左融合',
          'cur-child': `[${i}] (评分: ${ratings[i]})`,
          'total-candies': `${runningSum} 颗`,
          'status': isInc ? '📉 左高取 max' : '✓ 满足双边',
        },
      });
    }

    const totalCandies = finalCandies.reduce((a, b) => a + b, 0);

    // 结算 Step
    steps.push({
      stepIndex: steps.length,
      stage: 1,
      line: anchorMap['done'] ?? 14,
      codeLine: anchorMap['done'] ?? 14,
      decision: `🎉 双向贪心推演完成！最少需要准备 ${totalCandies} 颗糖果，分配方案为 [${finalCandies.join(', ')}]`,
      message: `双向两次贪心严谨达成全局最优，时间复杂度 O(N)，空间复杂度 O(N)`,
      variables: {
        return: totalCandies,
        finalCandies: JSON.stringify(finalCandies),
        totalChildren: n,
      },
      stateArrays: buildStateArrays(),
      metrics: {
        'phase': '🏁 推演完成',
        'cur-child': '—',
        'total-candies': `${totalCandies} 颗`,
        'status': '🏆 全局最优',
      },
    });

    return steps;
  }

  // ==========================================================================
  // Stage 2: 记忆化拓扑搜索 (DAG 最长路径)
  // ==========================================================================
    private static compileCandyStage2(
    model: IYamlAlgorithmModel,
    ratings: number[],
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = ratings.length;
    const anchorMap = this.extractAnchors(model, 2, options?.direction || 'forward', options?.anchorMap);

    const memo = new Array(n).fill(0);
    const cloneMemoGrid = (): (number | null)[][] => [memo.map((v) => (v === 0 ? null : v))];

    const buildStateArrays = (activeIdx?: number, highlightIndices?: number[]): StateArrayItem[] => [
      {
        id: 'ratings',
        name: '孩子评分 (ratings)',
        indices: ratings.map((_, idx) => idx),
        values: ratings.map((v) => String(v)),
        activeIdx,
        highlightIndices,
        color: 'emerald',
      },
      {
        id: 'memo',
        name: '糖果备忘录 (memo)',
        indices: memo.map((_, idx) => idx),
        values: memo.map((v) => (v === 0 ? '?' : String(v))),
        activeIdx,
        highlightIndices,
        color: 'indigo',
      },
    ];

    let nodeUid = 0;
    const rootTree: UniversalTreeNode = {
      id: 'dfs_root',
      r: 0,
      c: 0,
      val: '求解全序列糖果 DAG',
      status: 'active',
      children: [],
    };

    // Step 0: 入口
    steps.push({
      stepIndex: 0,
      stage: 2,
      line: anchorMap['entry'] ?? 1,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `记忆化搜索初始化：将相邻评分视为有向无环图 (DAG)，自顶向下探索每个孩子到波谷的最长依赖链`,
      message: `孩子 i 若评分高于相邻孩子，则建立递推依赖，糖果数取决于邻居递归结果 + 1`,
      variables: { n, 'memo.length': n },
      grid: cloneMemoGrid(),
      treeRoot: cloneStateDepTree(rootTree),
      stateArrays: buildStateArrays(),
      activeSlot: 0,
      metrics: { 'dfs-state': 'DFS 全局初始化', 'total-candies': '0' },
    });

    let totalCandies = 0;

    const runDfs = (i: number, parentNode: UniversalTreeNode, branchLabel: string): number => {
      nodeUid++;
      const currentTreeNode: UniversalTreeNode = {
        id: `node_${i}_${nodeUid}`,
        r: 0,
        c: i,
        val: branchLabel ? `${branchLabel} → dfs(${i})` : `dfs(${i}, 评分=${ratings[i]})`,
        status: 'active',
        children: [],
      };
      parentNode.children.push(currentTreeNode);

      // 进入探查
      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchorMap['dfs'] ?? 4,
        codeLine: anchorMap['dfs'] ?? 4,
        decision: `🔍 深入调用 dfs(i=${i})：考查孩子 [${i}] (评分=${ratings[i]})，探索其向较低评分邻居的降序链`,
        message: `自顶向下探索，寻找局部单调降序终止点（山谷）`,
        variables: { i, rating: ratings[i], totalCandies },
        grid: cloneMemoGrid(),
        treeRoot: cloneStateDepTree(rootTree),
        stateArrays: buildStateArrays(i),
        activeSlot: i,
        metrics: { 'dfs-state': `dfs(${i})`, 'rating': String(ratings[i]) },
      });

      // 记忆化检查 (Cache Hit)
      if (memo[i] > 0) {
        currentTreeNode.status = 'pruned';
        currentTreeNode.val = `dfs(${i}) = ${memo[i]} (⚡ 剪枝命中)`;

        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchorMap['dfs'] ?? 4,
          codeLine: anchorMap['dfs'] ?? 4,
          decision: `⚡ 记忆化命中！孩子 [${i}] 糖果数已缓存为 memo[${i}]=${memo[i]}，直接剪枝返回，避免重复递归！`,
          message: `剪枝消除重叠子问题计算`,
          variables: { i, cached: memo[i], totalCandies },
          grid: cloneMemoGrid(),
          treeRoot: cloneStateDepTree(rootTree),
          stateArrays: buildStateArrays(i),
          activeSlot: i,
          metrics: { 'action': '⚡ 记忆化剪枝', 'memo[i]': String(memo[i]) },
        });
        return memo[i];
      }

      let candies = 1;
      const hasLeftLower = i > 0 && ratings[i] > ratings[i - 1];
      const hasRightLower = i < n - 1 && ratings[i] > ratings[i + 1];

      // 递归基判定：若两侧均不高于邻居，自身即为波谷
      if (!hasLeftLower && !hasRightLower) {
        memo[i] = 1;
        currentTreeNode.status = 'visited';
        currentTreeNode.val = `dfs(${i}) = 1 (波谷基底)`;

        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchorMap['dfs'] ?? 4,
          codeLine: anchorMap['dfs'] ?? 4,
          decision: `🛑 到达波谷基底：孩子 [${i}] 评分 ${ratings[i]} 不高于任何邻居，分配基础糖果 1 颗，触底返回`,
          message: `波谷节点无更低邻居依赖，直接作为基底返回 1`,
          variables: { i, candies: 1 },
          grid: cloneMemoGrid(),
          treeRoot: cloneStateDepTree(rootTree),
          stateArrays: buildStateArrays(i),
          activeSlot: i,
          metrics: { 'dfs-state': '波谷触底', 'candies': '1' },
        });
        return 1;
      }

      // 探查左邻居
      if (hasLeftLower) {
        const leftVal = runDfs(i - 1, currentTreeNode, `左邻低评 [${i - 1}]`);
        candies = Math.max(candies, leftVal + 1);
      }

      // 探查右邻居
      if (hasRightLower) {
        const rightVal = runDfs(i + 1, currentTreeNode, `右邻低评 [${i + 1}]`);
        candies = Math.max(candies, rightVal + 1);
      }

      memo[i] = candies;
      currentTreeNode.status = 'visited';
      currentTreeNode.val = `dfs(${i}) = ${candies}`;

      // 回溯落盘
      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchorMap['dfs'] ?? 4,
        codeLine: anchorMap['dfs'] ?? 4,
        decision: `↩️ 回溯落盘：综合两侧邻居，确定孩子 [${i}] 需分配 ${candies} 颗糖果，写入 memo[${i}]=${candies}`,
        message: `子问题解整合完毕，状态落盘持久化`,
        variables: { i, candies, 'memo[i]': candies },
        grid: cloneMemoGrid(),
        treeRoot: cloneStateDepTree(rootTree),
        stateArrays: buildStateArrays(i),
        activeSlot: i,
        metrics: { 'action': '↩️ 回溯落盘', 'candies': String(candies) },
      });

      return candies;
    };

    // 主循环递归
    for (let i = 0; i < n; i++) {
      if (memo[i] === 0) {
        const val = runDfs(i, rootTree, `主循环 孩子[${i}]`);
        totalCandies += val;
      } else {
        totalCandies += memo[i];
      }
    }

    // 终局步
    steps.push({
      stepIndex: steps.length,
      stage: 2,
      line: anchorMap['done'] ?? 6,
      codeLine: anchorMap['done'] ?? 6,
      decision: `🎉 记忆化搜索全部推演完成！最少需要分发 ${totalCandies} 颗糖果，状态树与备忘录全闭环收敛`,
      message: `DAG 最长链搜索严格验证了贪心双向扫描的正确性`,
      variables: { return: totalCandies, totalChildren: n },
      grid: cloneMemoGrid(),
      treeRoot: cloneStateDepTree(rootTree),
      stateArrays: buildStateArrays(),
      activeSlot: n - 1,
      metrics: { 'status': '🏁 搜索收敛', 'total-candies': String(totalCandies) },
    });

    return steps;
  }

  // ==========================================================================
  // Stage 3: 拓扑排序动态规划 (Topological DP)
  // ==========================================================================
  private static compileCandyStage3(
    model: IYamlAlgorithmModel,
    ratings: number[],
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = ratings.length;
    const anchorMap = this.extractAnchors(model, 3, options?.direction || 'forward', options?.anchorMap);

    const dp = new Array(n).fill(1);
    // 按评分排序后的索引序列（低分山谷排在前面，高分山峰排在后面）
    const order = ratings.map((_, i) => i).sort((a, b) => ratings[a] - ratings[b]);

    const buildDpStateArrays = (activeIdx?: number, highlightIndices?: number[]): StateArrayItem[] => [
      {
        id: 'ratings',
        name: '孩子评分 (ratings)',
        indices: ratings.map((_, i) => i),
        values: ratings.map(String),
        activeIdx,
        highlightIndices,
        color: 'indigo',
      },
      {
        id: 'dp',
        name: '拓扑 DP 糖果数 (dp[i])',
        indices: dp.map((_, i) => i),
        values: dp.map(String),
        activeIdx,
        highlightIndices,
        color: 'purple',
      },
    ];

    // Step 0: 初始化入口
    steps.push({
      stepIndex: 0,
      stage: 3,
      line: anchorMap['entry'] ?? 1,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `拓扑 DP 初始化：全员初始赋值 dp[i] = 1，将 ${n} 个孩子按评分从小到大建立拓扑排序序列: [${order.map(i => `[${i}]:${ratings[i]}`).join(', ')}]`,
      message: `拓扑序保证：当计算孩子 i 的糖果数时，评分低于它的所有相邻孩子必然已经完成最优求解`,
      variables: { totalChildren: n, order: JSON.stringify(order) },
      stateArrays: buildDpStateArrays(),
      actorState: { currentSlot: order[0], action: 'idle' },
      activeSlot: order[0],
      metrics: { 'phase': '拓扑排序完成', 'dp-status': '初始化' },
    });

    // 严谨遍历全部 order 节点，绝不偷懒截断！
    for (let stepIdx = 0; stepIdx < order.length; stepIdx++) {
      const idx = order[stepIdx];
      const curRating = ratings[idx];

      // 阶段 3.1: 探查并选中当前拓扑序号最小的节点
      steps.push({
        stepIndex: steps.length,
        stage: 3,
        line: anchorMap['loop'] ?? 5,
        codeLine: anchorMap['loop'] ?? 5,
        decision: `📌 拓扑出队 (#${stepIdx + 1}/${order.length})：选取当前全局评分最低孩子 [${idx}] (评分=${curRating})，探险家前往槽位 [${idx}]`,
        message: `自底向上推进：由局部波谷向相邻两侧波峰逐级松弛传播最优解`,
        variables: { currentChild: idx, rating: curRating, 'current_dp': dp[idx], stepOrder: `${stepIdx + 1}/${order.length}` },
        stateArrays: buildDpStateArrays(idx, [idx]),
        actorState: { currentSlot: idx, action: 'walk' },
        activeIndices: [idx],
        activeSlot: idx,
        metrics: { 'phase': `处理节点 [${idx}]`, 'dp-status': `初始 dp[${idx}]=${dp[idx]}` },
      });

      let updatedByLeft = false;
      let updatedByRight = false;

      // 阶段 3.2: 检查左邻居
      if (idx > 0) {
        const leftRating = ratings[idx - 1];
        if (curRating > leftRating) {
          const oldVal = dp[idx];
          dp[idx] = Math.max(dp[idx], dp[idx - 1] + 1);
          updatedByLeft = true;
          steps.push({
            stepIndex: steps.length,
            stage: 3,
            line: anchorMap['transfer_left'] ?? 6,
            codeLine: anchorMap['transfer_left'] ?? 6,
            decision: `⬅️ 检查左邻：孩子 [${idx}] 评分 ${curRating} > 左邻 [${idx - 1}] 评分 ${leftRating}，松弛更新 dp[${idx}] = max(${oldVal}, dp[${idx - 1}]+1 = ${dp[idx - 1] + 1}) = ${dp[idx]}`,
            message: `满足左侧约束：当前孩子评分更高，糖果数必须至少比左邻多 1`,
            variables: { currentChild: idx, leftChild: idx - 1, 'dp[idx]': dp[idx], 'dp[left]': dp[idx - 1] },
            stateArrays: buildDpStateArrays(idx, [idx - 1, idx]),
            actorState: { currentSlot: idx, action: 'compare' },
            activeIndices: [idx],
            activeSlot: idx,
            metrics: { 'phase': `松弛左邻 [${idx}]`, 'dp-status': `dp[${idx}] -> ${dp[idx]}` },
          });
        }
      }

      // 阶段 3.3: 检查右邻居
      if (idx < n - 1) {
        const rightRating = ratings[idx + 1];
        if (curRating > rightRating) {
          const oldVal = dp[idx];
          dp[idx] = Math.max(dp[idx], dp[idx + 1] + 1);
          updatedByRight = true;
          steps.push({
            stepIndex: steps.length,
            stage: 3,
            line: anchorMap['transfer_right'] ?? 7,
            codeLine: anchorMap['transfer_right'] ?? 7,
            decision: `➡️ 检查右邻：孩子 [${idx}] 评分 ${curRating} > 右邻 [${idx + 1}] 评分 ${rightRating}，松弛更新 dp[${idx}] = max(${oldVal}, dp[${idx + 1}]+1 = ${dp[idx + 1] + 1}) = ${dp[idx]}`,
            message: `满足右侧约束：当前孩子评分更高，糖果数必须至少比右邻多 1`,
            variables: { currentChild: idx, rightChild: idx + 1, 'dp[idx]': dp[idx], 'dp[right]': dp[idx + 1] },
            stateArrays: buildDpStateArrays(idx, [idx, idx + 1]),
            actorState: { currentSlot: idx, action: 'compare' },
            activeIndices: [idx],
            activeSlot: idx,
            metrics: { 'phase': `松弛右邻 [${idx}]`, 'dp-status': `dp[${idx}] -> ${dp[idx]}` },
          });
        }
      }

      // 阶段 3.4: 若未触发任何邻居松弛，说明该孩子是局部山谷，保持基准 1 颗
      if (!updatedByLeft && !updatedByRight) {
        steps.push({
          stepIndex: steps.length,
          stage: 3,
          line: anchorMap['loop'] ?? 5,
          codeLine: anchorMap['loop'] ?? 5,
          decision: `⛰️ 局部山谷判定：孩子 [${idx}] 评分 ${curRating} 不高于任何未处理或已处理邻居，保持基准糖果数 dp[${idx}] = 1`,
          message: `基准性质：局部波谷仅需分配底线 1 颗糖果即可满足题意`,
          variables: { currentChild: idx, 'dp[idx]': dp[idx], valley: true },
          stateArrays: buildDpStateArrays(idx, [idx]),
          actorState: { currentSlot: idx, action: 'idle' },
          activeIndices: [idx],
          activeSlot: idx,
          metrics: { 'phase': `确认山谷 [${idx}]`, 'dp-status': `dp[${idx}] = 1` },
        });
      }
    }

    const total = dp.reduce((a, b) => a + b, 0);

    // 最终结算 Step
    steps.push({
      stepIndex: steps.length,
      stage: 3,
      line: anchorMap['done'] ?? 9,
      codeLine: anchorMap['done'] ?? 9,
      decision: `🎉 拓扑 DP 表推演完成！全部 ${n} 个孩子按拓扑序依次松弛结束，最少糖果数为 ${total} 颗，分配方案为 [${dp.join(', ')}]`,
      message: `拓扑状态转移矩阵严谨收敛于全局最优解，时间复杂度 O(N log N)，空间复杂度 O(N)`,
      variables: { return: total, finalDp: JSON.stringify(dp), totalCandies: total },
      stateArrays: buildDpStateArrays(),
      actorState: { currentSlot: n - 1, action: 'idle' },
      activeSlot: n - 1,
      metrics: { 'phase': '🏁 DP 结算', 'dp-status': '推演完成' },
    });

    return steps;
  }

  // ==========================================================================
  // Stage 4: 单趟常数空间峰谷贪心 (O(1) Auxiliary Space)
  // ==========================================================================
  private static compileCandyStage4(
    model: IYamlAlgorithmModel,
    ratings: number[],
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = ratings.length;
    const anchorMap = this.extractAnchors(model, 4, options?.direction || 'forward', options?.anchorMap);

    const buildSlopeStateArrays = (activeIdx?: number): StateArrayItem[] => [
      {
        id: 'ratings',
        name: '评分序列 (ratings)',
        indices: ratings.map((_, i) => i),
        values: ratings.map(String),
        activeIdx,
        color: 'indigo',
      },
    ];

    steps.push({
      stepIndex: 0,
      stage: 4,
      line: anchorMap['entry'] ?? 1,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `常数空间优化入口：单趟线性扫描，使用 inc (上坡长)、dec (下坡长) 与 pre 变量实时统计，实现 O(1) 辅助空间`,
      message: `单趟峰谷贪心原理：将序列视为连绵起伏的山峦，上坡累加自然数列 1..k，下坡倒序累加并在超过波峰时补偿峰顶`,
      variables: { n, inc: 1, dec: 0, pre: 1, ret: 1 },
      stateArrays: buildSlopeStateArrays(0),
      metrics: { 'slope-type': '起点', 'aux-space': 'O(1) 常数空间' },
    });

    let ret = 1;
    let inc = 1;
    let dec = 0;
    let pre = 1;

    for (let i = 1; i < n; i++) {
      const cur = ratings[i];
      const prev = ratings[i - 1];

      if (cur >= prev) {
        dec = 0;
        pre = cur === prev ? 1 : pre + 1;
        ret += pre;
        inc = pre;

        steps.push({
          stepIndex: steps.length,
          stage: 4,
          line: anchorMap['up_calc'] ?? 7,
          codeLine: anchorMap['up_calc'] ?? 7,
          decision: `↗️ [上坡/平坡] 孩子 [${i}] 评分 ${cur} >= 前者 ${prev}：下坡计数归零，分配 ${pre} 颗糖，累计糖果达 ${ret} 颗`,
          message: `上坡时糖果逐级爬升，记录历史最高峰顶 inc = ${inc}`,
          variables: { i, slope: '↗ 上坡', pre, inc, dec, ret },
          stateArrays: buildSlopeStateArrays(i),
          activeIndices: [i],
          metrics: { 'slope-type': '↗️ 上坡段', 'aux-space': 'O(1)' },
        });
      } else {
        dec++;
        if (dec === inc) {
          dec++; // 补偿峰顶
        }
        ret += dec;
        pre = 1;

        steps.push({
          stepIndex: steps.length,
          stage: 4,
          line: anchorMap['down_check'] ?? 10,
          codeLine: anchorMap['down_check'] ?? 10,
          decision: `↘️ [下坡] 孩子 [${i}] 评分 ${cur} < 前者 ${prev}：进入下坡段 (dec=${dec})，当前增加 ${dec} 颗糖，累计达 ${ret} 颗`,
          message: `下坡时视作反向自然数增长，若下坡长度赶上历史波峰，则需要给历史波峰补发 1 颗`,
          variables: { i, slope: '↘ 下坡', dec, inc, ret },
          stateArrays: buildSlopeStateArrays(i),
          activeIndices: [i],
          metrics: { 'slope-type': '↘️ 下坡段', 'aux-space': 'O(1)' },
        });
      }
    }

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchorMap['done'] ?? 15,
      codeLine: anchorMap['done'] ?? 15,
      decision: `🎉 单趟常数空间推演完成！无需额外数组，纯标量计数收敛于最优解 ${ret} 颗糖果`,
      message: `单趟坡度分析达成极致空间性能：时间复杂度 O(N)，辅助空间严格 O(1)`,
      variables: { return: ret, finalRet: ret, spaceComplexity: 'O(1)' },
      stateArrays: buildSlopeStateArrays(),
      metrics: { 'slope-type': '🏁 扫描收敛', 'aux-space': 'O(1) 极致' },
    });

    return steps;
  }

  // ==========================================================================
  // 单调递增的数字 (LeetCode 738) 顶层四阶段编译器
  // ==========================================================================
  public static compileMonotoneDigits(
    model: IYamlAlgorithmModel,
    rawNum: any,
    options?: TwoPassCompileOptions,
    stage: number = 1
  ): UniversalStep[] {
    const num = typeof rawNum === 'number' ? rawNum : (Number(rawNum) || 332);
    switch (stage) {
      case 2:
        return this.compileMonotoneDigitsStage2(model, num, options);
      case 3:
        return this.compileMonotoneDigitsStage3(model, num, options);
      case 4:
        return this.compileMonotoneDigitsStage4(model, num, options);
      case 1:
      default:
        return this.compileMonotoneDigitsStage1(model, num, options);
    }
  }

  private static compileMonotoneDigitsStage1(
    model: IYamlAlgorithmModel,
    num: number,
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const digits = String(num).split('').map(Number);
    const n = digits.length;
    const anchors = this.extractAnchors(model, 1, options?.direction || 'forward', options?.anchorMap);
    let flag = n;

    steps.push(
      UniversalStepBuilder.create(0)
        .stage(1)
        .line(anchors.init || 2)
        .slot(0)
        .decision(`初始化：将数字 ${num} 拆解为 ${n} 位数数组 [${digits.join(', ')}]，初始置9标记 flag = ${flag}`)
        .message(`准备开始从右向左逆序扫描，若相邻位破坏单调性则借位。`)
        .variables({ num, flag, digits: [...digits] })
        .metrics({ 'original': num, 'current-digits': digits.join(''), 'flag': flag })
        .build()
    );

    // 1. 逆序扫描借位
    for (let i = n - 1; i > 0; i--) {
      // 探查步
      steps.push(
        UniversalStepBuilder.create(steps.length)
          .stage(1)
          .line(anchors.check || 4)
          .slot(i)
          .highlightSlots([i - 1, i])
          .decision(`逆序比较相邻位：考察 digits[${i - 1}]=${digits[i - 1]} 与 digits[${i}]=${digits[i]}`)
          .message(`单调递增要求高位 <= 低位。比对 digits[${i - 1}] 与 digits[${i}]。`)
          .variables({ i, high: digits[i - 1], low: digits[i], flag })
          .metrics({ 'scan-i': i, 'check': `${digits[i - 1]} > ${digits[i]} ?` })
          .build()
      );

      if (digits[i - 1] > digits[i]) {
        digits[i - 1]--;
        flag = i;
        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(1)
            .line(anchors.borrow || 5)
            .slot(i - 1)
            .highlightSlots([i - 1])
            .decision(`⚠️ 逆序比较发现 ${digits[i - 1] + 1} > ${digits[i]} 违规！高位借位减 1 变为 ${digits[i - 1]}，置9起点更新为 flag=${flag}`)
            .message(`为保持最大且单调递增，将破坏递增的高位减 1，其后所有低位后续均将补齐为 9。`)
            .variables({ i, 'borrowed-pos': i - 1, newHigh: digits[i - 1], flag, digits: [...digits] })
            .metrics({ 'borrow': `pos ${i - 1} -> ${digits[i - 1]}`, 'flag': flag })
            .build()
        );
      } else {
        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(1)
            .line(anchors.check || 4)
            .slot(i - 1)
            .highlightSlots([i - 1, i])
            .decision(`✓ 逆序相邻位 ${digits[i - 1]} <= ${digits[i]} 满足单调递增，无需借位`)
            .message(`当前局部满足单调递增，继续向左扫描高位。`)
            .variables({ i, flag, digits: [...digits] })
            .metrics({ 'status': '局部递增OK', 'flag': flag })
            .build()
        );
      }
    }

    // 2. 正向置 9 循环
    for (let i = flag; i < n; i++) {
      digits[i] = 9;
      steps.push(
        UniversalStepBuilder.create(steps.length)
          .stage(1)
          .line(anchors.fill9 || 9)
          .slot(i)
          .highlightSlots([i])
          .decision(`后缀最大化置9：因高位发生借位，将低位 digits[${i}] 置为 9`)
          .message(`贪心准则：高位减一后，后缀所有数位全部贪心取最大值 9。`)
          .variables({ i, flag, digits: [...digits] })
          .metrics({ [`digits[${i}]`]: '9', 'current-result': digits.join('') })
          .build()
      );
    }

    const finalVal = parseInt(digits.join(''), 10);
    steps.push(
      UniversalStepBuilder.create(steps.length)
        .stage(1)
        .line(anchors.done || 11)
        .slot(0)
        .decision(`🎉 贪心扫描推演完成！最终小于等于 ${num} 的最大单调递增数字为 ${finalVal}`)
        .message(`完成全流程贪心求解，返回 ${finalVal}。`)
        .variables({ return: finalVal, original: num })
        .metrics({ 'final-result': finalVal, 'status': 'DONE' })
        .build()
    );

    return steps;
  }

  private static compileMonotoneDigitsStage2(
    model: IYamlAlgorithmModel,
    num: number,
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const digits = String(num).split('').map(Number);
    const n = digits.length;
    const anchors = this.extractAnchors(model, 2, options?.direction || 'forward', options?.anchorMap);

    const rootNode: UniversalTreeNode = {
      id: 'node-root',
      r: 0,
      c: 0,
      val: `Num(${num})`,
      status: 'current',
      children: [],
    };

    steps.push(
      UniversalStepBuilder.create(0)
        .stage(2)
        .line(anchors.base || 2)
        .slot(0)
        .decision(`决策树根节点展开：初始数字 ${num}`)
        .message(`构建自右向左数位决策依赖树，探索借位分支与贪心剪枝。`)
        .variables({ num, len: n })
        .tree(rootNode)
        .build()
    );

    let flag = n;
    let parentNode = rootNode;

    for (let i = n - 1; i > 0; i--) {
      // 微步 1: 递归深入探查 (@step:check)
      steps.push(
        UniversalStepBuilder.create(steps.length)
          .stage(2)
          .line(anchors.check || 3)
          .slot(i)
          .highlightSlots([i - 1, i])
          .decision(`递归探查：dfs(idx=${i}) 深入考察相邻数位 [${i - 1}] 与 [${i}]`)
          .message(`进入递归调用帧，当前考察位索引 idx=${i}，比对相邻数值关系。`)
          .variables({ idx: i, high: digits[i - 1], low: digits[i], flag })
          .tree(rootNode)
          .activeNode(parentNode.id)
          .build()
      );

      // 微步 2: 分支条件评估
      steps.push(
        UniversalStepBuilder.create(steps.length)
          .stage(2)
          .line(anchors.check || 3)
          .slot(i - 1)
          .highlightSlots([i - 1, i])
          .decision(`条件评估：比对 digits[${i - 1}]=${digits[i - 1]} 与 digits[${i}]=${digits[i]} (${digits[i - 1] > digits[i] ? '违反单调递增' : '满足单调递增'})`)
          .message(digits[i - 1] > digits[i] ? `由于 ${digits[i - 1]} > ${digits[i]}，必须发生高位借位减 1。` : `相邻位合法递增，无需借位。`)
          .variables({ idx: i, high: digits[i - 1], low: digits[i], needsBorrow: digits[i - 1] > digits[i] })
          .tree(rootNode)
          .activeNode(parentNode.id)
          .build()
      );

      // 微步 3: 决策转移与子树挂载
      if (digits[i - 1] > digits[i]) {
        digits[i - 1]--;
        flag = i;
        const child: UniversalTreeNode = {
          id: `node-${i}`,
          r: n - i,
          c: 0,
          val: `[${i-1}]借位->${digits[i-1]},flag=${flag}`,
          status: 'visited',
          tag: '借位减1',
          children: [],
        };
        parentNode.children = [child];
        parentNode = child;

        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(2)
            .line(anchors.branch_borrow || 5)
            .slot(i - 1)
            .highlightSlots([i - 1])
            .decision(`探索借位分支：高位借位减 1 转移至 digits[${i - 1}]=${digits[i - 1]}，更新置9起点 flag=${flag}`)
            .message(`探索借位子分支，更新置9标记点 flag=${flag}。`)
            .variables({ idx: i, 'borrowed': digits[i - 1], flag })
            .tree(rootNode)
            .activeNode(child.id)
            .build()
        );
      } else {
        const child: UniversalTreeNode = {
          id: `node-${i}`,
          r: n - i,
          c: 0,
          val: `[${i-1}]保持->${digits[i-1]}`,
          status: 'visited',
          tag: '满足保持',
          children: [],
        };
        parentNode.children = [child];
        parentNode = child;

        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(2)
            .line(anchors.branch_keep || 7)
            .slot(i - 1)
            .highlightSlots([i - 1, i])
            .decision(`探索保持分支：相邻位满足递增，转移至 dfs(idx=${i - 1})`)
            .message(`无借位发生，保持当前数位继续深入。`)
            .variables({ idx: i, flag })
            .tree(rootNode)
            .activeNode(child.id)
            .build()
        );
      }
    }

    // 后缀置 9
    for (let i = flag; i < n; i++) {
      digits[i] = 9;
      const child: UniversalTreeNode = {
        id: `node-fill-${i}`,
        r: n + (i - flag + 1),
        c: 0,
        val: `[${i}]置9`,
        status: 'visited',
        tag: '置9',
        children: [],
      };
      parentNode.children = [child];
      parentNode = child;

      steps.push(
        UniversalStepBuilder.create(steps.length)
          .stage(2)
          .line(anchors.base || 2)
          .slot(i)
          .highlightSlots([i])
          .decision(`递归回溯置9：将低位 [${i}] 补齐为 9`)
          .message(`贪心后缀最大化展开。`)
          .variables({ i, digits: [...digits] })
          .tree(rootNode)
          .activeNode(child.id)
          .build()
      );
    }

    const finalVal = parseInt(digits.join(''), 10);
    steps.push(
      UniversalStepBuilder.create(steps.length)
        .stage(2)
        .line(anchors.base || 2)
        .slot(0)
        .decision(`决策树完全遍历完成，最终生成最大单调递增数字 ${finalVal}`)
        .message(`🎯 递归基底命中，返回最优结果。`)
        .variables({ return: finalVal, original: num })
        .tree(rootNode)
        .build()
    );

    return steps;
  }

  private static compileMonotoneDigitsStage3(
    model: IYamlAlgorithmModel,
    num: number,
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const digits = String(num).split('').map(Number);
    const n = digits.length;
    const anchors = this.extractAnchors(model, 3, options?.direction || 'forward', options?.anchorMap);

    // grid: n 行, 2 列 (col 0: 当前位数字, col 1: 当前 flag 标记)
    const grid: number[][] = Array.from({ length: n }, (_, idx) => [digits[idx], n]);
    let flag = n;

    steps.push(
      UniversalStepBuilder.create(0)
        .stage(3)
        .line(anchors.table_init || 3)
        .slot(0)
        .grid(grid)
        .cell(0, 0)
        .decision(`数位矩阵初始化：构造 ${n}×2 状态矩阵，记录各数位当前值与变9标记`)
        .message(`第 0 列为数位数值，第 1 列为借位影响标记。`)
        .variables({ len: n, flag: n })
        .metrics({ 'table': '就绪', 'flag': n })
        .build()
    );

    for (let i = n - 1; i > 0; i--) {
      // 探查步
      steps.push(
        UniversalStepBuilder.create(steps.length)
          .stage(3)
          .line(anchors.loop || 5)
          .slot(i)
          .highlightSlots([i - 1, i])
          .grid(grid)
          .cell(i, 0)
          .decision(`状态探查：读取 table[${i - 1}][0]=${digits[i - 1]} 与 table[${i}][0]=${digits[i]}`)
          .message(`比对两相邻位在当前推演步的数值。`)
          .variables({ i, high: digits[i - 1], low: digits[i] })
          .metrics({ 'current-i': i, 'check': `${digits[i - 1]} > ${digits[i]}` })
          .build()
      );

      if (digits[i - 1] > digits[i]) {
        digits[i - 1]--;
        flag = i;
        grid[i - 1][0] = digits[i - 1];
        grid[i - 1][1] = flag;

        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(3)
            .line(anchors.borrow || 7)
            .slot(i - 1)
            .highlightSlots([i - 1])
            .grid(grid)
            .cell(i - 1, 0)
            .decision(`状态转移：高位借位减 1，table[${i - 1}] 更新为 [${digits[i - 1]}, flag=${flag}]`)
            .message(`状态向量写回矩阵。`)
            .variables({ i, newHigh: digits[i - 1], flag })
            .metrics({ 'borrow-cell': `table[${i - 1}][0]=${digits[i - 1]}`, 'flag': flag })
            .build()
        );
      } else {
        grid[i - 1][1] = flag;
        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(3)
            .line(anchors.record || 10)
            .slot(i - 1)
            .highlightSlots([i - 1, i])
            .grid(grid)
            .cell(i - 1, 1)
            .decision(`状态转移：位 [${i - 1}] 维持原值 ${digits[i - 1]}，记录标记 flag=${flag}`)
            .message(`状态保持稳定。`)
            .variables({ i, val: digits[i - 1], flag })
            .metrics({ 'status': '稳定', 'flag': flag })
            .build()
        );
      }
    }

    // 置 9 状态更新
    for (let i = flag; i < n; i++) {
      digits[i] = 9;
      grid[i][0] = 9;
      steps.push(
        UniversalStepBuilder.create(steps.length)
          .stage(3)
          .line(anchors.record || 10)
          .slot(i)
          .highlightSlots([i])
          .grid(grid)
          .cell(i, 0)
          .decision(`状态更新：将 table[${i}][0] 置为 9`)
          .message(`后缀全部最大化赋值 9。`)
          .variables({ i, val: 9, flag })
          .metrics({ [`cell[${i}]`]: '9' })
          .build()
      );
    }

    const finalVal = parseInt(digits.join(''), 10);
    steps.push(
      UniversalStepBuilder.create(steps.length)
        .stage(3)
        .line(anchors.done || 12)
        .slot(0)
        .grid(grid)
        .cell(0, 0)
        .decision(`状态转移完成，矩阵收敛，最终结果为 ${finalVal}`)
        .message(`🏁 全表填毕，返回最终数值。`)
        .variables({ return: finalVal })
        .metrics({ 'final': finalVal, 'status': 'TRUE' })
        .build()
    );

    return steps;
  }

  private static compileMonotoneDigitsStage4(
    model: IYamlAlgorithmModel,
    num: number,
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const digits = String(num).split('').map(Number);
    const n = digits.length;
    const anchors = this.extractAnchors(model, 4, options?.direction || 'forward', options?.anchorMap);
    let flag = n;

    steps.push(
      UniversalStepBuilder.create(0)
        .stage(4)
        .line(anchors.init || 2)
        .slot(0)
        .decision(`原地空间压缩：将数字 ${num} 转化为字符数组 s，直接原地操作，空间复杂度 O(1)`)
        .message(`零额外内存开销，原地双指针扫描。`)
        .variables({ num, flag, len: n })
        .metrics({ 'space': 'O(1)', 'flag': flag })
        .build()
    );

    for (let i = n - 1; i > 0; i--) {
      // 探查步
      steps.push(
        UniversalStepBuilder.create(steps.length)
          .stage(4)
          .line(anchors.loop || 4)
          .slot(i)
          .highlightSlots([i - 1, i])
          .decision(`[${i}] 原地探查：比对 s[${i - 1}]=${digits[i - 1]} 与 s[${i}]=${digits[i]}`)
          .message(`寄存器比对相邻字符。`)
          .variables({ i, high: digits[i - 1], low: digits[i], flag })
          .metrics({ 'i': i, 'check': `${digits[i - 1]} > ${digits[i]}` })
          .build()
      );

      if (digits[i - 1] > digits[i]) {
        digits[i - 1]--;
        flag = i;
        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(4)
            .line(anchors.borrow || 5)
            .slot(i - 1)
            .highlightSlots([i - 1])
            .decision(`[${i}] 原地借位：s[${i - 1}]-- 变为 '${digits[i - 1]}', flag 更新为 ${flag}`)
            .message(`直接修改数组元素。`)
            .variables({ i, borrowed: digits[i - 1], flag, currentS: digits.join('') })
            .metrics({ 's': digits.join(''), 'flag': flag })
            .build()
        );
      }
    }

    for (let i = flag; i < n; i++) {
      digits[i] = 9;
      steps.push(
        UniversalStepBuilder.create(steps.length)
          .stage(4)
          .line(anchors.fill9 || 7)
          .slot(i)
          .highlightSlots([i])
          .decision(`[${i}] 原地置9：s[${i}] = '9'`)
          .message(`极速单趟原地覆写。`)
          .variables({ i, currentS: digits.join('') })
          .metrics({ 's': digits.join('') })
          .build()
      );
    }

    const finalVal = parseInt(digits.join(''), 10);
    steps.push(
      UniversalStepBuilder.create(steps.length)
        .stage(4)
        .line(anchors.done || 8)
        .slot(0)
        .decision(`极速原地扫描完成，转换输出最优解 ${finalVal}`)
        .message(`🏆 原地算法完成，返回 ${finalVal}。`)
        .variables({ return: finalVal })
        .metrics({ 'result': finalVal, 'status': 'DONE' })
        .build()
    );

    return steps;
  }

  // ==========================================================================
  // 摆动序列 (LeetCode 376) 顶层四阶段编译器
  // ==========================================================================
  public static compileWiggleSubsequence(
    model: IYamlAlgorithmModel,
    options?: (TwoPassCompileOptions & { nums?: number[] }) | any,
    stage: number = 1
  ): UniversalStep[] {
    const rawNums = options?.nums ?? (Array.isArray(options) ? options : model.defaultParams?.nums) ?? [1, 7, 4, 9, 2, 5];
    const nums: number[] = Array.isArray(rawNums)
      ? rawNums.map(Number)
      : typeof rawNums === 'string'
      ? rawNums.split(/[\s,]+/).filter(Boolean).map(Number)
      : [1, 7, 4, 9, 2, 5];

    switch (stage) {
      case 2:
        return this.compileWiggleSubsequenceStage2(model, nums, options);
      case 3:
        return this.compileWiggleSubsequenceStage3(model, nums, options);
      case 4:
        return this.compileWiggleSubsequenceStage4(model, nums, options);
      case 1:
      default:
        return this.compileWiggleSubsequenceStage1(model, nums, options);
    }
  }

  private static compileWiggleSubsequenceStage1(
    model: IYamlAlgorithmModel,
    nums: number[],
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = nums.length;
    const anchors = this.extractAnchors(model, 1, options?.direction || 'forward', options?.anchorMap);

    if (n <= 1) {
      steps.push(
        UniversalStepBuilder.create(0)
          .stage(1)
          .line(anchors.guard || 2)
          .slot(0)
          .decision(`特判：数组长度为 ${n} <= 1，直接返回长度 ${n}`)
          .message(`空数组或单元素数组直接视作有效摆动序列。`)
          .variables({ length: n, nums })
          .metrics({ 'count': n, 'status': '边界直接返回' })
          .build()
      );
      return steps;
    }

    let count = 1;
    let preDiff = 0;

    steps.push(
      UniversalStepBuilder.create(0)
        .stage(1)
        .line(anchors.init || 3)
        .slot(0)
        .decision(`初始化：起始假定最右端包含 1 个峰值/谷值，count = 1，preDiff = 0`)
        .message(`准备开始单趟扫描，比较相邻两数差值 curDiff 与前驱差值 preDiff。`)
        .variables({ count: 1, preDiff: 0, nums })
        .metrics({ 'count': 1, 'preDiff': 0, 'phase': '初始化就绪' })
        .build()
    );

    for (let i = 1; i < n; i++) {
      const curDiff = nums[i] - nums[i - 1];
      const slot = i;

      if ((curDiff > 0 && preDiff <= 0) || (curDiff < 0 && preDiff >= 0)) {
        count++;
        const oldPre = preDiff;
        preDiff = curDiff;

        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(1)
            .line(anchors.peak_or_valley || 6)
            .slot(slot)
            .highlightSlots([i - 1, i])
            .decision(`📈📉 捕获反转极值点！[${i-1}]=${nums[i-1]} -> [${i}]=${nums[i]} (差值=${curDiff > 0 ? '+' + curDiff : curDiff})，跨越方向反转，count 增至 ${count}`)
            .message(`峰值或谷值判定成功：差值方向由 ${oldPre} 翻转为 ${preDiff}，计入摆动子序列。`)
            .variables({ i, prev: nums[i - 1], curr: nums[i], curDiff, preDiff, count })
            .metrics({
              'cur-idx': i,
              'diff': `${nums[i - 1]} -> ${nums[i]} (${curDiff > 0 ? '+' + curDiff : curDiff})`,
              'count': count,
              'status': curDiff > 0 ? '谷转峰 ↑' : '峰转谷 ↓',
            })
            .build()
        );
      } else {
        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(1)
            .line(anchors.loop || 4)
            .slot(slot)
            .highlightSlots([i - 1, i])
            .decision(`⏩ 单调坡或平坡延伸：[${i-1}]=${nums[i-1]} -> [${i}]=${nums[i]} (差值=${curDiff})，过滤中间过渡节点，preDiff 保持 ${preDiff}，count 维持 ${count}`)
            .message(`坡度未发生反转，贪心忽略单调坡中间节点，等待极值到来。`)
            .variables({ i, prev: nums[i - 1], curr: nums[i], curDiff, preDiff, count })
            .metrics({
              'cur-idx': i,
              'diff': `${nums[i - 1]} -> ${nums[i]} (${curDiff})`,
              'count': count,
              'status': '单调坡跳过',
            })
            .build()
        );
      }
    }

    steps.push(
      UniversalStepBuilder.create(steps.length)
        .stage(1)
        .line(anchors.done || 10)
        .slot(n - 1)
        .highlightSlots([n - 1])
        .decision(`🎉 求解完成：最长摆动子序列长度为 ${count}`)
        .message(`完成全数组扫描，返回最终摆动极值数量 ${count}。`)
        .variables({ return: count, totalElements: n })
        .metrics({ 'final-count': count, 'status': '完成' })
        .build()
    );

    return steps;
  }

  private static compileWiggleSubsequenceStage2(
    model: IYamlAlgorithmModel,
    nums: number[],
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = nums.length;
    const anchors = this.extractAnchors(model, 2, options?.direction || 'forward', options?.anchorMap);

    const memoGrid: (number | null)[][] = Array.from({ length: n }, () => new Array(2).fill(null));
    memoGrid[0][0] = 1;
    memoGrid[0][1] = 1;

    const rootNode: UniversalTreeNode = {
      id: 'node-root',
      r: 0,
      c: 0,
      val: `WiggleDFS(i=0)`,
      status: 'current',
      children: [],
    };

    steps.push(
      UniversalStepBuilder.create(0)
        .stage(2)
        .line(anchors.base || 2)
        .slot(0)
        .decision(`自顶向下展开摆动决策依赖树根节点：dfs(i=0)`)
        .message(`每个节点评估保留为峰谷或跳过单调坡的分支路径。`)
        .variables({ i: 0, total: n })
        .tree(rootNode)
        .grid(memoGrid)
        .build()
    );

    let curParent = rootNode;
    let count = 1;
    let preDiff = 0;

    for (let i = 1; i < n; i++) {
      const curDiff = nums[i] - nums[i - 1];
      const slot = i;

      steps.push(
        UniversalStepBuilder.create(steps.length)
          .stage(2)
          .line(anchors.entry || 3)
          .slot(slot)
          .highlightSlots([slot])
          .decision(`递归探查：dfs(i=${i}) 考察节点 nums[${i}]=${nums[i]}`)
          .message(`评估与上一节点 nums[${i - 1}]=${nums[i - 1]} 的差值方向。`)
          .variables({ i, val: nums[i], curDiff })
          .tree(rootNode)
          .grid(memoGrid)
          .activeNode(curParent.id)
          .build()
      );

      if ((curDiff > 0 && preDiff <= 0) || (curDiff < 0 && preDiff >= 0)) {
        count++;
        preDiff = curDiff;
        memoGrid[i][curDiff > 0 ? 0 : 1] = count;
        const child: UniversalTreeNode = {
          id: `node-${i}`,
          r: i,
          c: 0,
          val: `[${i}] 采纳极值点(${nums[i]}) count=${count}`,
          status: 'visited',
          tag: curDiff > 0 ? '波峰' : '波谷',
          children: [],
        };
        curParent.children = [child];
        curParent = child;

        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(2)
            .line(anchors.branch_pick || 6)
            .slot(slot)
            .highlightSlots([slot])
            .decision(`决策分支：方向反转，采纳分支 -> count 增至 ${count}`)
            .message(`极值点剪枝确认，作为关键摆动节点保留。`)
            .variables({ i, count, preDiff })
            .tree(rootNode)
            .grid(memoGrid)
            .activeNode(child.id)
            .build()
        );
      } else {
        memoGrid[i][0] = count;
        memoGrid[i][1] = count;
        const child: UniversalTreeNode = {
          id: `node-${i}`,
          r: i,
          c: 0,
          val: `[${i}] 过滤坡度(${nums[i]}) count=${count}`,
          status: 'pruned',
          tag: '坡度过滤',
          children: [],
        };
        curParent.children = [child];
        curParent = child;

        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(2)
            .line(anchors.branch_skip || 4)
            .slot(slot)
            .highlightSlots([slot])
            .decision(`决策分支：单调坡度，剪枝跳过 -> count 维持 ${count}`)
            .message(`中间过渡节点不影响最优解，直接剪枝。`)
            .variables({ i, count, preDiff })
            .tree(rootNode)
            .grid(memoGrid)
            .activeNode(child.id)
            .build()
        );
      }
    }

    steps.push(
      UniversalStepBuilder.create(steps.length)
        .stage(2)
        .line(anchors.optimal || 8)
        .slot(n - 1)
        .highlightSlots([n - 1])
        .decision(`决策树推演收敛：最长摆动长度为 ${count}`)
        .message(`决策树完整遍历完毕。`)
        .variables({ return: count })
        .tree(rootNode)
        .grid(memoGrid)
        .activeNode(curParent.id)
        .build()
    );

    return steps;
  }

  private static compileWiggleSubsequenceStage3(
    model: IYamlAlgorithmModel,
    nums: number[],
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = nums.length;
    const anchors = this.extractAnchors(model, 3, options?.direction || 'forward', options?.anchorMap);

    const dpGrid: (number | null)[][] = Array.from({ length: n }, () => new Array(2).fill(null));
    dpGrid[0][0] = 1;
    dpGrid[0][1] = 1;

    steps.push(
      UniversalStepBuilder.create(0)
        .stage(3)
        .line(anchors.dp_init || 2)
        .slot(0)
        .decision(`初始化交替状态表格 dp[${n}][2]：up[0]=1, down[0]=1`)
        .message(`二维状态矩阵：第 0 列记录上升结尾最大长度，第 1 列记录下降结尾最大长度。`)
        .variables({ n, 'dp[0][0]': 1, 'dp[0][1]': 1 })
        .grid(dpGrid)
        .metrics({ 'matrix-size': `${n} × 2` })
        .build()
    );

    let up = 1;
    let down = 1;

    for (let i = 1; i < n; i++) {
      const slot = i;
      const curDiff = nums[i] - nums[i - 1];

      steps.push(
        UniversalStepBuilder.create(steps.length)
          .stage(3)
          .line(anchors.dp_loop || 3)
          .slot(slot)
          .highlightSlots([slot])
          .decision(`状态演进 [${i}]：nums[${i}]=${nums[i]} 与 nums[${i - 1}]=${nums[i - 1]} 比对`)
          .message(`差值 curDiff = ${curDiff}。`)
          .variables({ i, curr: nums[i], prev: nums[i - 1], curDiff })
          .grid(dpGrid)
          .metrics({ 'cur-diff': curDiff })
          .build()
      );

      if (curDiff > 0) {
        up = down + 1;
        dpGrid[i][0] = up;
        dpGrid[i][1] = down;
        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(3)
            .line(anchors.dp_transfer || 5)
            .slot(slot)
            .highlightSlots([slot])
            .decision(`上升转移：nums[${i}] > nums[${i - 1}]，up[${i}] = down[${i - 1}] + 1 = ${up}，down 保持 ${down}`)
            .message(`由前驱下降状态转移至当前上升状态。`)
            .variables({ i, up, down })
            .grid(dpGrid)
            .metrics({ 'up': up, 'down': down, 'phase': '上升转移' })
            .build()
        );
      } else if (curDiff < 0) {
        down = up + 1;
        dpGrid[i][0] = up;
        dpGrid[i][1] = down;
        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(3)
            .line(anchors.dp_transfer || 5)
            .slot(slot)
            .highlightSlots([slot])
            .decision(`下降转移：nums[${i}] < nums[${i - 1}]，down[${i}] = up[${i - 1}] + 1 = ${down}，up 保持 ${up}`)
            .message(`由前驱上升状态转移至当前下降状态。`)
            .variables({ i, up, down })
            .grid(dpGrid)
            .metrics({ 'up': up, 'down': down, 'phase': '下降转移' })
            .build()
        );
      } else {
        dpGrid[i][0] = up;
        dpGrid[i][1] = down;
        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(3)
            .line(anchors.dp_transfer || 5)
            .slot(slot)
            .highlightSlots([slot])
            .decision(`平坡保持：nums[${i}] == nums[${i - 1}]，up 与 down 均保持继承`)
            .message(`平坡无增益，继承前驱。`)
            .variables({ i, up, down })
            .grid(dpGrid)
            .metrics({ 'up': up, 'down': down, 'phase': '平坡继承' })
            .build()
        );
      }
    }

    const maxAns = Math.max(up, down);
    steps.push(
      UniversalStepBuilder.create(steps.length)
        .stage(3)
        .line(anchors.dp_done || 7)
        .slot(n - 1)
        .highlightSlots([n - 1])
        .decision(`状态表格演进收敛：max(up[${n - 1}], down[${n - 1}]) = ${maxAns}`)
        .message(`完成二维状态表格求解。`)
        .variables({ return: maxAns })
        .grid(dpGrid)
        .metrics({ 'final-max': maxAns, 'status': '收敛' })
        .build()
    );

    return steps;
  }

  private static compileWiggleSubsequenceStage4(
    model: IYamlAlgorithmModel,
    nums: number[],
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = nums.length;
    const anchors = this.extractAnchors(model, 4, options?.direction || 'forward', options?.anchorMap);

    let up = 1;
    let down = 1;

    steps.push(
      UniversalStepBuilder.create(0)
        .stage(4)
        .line(anchors.reg_init || 2)
        .slot(0)
        .decision(`O(1) 双寄存器初始化：up = 1, down = 1`)
        .message(`利用 2 个局部寄存器完成常数空间的单趟极速推演。`)
        .variables({ up: 1, down: 1 })
        .metrics({ 'up-reg': 1, 'down-reg': 1 })
        .build()
    );

    for (let i = 1; i < n; i++) {
      const slot = i;
      if (nums[i] > nums[i - 1]) {
        up = down + 1;
      } else if (nums[i] < nums[i - 1]) {
        down = up + 1;
      }

      steps.push(
        UniversalStepBuilder.create(steps.length)
          .stage(4)
          .line(anchors.reg_loop || 3)
          .slot(slot)
          .highlightSlots([slot])
          .decision(`寄存器流式更新 [${i}]：nums[${i}]=${nums[i]} -> up=${up}, down=${down}`)
          .message(`单趟常数开销寄存器更新。`)
          .variables({ i, up, down })
          .metrics({ 'up-reg': up, 'down-reg': down })
          .build()
      );
    }

    const ans = Math.max(up, down);
    steps.push(
      UniversalStepBuilder.create(steps.length)
        .stage(4)
        .line(anchors.reg_done || 5)
        .slot(n - 1)
        .highlightSlots([n - 1])
        .decision(`极速单趟寄存器流推演完成：最大摆动长度 = ${ans}`)
        .message(`完成 O(1) 空间极速求解。`)
        .variables({ return: ans })
        .metrics({ 'final-result': ans, 'status': '完成' })
        .build()
    );

    return steps;
  }

  // ==========================================================================
  // 最大子数组和 (LeetCode 53 / Kadane) 顶层四阶段编译器
  // 归约：单调前后缀扫描与局部正增益贪心保留，属于相邻元素极值族群
  // ==========================================================================
  public static compileMaxSubarray(
    model: IYamlAlgorithmModel,
    options?: (TwoPassCompileOptions & { nums?: number[] }) | any,
    stage: number = 1
  ): UniversalStep[] {
    const rawNums = options?.nums ?? (Array.isArray(options) ? options : model.defaultParams?.nums) ?? [-2, 1, -3, 4, -1, 2, 1, -5, 4];
    const nums: number[] = Array.isArray(rawNums)
      ? rawNums.map(Number)
      : typeof rawNums === 'string'
      ? rawNums.split(/[\s,]+/).filter(Boolean).map(Number)
      : [-2, 1, -3, 4, -1, 2, 1, -5, 4];

    switch (stage) {
      case 2:
        return this.compileMaxSubarrayStage2(model, nums, options);
      case 3:
        return this.compileMaxSubarrayStage3(model, nums, options);
      case 4:
        return this.compileMaxSubarrayStage4(model, nums, options);
      case 1:
      default:
        return this.compileMaxSubarrayStage1(model, nums, options);
    }
  }

  private static compileMaxSubarrayStage1(
    model: IYamlAlgorithmModel,
    nums: number[],
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = nums.length;
    const isReverse = options?.direction === 'reverse';
    const anchors = this.extractAnchors(model, 1, options?.direction || 'forward', options?.anchorMap);

    if (!isReverse) {
      let currentSum = 0;
      let maxSum = nums[0];
      let maxStart = 0;
      let maxEnd = 0;
      let curStart = 0;

      steps.push({
        stepIndex: steps.length,
        stage: 1,
        line: anchors.init || 2,
        codeLine: anchors.init || 2,
        decision: `1. 初始化 Kadane 贪心状态：currentSum = 0，全局初始最优解 maxSum = ${maxSum}`,
        message: `从左至右线性扫描，只要连续和保持为正，便对后续元素产生正增益`,
        variables: { currentSum: 0, maxSum, n },
        stateArrays: [
          {
            id: 'nums',
            name: '输入数组 nums',
            indices: nums.map((_, idx) => idx),
            values: nums.map(String),
            color: 'indigo',
          },
          {
            id: 'kadane',
            name: 'Kadane 动态窗口 [curStart..i]',
            indices: nums.map((_, idx) => idx),
            values: nums.map(() => '0'),
            color: 'emerald',
          },
        ],
        activeIndices: [0],
        activeSlot: 0,
        metrics: { '当前连续和': '0', '全局最大和': String(maxSum), '状态': '初始化' },
      });

      for (let i = 0; i < n; i++) {
        const x = nums[i];
        currentSum += x;

        steps.push({
          stepIndex: steps.length,
          stage: 1,
          line: anchors.loop || 5,
          codeLine: anchors.loop || 5,
          decision: `2. 累加推进：考察 nums[${i}] = ${x}，连续和累加至 currentSum = ${currentSum}`,
          message: `将当前元素纳入连续子段考察范围`,
          variables: { i, val: x, currentSum, maxSum },
          stateArrays: [
            {
              id: 'nums',
              name: '输入数组 nums',
              indices: nums.map((_, idx) => idx),
              values: nums.map(String),
              activeIdx: i,
              color: 'indigo',
            },
            {
              id: 'kadane',
              name: '当前累积窗口',
              indices: nums.map((_, idx) => idx),
              values: nums.map((v, idx) => idx >= curStart && idx <= i ? String(v) : ''),
              activeIdx: i,
              color: 'emerald',
            },
          ],
          activeIndices: [i],
          activeSlot: i,
          metrics: { '当前连续和': String(currentSum), '全局最大和': String(maxSum), '考察下标': String(i) },
        });

        if (currentSum > maxSum) {
          maxSum = currentSum;
          maxStart = curStart;
          maxEnd = i;
          steps.push({
            stepIndex: steps.length,
            stage: 1,
            line: anchors.update || 8,
            codeLine: anchors.update || 8,
            decision: `★ 刷新全局最大和！currentSum = ${currentSum} > 历史 maxSum，更新 maxSum = ${maxSum}，当前最优区间 [${maxStart}..${maxEnd}]`,
            message: `捕捉到当前更优连续子数组`,
            variables: { i, currentSum, maxSum, maxStart, maxEnd },
            stateArrays: [
              {
                id: 'nums',
                name: '输入数组 nums',
                indices: nums.map((_, idx) => idx),
                values: nums.map(String),
                activeIdx: i,
                color: 'indigo',
              },
              {
                id: 'kadane',
                name: '全局最优区间',
                indices: nums.map((_, idx) => idx),
                values: nums.map((v, idx) => idx >= maxStart && idx <= maxEnd ? String(v) : ''),
                color: 'emerald',
              },
            ],
            activeIndices: [i],
            activeSlot: i,
            metrics: { '当前连续和': String(currentSum), '全局最大和': String(maxSum), '最优区间': `[${maxStart}..${maxEnd}]` },
          });
        }

        if (currentSum < 0) {
          steps.push({
            stepIndex: steps.length,
            stage: 1,
            line: anchors.reset || 11,
            codeLine: anchors.reset || 11,
            decision: `⚠️ 负收益断舍离：currentSum = ${currentSum} < 0，累加和已成为负资产，立即清零重置为 0！`,
            message: `任何包含负和前缀的连续段都会拖累后续子数组，贪心抛弃`,
            variables: { i, oldSum: currentSum, currentSum: 0, nextStart: i + 1 },
            stateArrays: [
              {
                id: 'nums',
                name: '输入数组 nums',
                indices: nums.map((_, idx) => idx),
                values: nums.map(String),
                activeIdx: i,
                color: 'indigo',
              },
              {
                id: 'kadane',
                name: '连续和已清零',
                indices: nums.map((_, idx) => idx),
                values: nums.map(() => ''),
                color: 'amber',
              },
            ],
            activeIndices: [i],
            activeSlot: i,
            metrics: { '当前连续和': '0 (清零)', '全局最大和': String(maxSum), '动作': '清零重置' },
          });
          currentSum = 0;
          curStart = i + 1;
        }
      }

      steps.push({
        stepIndex: steps.length,
        stage: 1,
        line: anchors.done || 14,
        codeLine: anchors.done || 14,
        decision: `🏁 正向 Kadane 扫描完成！遍历收敛，全局最大子数组和为 ${maxSum}，区间 [${maxStart}..${maxEnd}]`,
        message: `单趟 O(N) 线性扫描达成全局最优解`,
        variables: { return: maxSum, maxStart, maxEnd, total: n },
        stateArrays: [
          {
            id: 'nums',
            name: '最终最优解子数组',
            indices: nums.map((_, idx) => idx),
            values: nums.map((v, idx) => idx >= maxStart && idx <= maxEnd ? `★${v}` : String(v)),
            color: 'emerald',
          },
        ],
        activeIndices: [maxEnd],
        activeSlot: maxEnd,
        metrics: { '全局最大和': String(maxSum), '状态': '🏁 扫描完成' },
      });
    } else {
      // 逆向 Kadane
      let currentSum = 0;
      let maxSum = nums[n - 1];

      steps.push({
        stepIndex: steps.length,
        stage: 1,
        line: anchors.init || 2,
        codeLine: anchors.init || 2,
        decision: `逆向 Kadane 扫描初始化：从右向左扫描，初始 maxSum = ${maxSum}`,
        message: `逆序推演以每个位置为起点的最大连续和`,
        variables: { currentSum: 0, maxSum, n },
        stateArrays: [
          {
            id: 'nums',
            name: '逆序扫描数组',
            indices: nums.map((_, idx) => idx),
            values: nums.map(String),
            color: 'amber',
          },
        ],
        activeIndices: [n - 1],
        activeSlot: n - 1,
        metrics: { '逆向连续和': '0', '逆向最大和': String(maxSum) },
      });

      for (let i = n - 1; i >= 0; i--) {
        const x = nums[i];
        currentSum += x;

        steps.push({
          stepIndex: steps.length,
          stage: 1,
          line: anchors.loop || 5,
          codeLine: anchors.loop || 5,
          decision: `逆向累加 [${i}]：nums[${i}]=${x}，逆向连续和 currentSum = ${currentSum}`,
          message: `从右向左延展连续段`,
          variables: { i, val: x, currentSum, maxSum },
          stateArrays: [
            {
              id: 'nums',
              name: '逆序扫描',
              indices: nums.map((_, idx) => idx),
              values: nums.map(String),
              activeIdx: i,
              color: 'amber',
            },
          ],
          activeIndices: [i],
          activeSlot: i,
          metrics: { '逆向连续和': String(currentSum), '逆向最大和': String(maxSum) },
        });

        if (currentSum > maxSum) {
          maxSum = currentSum;
          steps.push({
            stepIndex: steps.length,
            stage: 1,
            line: anchors.update || 7,
            codeLine: anchors.update || 7,
            decision: `★ 逆向刷新最大和！currentSum = ${currentSum} > maxSum，更新 maxSum = ${maxSum}`,
            message: `捕获更优逆向连续段`,
            variables: { i, currentSum, maxSum },
            stateArrays: [
              {
                id: 'nums',
                name: '逆序扫描',
                indices: nums.map((_, idx) => idx),
                values: nums.map(String),
                activeIdx: i,
                color: 'amber',
              },
            ],
            activeIndices: [i],
            activeSlot: i,
            metrics: { '逆向连续和': String(currentSum), '逆向最大和': String(maxSum) },
          });
        }

        if (currentSum < 0) {
          steps.push({
            stepIndex: steps.length,
            stage: 1,
            line: anchors.reset || 9,
            codeLine: anchors.reset || 9,
            decision: `⚠️ 逆向负和清零：currentSum = ${currentSum} < 0，断开累加重新开始`,
            message: `贪心抛弃负收益连续段`,
            variables: { i, currentSum: 0 },
            stateArrays: [
              {
                id: 'nums',
                name: '逆序扫描',
                indices: nums.map((_, idx) => idx),
                values: nums.map(String),
                activeIdx: i,
                color: 'amber',
              },
            ],
            activeIndices: [i],
            activeSlot: i,
            metrics: { '逆向连续和': '0 (清零)', '逆向最大和': String(maxSum) },
          });
          currentSum = 0;
        }
      }

      steps.push({
        stepIndex: steps.length,
        stage: 1,
        line: anchors.done || 11,
        codeLine: anchors.done || 11,
        decision: `🏁 逆向 Kadane 扫描完成！获得完全一致的最大子数组和：${maxSum}`,
        message: `双向对称性证明了贪心局部最优解与全局最优的一致性`,
        variables: { return: maxSum },
        stateArrays: [
          {
            id: 'nums',
            name: '最终最优解',
            indices: nums.map((_, idx) => idx),
            values: nums.map(String),
            color: 'amber',
          },
        ],
        activeIndices: [0],
        activeSlot: 0,
        metrics: { '逆向最大和': String(maxSum), '状态': '🏁 逆向收敛' },
      });
    }

    return steps;
  }

  private static compileMaxSubarrayStage2(
    model: IYamlAlgorithmModel,
    nums: number[],
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = nums.length;
    const anchors = this.extractAnchors(model, 2, options?.direction || 'forward', options?.anchorMap);

    const memoGrid: (number | null)[][] = Array.from({ length: n }, () => new Array(2).fill(null));

    const rootNode: UniversalTreeNode = {
      id: 'div_root',
      r: 0,
      c: 0,
      val: `solve([0..${n - 1}])`,
      status: 'active',
      children: [],
    };

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      line: anchors.entry || 3,
      codeLine: anchors.entry || 3,
      decision: `分治决策树初始化：自顶向下构建区间 [0..${n - 1}] 分治递归树`,
      message: `分治策略：最大子数组要么在左半部分，要么在右半部分，要么跨越中点`,
      variables: { left: 0, right: n - 1, total: n },
      treeRoot: cloneStateDepTree(rootNode),
      grid: memoGrid.map(r => [...r]),
      metrics: { '分治区间': `[0..${n - 1}]`, '阶段': '树形展开' },
    });

    let nodeUid = 0;
    const buildDfs = (l: number, r: number, parentNode: UniversalTreeNode, depth: number): number => {
      nodeUid++;
      const mid = Math.floor((l + r) / 2);
      const curId = `node_${l}_${r}_${nodeUid}`;

      if (l === r) {
        const val = nums[l];
        const leafNode: UniversalTreeNode = {
          id: curId,
          r: depth,
          c: l,
          val: `[${l}]: ${val}`,
          status: 'visited',
          children: [],
        };
        parentNode.children.push(leafNode);
        memoGrid[l][0] = val;

        steps.push({
          stepIndex: steps.length,
          stage: 2,
          line: anchors.base || 2,
          codeLine: anchors.base || 2,
          decision: `🛑 触底单元素基准：区间 [${l}..${r}] 仅含单元素 nums[${l}] = ${val}，直接返回`,
          message: `分治触底返回叶子节点结果`,
          variables: { l, r, val, depth },
          treeRoot: cloneStateDepTree(rootNode),
          grid: memoGrid.map(row => [...row]),
          activeIndices: [l],
          activeSlot: l,
          metrics: { '单元素值': String(val), '深度': String(depth) },
        });

        return val;
      }

      const internalNode: UniversalTreeNode = {
        id: curId,
        r: depth,
        c: mid,
        val: `[${l}..${r}] mid=${mid}`,
        status: 'active',
        children: [],
      };
      parentNode.children.push(internalNode);

      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.branch_left || 5,
        codeLine: anchors.branch_left || 5,
        decision: `🔍 分治二分：区间 [${l}..${r}] 中点 mid = ${mid}，下探左半区间 [${l}..${mid}]`,
        message: `自顶向下展开左子树搜索`,
        variables: { l, r, mid, depth },
        treeRoot: cloneStateDepTree(rootNode),
        grid: memoGrid.map(row => [...row]),
        activeIndices: [mid],
        activeSlot: mid,
        metrics: { '当前区间': `[${l}..${r}]`, '中点': String(mid) },
      });

      const leftMax = buildDfs(l, mid, internalNode, depth + 1);

      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.branch_right || 7,
        codeLine: anchors.branch_right || 7,
        decision: `🔍 下探右半区间：中点后半部分 [${mid + 1}..${r}]`,
        message: `自顶向下展开右子树搜索`,
        variables: { l: mid + 1, r, depth },
        treeRoot: cloneStateDepTree(rootNode),
        grid: memoGrid.map(row => [...row]),
        activeIndices: [mid + 1],
        activeSlot: mid + 1,
        metrics: { '右区间': `[${mid + 1}..${r}]`, '左侧最大值': String(leftMax) },
      });

      const rightMax = buildDfs(mid + 1, r, internalNode, depth + 1);

      // 计算跨中点连续和
      let leftCross = -Infinity;
      let sum = 0;
      for (let i = mid; i >= l; i--) {
        sum += nums[i];
        leftCross = Math.max(leftCross, sum);
      }
      let rightCross = -Infinity;
      sum = 0;
      for (let i = mid + 1; i <= r; i++) {
        sum += nums[i];
        rightCross = Math.max(rightCross, sum);
      }
      const crossMax = leftCross + rightCross;
      const best = Math.max(leftMax, Math.max(rightMax, crossMax));

      memoGrid[mid][1] = best;
      internalNode.val = `[${l}..${r}] = ${best}`;
      internalNode.status = 'visited';

      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: anchors.cross || 9,
        codeLine: anchors.cross || 9,
        decision: `跨中点归并：区间 [${l}..${r}] 左侧最大=${leftMax}，右侧最大=${rightMax}，跨中点最大=${crossMax}，合并最优值 = ${best}`,
        message: `三方候选取最大，回溯合并结果`,
        variables: { l, r, leftMax, rightMax, crossMax, best },
        treeRoot: cloneStateDepTree(rootNode),
        grid: memoGrid.map(row => [...row]),
        activeIndices: [mid],
        activeSlot: mid,
        metrics: { '合并最大和': String(best), '跨中点和': String(crossMax) },
      });

      return best;
    };

    const overallBest = buildDfs(0, n - 1, rootNode, 1);
    rootNode.val = `solve([0..${n - 1}]) = ${overallBest}`;

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      line: anchors.entry || 3,
      codeLine: anchors.entry || 3,
      decision: `🎉 分治决策树遍历完成！全局最大连续子段和为 ${overallBest}`,
      message: `分治时间复杂度 O(N log N)，树形结构证明了最优子结构的完整覆盖`,
      variables: { return: overallBest },
      treeRoot: cloneStateDepTree(rootNode),
      grid: memoGrid.map(row => [...row]),
      metrics: { '最终结果': String(overallBest), '状态': '🏁 决策树收敛' },
    });

    return steps;
  }

  private static compileMaxSubarrayStage3(
    model: IYamlAlgorithmModel,
    nums: number[],
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = nums.length;
    const anchors = this.extractAnchors(model, 3, options?.direction || 'forward', options?.anchorMap);

    // 1D DP 矩阵与 2D 状态跟踪矩阵 (n x 2)
    const dp: number[] = new Array(n).fill(0);
    dp[0] = nums[0];
    let maxAns = dp[0];

    const dpGrid: (number | null)[][] = Array.from({ length: n }, () => new Array(2).fill(null));
    dpGrid[0][0] = nums[0];
    dpGrid[0][1] = dp[0];

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      line: anchors.dp_init || 2,
      codeLine: anchors.dp_init || 2,
      decision: `动态规划初始化：dp[0] = nums[0] = ${nums[0]}，初始最大值 maxAns = ${maxAns}`,
      message: `状态定义：dp[i] 表示以 nums[i] 结尾的连续子数组的最大和`,
      variables: { 'dp[0]': dp[0], maxAns },
      grid: dpGrid.map(r => [...r]),
      stateArrays: [
        {
          id: 'nums',
          name: '输入数组 nums',
          indices: nums.map((_, idx) => idx),
          values: nums.map(String),
          color: 'indigo',
        },
        {
          id: 'dp',
          name: 'DP 状态数组 dp[i]',
          indices: dp.map((_, idx) => idx),
          values: dp.map((v, idx) => idx === 0 ? String(v) : ''),
          color: 'purple',
        },
      ],
      activeIndices: [0],
      activeSlot: 0,
      metrics: { 'dp[0]': String(dp[0]), '全局最大和': String(maxAns) },
    });

    for (let i = 1; i < n; i++) {
      const prevDp = dp[i - 1];
      const curNum = nums[i];

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        line: anchors.dp_loop || 7,
        codeLine: anchors.dp_loop || 7,
        decision: `外层推进 [${i}]：准备计算以 nums[${i}] = ${curNum} 结尾的最大连续子数组和`,
        message: `对比前驱最优解 dp[${i - 1}] = ${prevDp} 对当前元素的贡献`,
        variables: { i, 'nums[i]': curNum, 'dp[i-1]': prevDp },
        grid: dpGrid.map(r => [...r]),
        i,
        j: 0,
        currentI: i,
        currentJ: 0,
        deps: [{ r: i - 1, c: 1, label: `前驱 dp[${i - 1}]=${prevDp}` }],
        stateArrays: [
          {
            id: 'nums',
            name: '输入数组 nums',
            indices: nums.map((_, idx) => idx),
            values: nums.map(String),
            activeIdx: i,
            color: 'indigo',
          },
          {
            id: 'dp',
            name: 'DP 状态数组 dp[i]',
            indices: dp.map((_, idx) => idx),
            values: dp.map((v, idx) => idx < i ? String(v) : ''),
            color: 'purple',
          },
        ],
        activeIndices: [i],
        activeSlot: i,
        metrics: { '当前元素': String(curNum), '前驱 dp': String(prevDp) },
      });

      const chooseExtend = prevDp + curNum;
      dp[i] = Math.max(curNum, chooseExtend);
      dpGrid[i][0] = curNum;
      dpGrid[i][1] = dp[i];

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        line: anchors.dp_transfer || 9,
        codeLine: anchors.dp_transfer || 9,
        decision: `状态转移确认：dp[${i}] = max(${curNum}, ${prevDp} + ${curNum} = ${chooseExtend}) = ${dp[i]}，${dp[i] === curNum ? '独立另起新子段' : '承接前驱连续累加'}`,
        message: `若前驱累积和为正，则承接；若前驱为负，则直接以当前元素为起点另起`,
        variables: { i, 'dp[i]': dp[i], action: dp[i] === curNum ? '另起子数组' : '延续前驱' },
        grid: dpGrid.map(r => [...r]),
        i,
        j: 1,
        currentI: i,
        currentJ: 1,
        deps: [{ r: i - 1, c: 1, label: `前驱: ${prevDp}` }],
        stateArrays: [
          {
            id: 'nums',
            name: '输入数组 nums',
            indices: nums.map((_, idx) => idx),
            values: nums.map(String),
            activeIdx: i,
            color: 'indigo',
          },
          {
            id: 'dp',
            name: 'DP 状态数组 dp[i]',
            indices: dp.map((_, idx) => idx),
            values: dp.map((v, idx) => idx <= i ? String(v) : ''),
            activeIdx: i,
            color: 'purple',
          },
        ],
        activeIndices: [i],
        activeSlot: i,
        metrics: { 'dp[i]': String(dp[i]), '决策': dp[i] === curNum ? '另起' : '累加' },
      });

      if (dp[i] > maxAns) {
        maxAns = dp[i];
        steps.push({
          stepIndex: steps.length,
          stage: 3,
          line: anchors.dp_update || 11,
          codeLine: anchors.dp_update || 11,
          decision: `★ 刷新全局最大和：maxAns = max(${maxAns}, dp[${i}]=${dp[i]}) = ${dp[i]}`,
          message: `全局最大和由当前结尾的子段刷新`,
          variables: { i, 'dp[i]': dp[i], maxAns },
          grid: dpGrid.map(r => [...r]),
          i,
          j: 1,
          currentI: i,
          currentJ: 1,
          stateArrays: [
            {
              id: 'nums',
              name: '输入数组 nums',
              indices: nums.map((_, idx) => idx),
              values: nums.map(String),
              activeIdx: i,
              color: 'indigo',
            },
            {
              id: 'dp',
              name: 'DP 状态数组 dp[i]',
              indices: dp.map((_, idx) => idx),
              values: dp.map((v, idx) => idx <= i ? String(v) : ''),
              activeIdx: i,
              color: 'purple',
            },
          ],
          activeIndices: [i],
          activeSlot: i,
          metrics: { '全局最大和': String(maxAns), '刷新位置': String(i) },
        });
      }
    }

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      line: anchors.dp_done || 14,
      codeLine: anchors.dp_done || 14,
      decision: `🎉 DP 状态表格填表完毕！最终全局最大子数组和为 ${maxAns}`,
      message: `动态规划以自底向上线性递推方式达成全局最优`,
      variables: { return: maxAns, finalDp: dp },
      grid: dpGrid.map(r => [...r]),
      stateArrays: [
        {
          id: 'dp',
          name: '最终完整 DP 表',
          indices: dp.map((_, idx) => idx),
          values: dp.map(String),
          color: 'purple',
        },
      ],
      activeIndices: [n - 1],
      activeSlot: n - 1,
      metrics: { '最终最大和': String(maxAns), '状态': '🏁 状态表收敛' },
    });

    return steps;
  }

  private static compileMaxSubarrayStage4(
    model: IYamlAlgorithmModel,
    nums: number[],
    options?: TwoPassCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = nums.length;
    const anchors = this.extractAnchors(model, 4, options?.direction || 'forward', options?.anchorMap);

    let prev = 0;
    let res = nums[0];

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchors.reg_init || 2,
      codeLine: anchors.reg_init || 2,
      decision: `空间极致压缩初始化：仅使用前驱滚动寄存器 prev = 0，全局最大值 res = ${res}`,
      message: `舍弃 O(N) 辅助状态数组，空间复杂度从 O(N) 直降为 O(1)`,
      variables: { prev: 0, res, spaceComplexity: 'O(1)' },
      stateArrays: [
        {
          id: 'regs',
          name: 'O(1) 滚动寄存器',
          indices: [0, 1],
          values: [`prev: 0`, `res: ${res}`],
          color: 'indigo',
        },
      ],
      metrics: { '空间复杂度': 'O(1)', '全局最大值': String(res) },
    });

    for (let i = 0; i < n; i++) {
      const x = nums[i];
      prev = Math.max(prev + x, x);
      res = Math.max(res, prev);

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        line: anchors.reg_loop || 4,
        codeLine: anchors.reg_loop || 4,
        decision: `滚动推进 [${i}]：x=${x} -> prev = max(prev+x, x) = ${prev}，res = ${res}`,
        message: `单趟常数空间滚动迭代`,
        variables: { i, x, prev, res },
        stateArrays: [
          {
            id: 'regs',
            name: 'O(1) 滚动寄存器',
            indices: [0, 1],
            values: [`prev: ${prev}`, `res: ${res}`],
            color: 'indigo',
          },
        ],
        activeIndices: [i],
        activeSlot: i,
        metrics: { 'prev': String(prev), 'res': String(res) },
      });
    }

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: anchors.reg_done || 8,
      codeLine: anchors.reg_done || 8,
      decision: `🏁 空间压缩流式推演收敛：全局最大和 = ${res}，时间 O(N)，空间 O(1)`,
      message: `达成工业级最精炼空间优化`,
      variables: { return: res },
      stateArrays: [
        {
          id: 'regs',
          name: '最终产出',
          indices: [0],
          values: [`res: ${res}`],
          color: 'emerald',
        },
      ],
      metrics: { '最终最大和': String(res), '空间占用': 'O(1)' },
    });

    return steps;
  }
}


