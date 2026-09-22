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
  // Stage 2: 递归回溯与记忆化搜索树 (UniversalTreeNode & 2D Memo Grid)
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
    const rawB = options.seqB && options.seqB.length > 0 ? options.seqB : [1, 1];
    const g = [...rawA].sort((a, b) => a - b);
    const s = [...rawB].sort((a, b) => a - b);
    const m = g.length;
    const n = s.length;

    // 二维备忘录网格 ((m+1) x (n+1))：null 表示未计算
    const memo: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    const cloneMemoGrid = (): (number | null)[][] => memo.map((row) => [...row]);

    const buildStateArrays = (activeI?: number, activeJ?: number): StateArrayItem[] => [
      {
        id: 'g',
        name: `${itemALabel}序列 (g, m=${m})`,
        indices: g.map((_, idx) => idx),
        values: g.map((v) => String(v)),
        activeIdx: activeI !== undefined && activeI >= 0 && activeI < m ? activeI : undefined,
        color: 'emerald',
      },
      {
        id: 's',
        name: `${itemBLabel}序列 (s, n=${n})`,
        indices: s.map((_, idx) => idx),
        values: s.map((v) => String(v)),
        activeIdx: activeJ !== undefined && activeJ >= 0 && activeJ < n ? activeJ : undefined,
        color: 'amber',
      },
    ];

    let nodeUid = 0;
    const rootTree: UniversalTreeNode = {
      id: 'dfs_root_0_0',
      r: 0,
      c: 0,
      val: 'dfs(0, 0)',
      status: 'active',
      children: [],
    };

    // 初始入口步
    steps.push({
      stepIndex: 0,
      stage: 2,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `递归搜索初始化：构建 (${m + 1} × ${n + 1}) 备忘录网格，自顶向下启动 dfs(0, 0) 探索最优分配决策树`,
      message: `dfs(i, j) 表示使用饼干 s[j..${n - 1}] 满足孩子 g[i..${m - 1}] 的最大数量，备忘录剪枝消除重叠计算`,
      variables: { i: 0, j: 0, m, n },
      grid: cloneMemoGrid(),
      i: 0,
      j: 0,
      currentI: 0,
      currentJ: 0,
      treeRoot: cloneStateDepTree(rootTree),
      stateArrays: buildStateArrays(0, 0),
      metrics: { 'dfs-state': 'dfs(0, 0)', [targetMetric]: '0' },
    });

    // 递归执行函数
    const runDfs = (i: number, j: number, parentNode: UniversalTreeNode, branchLabel: string): number => {
      nodeUid++;
      const currentTreeNode: UniversalTreeNode = {
        id: `node_${i}_${j}_${nodeUid}`,
        r: i,
        c: j,
        val: branchLabel ? `${branchLabel} → dfs(${i}, ${j})` : `dfs(${i}, ${j})`,
        status: 'active',
        children: [],
      };
      parentNode.children.push(currentTreeNode);

      // 微步 1: 进入调用探查
      steps.push({
        stepIndex: steps.length,
        stage: 2,
        codeLine: anchorMap['entry'] ?? 1,
        decision: `🔍 深入调用 dfs(i=${i}, j=${j})：考查从第 ${i} 个孩子与第 ${j} 块饼干开始的分配子问题`,
        message: `自顶向下展开递归子树，当前探测坐标 (${i}, ${j})`,
        variables: { i, j, 'g.length': m, 's.length': n },
        grid: cloneMemoGrid(),
        i,
        j,
        currentI: i,
        currentJ: j,
        treeRoot: cloneStateDepTree(rootTree),
        stateArrays: buildStateArrays(i < m ? i : undefined, j < n ? j : undefined),
        metrics: { 'dfs-state': `dfs(${i}, ${j})`, 'depth': `${i + j}` },
      });

      // 递归基 (Base Case)
      if (i >= m || j >= n) {
        currentTreeNode.status = 'visited';
        currentTreeNode.val = `dfs(${i}, ${j}) = 0 (到达边界)`;
        memo[i][j] = 0;

        steps.push({
          stepIndex: steps.length,
          stage: 2,
          codeLine: anchorMap['entry'] ?? 1,
          decision: `🛑 触底边界返回：${i >= m ? `所有 ${m} 个孩子已考察完毕` : `所有 ${n} 块饼干已消耗殆尽`}，无法继续满足更多孩子，返回 0`,
          message: `边界基准条件成立，递归触底回溯`,
          variables: { i, j, return: 0 },
          grid: cloneMemoGrid(),
          i,
          j,
          currentI: i,
          currentJ: j,
          treeRoot: cloneStateDepTree(rootTree),
          stateArrays: buildStateArrays(i < m ? i : undefined, j < n ? j : undefined),
          metrics: { 'dfs-state': `dfs(${i}, ${j}) 触底`, 'result': '0' },
        });
        return 0;
      }

      // 记忆化备忘录命中检查
      if (memo[i][j] !== null) {
        const cachedVal = memo[i][j]!;
        currentTreeNode.status = 'pruned';
        currentTreeNode.val = `dfs(${i}, ${j}) = ${cachedVal} (⚡备忘录剪枝)`;

        steps.push({
          stepIndex: steps.length,
          stage: 2,
          codeLine: anchorMap['memo_hit'] ?? 2,
          decision: `⚡ 记忆化剪枝命中！子状态 (i=${i}, j=${j}) 已经在备忘录 memo[${i}][${j}]=${cachedVal} 中缓存，直接剪枝返回，避免重复展开`,
          message: `备忘录成功剪除指数级重复搜索分支`,
          variables: { i, j, 'memo[i][j]': cachedVal },
          grid: cloneMemoGrid(),
          i,
          j,
          currentI: i,
          currentJ: j,
          treeRoot: cloneStateDepTree(rootTree),
          stateArrays: buildStateArrays(i, j),
          metrics: { 'memo-hit': `memo[${i}][${j}]=${cachedVal}`, 'action': '⚡ 剪枝' },
        });
        return cachedVal;
      }

      // 分支决策探查
      const curG = g[i];
      const curS = s[j];
      let best = 0;

      if (curS >= curG) {
        // 分支 A: 分配满足当前饼干
        steps.push({
          stepIndex: steps.length,
          stage: 2,
          codeLine: anchorMap['choose'] ?? 3,
          decision: `✅ 贪心相容：饼干 s[${j}]=${curS} >= 孩子 g[${i}]=${curG}，可分发满足！启动分支探查：1 + dfs(${i + 1}, ${j + 1})`,
          message: `当前决策产生 1 个满足计数，并消耗这块饼干向后下探`,
          variables: { i, j, 'g[i]': curG, 's[j]': curS },
          grid: cloneMemoGrid(),
          i,
          j,
          currentI: i,
          currentJ: j,
          treeRoot: cloneStateDepTree(rootTree),
          stateArrays: buildStateArrays(i, j),
          metrics: { 'branch': `分发 s[${j}] 给 g[${i}]`, 'comparison': `${curS} >= ${curG}` },
        });

        const takeRes = 1 + runDfs(i + 1, j + 1, currentTreeNode, `分发(g[${i}],s[${j}])`);
        best = takeRes;

        // 分支 B: 探查跳过当前饼干寻找更匹配分支
        steps.push({
          stepIndex: steps.length,
          stage: 2,
          codeLine: anchorMap['skip'] ?? 4,
          decision: `🔍 分支探查：亦可跳过饼干 s[${j}]，尝试为孩子 g[${i}] 寻找后续饼干：dfs(${i}, ${j + 1})`,
          message: `全面探索所有可能分支以验证最优解`,
          variables: { i, j: j + 1 },
          grid: cloneMemoGrid(),
          i,
          j,
          currentI: i,
          currentJ: j,
          treeRoot: cloneStateDepTree(rootTree),
          stateArrays: buildStateArrays(i, j),
          metrics: { 'branch': `跳过 s[${j}]`, 'currentBest': String(best) },
        });

        const skipRes = runDfs(i, j + 1, currentTreeNode, `跳过 s[${j}]`);
        best = Math.max(takeRes, skipRes);
      } else {
        // 饼干太小，无法满足当前孩子，唯一选择是跳过当前饼干
        steps.push({
          stepIndex: steps.length,
          stage: 2,
          codeLine: anchorMap['skip'] ?? 4,
          decision: `⏩ 尺寸不足：饼干 s[${j}]=${curS} < 孩子 g[${i}]=${curG}，无法满足！只能跳过当前饼干，下探子状态 dfs(${i}, ${j + 1})`,
          message: `单调性决定此饼干无法满足当前及后续更大胃口的孩子，单向跳过`,
          variables: { i, j, 'g[i]': curG, 's[j]': curS },
          grid: cloneMemoGrid(),
          i,
          j,
          currentI: i,
          currentJ: j,
          treeRoot: cloneStateDepTree(rootTree),
          stateArrays: buildStateArrays(i, j),
          metrics: { 'branch': `跳过偏小 s[${j}]`, 'comparison': `${curS} < ${curG}` },
        });

        best = runDfs(i, j + 1, currentTreeNode, `跳过 s[${j}]`);
      }

      // 递归回溯与备忘录落盘
      memo[i][j] = best;
      currentTreeNode.status = 'visited';
      currentTreeNode.val = `dfs(${i}, ${j}) = ${best}`;

      steps.push({
        stepIndex: steps.length,
        stage: 2,
        codeLine: anchorMap['done'] ?? 5,
        decision: `💾 回溯落盘：dfs(${i}, ${j}) 分支计算完成，取得最优解 ${best}，写入备忘录 memo[${i}][${j}]=${best}`,
        message: `子问题最优解已固化至二维备忘录矩阵中`,
        variables: { i, j, 'memo[i][j]': best },
        grid: cloneMemoGrid(),
        i,
        j,
        currentI: i,
        currentJ: j,
        treeRoot: cloneStateDepTree(rootTree),
        stateArrays: buildStateArrays(i, j),
        metrics: { [targetMetric]: String(best), 'memo-write': `memo[${i}][${j}]=${best}` },
      });

      return best;
    };

    // 启动根调用并挂载至 rootTree
    const finalOptimal = runDfs(0, 0, rootTree, '根节点决策');
    rootTree.val = `dfs(0, 0) = ${finalOptimal}`;
    rootTree.status = 'visited';

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      codeLine: anchorMap['done'] ?? 5,
      decision: `🎉 递归记忆化搜索全部完成！全局最优可满足孩子数为 ${finalOptimal}，备忘录矩阵与依赖树完全收敛`,
      message: `搜索树证明了贪心选择性质与动态规划最优子结构的一致性`,
      variables: { return: finalOptimal, m, n },
      grid: cloneMemoGrid(),
      i: 0,
      j: 0,
      currentI: 0,
      currentJ: 0,
      treeRoot: cloneStateDepTree(rootTree),
      stateArrays: buildStateArrays(0, 0),
      metrics: { [targetMetric]: String(finalOptimal), 'status': '🏁 搜索完备' },
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

    // dp[i][j]: 前 i 个孩子使用前 j 块饼干的最大满足数 ((m+1) x (n+1) 完整二维 DP 矩阵)
    const dp: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    for (let j = 0; j <= n; j++) dp[0][j] = 0;
    for (let i = 0; i <= m; i++) dp[i][0] = 0;

    const cloneGrid = (): (number | null)[][] => dp.map((row) => [...row]);

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
    ];

    // Step 0: 初始矩阵与基准条件
    steps.push({
      stepIndex: 0,
      stage: 3,
      codeLine: anchorMap['entry'] ?? 1,
      decision: `动态规划建表：构建 (${m + 1} × ${n + 1}) 的双序列 DP 矩阵。基准条件：dp[0][j]=0（无孩子时满足数为0），dp[i][0]=0（无饼干时满足数为0）`,
      message: `状态定义：dp[i][j] 表示使用前 j 块饼干满足前 i 个孩子的最大数量`,
      variables: { m, n, 'dp[0][0]': 0 },
      grid: cloneGrid(),
      i: 0,
      j: 0,
      currentI: 0,
      currentJ: 0,
      stateArrays: buildStateArrays(0, 0),
      metrics: { [targetMetric]: '0', 'dp-cell': 'dp[0][0]=0' },
    });

    for (let i = 1; i <= m; i++) {
      const curG = g[i - 1];

      steps.push({
        stepIndex: steps.length,
        stage: 3,
        codeLine: anchorMap['outer_loop'] ?? 2,
        decision: `外层推进：考察第 ${i} 行（对应孩子 g[${i - 1}]=${curG}），准备遍历饼干列 j=1..${n} 进行状态转移`,
        message: `自底向上计算第 ${i} 行的状态转移矩阵`,
        variables: { i, 'g[i-1]': curG },
        grid: cloneGrid(),
        i,
        j: 0,
        currentI: i,
        currentJ: 0,
        stateArrays: buildStateArrays(i, 0),
        activeIndices: [i - 1],
        activeSlot: i - 1,
        metrics: { 'row-i': `${i}/${m}`, 'cur-g': String(curG) },
      });

      for (let j = 1; j <= n; j++) {
        const curS = s[j - 1];
        const canSatisfy = curS >= curG;
        const topVal = dp[i - 1][j] ?? 0;
        const leftVal = dp[i][j - 1] ?? 0;
        const diagVal = canSatisfy ? (dp[i - 1][j - 1] ?? 0) + 1 : 0;

        const deps: Array<{ r: number; c: number; type?: 'top' | 'left' | 'diag'; label?: string }> = [
          { r: i - 1, c: j, type: 'top', label: `跳过孩子: ${topVal}` },
          { r: i, c: j - 1, type: 'left', label: `跳过饼干: ${leftVal}` },
        ];
        if (canSatisfy) {
          deps.push({ r: i - 1, c: j - 1, type: 'diag', label: `满足配对: ${diagVal}` });
        }

        // 微步 1: 探查与多向依赖比对 (Probe)
        steps.push({
          stepIndex: steps.length,
          stage: 3,
          codeLine: anchorMap['check'] ?? 3,
          decision: `🔍 聚焦单元格 dp[${i}][${j}]：考察孩子 g[${i - 1}]=${curG} 与 饼干 s[${j - 1}]=${curS}。比对状态依赖源：上方 dp[${i - 1}][${j}]=${topVal}，左方 dp[${i}][${j - 1}]=${leftVal}${canSatisfy ? `，左上匹配 dp[${i - 1}][${j - 1}]+1=${diagVal}` : '（当前饼干尺寸不足，无左上转移）'}`,
          message: canSatisfy
            ? `饼干尺寸 ${curS} >= 孩子胃口 ${curG}，支持从左上角配对转移！`
            : `饼干尺寸 ${curS} < 孩子胃口 ${curG}，无法配对，仅能继承上方或左方最优解`,
          variables: { i, j, 'g[i-1]': curG, 's[j-1]': curS, topVal, leftVal, diagVal },
          grid: cloneGrid(),
          i,
          j,
          currentI: i,
          currentJ: j,
          topI: i - 1,
          topJ: j,
          leftI: i,
          leftJ: j - 1,
          diagI: canSatisfy ? i - 1 : undefined,
          diagJ: canSatisfy ? j - 1 : undefined,
          deps,
          topVal,
          leftVal,
          sumVal: diagVal,
          stateArrays: buildStateArrays(i, j),
          activeIndices: [i - 1],
          activeSlot: i - 1,
          metrics: { 'checking': `g[${i-1}]=${curG}, s[${j-1}]=${curS}`, 'canSatisfy': canSatisfy ? '是' : '否' },
        });

        // 决策落盘
        const finalCellVal = Math.max(topVal, Math.max(leftVal, diagVal));
        dp[i][j] = finalCellVal;

        // 微步 2: 确认落盘与最优值确认 (Commit)
        steps.push({
          stepIndex: steps.length,
          stage: 3,
          codeLine: anchorMap['transfer'] ?? 4,
          decision: `✅ 转移确认：综合三方候选，取最大值 dp[${i}][${j}] = max(${topVal}, ${leftVal}${canSatisfy ? `, ${diagVal}` : ''}) = ${finalCellVal}，单元格落盘`,
          message: `单元格 dp[${i}][${j}] 计算完成并固化写入 DP 矩阵`,
          variables: { i, j, 'dp[i][j]': finalCellVal },
          grid: cloneGrid(),
          i,
          j,
          currentI: i,
          currentJ: j,
          deps,
          topVal,
          leftVal,
          sumVal: finalCellVal,
          stateArrays: buildStateArrays(i, j),
          activeIndices: [i - 1],
          activeSlot: i - 1,
          metrics: { [targetMetric]: String(finalCellVal), 'dp-cell': `dp[${i}][${j}]=${finalCellVal}` },
        });
      }
    }

    const finalResult = dp[m][n] ?? 0;

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      codeLine: anchorMap['done'] ?? 8,
      decision: `🎉 双序列 DP 状态填表完成！最终 dp[${m}][${n}] = ${finalResult}，全局最多可满足 ${finalResult} 个${itemALabel}`,
      message: `动态规划矩阵自底向上填表验证了单调贪心策略的全局最优性`,
      variables: { return: finalResult, m, n },
      grid: cloneGrid(),
      i: m,
      j: n,
      currentI: m,
      currentJ: n,
      stateArrays: buildStateArrays(m, n),
      metrics: { [targetMetric]: String(finalResult), 'status': '🏁 DP 矩阵收敛' },
    });

    return steps;
  }

  // ==========================================================================
  // Stage 4: 空间压缩与单趟双指针极致优化 (O(1) Auxiliary Space)
  // ==========================================================================
  private static compileStage4(
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
      4,
      options.direction || 'forward',
      options.anchorMap
    );

    const rawA = options.seqA && options.seqA.length > 0 ? options.seqA : [1, 2, 3];
    const rawB = options.seqB && options.seqB.length > 0 ? options.seqB : [1, 1];
    const g = [...rawA].sort((a, b) => a - b);
    const s = [...rawB].sort((a, b) => a - b);
    const m = g.length;
    const n = s.length;

    const buildStateArrays = (
      activeChild?: number,
      activeCookie?: number,
      matchedChildren: number[] = [],
      matchedCookies: number[] = []
    ): StateArrayItem[] => [
      {
        id: 'g',
        name: `${itemALabel}序列 (g, m=${m})`,
        indices: g.map((_, idx) => idx),
        values: g.map((v) => String(v)),
        activeIdx: activeChild,
        color: 'emerald',
      },
      {
        id: 's',
        name: `${itemBLabel}序列 (s, n=${n})`,
        indices: s.map((_, idx) => idx),
        values: s.map((v) => String(v)),
        activeIdx: activeCookie,
        color: 'amber',
      },
      {
        id: 'matched_info',
        name: 'O(1) 双指针压缩状态',
        indices: [0, 1],
        values: [
          `已满足: ${matchedChildren.length}`,
          `指针: [g:${activeChild ?? '完'}, s:${activeCookie ?? '完'}]`,
        ],
        color: 'indigo',
      },
    ];

    // Step 0: 排序与就绪
    steps.push({
      stepIndex: 0,
      stage: 4,
      codeLine: anchorMap['sort_g'] ?? 1,
      decision: `空间极致压缩：舍弃 O(m*n) 的 DP 矩阵与备忘录，仅依靠升序序列与双指针流水线推进`,
      message: `辅助空间复杂度从 O(m*n) 直降为 O(1)，排序后单趟线性扫描直接产出最优解`,
      variables: { 'g.length': m, 's.length': n, spaceComplexity: 'O(1)' },
      stateArrays: buildStateArrays(),
      metrics: { [targetMetric]: '0', 'space': 'O(1)' },
    });

    if (!isReverse) {
      let child = 0;
      const matchedChildren: number[] = [];
      const matchedCookies: number[] = [];

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        codeLine: anchorMap['init'] ?? 3,
        decision: `指针就绪：初始化 child=0 指向待满足的最小胃口孩子 g[0]=${g[0]}`,
        message: `单趟 for 循环推进 cookie 指针遍历整个饼干序列`,
        variables: { child: 0, cookie: 0 },
        stateArrays: buildStateArrays(0, 0, matchedChildren, matchedCookies),
        activeIndices: [0],
        activeSlot: 0,
        metrics: { [targetMetric]: '0', 'pointer': 'child=0' },
      });

      for (let cookie = 0; cookie < n && child < m; cookie++) {
        const curG = g[child];
        const curS = s[cookie];

        steps.push({
          stepIndex: steps.length,
          stage: 4,
          codeLine: anchorMap['loop'] ?? 4,
          decision: `🔍 流水线扫描：饼干指针推进至 cookie=${cookie} (s[${cookie}]=${curS})，考查当前孩子 child=${child} (g[${child}]=${curG})`,
          message: curS >= curG
            ? `饼干尺寸 ${curS} >= 孩子胃口 ${curG}，贪心相容！`
            : `饼干尺寸 ${curS} < 孩子胃口 ${curG}，尺寸不足，流水线继续推进至下一块饼干`,
          variables: { child, cookie, 'g[child]': curG, 's[cookie]': curS },
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
            stage: 4,
            codeLine: anchorMap['matched'] ?? 5,
            decision: `🎉 即时消化分配：将饼干 s[${cookie}]=${curS} 分配给孩子 g[${child - 1}]=${curG}，child 指针推进至 ${child}`,
            message: `满足计数原地累加，无需回溯任何中间状态表`,
            variables: { child, cookie, count: child },
            stateArrays: buildStateArrays(child < m ? child : undefined, cookie, matchedChildren, matchedCookies),
            activeIndices: [child - 1],
            activeSlot: child - 1,
            metrics: { [targetMetric]: String(child), 'action': '✅ 满足双增' },
          });
        }
      }

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        codeLine: anchorMap['done'] ?? 7,
        decision: `🏁 极致流转收敛：单趟流水线执行完毕，最终满足 ${child} 个${itemALabel}，空间 O(1)，时间 O(n log n)`,
        message: `单趟双指针直接达成全局最优，空间压缩圆满达成`,
        variables: { return: child, totalChildren: m, totalCookies: n },
        stateArrays: buildStateArrays(undefined, undefined, matchedChildren, matchedCookies),
        metrics: { [targetMetric]: String(child), 'space': 'O(1)', 'status': '🏁 O(1) 全局最优' },
      });
    } else {
      let count = 0;
      let cookie = n - 1;
      const matchedChildren: number[] = [];
      const matchedCookies: number[] = [];

      steps.push({
        stepIndex: steps.length,
        stage: 4,
        codeLine: anchorMap['init'] ?? 3,
        decision: `逆向压缩就绪：大饼干优先，cookie=${n - 1}，从最大胃口孩子开始逆序推进`,
        message: `逆向单趟扫描同样仅消耗 O(1) 辅助空间`,
        variables: { count: 0, cookie: n - 1 },
        stateArrays: buildStateArrays(m - 1, n - 1, matchedChildren, matchedCookies),
        activeIndices: [m - 1],
        activeSlot: m - 1,
        metrics: { [targetMetric]: '0', 'pointer': `cookie=${n - 1}` },
      });

      for (let child = m - 1; child >= 0 && cookie >= 0; child--) {
        const curG = g[child];
        const curS = s[cookie];

        steps.push({
          stepIndex: steps.length,
          stage: 4,
          codeLine: anchorMap['loop'] ?? 4,
          decision: `🔍 逆向考查：大胃口孩子 g[${child}]=${curG}，当前最大饼干 s[${cookie}]=${curS}`,
          message: curS >= curG
            ? `饼干足以满足最大胃口孩子！进行消化分配`
            : `当前最大饼干不足以满足孩子 g[${child}]，当前孩子无法被满足，继续考察次大胃口孩子`,
          variables: { child, cookie, 'g[child]': curG, 's[cookie]': curS },
          stateArrays: buildStateArrays(child, cookie, matchedChildren, matchedCookies),
          activeIndices: [child],
          activeSlot: child,
          metrics: { [targetMetric]: String(count), 'check': `${curS} >= ${curG} ?` },
        });

        if (curS >= curG) {
          matchedChildren.push(child);
          matchedCookies.push(cookie);
          count++;
          cookie--;

          steps.push({
            stepIndex: steps.length,
            stage: 4,
            codeLine: anchorMap['matched'] ?? 5,
            decision: `🎉 逆向即时消化：s[${cookie + 1}]=${curS} 成功分配给 g[${child}]=${curG}，累计满足数增至 ${count}`,
            message: `高效消化最大尺寸资源`,
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
        stage: 4,
        codeLine: anchorMap['done'] ?? 7,
        decision: `🏁 逆向流转收敛：单趟逆向扫描完毕，最多满足 ${count} 个${itemALabel}`,
        message: `双向对称性完全一致收敛`,
        variables: { return: count, totalChildren: m, totalCookies: n },
        stateArrays: buildStateArrays(undefined, undefined, matchedChildren, matchedCookies),
        metrics: { [targetMetric]: String(count), 'space': 'O(1)', 'status': '🏁 逆向最优' },
      });
    }

    return steps;
  }
}
