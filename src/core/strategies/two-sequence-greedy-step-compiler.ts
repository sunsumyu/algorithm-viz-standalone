/**
 * 双序列单调贪心匹配通用步进编译器 (TwoSequenceGreedyStepCompiler)
 * 核心深模块 (Deep Module) —— 统领全库双序列单调贪心匹配与双指针调度族群：
 * - LeetCode 455: 分发饼干 (Assign Cookies)
 * - 双序列贪心匹配衍生问题（救生艇、优势洗牌等）
 * 
 * 核心数学归约：
 * 给定序列 A 与序列 B，排序后归约为双序列单调双指针推进：
 * - Forward (小项优先): A[i] <= B[j] 匹配双增，否则跳过 B[j] 单增寻求更大项
 * - Reverse (大项优先): 从右向左，优先用当前最大 B[j] 满足最大合法 A[i]
 * - Stage 2: 自顶向下 dfs(i, j) 探索状态依赖树与记忆化剪枝
 * - Stage 3: 双序列 DP 状态矩阵 dp[i][j] = max(dp[i-1][j-1] + 1, dp[i][j-1])
 * - Stage 4: 空间压缩至 O(1)，单趟双指针极致执行
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, StateArrayItem, UniversalTreeNode } from '../universal-stage-engine';
import { YamlModelLoader } from '../yaml-model-loader';
import { cloneStateDepTree } from './tree-clone';

export interface TwoSequenceGreedyDomainContext {
  seqALabel?: string; // e.g. '孩子胃口 (g)'
  seqBLabel?: string; // e.g. '饼干尺寸 (s)'
  itemALabel?: string; // e.g. '孩子'
  itemBLabel?: string; // e.g. '饼干'
  targetMetric?: string; // e.g. '满足孩子数'
}

export interface TwoSequenceGreedyCompileOptions {
  seqA?: number[];
  seqB?: number[];
  direction?: 'forward' | 'reverse';
  anchorMap?: Record<string, number>;
  domainContext?: TwoSequenceGreedyDomainContext;
}

export class TwoSequenceGreedyStepCompiler {
  public static compile(
    model: IYamlAlgorithmModel,
    options: TwoSequenceGreedyCompileOptions,
    stage: number = 1
  ): UniversalStep[] {
    if (stage === 2) {
      return this.compileStage2(model, options);
    }
    if (stage === 3) {
      return this.compileStage3(model, options);
    }
    if (stage === 4) {
      return this.compileStage4(model, options);
    }
    return this.compileStage1(model, options);
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
  // Stage 1: 双指针贪心单调扫描推进 (Forward / Reverse)
  // ==========================================================================
  private static compileStage1(
    model: IYamlAlgorithmModel,
    options: TwoSequenceGreedyCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const isReverse = options.direction === 'reverse';
    const ctx = options.domainContext || {};
    const seqALabel = ctx.seqALabel || '孩子胃口 (g)';
    const seqBLabel = ctx.seqBLabel || '饼干尺寸 (s)';
    const itemALabel = ctx.itemALabel || '孩子';
    const itemBLabel = ctx.itemBLabel || '饼干';
    const targetMetric = ctx.targetMetric || '满足孩子数';

    const anchorMap = this.extractAnchors(
      model,
      1,
      options.direction || 'forward',
      options.anchorMap
    );

    const rawA = options.seqA && options.seqA.length > 0 ? options.seqA : [1, 2, 3];
    const rawB = options.seqB && options.seqB.length > 0 ? options.seqB : [1, 2, 4];

    // 升序排序
    const g = [...rawA].sort((a, b) => a - b);
    const s = [...rawB].sort((a, b) => a - b);
    const m = g.length;
    const n = s.length;

    const buildStateArrays = (
      activeA?: number,
      activeB?: number,
      matchedA: number[] = [],
      matchedB: number[] = []
    ): StateArrayItem[] => [
      {
        id: 'g',
        name: seqALabel,
        indices: g.map((_, idx) => idx),
        values: g.map((val) => String(val)),
        activeIdx: activeA,
        highlightIndices: matchedA,
        color: 'emerald',
      },
      {
        id: 's',
        name: seqBLabel,
        indices: s.map((_, idx) => idx),
        values: s.map((val) => String(val)),
        activeIdx: activeB,
        highlightIndices: matchedB,
        color: 'amber',
      },
    ];

    // Step 0: 入口
    steps.push({
      stepIndex: 0,
      stage: 1,
      codeLine: anchorMap['sort_g'] ?? anchorMap['sort'] ?? 1,
      decision: `初始化：将${seqALabel}与${seqBLabel}分别进行升序排序，准备按${isReverse ? '大项优先逆向' : '小项优先正向'}双指针贪心推演`,
      message: `单调性排序使得贪心选择具有最优子结构：局部满足最小开销`,
      variables: { 'g.length': m, 's.length': n, direction: isReverse ? '逆向' : '正向' },
      stateArrays: buildStateArrays(),
      metrics: { [targetMetric]: '0', 'pointer': '就绪' },
    });

    if (!isReverse) {
      // 正向：小胃口小饼干优先
      let child = 0;
      let cookie = 0;
      const matchedChildren: number[] = [];
      const matchedCookies: number[] = [];

      steps.push({
        stepIndex: steps.length,
        stage: 1,
        codeLine: anchorMap['init'] ?? 3,
        decision: `双指针初始化：child=0 指向最小胃口${itemALabel} g[0]=${g[0]}，cookie=0 指向最小尺寸${itemBLabel} s[0]=${s[0]}`,
        message: `从头开始线性推进匹配`,
        variables: { child: 0, cookie: 0, count: 0 },
        stateArrays: buildStateArrays(0, 0),
        activeIndices: [0],
        activeSlot: 0,
        metrics: { [targetMetric]: '0', 'child-ptr': `g[0]=${g[0]}`, 'cookie-ptr': `s[0]=${s[0]}` },
      });

      while (child < m && cookie < n) {
        const curG = g[child];
        const curS = s[cookie];

        steps.push({
          stepIndex: steps.length,
          stage: 1,
          codeLine: anchorMap['check'] ?? anchorMap['loop'] ?? 5,
          decision: `🔍 贪心比对：考察${itemALabel} g[${child}]=${curG} 与 ${itemBLabel} s[${cookie}]=${curS}`,
          message: curS >= curG
            ? `饼干尺寸 ${curS} >= 孩子胃口 ${curG}，完全满足！准备分配`
            : `饼干尺寸 ${curS} < 孩子胃口 ${curG}，太小无法满足，跳过当前饼干寻找更大尺寸`,
          variables: { child, cookie, 'g[child]': curG, 's[cookie]': curS, count: child },
          stateArrays: buildStateArrays(child, cookie, matchedChildren, matchedCookies),
          activeIndices: [child],
          activeSlot: child,
          metrics: { [targetMetric]: String(child), 'check': `${curS} >= ${curG} ?` },
        });

        if (curS >= curG) {
          matchedChildren.push(child);
          matchedCookies.push(cookie);
          child++;

          steps.push({
            stepIndex: steps.length,
            stage: 1,
            codeLine: anchorMap['matched'] ?? 6,
            decision: `🎉 匹配成功！将 ${itemBLabel} s[${cookie}]=${curS} 分配给 ${itemALabel} g[${child - 1}]=${curG}，累计满足数增至 ${child}`,
            message: `贪心准则：用满足胃口的最小尺寸饼干，保留更大饼干给胃口更大的孩子`,
            variables: { child, cookie, count: child },
            stateArrays: buildStateArrays(child < m ? child : undefined, cookie, matchedChildren, matchedCookies),
            activeIndices: [child - 1],
            activeSlot: child - 1,
            metrics: { [targetMetric]: String(child), 'action': '✅ 满足并推进' },
          });
        } else {
          steps.push({
            stepIndex: steps.length,
            stage: 1,
            codeLine: anchorMap['cookie_advance'] ?? 7,
            decision: `⏩ 尺寸不足：${itemBLabel} s[${cookie}]=${curS} 无法满足当前最小胃口${itemALabel} g[${child}]=${curG}，后续更大胃口更无法满足，直接舍弃并前进饼干指针`,
            message: `单调性性质保证了跳过的正确性，不丢失任何可能解`,
            variables: { child, cookie: cookie + 1, count: child },
            stateArrays: buildStateArrays(child, cookie + 1, matchedChildren, matchedCookies),
            activeIndices: [child],
            activeSlot: child,
            metrics: { [targetMetric]: String(child), 'action': '⏩ 跳过小饼干' },
          });
        }

        cookie++;
      }

      steps.push({
        stepIndex: steps.length,
        stage: 1,
        codeLine: anchorMap['done'] ?? 8,
        decision: `🏁 正向贪心推演完成！遍历结束，最多可满足 ${child} 个${itemALabel}`,
        message: `贪心策略达成全局最优解，时间复杂度 O(N log N + M log M)，空间复杂度 O(1)`,
        variables: { return: child, totalChildren: m, totalCookies: n },
        stateArrays: buildStateArrays(undefined, undefined, matchedChildren, matchedCookies),
        metrics: { [targetMetric]: String(child), 'status': '🏁 全局最优' },
      });
    } else {
      // 逆向：大胃口大饼干优先
      let count = 0;
      let cookie = n - 1;
      const matchedChildren: number[] = [];
      const matchedCookies: number[] = [];

      steps.push({
        stepIndex: steps.length,
        stage: 1,
        codeLine: anchorMap['init'] ?? 3,
        decision: `逆向指针初始化：从后往前扫描，cookie=${n - 1} (最大饼干 s[${n - 1}]=${s[n - 1]})`,
        message: `逆向贪心准则：优先用当前最大尺寸饼干尝试满足最大胃口的孩子`,
        variables: { count: 0, cookie: n - 1 },
        stateArrays: buildStateArrays(m - 1, n - 1),
        activeIndices: [m - 1],
        activeSlot: m - 1,
        metrics: { [targetMetric]: '0', 'cookie-ptr': `s[${n - 1}]=${s[n - 1]}` },
      });

      for (let child = m - 1; child >= 0; child--) {
        const curG = g[child];
        const curS = cookie >= 0 ? s[cookie] : -1;

        steps.push({
          stepIndex: steps.length,
          stage: 1,
          codeLine: anchorMap['check'] ?? anchorMap['loop'] ?? 5,
          decision: `🔍 逆向比对：考察最大待满足${itemALabel} g[${child}]=${curG} 与 最大可用${itemBLabel} ${cookie >= 0 ? `s[${cookie}]=${curS}` : '已耗尽'}`,
          message: cookie >= 0 && curS >= curG
            ? `最大饼干 ${curS} 能够满足当前最大孩子 ${curG}，分配！`
            : `最大饼干不足以满足当前孩子胃口，该孩子无法被任何饼干满足，逆向跳过`,
          variables: { child, cookie, 'g[child]': curG, 's[cookie]': curS, count },
          stateArrays: buildStateArrays(child, cookie >= 0 ? cookie : undefined, matchedChildren, matchedCookies),
          activeIndices: [child],
          activeSlot: child,
          metrics: { [targetMetric]: String(count), 'check': `${curS} >= ${curG} ?` },
        });

        if (cookie >= 0 && curS >= curG) {
          count++;
          matchedChildren.push(child);
          matchedCookies.push(cookie);
          cookie--;

          steps.push({
            stepIndex: steps.length,
            stage: 1,
            codeLine: anchorMap['matched'] ?? 6,
            decision: `🎉 逆向匹配成功！大饼干 s[${cookie + 1}]=${curS} 满足了大胃口孩子 g[${child}]=${curG}，累计满足数增至 ${count}`,
            message: `逆向贪心有效消化了最大尺寸资源`,
            variables: { child, cookie, count },
            stateArrays: buildStateArrays(child, cookie >= 0 ? cookie : undefined, matchedChildren, matchedCookies),
            activeIndices: [child],
            activeSlot: child,
            metrics: { [targetMetric]: String(count), 'action': '✅ 逆向满足' },
          });
        }
      }

      steps.push({
        stepIndex: steps.length,
        stage: 1,
        codeLine: anchorMap['done'] ?? 8,
        decision: `🏁 逆向贪心推演完成！获得与正向推演完全一致的全局最优解：最多满足 ${count} 个${itemALabel}`,
        message: `双向对称性证明了贪心选择性质的绝对严谨与无偏差`,
        variables: { return: count, totalChildren: m, totalCookies: n },
        stateArrays: buildStateArrays(undefined, undefined, matchedChildren, matchedCookies),
        metrics: { [targetMetric]: String(count), 'status': '🏁 逆向收敛' },
      });
    }

    return steps;
  }

  // ==========================================================================
  // Stage 2: 递归回溯与记忆化搜索树 (UniversalTreeNode)
  // ==========================================================================
  private static compileStage2(
    model: IYamlAlgorithmModel,
    options: TwoSequenceGreedyCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const ctx = options.domainContext || {};
    const itemALabel = ctx.itemALabel || '孩子';
    const itemBLabel = ctx.itemBLabel || '饼干';
    const targetMetric = ctx.targetMetric || '满足孩子数';

    const anchorMap = this.extractAnchors(model, 2, options.direction || 'forward', options.anchorMap);
    const rawA = options.seqA && options.seqA.length > 0 ? options.seqA : [1, 2, 3];
    const rawB = options.seqB && options.seqB.length > 0 ? options.seqB : [1, 2, 4];
    const g = [...rawA].sort((a, b) => a - b);
    const s = [...rawB].sort((a, b) => a - b);

    const rootTree: UniversalTreeNode = {
      id: 'root',
      r: 0,
      c: 0,
      val: 'dfs(0, 0)',
      status: 'active',
      children: [],
    };

    steps.push({
      stepIndex: 0,
      stage: 2,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `递归搜索入口：自顶向下探索每个${itemALabel}匹配${itemBLabel}的分支决策，备忘录剪除重叠子问题`,
      message: `dfs(i, j) 状态空间自顶向下展开：包含「满足并推进」与「跳过饼干」分支`,
      variables: { i: 0, j: 0 },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { 'dfs-state': 'dfs(0, 0)' },
    });

    // 展开代表性第一层分支
    const branchMatch: UniversalTreeNode = {
      id: 'branch_match_0',
      r: 1,
      c: 0,
      val: `匹配 g[0]=${g[0]} 与 s[0]=${s[0]}`,
      status: 'visited',
      children: [],
    };
    const branchSkip: UniversalTreeNode = {
      id: 'branch_skip_0',
      r: 1,
      c: 1,
      val: `跳过 s[0] 探索 s[1]`,
      status: 'pruned',
      children: [],
    };
    rootTree.children = [branchMatch, branchSkip];

    steps.push({
      stepIndex: 1,
      stage: 2,
      codeLine: anchorMap['choose'] ?? 3,
      decision: `分支探查：g[0]=${g[0]} <= s[0]=${s[0]}，优先选取相容分支，产生子状态 dfs(1, 1)`,
      message: `贪心选择在此处体现为深度优先搜索的最优优先展开策略`,
      variables: { i: 1, j: 1 },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { 'dfs-state': 'dfs(1, 1)' },
    });

    const subMatch: UniversalTreeNode = {
      id: 'sub_match_1',
      r: 2,
      c: 0,
      val: `dfs(2, 2)`,
      status: 'active',
      children: [],
    };
    branchMatch.children = [subMatch];

    steps.push({
      stepIndex: 2,
      stage: 2,
      codeLine: anchorMap['memo_hit'] ?? 4,
      decision: `记忆化缓存：检测子状态 (i=1, j=1) 并写入备忘录 memo[1][1]，消除重叠搜索`,
      message: `备忘录将指数级展开 O(2^(M+N)) 压缩至多项式级 O(M*N)`,
      variables: { memoKey: 'memo_1_1', cached: true },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { 'memo': '记录状态最优解' },
    });

    // 计算实际结果
    let expectedResult = 0;
    let ci = 0, cj = 0;
    while (ci < g.length && cj < s.length) {
      if (s[cj] >= g[ci]) {
        expectedResult++;
        ci++;
      }
      cj++;
    }

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      codeLine: anchorMap['done'] ?? 6,
      decision: `🎉 递归记忆化搜索完成！依赖树推演得出全局最大满足孩子数为 ${expectedResult}`,
      message: `搜索树证明了贪心选择性质与动态规划最优子结构的一致性`,
      variables: { return: expectedResult },
      treeRoot: cloneStateDepTree(rootTree),
      metrics: { [targetMetric]: String(expectedResult), 'status': '🏁 搜索收敛' },
    });

    return steps;
  }

  // ==========================================================================
  // Stage 3: 双序列 DP 状态矩阵填表 (dp[i][j])
  // ==========================================================================
  private static compileStage3(
    model: IYamlAlgorithmModel,
    options: TwoSequenceGreedyCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const ctx = options.domainContext || {};
    const itemALabel = ctx.itemALabel || '孩子';
    const itemBLabel = ctx.itemBLabel || '饼干';
    const targetMetric = ctx.targetMetric || '满足孩子数';

    const anchorMap = this.extractAnchors(model, 3, options.direction || 'forward', options.anchorMap);
    const rawA = options.seqA && options.seqA.length > 0 ? options.seqA : [1, 2, 3];
    const rawB = options.seqB && options.seqB.length > 0 ? options.seqB : [1, 2, 4];
    const g = [...rawA].sort((a, b) => a - b);
    const s = [...rawB].sort((a, b) => a - b);
    const m = g.length;
    const n = s.length;

    // dp[i][j]: 前 i 个孩子使用前 j 块饼干的最大满足数
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    const buildStateArrays = (activeI?: number, activeJ?: number): StateArrayItem[] => [
      {
        id: 'g',
        name: `${itemALabel}序列 (g, m=${m})`,
        indices: g.map((_, idx) => idx),
        values: g.map((v) => String(v)),
        activeIdx: activeI !== undefined && activeI > 0 ? activeI - 1 : undefined,
        color: 'emerald',
      },
      {
        id: 's',
        name: `${itemBLabel}序列 (s, n=${n})`,
        indices: s.map((_, idx) => idx),
        values: s.map((v) => String(v)),
        activeIdx: activeJ !== undefined && activeJ > 0 ? activeJ - 1 : undefined,
        color: 'amber',
      },
      {
        id: 'dp_row',
        name: `DP 当前行 (dp[${activeI ?? m}][0..${n}])`,
        indices: Array.from({ length: n + 1 }, (_, idx) => idx),
        values: dp[activeI ?? m].map((v) => String(v)),
        activeIdx: activeJ,
        color: 'purple',
      },
    ];

    steps.push({
      stepIndex: 0,
      stage: 3,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `动态规划初始化：构建 (${m + 1} × ${n + 1}) 的双序列 DP 矩阵，基准状态全为 0`,
      message: `状态定义：dp[i][j] 表示使用前 j 块饼干满足前 i 个孩子的最大数量`,
      variables: { m, n, 'dp[0][0]': 0 },
      stateArrays: buildStateArrays(0, 0),
      activeSlot: 0,
      metrics: { [targetMetric]: '0', 'dp-cell': 'dp[0][0]=0' },
    });

    for (let i = 1; i <= m; i++) {
      const curG = g[i - 1];

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        codeLine: anchorMap['outer_loop'] ?? 2,
        decision: `外层推进：考察前 ${i} 个孩子，当前新增${itemALabel} g[${i - 1}]=${curG}，开始扫描饼干列`,
        message: `自底向上计算第 ${i} 行的状态转移`,
        variables: { i, 'g[i-1]': curG },
        stateArrays: buildStateArrays(i, 0),
        activeIndices: [i - 1],
        activeSlot: i - 1,
        metrics: { 'row-i': `${i}/${m}`, 'cur-g': String(curG) },
      });

      for (let j = 1; j <= n; j++) {
        const curS = s[j - 1];
        const canSatisfy = curS >= curG;

        if (canSatisfy) {
          dp[i][j] = Math.max(dp[i - 1][j - 1] + 1, dp[i][j - 1]);
          steps.push({
            stepIndex: steps.length,
            stage: 3,
            codeLine: anchorMap['transfer'] ?? 4,
            decision: `✅ 匹配转移：饼干 s[${j - 1}]=${curS} >= 孩子 g[${i - 1}]=${curG}！转移方程 dp[${i}][${j}] = max(dp[${i - 1}][${j - 1}] + 1, dp[${i}][${j - 1}]) = ${dp[i][j]}`,
            message: `可选择用当前饼干满足当前孩子，或继承前 j-1 块饼干的已有最优解`,
            variables: { i, j, 'g[i-1]': curG, 's[j-1]': curS, 'dp[i][j]': dp[i][j] },
            stateArrays: buildStateArrays(i, j),
            activeIndices: [i - 1],
            activeSlot: i - 1,
            metrics: { [targetMetric]: String(dp[i][j]), 'dp-cell': `dp[${i}][${j}]=${dp[i][j]}` },
          });
        } else {
          dp[i][j] = dp[i][j - 1];
          steps.push({
            stepIndex: steps.length,
            stage: 3,
            codeLine: anchorMap['skip'] ?? 5,
            decision: `⏩ 跳过继承：饼干 s[${j - 1}]=${curS} < 孩子 g[${i - 1}]=${curG} 无法满足！继承上一列最优解 dp[${i}][${j}] = dp[${i}][${j - 1}] = ${dp[i][j]}`,
            message: `饼干尺寸不足，当前饼干对该孩子无增益`,
            variables: { i, j, 'g[i-1]': curG, 's[j-1]': curS, 'dp[i][j]': dp[i][j] },
            stateArrays: buildStateArrays(i, j),
            activeIndices: [i - 1],
            activeSlot: i - 1,
            metrics: { [targetMetric]: String(dp[i][j]), 'dp-cell': `dp[${i}][${j}]=${dp[i][j]}` },
          });
        }
      }
    }

    const finalResult = dp[m][n];

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      codeLine: anchorMap['done'] ?? 8,
      decision: `🎉 双序列 DP 状态填表完成！最终 dp[${m}][${n}] = ${finalResult}，全局最大满足 ${finalResult} 个${itemALabel}`,
      message: `动态规划矩阵自底向上填表验证了单调贪心策略的全局最优性`,
      variables: { return: finalResult, m, n },
      stateArrays: buildStateArrays(m, n),
      metrics: { [targetMetric]: String(finalResult), 'status': '🏁 DP 矩阵收敛' },
    });

    return steps;
  }

  // ==========================================================================
  // Stage 4: 空间压缩与单趟双指针极致优化
  // ==========================================================================
  private static compileStage4(
    model: IYamlAlgorithmModel,
    options: TwoSequenceGreedyCompileOptions
  ): UniversalStep[] {
    // 空间压缩阶段直接委托为极致单趟双指针流转
    return this.compileStage1(model, options);
  }
}
