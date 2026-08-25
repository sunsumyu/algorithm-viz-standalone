/**
 * 通用多阶段状态推导执行引擎 (UniversalStageEngine)
 * 遵循 LSP（里氏替换原则）与 OCP（开闭原则）：
 * 依据 YAML 算法模型声明的 directions, branches 与阶段规则，
 * 自动派发并生成 4 个阶段的标准单步快照，消除各处手写重复推导逻辑。
 * 支持：不同路径 (LeetCode 62)、不同路径 II (LeetCode 63)、最小路径和 (LeetCode 64)、爬楼梯 (LeetCode 70)、斐波那契数 (LeetCode 509) 等。
 */

import type { IYamlAlgorithmModel } from './interfaces';

export interface UniversalTreeNode {
  id: string;
  r: number;
  c: number;
  val: string;
  status: 'normal' | 'current' | 'base' | 'pruned' | 'visited';
  tag?: string;
  children: UniversalTreeNode[];
}

export interface UniversalStep {
  type: string;
  i: number;
  j: number;
  grid?: (number | null)[][];
  activeStack?: string[];
  visited?: string[];
  line?: number;
  tag?: string;
  log?: string;
  msg?: string;
  topI?: number;
  topJ?: number;
  leftI?: number;
  leftJ?: number;
  activeNodeId?: string;
  treeRoot?: UniversalTreeNode | null;
  // 阶段 3 & 4 空间压缩与转移计算专用元数据
  memo?: number[];
  memoUpdatedIndex?: number;
  memoRefLeftIndex?: number;
  topVal?: number;
  leftVal?: number;
  sumVal?: number;
  obstacleGrid?: number[][];
  weightsGrid?: number[][];
  activeSlot?: number;
  slotMode?: 'down' | 'right' | 'updated' | 'final';
  memoSnapshot?: number[];
  memoj?: number | string;
  down?: number | string;
  right?: number | string;
  gridHighlight?: { i: number; j: number };
  fromTopCell?: { i: number; j: number } | null;
  fromLeftCell?: { i: number; j: number } | null;
  action?: string;
  // 越界拦截与物理反弹属性
  fromI?: number;
  fromJ?: number;
  outOfBoundsDir?: 'river' | 'right-wall' | 'top-wall' | 'left-wall' | string;
  isOutOfBounds?: boolean;
  isBlockedStep?: boolean;
  // 行内局部表达式发光聚焦 (Inline Sub-Expression Highlighting)
  highlightText?: string;
}

export class UniversalStageEngine {
  private static cloneTree(node: UniversalTreeNode | null): UniversalTreeNode | null {
    if (!node) return null;
    return {
      id: node.id,
      r: node.r,
      c: node.c,
      val: node.val,
      status: node.status,
      tag: node.tag,
      children: node.children ? node.children.map(UniversalStageEngine.cloneTree as any) : []
    };
  }

  /**
   * 动态生成契合当前 (m, n) 尺寸的障碍物网格矩阵
   */
  public static getDynamicObstacleGrid(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number
  ): number[][] | undefined {
    if (model.id !== 'unique-paths-ii' && !(model.defaultParams as any)?.obstacleGrid) {
      return undefined;
    }
    const defaultGrid = (model.defaultParams as any)?.obstacleGrid as number[][] | undefined;
    if (defaultGrid && defaultGrid.length === mVal && defaultGrid[0]?.length === nVal) {
      return JSON.parse(JSON.stringify(defaultGrid));
    }
    return Array.from({ length: mVal }, (_, r) =>
      Array.from({ length: nVal }, (_, c) => {
        if (defaultGrid && defaultGrid[r]?.[c] !== undefined) {
          return defaultGrid[r][c];
        }
        return (r === 1 && c === 1 && mVal > 1 && nVal > 1) ? 1 : 0;
      })
    );
  }

  /**
   * 动态生成契合当前 (m, n) 尺寸的权值网格矩阵 (用于最小路径和等网格权值题型)
   */
  public static getDynamicWeightsGrid(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number
  ): number[][] | undefined {
    if (model.id !== 'min-path-sum' && !(model.defaultParams as any)?.grid) {
      return undefined;
    }
    const defaultGrid = (model.defaultParams as any)?.grid as number[][] | undefined;
    if (defaultGrid && defaultGrid.length === mVal && defaultGrid[0]?.length === nVal) {
      return JSON.parse(JSON.stringify(defaultGrid));
    }
    const fallbackTemplate = [
      [1, 3, 1, 2, 1, 4, 2, 3],
      [1, 5, 1, 3, 2, 1, 5, 2],
      [4, 2, 1, 1, 4, 3, 1, 2],
      [2, 1, 3, 2, 1, 5, 2, 1],
      [3, 4, 1, 2, 3, 1, 4, 2],
      [1, 2, 5, 1, 2, 4, 1, 3],
      [2, 3, 1, 4, 1, 2, 3, 1],
      [1, 4, 2, 1, 3, 2, 1, 5]
    ];
    return Array.from({ length: mVal }, (_, r) =>
      Array.from({ length: nVal }, (_, c) => {
        if (defaultGrid && defaultGrid[r]?.[c] !== undefined) {
          return defaultGrid[r][c];
        }
        return fallbackTemplate[r % fallbackTemplate.length][c % fallbackTemplate[0].length];
      })
    );
  }

  /**
   * 生成一维线性 DP 阶段 1/2 演化步骤 (爬楼梯 / 斐波那契数)
   */
  public static generate1DStage1or2Steps(
    model: IYamlAlgorithmModel,
    nVal: number,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const isFib = model.id === 'fibonacci';
    const funcName = isFib ? 'fib' : 'climbStairs';
    const n = Math.min(Math.max(nVal || (isFib ? 6 : 5), 1), 6);

    const generated: UniversalStep[] = [];
    const memoCache: Record<number, number> = {};
    const dpState: number[] = new Array(n + 1).fill(null);
    let callCount = 0;
    let nodeIdCounter = 0;

    const lineEntry = anchorMap?.entry || (isMemo ? 7 : 1);
    const lineBoundary = anchorMap?.boundary || (isMemo ? 8 : 2);
    const lineCacheHit = anchorMap?.cache_hit || (isMemo ? 9 : 3);
    const lineBranchLeft = anchorMap?.branch_left || (isMemo ? 10 : 3);
    const lineBranchRight = anchorMap?.branch_right || (isMemo ? 11 : 4);
    const lineCombine = anchorMap?.combine || (isMemo ? 12 : 5);
    const lineReturn = anchorMap?.return || (isMemo ? 5 : 5);

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: n,
      c: 0,
      val: `${funcName}(${n})`,
      status: 'current',
      children: []
    };

    function isBaseCase(k: number): boolean {
      if (isFib) {
        return k <= 0 || k === 1;
      }
      return k <= 1;
    }

    function getBaseValue(k: number): number {
      if (isFib) {
        return k <= 0 ? 0 : 1;
      }
      return 1;
    }

    function dfs(k: number, currentNode: UniversalTreeNode): number {
      callCount++;
      const isRepeated = !isMemo && memoCache[k] !== undefined;
      currentNode.status = 'current';
      if (isRepeated) {
        currentNode.tag = '⚠️重复';
      }

      generated.push({
        type: 'dfs-call',
        i: k,
        j: 0,
        grid: [JSON.parse(JSON.stringify(dpState))],
        memo: [...dpState],
        line: lineEntry,
        tag: `调用 #${callCount} (${funcName}(${k}))`,
        log: `| 📥 进入 ${funcName}(n=${k}) [调用 #${callCount}]`,
        msg: `📥 进入 <code>${funcName}(${k})</code>，向下展开子状态分支。`,
        activeNodeId: currentNode.id,
        treeRoot: UniversalStageEngine.cloneTree(rootNode)
      });

      if (isBaseCase(k)) {
        const baseVal = getBaseValue(k);
        dpState[k] = baseVal;
        currentNode.status = 'base';
        currentNode.tag = `= ${baseVal}`;

        generated.push({
          type: 'boundary',
          i: k,
          j: 0,
          grid: [JSON.parse(JSON.stringify(dpState))],
          memo: [...dpState],
          line: lineBoundary,
          tag: 'Base Case',
          log: `| 🎬 满足 Base Case: ${funcName}(${k}) = ${baseVal}`,
          msg: `🎬 达到基础边界条件：<code>${funcName}(${k}) = <strong>${baseVal}</strong></code>，直接返回。`,
          activeNodeId: currentNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
        return baseVal;
      }

      if (isMemo && memoCache[k] !== undefined) {
        currentNode.status = 'pruned';
        currentNode.tag = `⚡=${memoCache[k]}`;

        generated.push({
          type: 'cache-hit',
          i: k,
          j: 0,
          grid: [JSON.parse(JSON.stringify(dpState))],
          memo: [...dpState],
          line: lineCacheHit,
          tag: '⚡ 备忘录命中',
          log: `| ⚡ 【备忘录命中剪枝】memo[${k}] 已缓存 ${memoCache[k]}！直接 O(1) 返回`,
          msg: `⚡ 【备忘录剪枝】<code>memo[${k}]</code> 已命中缓存 <strong>${memoCache[k]}</strong>，无需重复递归！`,
          activeNodeId: currentNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
        return memoCache[k];
      }

      memoCache[k] = (memoCache[k] || 0) + 1;

      // 分支 1: n - 1
      const leftNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: k - 1,
        c: 0,
        val: `${funcName}(${k - 1})`,
        status: 'normal',
        children: []
      };
      currentNode.children.push(leftNode);

      generated.push({
        type: 'branch-left',
        i: k,
        j: 0,
        grid: [JSON.parse(JSON.stringify(dpState))],
        memo: [...dpState],
        line: lineBranchLeft,
        tag: `计算 ${funcName}(${k - 1})`,
        log: `| ↙️ 递归求解左分支 ${funcName}(${k - 1})`,
        msg: `↙️ 执行 <code>${funcName}(${k - 1})</code>，进入左子分支计算。`,
        activeNodeId: currentNode.id,
        treeRoot: UniversalStageEngine.cloneTree(rootNode)
      });

      const leftVal = dfs(k - 1, leftNode);

      // 分支 2: n - 2
      const rightNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: k - 2,
        c: 0,
        val: `${funcName}(${k - 2})`,
        status: 'normal',
        children: []
      };
      currentNode.children.push(rightNode);

      generated.push({
        type: 'branch-right',
        i: k,
        j: 0,
        grid: [JSON.parse(JSON.stringify(dpState))],
        memo: [...dpState],
        line: lineBranchRight,
        tag: `计算 ${funcName}(${k - 2})`,
        log: `| ↘️ 递归求解右分支 ${funcName}(${k - 2}) [左分支已得 ${leftVal}]`,
        msg: `↘️ 执行 <code>${funcName}(${k - 2})</code>，左分支已得 ${leftVal}，进入右子分支。`,
        activeNodeId: currentNode.id,
        treeRoot: UniversalStageEngine.cloneTree(rootNode)
      });

      const rightVal = dfs(k - 2, rightNode);
      const res = leftVal + rightVal;
      if (isMemo) memoCache[k] = res;
      dpState[k] = res;

      currentNode.status = 'visited';
      currentNode.tag = `= ${res}`;

      generated.push({
        type: 'update',
        i: k,
        j: 0,
        grid: [JSON.parse(JSON.stringify(dpState))],
        memo: [...dpState],
        line: lineCombine,
        tag: '合并子问题',
        log: `| ✨ 合并: ${funcName}(${k}) = ${leftVal} + ${rightVal} = ${res}${isMemo ? ' [写入备忘录]' : ''}`,
        msg: `✨ 汇总子问题：<code>${funcName}(${k}) = ${leftVal} + ${rightVal} = <strong>${res}</strong></code>${isMemo ? '，写入 memo' : ''}。`,
        activeNodeId: currentNode.id,
        treeRoot: UniversalStageEngine.cloneTree(rootNode)
      });

      return res;
    }

    const total = dfs(n, rootNode);

    generated.push({
      type: 'return',
      i: n,
      j: 0,
      grid: [JSON.parse(JSON.stringify(dpState))],
      memo: [...dpState],
      line: lineReturn,
      tag: '最终答案',
      log: `| 🏆 最终答案: ${funcName}(${n}) = ${total}`,
      msg: `🏆 演化计算完成！最终结果: <code>${funcName}(${n}) = <strong>${total}</strong></code>。`,
      activeNodeId: rootNode.id,
      treeRoot: UniversalStageEngine.cloneTree(rootNode)
    });

    return generated;
  }

  /**
   * 生成一维线性 DP 阶段 3 演化步骤 (1D 数组填表)
   */
  public static generate1DStage3Steps(
    model: IYamlAlgorithmModel,
    nVal: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const isFib = model.id === 'fibonacci';
    const n = Math.min(Math.max(nVal || (isFib ? 6 : 5), 1), 10);
    const steps: UniversalStep[] = [];
    const dp = new Array(n + 1).fill(null);

    const lineInit = anchorMap?.init || 3;
    const lineInitVal = anchorMap?.init_val || 4;
    const lineLoop = anchorMap?.loop_i || 6;
    const lineTransfer = anchorMap?.transfer || 7;
    const lineReturn = anchorMap?.return || 9;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: [JSON.parse(JSON.stringify(dp))],
      memo: [...dp],
      tag: '初始化 DP 数组',
      log: `| 📦 创建一维 DP 状态数组 dp[0..${n}]`,
      msg: `创建长度为 ${n + 1} 的一维 DP 数组，准备自底向上顺序填表。`
    });

    if (isFib) {
      dp[0] = 0;
      steps.push({
        type: 'init-val',
        line: lineInitVal,
        i: 0,
        j: 0,
        activeSlot: 0,
        grid: [JSON.parse(JSON.stringify(dp))],
        memo: [...dp],
        tag: 'Base Case dp[0]=0',
        log: `| 🎬 初始化 Base Case: dp[0] = 0`,
        msg: `初始化 <code>dp[0] = 0</code>。`
      });
      if (n >= 1) {
        dp[1] = 1;
        steps.push({
          type: 'init-val',
          line: lineInitVal,
          i: 1,
          j: 0,
          activeSlot: 1,
          grid: [JSON.parse(JSON.stringify(dp))],
          memo: [...dp],
          tag: 'Base Case dp[1]=1',
          log: `| 🎬 初始化 Base Case: dp[1] = 1`,
          msg: `初始化 <code>dp[1] = 1</code>。`
        });
      }
    } else {
      dp[0] = 1;
      steps.push({
        type: 'init-val',
        line: lineInitVal,
        i: 0,
        j: 0,
        activeSlot: 0,
        grid: [JSON.parse(JSON.stringify(dp))],
        memo: [...dp],
        tag: 'Base Case dp[0]=1',
        log: `| 🎬 初始化 Base Case: dp[0] = 1`,
        msg: `初始化 <code>dp[0] = 1</code> (站在地面直达1种方案)。`
      });
      if (n >= 1) {
        dp[1] = 1;
        steps.push({
          type: 'init-val',
          line: lineInitVal,
          i: 1,
          j: 0,
          activeSlot: 1,
          grid: [JSON.parse(JSON.stringify(dp))],
          memo: [...dp],
          tag: 'Base Case dp[1]=1',
          log: `| 🎬 初始化 Base Case: dp[1] = 1`,
          msg: `初始化 <code>dp[1] = 1</code> (跨1阶直达1种方案)。`
        });
      }
    }

    for (let i = 2; i <= n; i++) {
      const prev1 = dp[i - 1];
      const prev2 = dp[i - 2];
      const sum = prev1 + prev2;
      dp[i] = sum;

      steps.push({
        type: 'transfer',
        line: lineTransfer,
        i,
        j: 0,
        activeSlot: i,
        grid: [JSON.parse(JSON.stringify(dp))],
        memo: [...dp],
        tag: `状态转移 dp[${i}]`,
        log: `| 🔄 dp[${i}] = dp[${i - 1}](${prev1}) + dp[${i - 2}](${prev2}) = ${sum}`,
        msg: `状态转移：<code>dp[${i}] = dp[${i - 1}] (${prev1}) + dp[${i - 2}] (${prev2}) = <strong>${sum}</strong></code>。`
      });
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: n,
      j: 0,
      activeSlot: n,
      grid: [JSON.parse(JSON.stringify(dp))],
      memo: [...dp],
      tag: '最终答案',
      log: `| 🏆 填表计算完成！最终结果 dp[${n}] = ${dp[n]}`,
      msg: `🏆 递推填表完成！最终答案: <code>dp[${n}] = <strong>${dp[n]}</strong></code>。`
    });

    return steps;
  }

  /**
   * 生成一维线性 DP 阶段 4 演化步骤 (O(1) 双变量滚动)
   */
  public static generate1DStage4Steps(
    model: IYamlAlgorithmModel,
    nVal: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const isFib = model.id === 'fibonacci';
    const n = Math.min(Math.max(nVal || (isFib ? 6 : 5), 1), 10);
    const steps: UniversalStep[] = [];

    const lineInit = anchorMap?.init || 3;
    const lineAccumulate = anchorMap?.accumulate || 5;
    const lineFetchDown = anchorMap?.fetch_down || 6;
    const lineFetchRight = anchorMap?.fetch_right || 7;
    const lineReturn = anchorMap?.return || 9;

    let p = isFib ? 0 : 1;
    let q = 1;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      activeSlot: 0,
      down: p,
      right: q,
      memoj: p,
      tag: '初始化双变量',
      log: `| 📦 初始化滚动状态: p = ${p}, q = ${q} [空间复杂度 O(1)]`,
      msg: `初始化双滚动变量 <code>p = ${p}, q = ${q}</code>，空间复杂度降至 <strong>O(1)</strong>。`
    });

    for (let i = 2; i <= n; i++) {
      const r = p + q;

      steps.push({
        type: 'accumulate',
        line: lineAccumulate,
        i,
        j: 0,
        activeSlot: i,
        slotMode: 'updated',
        down: p,
        right: q,
        memoj: r,
        tag: `计算当前值 i=${i}`,
        log: `| ✨ 计算当前项: r = p(${p}) + q(${q}) = ${r}`,
        msg: `计算当前项：<code>r = p (${p}) + q (${q}) = <strong>${r}</strong></code>。`
      });

      p = q;
      steps.push({
        type: 'fetch-down',
        line: lineFetchDown,
        i,
        j: 0,
        activeSlot: i,
        slotMode: 'down',
        down: p,
        right: q,
        memoj: r,
        tag: '滑动更新 p = q',
        log: `| ⬇️ 滑动状态: p = q (${p})`,
        msg: `滚动变量前移：<code>p = q (${p})</code>。`
      });

      q = r;
      steps.push({
        type: 'fetch-right',
        line: lineFetchRight,
        i,
        j: 0,
        activeSlot: i,
        slotMode: 'right',
        down: p,
        right: q,
        memoj: q,
        tag: '滑动更新 q = r',
        log: `| ➡️ 滑动状态: q = r (${q})`,
        msg: `滚动变量前移：<code>q = r (${q})</code>。`
      });
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: n,
      j: 0,
      activeSlot: n,
      slotMode: 'final',
      down: p,
      right: q,
      memoj: q,
      tag: '最终答案',
      log: `| 🏆 O(1) 滚动完成！最终答案 = ${q}`,
      msg: `🏆 O(1) 滚动压缩计算完成！最终结果: <strong>${q}</strong>。`
    });

    return steps;
  }

  /**
   * 生成不同的子序列 (Distinct Subsequences) 阶段 1/2 演化步骤
   */
  public static generateDistinctSubsequencesStage1or2Steps(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'rabbbit') as string;
    const t = ((model.defaultParams as any)?.t || 'rabbit') as string;
    const m = s.length;
    const n = t.length;

    const generated: UniversalStep[] = [];
    const memoCache: Record<string, number> = {};
    const gridState: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let callCount = 0;
    let nodeIdCounter = 0;

    const lineEntry = anchorMap?.entry || (isMemo ? 3 : 3);
    const lineBoundaryTarget = anchorMap?.boundary_target || (isMemo ? 9 : 8);
    const lineBoundarySource = anchorMap?.boundary_source || (isMemo ? 11 : 10);
    const lineCacheHit = anchorMap?.cache_hit || 13;
    const lineMatch = anchorMap?.match || (isMemo ? 17 : 13);
    const lineCombine = anchorMap?.combine || (isMemo ? 19 : 15);
    const lineSkip = anchorMap?.skip || (isMemo ? 22 : 18);
    const lineReturn = anchorMap?.return || 4;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: m,
      c: n,
      val: `dfs(${m},${n})`,
      status: 'current',
      children: []
    };

    function dfs(i: number, j: number, currentTreeNode: UniversalTreeNode): number {
      callCount++;
      const key = `${i},${j}`;
      const isRepeated = !isMemo && memoCache[key] !== undefined;

      activeStack.push(key);
      visitedCells.add(key);

      currentTreeNode.status = 'current';
      if (isRepeated) {
        currentTreeNode.tag = '⚠️重复';
      }

      generated.push({
        type: 'dfs-call',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineEntry,
        tag: `DFS #${callCount} (i=${i}, j=${j})`,
        log: `| 📥 进入 dfs(i=${i}, j=${j}) [s前缀="${s.slice(0, i)}", t前缀="${t.slice(0, j)}"]`,
        msg: `📥 进入 <code>dfs(i=${i}, j=${j})</code>：求解 <code>s[0..${i - 1}]</code> 中匹配 <code>t[0..${j - 1}]</code> 的不同子序列数。`,
        gridHighlight: { i, j },
        activeNodeId: currentTreeNode.id,
        treeRoot: UniversalStageEngine.cloneTree(rootNode)
      });

      // Base Case 1: 目标串已全部匹配完成 (j == 0) -> 成功得到 1 种方案
      if (j === 0) {
        gridState[i][0] = 1;
        currentTreeNode.status = 'base';
        currentTreeNode.tag = '= 1 (匹配成功)';

        generated.push({
          type: 'boundary',
          i,
          j: 0,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundaryTarget,
          tag: '🏆 目标串匹配完成',
          log: `| 🏆 【Base Case 达成】j=0: 目标串 t 为空，删除 s 中剩余字符即得 1 种方案，return 1`,
          msg: `🏆 <strong>【目标串匹配完成】</strong><code>j = 0</code>（目标串为空）：唯一选法是删除源串剩余全部字符，返回 <strong>1</strong>。`,
          gridHighlight: { i, j: 0 },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
        activeStack.pop();
        return 1;
      }

      // Base Case 2: 源串已耗尽但目标串未匹配完 (i == 0, j > 0) -> 无法匹配，返回 0
      if (i === 0) {
        gridState[0][j] = 0;
        currentTreeNode.status = 'pruned';
        currentTreeNode.tag = '= 0 (源串耗尽)';

        generated.push({
          type: 'boundary',
          i: 0,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundarySource,
          tag: '🚫 源串耗尽',
          log: `| 🚫 【Base Case 阻断】i=0 且 j=${j}>0: 源串已空无法匹配目标串剩余字符，return 0`,
          msg: `🚫 <strong>【源串耗尽】</strong><code>i = 0</code> 且 <code>j > 0</code>：源串已无可用字符，无法构成目标串，返回 <strong>0</strong>。`,
          gridHighlight: { i: 0, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
        activeStack.pop();
        return 0;
      }

      // 备忘录剪枝
      if (isMemo && memoCache[key] !== undefined) {
        currentTreeNode.status = 'pruned';
        currentTreeNode.tag = `⚡=${memoCache[key]}`;

        generated.push({
          type: 'cache-hit',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCacheHit,
          tag: '⚡ 备忘录命中',
          log: `| ⚡ 【备忘录命中剪枝】memo[${i}][${j}] 已缓存 ${memoCache[key]}！直接 O(1) 返回`,
          msg: `⚡ 【备忘录剪枝】<code>memo[${i}][${j}]</code> 已命中缓存 <strong>${memoCache[key]}</strong>，直接返回！`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
        activeStack.pop();
        return memoCache[key];
      }

      memoCache[key] = (memoCache[key] || 0) + 1;

      const isMatch = s[i - 1] === t[j - 1];
      let res = 0;

      if (isMatch) {
        generated.push({
          type: 'match-branch',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineMatch,
          tag: `匹配字符 '${s[i - 1]}'`,
          log: `| 🔀 末尾字符匹配 s[${i - 1}] == t[${j - 1}] ('${s[i - 1]}')，进入「使用匹配」与「跳过匹配」双分支`,
          msg: `🔀 末尾字符匹配 <code>s[${i - 1}] == t[${j - 1}] == '${s[i - 1]}'</code>，展开双二叉决策分支。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });

        const childNode1: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: i - 1,
          c: j - 1,
          val: `dfs(${i - 1},${j - 1})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNode1);
        const valMatch = dfs(i - 1, j - 1, childNode1);

        const childNode2: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: i - 1,
          c: j,
          val: `dfs(${i - 1},${j})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNode2);
        const valSkip = dfs(i - 1, j, childNode2);

        res = valMatch + valSkip;

        if (isMemo) memoCache[key] = res;
        gridState[i][j] = res;

        currentTreeNode.status = 'visited';
        currentTreeNode.tag = `= ${res}`;

        generated.push({
          type: 'update',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCombine,
          tag: '合并匹配与跳过方案',
          log: `| ✨ 合并分支: dfs(${i}, ${j}) = 匹配(${valMatch}) + 跳过(${valSkip}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
          msg: `✨ 汇总分支决策：<code>使用 s[${i - 1}] 匹配 (${valMatch}) + 跳过 s[${i - 1}] (${valSkip}) = <strong>${res}</strong></code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
      } else {
        generated.push({
          type: 'skip-branch',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineSkip,
          tag: `不匹配跳过 '${s[i - 1]}'`,
          log: `| ⏩ 字符不匹配 s[${i - 1}]('${s[i - 1]}') != t[${j - 1}]('${t[j - 1]}')，只能跳过 s[${i - 1}]`,
          msg: `⏩ 字符不匹配 <code>s[${i - 1}] ('${s[i - 1]}') != t[${j - 1}] ('${t[j - 1]}')</code>，只能跳过 <code>s[${i - 1}]</code>，进入 <code>dfs(${i - 1}, ${j})</code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });

        const childNode: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: i - 1,
          c: j,
          val: `dfs(${i - 1},${j})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNode);
        res = dfs(i - 1, j, childNode);

        if (isMemo) memoCache[key] = res;
        gridState[i][j] = res;

        currentTreeNode.status = 'visited';
        currentTreeNode.tag = `= ${res}`;

        generated.push({
          type: 'update',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineSkip,
          tag: '跳过分支结果',
          log: `| ✨ 不匹配结果: dfs(${i}, ${j}) = dfs(${i - 1}, ${j}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
          msg: `✨ 跳过决策结果：<code>dfs(${i}, ${j}) = dfs(${i - 1}, ${j}) = <strong>${res}</strong></code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
      }

      activeStack.pop();
      return res;
    }

    const total = dfs(m, n, rootNode);

    generated.push({
      type: 'return',
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineReturn,
      tag: '最终答案',
      log: `| 🏆 不同的子序列演化完成！numDistinct("${s}", "${t}") = ${total}`,
      msg: `🏆 演化计算完成！在 <code>s = "${s}"</code> 的子序列中，<code>t = "${t}"</code> 出现的次数为 <strong>${total}</strong>。`,
      gridHighlight: { i: m, j: n },
      activeNodeId: rootNode.id,
      treeRoot: UniversalStageEngine.cloneTree(rootNode)
    });

    return generated;
  }

  /**
   * 生成两个字符串的删除操作 (Delete Operation for Two Strings) 阶段 1 朴素递归 / 阶段 2 记忆化搜索演化步骤
   */
  public static generateDeleteDistanceStage1or2Steps(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.word1 || (model.defaultParams as any)?.s || 'sea') as string;
    const t = ((model.defaultParams as any)?.word2 || (model.defaultParams as any)?.t || 'eat') as string;
    const m = s.length;
    const n = t.length;

    const generated: UniversalStep[] = [];
    const memoCache: Record<string, number> = {};
    const gridState: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let nodeIdCounter = 0;

    const lineEntry = anchorMap?.entry || (isMemo ? 7 : 5);
    const lineBoundaryWord1 = anchorMap?.boundary_word1 || (isMemo ? 8 : 6);
    const lineBoundaryWord2 = anchorMap?.boundary_word2 || (isMemo ? 9 : 7);
    const lineCacheHit = anchorMap?.cache_hit || 10;
    const lineMatch = anchorMap?.match || (isMemo ? 11 : 8);
    const lineMatchBranch = anchorMap?.match_branch || (isMemo ? 12 : 9);
    const lineCombine = anchorMap?.combine || (isMemo ? 14 : 12);
    const lineReturn = isMemo ? 4 : 3;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: m,
      c: n,
      val: `dfs(${m},${n})`,
      status: 'current',
      children: []
    };

    function dfs(i: number, j: number, currentTreeNode: UniversalTreeNode): number {
      const key = `${i},${j}`;
      activeStack.push(key);
      visitedCells.add(key);
      currentTreeNode.status = 'current';

      generated.push({
        type: 'entry',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineEntry,
        tag: `dfs(${i}, ${j})`,
        log: `| 📥 进入 dfs(i=${i}, j=${j}) [s前缀="${s.slice(0, i)}", t前缀="${t.slice(0, j)}"]`,
        msg: `进入函数 <code>dfs(i = ${i}, j = ${j})</code>，求解使 <code>word1[0..${i - 1}]</code> 与 <code>word2[0..${j - 1}]</code> 相同所需最少删除步数。`,
        gridHighlight: { i, j },
        activeNodeId: currentTreeNode.id,
        treeRoot: UniversalStageEngine.cloneTree(rootNode)
      });

      // Base Case 1: s 为空串 (i == 0)，需删除 t 的全部 j 个字符
      if (i === 0) {
        gridState[0][j] = j;
        currentTreeNode.status = 'base';
        currentTreeNode.tag = `= ${j} (删去t全部)`;

        generated.push({
          type: 'boundary',
          i: 0,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundaryWord1,
          tag: `Base Case i=0 需删${j}步`,
          log: `| 🏆 【Base Case 达成】i=0: word1 为空，需删去 word2 剩余全部 ${j} 个字符，return ${j}`,
          msg: `🏆 <strong>【Base Case 达成】</strong><code>i = 0</code>（word1 为空）：需删除 word2 剩余全部 <code>${j}</code> 个字符，返回 <strong>${j}</strong>。`,
          gridHighlight: { i: 0, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
        activeStack.pop();
        return j;
      }

      // Base Case 2: t 为空串 (j == 0)，需删除 s 的全部 i 个字符
      if (j === 0) {
        gridState[i][0] = i;
        currentTreeNode.status = 'base';
        currentTreeNode.tag = `= ${i} (删去s全部)`;

        generated.push({
          type: 'boundary',
          i,
          j: 0,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundaryWord2,
          tag: `Base Case j=0 需删${i}步`,
          log: `| 🏆 【Base Case 达成】j=0: word2 为空，需删去 word1 剩余全部 ${i} 个字符，return ${i}`,
          msg: `🏆 <strong>【Base Case 达成】</strong><code>j = 0</code>（word2 为空）：需删除 word1 剩余全部 <code>${i}</code> 个字符，返回 <strong>${i}</strong>。`,
          gridHighlight: { i, j: 0 },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
        activeStack.pop();
        return i;
      }

      // 备忘录剪枝
      if (isMemo && memoCache[key] !== undefined) {
        currentTreeNode.status = 'pruned';
        currentTreeNode.tag = `⚡=${memoCache[key]}`;

        generated.push({
          type: 'cache-hit',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCacheHit,
          tag: '⚡ 备忘录命中',
          log: `| ⚡ 【备忘录命中剪枝】memo[${i}][${j}] 已缓存 ${memoCache[key]}！直接 O(1) 返回`,
          msg: `⚡ 【备忘录剪枝】<code>memo[${i}][${j}]</code> 已命中缓存 <strong>${memoCache[key]}</strong>，直接返回！`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
        activeStack.pop();
        return memoCache[key];
      }

      memoCache[key] = (memoCache[key] || 0) + 1;

      const isMatch = s[i - 1] === t[j - 1];
      let res = 0;

      if (isMatch) {
        generated.push({
          type: 'match-branch',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineMatch,
          tag: `字符相同 '${s[i - 1]}'`,
          log: `| 🔀 末尾字符相同 word1[${i - 1}] == word2[${j - 1}] ('${s[i - 1]}')，无需删除，直接转移至 dfs(${i - 1}, ${j - 1})`,
          msg: `🔀 末尾字符相同 <code>word1[${i - 1}] == word2[${j - 1}] == '${s[i - 1]}'</code>，无需消耗删除步数，直接进入 <code>dfs(${i - 1}, ${j - 1})</code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });

        const childNode: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: i - 1,
          c: j - 1,
          val: `dfs(${i - 1},${j - 1})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNode);
        res = dfs(i - 1, j - 1, childNode);

        if (isMemo) memoCache[key] = res;
        gridState[i][j] = res;

        currentTreeNode.status = 'visited';
        currentTreeNode.tag = `= ${res}`;

        generated.push({
          type: 'update',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineMatchBranch,
          tag: '字符相同直接继承',
          log: `| ✨ 字符相同结果: dfs(${i}, ${j}) = dfs(${i - 1}, ${j - 1}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
          msg: `✨ 字符相同继承结果：<code>dfs(${i}, ${j}) = dfs(${i - 1}, ${j - 1}) = <strong>${res}</strong></code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
      } else {
        generated.push({
          type: 'diff-branch',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineMatch,
          tag: `字符不同 ('${s[i - 1]}' != '${t[j - 1]}')`,
          log: `| ⏩ 字符不同 word1[${i - 1}]('${s[i - 1]}') != word2[${j - 1}]('${t[j - 1]}')，尝试删 word1[${i - 1}] 与删 word2[${j - 1}] 两分支`,
          msg: `⏩ 字符不同 <code>word1[${i - 1}] ('${s[i - 1]}') != word2[${j - 1}] ('${t[j - 1]}')</code>，分别尝试删除 <code>word1[${i - 1}]</code> 或 <code>word2[${j - 1}]</code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });

        // 分支 1: 删 word1[i-1] -> dfs(i-1, j)
        const childNode1: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: i - 1,
          c: j,
          val: `dfs(${i - 1},${j})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNode1);
        const valDel1 = dfs(i - 1, j, childNode1);

        // 分支 2: 删 word2[j-1] -> dfs(i, j-1)
        const childNode2: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: i,
          c: j - 1,
          val: `dfs(${i},${j - 1})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNode2);
        const valDel2 = dfs(i, j - 1, childNode2);

        res = Math.min(valDel1, valDel2) + 1;

        if (isMemo) memoCache[key] = res;
        gridState[i][j] = res;

        currentTreeNode.status = 'visited';
        currentTreeNode.tag = `= ${res}`;

        generated.push({
          type: 'update',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCombine,
          tag: '取较小删除代价+1',
          log: `| ✨ 合并分支: dfs(${i}, ${j}) = min(删word1=${valDel1}, 删word2=${valDel2}) + 1 = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
          msg: `✨ 汇总删除代价：<code>min(删word1=${valDel1}, 删word2=${valDel2}) + 1 = <strong>${res}</strong></code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
      }

      activeStack.pop();
      return res;
    }

    const total = dfs(m, n, rootNode);

    generated.push({
      type: 'return',
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineReturn,
      tag: '最终答案',
      log: `| 🏆 两个字符串的删除操作计算完成！minDistance("${s}", "${t}") = ${total}`,
      msg: `🏆 演化计算完成！使 <code>word1 = "${s}"</code> 与 <code>word2 = "${t}"</code> 相同所需最少删除步数为 <strong>${total}</strong>。`,
      gridHighlight: { i: m, j: n },
      activeNodeId: rootNode.id,
      treeRoot: UniversalStageEngine.cloneTree(rootNode)
    });

    return generated;
  }

  /**
   * 生成编辑距离 (Edit Distance) 阶段 1 朴素递归 / 阶段 2 记忆化搜索演化步骤
   */
  public static generateEditDistanceStage1or2Steps(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.word1 || (model.defaultParams as any)?.s || 'horse') as string;
    const t = ((model.defaultParams as any)?.word2 || (model.defaultParams as any)?.t || 'ros') as string;
    const m = s.length;
    const n = t.length;

    const generated: UniversalStep[] = [];
    const memoCache: Record<string, number> = {};
    const gridState: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let nodeIdCounter = 0;

    const lineEntry = anchorMap?.entry || (isMemo ? 7 : 5);
    const lineBoundaryWord1 = anchorMap?.boundary_word1 || (isMemo ? 8 : 6);
    const lineBoundaryWord2 = anchorMap?.boundary_word2 || (isMemo ? 9 : 7);
    const lineCacheHit = anchorMap?.cache_hit || 10;
    const lineMatch = anchorMap?.match || (isMemo ? 11 : 8);
    const lineMatchBranch = anchorMap?.match_branch || (isMemo ? 12 : 9);
    const lineDiff = anchorMap?.diff || (isMemo ? 14 : 11);
    const lineCombine = anchorMap?.combine || (isMemo ? 18 : 17);
    const lineReturn = isMemo ? 4 : 3;

    let callCount = 0;
    const MAX_RECORDED_CALLS = 100;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: m,
      c: n,
      val: `dfs(${m},${n})`,
      status: 'current',
      children: []
    };

    function dfs(i: number, j: number, currentTreeNode?: UniversalTreeNode): number {
      callCount++;
      const shouldRecord = isMemo || callCount <= MAX_RECORDED_CALLS;
      const key = `${i},${j}`;
      activeStack.push(key);
      visitedCells.add(key);
      if (currentTreeNode) currentTreeNode.status = 'current';

      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'entry',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineEntry,
          tag: `dfs(${i}, ${j})`,
          log: `| 📥 进入 dfs(i=${i}, j=${j}) [s前缀="${s.slice(0, i)}", t前缀="${t.slice(0, j)}"]`,
          msg: `进入函数 <code>dfs(i = ${i}, j = ${j})</code>，求解将 <code>word1[0..${i - 1}]</code> 转换成 <code>word2[0..${j - 1}]</code> 所需最少操作数。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
      }

      // Base Case 1: s 为空串 (i == 0)，需插入 t 的全部 j 个字符
      if (i === 0) {
        gridState[0][j] = j;
        if (currentTreeNode) {
          currentTreeNode.status = 'base';
          currentTreeNode.tag = `= ${j} (插入全部)`;
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'boundary',
            i: 0,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBoundaryWord1,
            tag: `Base Case i=0 需插${j}步`,
            log: `| 🏆 【Base Case 达成】i=0: word1 为空，需插入 word2 剩余全部 ${j} 个字符，return ${j}`,
            msg: `🏆 <strong>【Base Case 达成】</strong><code>i = 0</code>（word1 为空）：需插入 <code>word2</code> 的全部 <code>${j}</code> 个字符，返回 <strong>${j}</strong>。`,
            gridHighlight: { i: 0, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return j;
      }

      // Base Case 2: t 为空串 (j == 0)，需删除 s 的全部 i 个字符
      if (j === 0) {
        gridState[i][0] = i;
        if (currentTreeNode) {
          currentTreeNode.status = 'base';
          currentTreeNode.tag = `= ${i} (删除全部)`;
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'boundary',
            i,
            j: 0,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBoundaryWord2,
            tag: `Base Case j=0 需删${i}步`,
            log: `| 🏆 【Base Case 达成】j=0: word2 为空，需删去 word1 剩余全部 ${i} 个字符，return ${i}`,
            msg: `🏆 <strong>【Base Case 达成】</strong><code>j = 0</code>（word2 为空）：需删去 <code>word1</code> 的全部 <code>${i}</code> 个字符，返回 <strong>${i}</strong>。`,
            gridHighlight: { i, j: 0 },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return i;
      }

      // 备忘录剪枝
      if (isMemo && memoCache[key] !== undefined) {
        if (currentTreeNode) {
          currentTreeNode.status = 'pruned';
          currentTreeNode.tag = `⚡=${memoCache[key]}`;
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'cache-hit',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineCacheHit,
            tag: '⚡ 备忘录命中',
            log: `| ⚡ 【备忘录命中剪枝】memo[${i}][${j}] 已缓存 ${memoCache[key]}！直接 O(1) 返回`,
            msg: `⚡ 【备忘录剪枝】<code>memo[${i}][${j}]</code> 已命中缓存 <strong>${memoCache[key]}</strong>，直接返回！`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return memoCache[key];
      }

      memoCache[key] = (memoCache[key] || 0) + 1;

      const isMatch = s[i - 1] === t[j - 1];
      let res = 0;

      if (isMatch) {
        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'match-branch',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineMatch,
            tag: `字符相同 '${s[i - 1]}'`,
            log: `| 🔀 末尾字符相同 word1[${i - 1}] == word2[${j - 1}] ('${s[i - 1]}')，无需操作，直接转移至 dfs(${i - 1}, ${j - 1})`,
            msg: `🔀 末尾字符相同 <code>word1[${i - 1}] == word2[${j - 1}] == '${s[i - 1]}'</code>，无需消耗操作步数，直接进入 <code>dfs(${i - 1}, ${j - 1})</code>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }

        let childNode: UniversalTreeNode | undefined;
        if (shouldRecord && currentTreeNode) {
          childNode = {
            id: `node-${++nodeIdCounter}`,
            r: i - 1,
            c: j - 1,
            val: `dfs(${i - 1},${j - 1})`,
            status: 'normal',
            children: []
          };
          currentTreeNode.children.push(childNode);
        }
        res = dfs(i - 1, j - 1, childNode);

        if (isMemo) memoCache[key] = res;
        gridState[i][j] = res;

        if (currentTreeNode) {
          currentTreeNode.status = 'visited';
          currentTreeNode.tag = `= ${res}`;
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'update',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineMatchBranch,
            tag: '字符相同无损继承',
            log: `| ✨ 字符相同结果: dfs(${i}, ${j}) = dfs(${i - 1}, ${j - 1}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
            msg: `✨ 字符相同继承结果：<code>dfs(${i}, ${j}) = dfs(${i - 1}, ${j - 1}) = <strong>${res}</strong></code>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }
      } else {
        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'diff-branch',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineDiff,
            tag: `字符不同 ('${s[i - 1]}' != '${t[j - 1]}')`,
            log: `| ⏩ 字符不同 word1[${i - 1}]('${s[i - 1]}') != word2[${j - 1}]('${t[j - 1]}')，探索替换、删除、插入三向决策`,
            msg: `⏩ 字符不同 <code>word1[${i - 1}] ('${s[i - 1]}') != word2[${j - 1}] ('${t[j - 1]}')</code>，分别探索替换、删除、插入三种分支。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }

        // 决策 1: 替换 -> dfs(i-1, j-1)
        let childReplace: UniversalTreeNode | undefined;
        if (shouldRecord && currentTreeNode) {
          childReplace = {
            id: `node-${++nodeIdCounter}`,
            r: i - 1,
            c: j - 1,
            val: `dfs(${i - 1},${j - 1})`,
            status: 'normal',
            children: []
          };
          currentTreeNode.children.push(childReplace);
        }
        const valReplace = dfs(i - 1, j - 1, childReplace);

        // 决策 2: 删除 -> dfs(i-1, j)
        let childDelete: UniversalTreeNode | undefined;
        if (shouldRecord && currentTreeNode) {
          childDelete = {
            id: `node-${++nodeIdCounter}`,
            r: i - 1,
            c: j,
            val: `dfs(${i - 1},${j})`,
            status: 'normal',
            children: []
          };
          currentTreeNode.children.push(childDelete);
        }
        const valDelete = dfs(i - 1, j, childDelete);

        // 决策 3: 插入 -> dfs(i, j-1)
        let childInsert: UniversalTreeNode | undefined;
        if (shouldRecord && currentTreeNode) {
          childInsert = {
            id: `node-${++nodeIdCounter}`,
            r: i,
            c: j - 1,
            val: `dfs(${i},${j - 1})`,
            status: 'normal',
            children: []
          };
          currentTreeNode.children.push(childInsert);
        }
        const valInsert = dfs(i, j - 1, childInsert);

        res = Math.min(valReplace, Math.min(valDelete, valInsert)) + 1;

        if (isMemo) memoCache[key] = res;
        gridState[i][j] = res;

        if (currentTreeNode) {
          currentTreeNode.status = 'visited';
          currentTreeNode.tag = `= ${res}`;
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'update',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineCombine,
            tag: '取三向最小代价+1',
            log: `| ✨ 合并三向分支: dfs(${i}, ${j}) = min(替换=${valReplace}, 删除=${valDelete}, 插入=${valInsert}) + 1 = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
            msg: `✨ 汇总三向编辑代价：<code>min(替换=${valReplace}, 删除=${valDelete}, 插入=${valInsert}) + 1 = <strong>${res}</strong></code>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }
      }

      activeStack.pop();
      return res;
    }

    const total = dfs(m, n, rootNode);

    generated.push({
      type: 'return',
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineReturn,
      tag: '最终答案',
      log: `| 🏆 编辑距离演化计算完成！minDistance("${s}", "${t}") = ${total}`,
      msg: `🏆 演化计算完成！将 <code>word1 = "${s}"</code> 转换成 <code>word2 = "${t}"</code> 所需最少操作数为 <strong>${total}</strong>。`,
      gridHighlight: { i: m, j: n },
      activeNodeId: rootNode.id,
      treeRoot: UniversalStageEngine.cloneTree(rootNode)
    });

    return generated;
  }

  /**
   * 生成回文子串 (Palindromic Substrings) 阶段 1 递归区间判定 / 阶段 2 记忆化搜索演化步骤
   */
  public static generatePalindromicSubstringsStage1or2Steps(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'aaa') as string;
    const n = s.length;

    const generated: UniversalStep[] = [];
    const memoCache: Record<string, boolean> = {};
    const gridState: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let nodeIdCounter = 0;
    let count = 0;

    const lineLoop = anchorMap?.loop_ij || 4;
    const lineCheck = anchorMap?.check || 6;
    const lineBoundary = anchorMap?.boundary || (isMemo ? 17 : 16);
    const lineCacheHit = anchorMap?.cache_hit || 19;
    const lineDiff = anchorMap?.diff || (isMemo ? 21 : 18);
    const lineRecurse = anchorMap?.recurse || (isMemo ? 23 : 20);
    const lineReturn = anchorMap?.return || 12;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: 0,
      c: n - 1,
      val: `countSubstrings("${s}")`,
      status: 'current',
      children: []
    };

    function isPalindrome(i: number, j: number, parentNode?: UniversalTreeNode): boolean {
      const key = `${i},${j}`;
      activeStack.push(key);
      visitedCells.add(key);

      const currentNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: i,
        c: j,
        val: `isPalin(${i},${j}): "${s.slice(i, j + 1)}"`,
        status: 'current',
        children: []
      };
      if (parentNode) {
        parentNode.children.push(currentNode);
      }

      generated.push({
        type: 'entry',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineCheck,
        tag: `检验区间 [${i}, ${j}] "${s.slice(i, j + 1)}"`,
        log: `| 🔍 检验子串 [${i}, ${j}] "${s.slice(i, j + 1)}" 是否为回文`,
        msg: `检验子串 <code>[${i}..${j}] "${s.slice(i, j + 1)}"</code> 的回文性。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: UniversalStageEngine.cloneTree(rootNode)
      });

      // Base Case: i >= j (单字符或空区间)
      if (i >= j) {
        gridState[i][j] = 1;
        currentNode.status = 'base';
        currentNode.tag = '= true (Base)';

        generated.push({
          type: 'boundary',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundary,
          tag: 'Base Case 单字符必然回文',
          log: `| 🏆 【Base Case 达成】i >= j (${i} >= ${j})，子串 "${s.slice(i, j + 1)}" 必然是回文，return true`,
          msg: `🏆 <strong>【Base Case 达成】</strong><code>i >= j (${i} >= ${j})</code>，单字符或空区间必然为回文，返回 <strong>true</strong>。`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
        activeStack.pop();
        return true;
      }

      // 备忘录命中
      if (isMemo && memoCache[key] !== undefined) {
        currentNode.status = 'pruned';
        currentNode.tag = `⚡=${memoCache[key]}`;

        generated.push({
          type: 'cache-hit',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCacheHit,
          tag: '⚡ 备忘录命中',
          log: `| ⚡ 【备忘录命中剪枝】memo[${i}][${j}] 已缓存 ${memoCache[key]}！直接 O(1) 返回`,
          msg: `⚡ 【备忘录剪枝】<code>memo[${i}][${j}]</code> 已命中缓存 <strong>${memoCache[key]}</strong>，直接返回！`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
        activeStack.pop();
        return memoCache[key];
      }

      // 端点不相等
      if (s[i] !== s[j]) {
        if (isMemo) memoCache[key] = false;
        gridState[i][j] = 0;
        currentNode.status = 'pruned';
        currentNode.tag = `= false ('${s[i]}' != '${s[j]}')`;

        generated.push({
          type: 'diff-branch',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineDiff,
          tag: `端点不同 '${s[i]}' != '${s[j]}'`,
          log: `| ❌ s[${i}]('${s[i]}') != s[${j}]('${s[j]}')，非回文串，return false`,
          msg: `❌ 端点字符不相等 <code>s[${i}] ('${s[i]}') != s[${j}] ('${s[j]}')</code>，非回文串，返回 <strong>false</strong>。`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
        activeStack.pop();
        return false;
      }

      // 端点相等，递归内层
      generated.push({
        type: 'match-branch',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineRecurse,
        tag: `端点相同 '${s[i]}' == '${s[j]}'`,
        log: `| 🔀 端点字符相同 s[${i}] == s[${j}] ('${s[i]}')，递归检验内层 isPalindrome(${i + 1}, ${j - 1})`,
        msg: `🔀 端点字符相同 <code>s[${i}] == s[${j}] == '${s[i]}'</code>，递归检验内层子串 <code>[${i + 1}..${j - 1}]</code>。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: UniversalStageEngine.cloneTree(rootNode)
      });

      const res = isPalindrome(i + 1, j - 1, currentNode);
      if (isMemo) memoCache[key] = res;
      gridState[i][j] = res ? 1 : 0;

      currentNode.status = res ? 'visited' : 'pruned';
      currentNode.tag = `= ${res}`;

      generated.push({
        type: 'update',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineRecurse,
        tag: `区间 [${i}, ${j}] 判定为 ${res}`,
        log: `| ✨ 区间 [${i}, ${j}] "${s.slice(i, j + 1)}" 判定结果: ${res}${isMemo ? ' [存入备忘录]' : ''}`,
        msg: `✨ 区间 <code>[${i}..${j}] "${s.slice(i, j + 1)}"</code> 判定结果为 <strong>${res}</strong>。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: UniversalStageEngine.cloneTree(rootNode)
      });

      activeStack.pop();
      return res;
    }

    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        if (isPalindrome(i, j, rootNode)) {
          count++;
        }
      }
    }

    generated.push({
      type: 'return',
      i: 0,
      j: n - 1,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineReturn,
      tag: '最终统计总数',
      log: `| 🏆 回文子串统计演化完成！countSubstrings("${s}") = ${count}`,
      msg: `🏆 演化计算完成！字符串 <code>"${s}"</code> 中的回文子串总数为 <strong>${count}</strong>。`,
      gridHighlight: { i: 0, j: n - 1 },
      activeNodeId: rootNode.id,
      treeRoot: UniversalStageEngine.cloneTree(rootNode)
    });

    return generated;
  }

  /**
   * 生成最长回文子序列 (Longest Palindromic Subsequence) 阶段 1 递归分治 / 阶段 2 记忆化搜索演化步骤
   */
  public static generateLongestPalindromicSubsequenceStage1or2Steps(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'bbbab') as string;
    const n = s.length;

    const generated: UniversalStep[] = [];
    const memoCache: Record<string, number> = {};
    const gridState: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let nodeIdCounter = 0;
    let callCount = 0;
    const MAX_RECORDED_CALLS = 100;

    const lineEntry = anchorMap?.entry || (isMemo ? 7 : 5);
    const lineBoundaryCross = anchorMap?.boundary_cross || (isMemo ? 8 : 6);
    const lineBoundarySingle = anchorMap?.boundary_single || (isMemo ? 9 : 7);
    const lineCacheHit = anchorMap?.cache_hit || 10;
    const lineMatch = anchorMap?.match || (isMemo ? 12 : 9);
    const lineMatchBranch = anchorMap?.match_branch || (isMemo ? 13 : 10);
    const lineDiff = anchorMap?.diff || (isMemo ? 16 : 13);
    const lineCombine = anchorMap?.combine || (isMemo ? 19 : 17);
    const lineReturn = isMemo ? 4 : 3;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: 0,
      c: n - 1,
      val: `dfs(0, ${n - 1})`,
      status: 'current',
      children: []
    };

    function dfs(i: number, j: number, currentTreeNode?: UniversalTreeNode): number {
      callCount++;
      const shouldRecord = isMemo || callCount <= MAX_RECORDED_CALLS;
      const key = `${i},${j}`;
      activeStack.push(key);
      visitedCells.add(key);
      if (currentTreeNode) currentTreeNode.status = 'current';

      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'entry',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineEntry,
          tag: `dfs(${i}, ${j})`,
          log: `| 📥 进入 dfs(i=${i}, j=${j}) [子串="${s.slice(i, j + 1)}"]`,
          msg: `进入函数 <code>dfs(i = ${i}, j = ${j})</code>，求解子串 <code>s[${i}..${j}] "${s.slice(i, j + 1)}"</code> 的最长回文子序列长度。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
      }

      // Base Case 1: i > j (越界/空区间)
      if (i > j) {
        if (currentTreeNode) {
          currentTreeNode.status = 'base';
          currentTreeNode.tag = '= 0 (空区间)';
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'boundary',
            i: Math.min(i, n - 1),
            j: Math.max(j, 0),
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBoundaryCross,
            tag: 'Base Case i > j (空区间)',
            log: `| 🏆 【Base Case 达成】i > j (${i} > ${j})，空区间返回 0`,
            msg: `🏆 <strong>【Base Case 达成】</strong><code>i > j (${i} > ${j})</code>，空区间返回 <strong>0</strong>。`,
            gridHighlight: { i: Math.min(i, n - 1), j: Math.max(j, 0) },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return 0;
      }

      // Base Case 2: i === j (单字符)
      if (i === j) {
        gridState[i][j] = 1;
        if (currentTreeNode) {
          currentTreeNode.status = 'base';
          currentTreeNode.tag = '= 1 (单字符)';
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'boundary',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBoundarySingle,
            tag: `Base Case 单字符 '${s[i]}'`,
            log: `| 🏆 【Base Case 达成】i == j (${i})，单字符 '${s[i]}' 自身为回文，长度 = 1`,
            msg: `🏆 <strong>【Base Case 达成】</strong><code>i == j == ${i}</code>，单字符 <code>'${s[i]}'</code> 回文长度为 <strong>1</strong>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return 1;
      }

      // 备忘录命中
      if (isMemo && memoCache[key] !== undefined) {
        if (currentTreeNode) {
          currentTreeNode.status = 'pruned';
          currentTreeNode.tag = `⚡=${memoCache[key]}`;
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'cache-hit',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineCacheHit,
            tag: '⚡ 备忘录命中',
            log: `| ⚡ 【备忘录命中剪枝】memo[${i}][${j}] 已缓存 ${memoCache[key]}！直接 O(1) 返回`,
            msg: `⚡ 【备忘录剪枝】<code>memo[${i}][${j}]</code> 已命中缓存 <strong>${memoCache[key]}</strong>，直接返回！`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return memoCache[key];
      }

      memoCache[key] = (memoCache[key] || 0) + 1;

      const isMatch = s[i] === s[j];
      let res = 0;

      if (isMatch) {
        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'match-branch',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineMatch,
            tag: `端点匹配 '${s[i]}'`,
            log: `| 🔀 端点字符相同 s[${i}] == s[${j}] ('${s[i]}')，两端匹配长度 +2，进入 dfs(${i + 1}, ${j - 1})`,
            msg: `🔀 端点字符相同 <code>s[${i}] == s[${j}] == '${s[i]}'</code>，两端同时加入回文序列 (+2)，递归求解 <code>dfs(${i + 1}, ${j - 1})</code>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }

        let childNode: UniversalTreeNode | undefined;
        if (shouldRecord && currentTreeNode) {
          childNode = {
            id: `node-${++nodeIdCounter}`,
            r: i + 1,
            c: j - 1,
            val: `dfs(${i + 1},${j - 1})`,
            status: 'normal',
            children: []
          };
          currentTreeNode.children.push(childNode);
        }
        res = dfs(i + 1, j - 1, childNode) + 2;

        if (isMemo) memoCache[key] = res;
        gridState[i][j] = res;

        if (currentTreeNode) {
          currentTreeNode.status = 'visited';
          currentTreeNode.tag = `= ${res}`;
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'update',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineMatchBranch,
            tag: '端点匹配 +2 结果',
            log: `| ✨ 端点匹配更新: dfs(${i}, ${j}) = dfs(${i + 1}, ${j - 1}) + 2 = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
            msg: `✨ 端点匹配结果：<code>dfs(${i}, ${j}) = dfs(${i + 1}, ${j - 1}) + 2 = <strong>${res}</strong></code>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }
      } else {
        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'diff-branch',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineDiff,
            tag: `端点不同 ('${s[i]}' != '${s[j]}')`,
            log: `| ⏩ 端点不同 s[${i}]('${s[i]}') != s[${j}]('${s[j]}')，分别尝试舍弃左端 dfs(${i + 1}, ${j}) 与舍弃右端 dfs(${i}, ${j - 1})`,
            msg: `⏩ 端点不同 <code>s[${i}] ('${s[i]}') != s[${j}] ('${s[j]}')</code>，分别尝试舍弃左端与舍弃右端。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }

        // 分支 1: 舍弃左端 s[i] -> dfs(i+1, j)
        let childLeft: UniversalTreeNode | undefined;
        if (shouldRecord && currentTreeNode) {
          childLeft = {
            id: `node-${++nodeIdCounter}`,
            r: i + 1,
            c: j,
            val: `dfs(${i + 1},${j})`,
            status: 'normal',
            children: []
          };
          currentTreeNode.children.push(childLeft);
        }
        const valLeft = dfs(i + 1, j, childLeft);

        // 分支 2: 舍弃右端 s[j] -> dfs(i, j-1)
        let childRight: UniversalTreeNode | undefined;
        if (shouldRecord && currentTreeNode) {
          childRight = {
            id: `node-${++nodeIdCounter}`,
            r: i,
            c: j - 1,
            val: `dfs(${i},${j - 1})`,
            status: 'normal',
            children: []
          };
          currentTreeNode.children.push(childRight);
        }
        const valRight = dfs(i, j - 1, childRight);

        res = Math.max(valLeft, valRight);

        if (isMemo) memoCache[key] = res;
        gridState[i][j] = res;

        if (currentTreeNode) {
          currentTreeNode.status = 'visited';
          currentTreeNode.tag = `= ${res}`;
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'update',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineCombine,
            tag: '取舍弃左右较大值',
            log: `| ✨ 合并分支: dfs(${i}, ${j}) = max(舍左=${valLeft}, 舍右=${valRight}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
            msg: `✨ 汇总分支决策：<code>max(舍左=${valLeft}, 舍右=${valRight}) = <strong>${res}</strong></code>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }
      }

      activeStack.pop();
      return res;
    }

    const total = dfs(0, n - 1, rootNode);

    generated.push({
      type: 'return',
      i: 0,
      j: n - 1,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineReturn,
      tag: '最终答案',
      log: `| 🏆 最长回文子序列演化完成！longestPalindromeSubseq("${s}") = ${total}`,
      msg: `🏆 演化计算完成！字符串 <code>"${s}"</code> 的最长回文子序列长度为 <strong>${total}</strong>。`,
      gridHighlight: { i: 0, j: n - 1 },
      activeNodeId: rootNode.id,
      treeRoot: UniversalStageEngine.cloneTree(rootNode)
    });

    return generated;
  }

  /**
   * 生成分割等和子集 (Partition Equal Subset Sum) 阶段 1 二叉决策递归 / 阶段 2 记忆化搜索演化步骤
   */
  public static generatePartitionSubsetStage1or2Steps(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const rawNums = (model.defaultParams as any)?.nums || [1, 5, 11, 5];
    const nums: number[] = Array.isArray(rawNums) ? rawNums : String(rawNums).split(',').map(Number);
    const n = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);

    const generated: UniversalStep[] = [];
    const lineOddCheck = anchorMap?.odd_check || 4;
    const lineDfsStart = anchorMap?.dfs_start || 6;
    const lineBaseMatch = anchorMap?.base_match || (isMemo ? 15 : 12);
    const lineBaseOverflow = anchorMap?.base_overflow || (isMemo ? 17 : 14);
    const lineCacheHit = anchorMap?.cache_hit || 19;
    const lineBranchNotTake = anchorMap?.branch_not_take || (isMemo ? 22 : 17);
    const lineBranchTake = anchorMap?.branch_take || (isMemo ? 26 : 21);
    const lineCombine = anchorMap?.combine || (isMemo ? 28 : 23);

    // 奇数直接剪枝
    if (sum % 2 !== 0) {
      generated.push({
        type: 'boundary',
        i: 0,
        j: 0,
        grid: [[0]],
        activeStack: [],
        visited: [],
        line: lineOddCheck,
        tag: `奇数总和 ${sum} 无法平分`,
        log: `| ❌ 数组总和 sum = ${sum} 为奇数，无法等分为两个整数子集，直接 return false`,
        msg: `数组总和 <code>sum = ${sum}</code> 为奇数，无法平分成两个相等的整数子集，直接返回 <strong>false</strong>。`
      });
      return generated;
    }

    const target = sum / 2;
    const memoCache: Record<string, boolean> = {};
    const gridState: (number | null)[][] = Array.from({ length: n }, () => new Array(target + 1).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let nodeIdCounter = 0;
    let callCount = 0;
    const MAX_RECORDED_CALLS = 100;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: 0,
      c: target,
      val: `canPartition(nums, target=${target})`,
      status: 'current',
      children: []
    };

    function dfs(i: number, curTarget: number, currentTreeNode?: UniversalTreeNode): boolean {
      callCount++;
      const shouldRecord = isMemo || callCount <= MAX_RECORDED_CALLS;
      const key = `${i},${curTarget}`;
      activeStack.push(key);
      visitedCells.add(key);
      if (currentTreeNode) currentTreeNode.status = 'current';

      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'entry',
          i: Math.min(i, n - 1),
          j: Math.max(0, Math.min(curTarget, target)),
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineDfsStart,
          tag: `dfs(i=${i}, 剩${curTarget})`,
          log: `| 📥 进入 dfs(i=${i}, curTarget=${curTarget}) [当前物品 nums[${i}]=${nums[i] ?? 'None'}]`,
          msg: `进入函数 <code>dfs(i = ${i}, curTarget = ${curTarget})</code>，从第 <code>${i}</code> 个物品起搜索和为 <code>${curTarget}</code> 的子集。`,
          gridHighlight: { i: Math.min(i, n - 1), j: Math.max(0, Math.min(curTarget, target)) },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
      }

      // Base Case 1: curTarget === 0 成功凑齐
      if (curTarget === 0) {
        if (i < n) gridState[i][0] = 1;
        if (currentTreeNode) {
          currentTreeNode.status = 'base';
          currentTreeNode.tag = '🎯 凑齐 target=0 (true)';
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'boundary',
            i: Math.min(i, n - 1),
            j: 0,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBaseMatch,
            tag: 'Base Case 恰好凑齐目标和',
            log: `| 🏆 【Base Case 达成】curTarget == 0，找到满足条件的等和子集！return true`,
            msg: `🏆 <strong>【Base Case 达成】</strong><code>curTarget == 0</code>，已恰好凑齐目标和 <strong>${target}</strong>，返回 <strong>true</strong>！`,
            gridHighlight: { i: Math.min(i, n - 1), j: 0 },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return true;
      }

      // Base Case 2: 越界或负数
      if (i >= n || curTarget < 0) {
        if (currentTreeNode) {
          currentTreeNode.status = 'pruned';
          currentTreeNode.tag = '❌ 越界/超额 (false)';
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'boundary',
            i: Math.min(i, n - 1),
            j: Math.max(0, Math.min(curTarget, target)),
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBaseOverflow,
            tag: 'Base Case 越界或超额',
            log: `| ❌ 【Base Case】i=${i}>=${n} 或 curTarget=${curTarget}<0，分支失败，return false`,
            msg: `❌ <strong>【Base Case】</strong><code>i = ${i} >= ${n}</code> 或 <code>curTarget = ${curTarget} < 0</code>，返回 <strong>false</strong>。`,
            gridHighlight: { i: Math.min(i, n - 1), j: Math.max(0, Math.min(curTarget, target)) },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return false;
      }

      // 备忘录命中
      if (isMemo && memoCache[key] !== undefined) {
        if (currentTreeNode) {
          currentTreeNode.status = 'pruned';
          currentTreeNode.tag = `⚡=${memoCache[key]}`;
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'cache-hit',
            i,
            j: curTarget,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineCacheHit,
            tag: '⚡ 备忘录命中',
            log: `| ⚡ 【备忘录命中剪枝】memo[${i}][${curTarget}] 已缓存 ${memoCache[key]}！直接 O(1) 返回`,
            msg: `⚡ 【备忘录剪枝】<code>memo[${i}][${curTarget}]</code> 已命中缓存 <strong>${memoCache[key]}</strong>，直接返回！`,
            gridHighlight: { i, j: curTarget },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return memoCache[key];
      }

      // 分支 1: 不选当前数字 nums[i]
      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'diff-branch',
          i,
          j: curTarget,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBranchNotTake,
          tag: `不选 nums[${i}]=${nums[i]}`,
          log: `| 🚫 决策 1: 不选 nums[${i}] (${nums[i]})，剩余目标仍为 ${curTarget}，进入 dfs(${i + 1}, ${curTarget})`,
          msg: `🚫 决策 1：<strong>不选</strong> 当前数字 <code>nums[${i}] = ${nums[i]}</code>，剩余目标保持 <code>${curTarget}</code>。`,
          gridHighlight: { i, j: curTarget },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
      }

      let childNotTake: UniversalTreeNode | undefined;
      if (shouldRecord && currentTreeNode) {
        childNotTake = {
          id: `node-${++nodeIdCounter}`,
          r: i + 1,
          c: curTarget,
          val: `不选: dfs(${i + 1},${curTarget})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNotTake);
      }
      const notTakeRes = dfs(i + 1, curTarget, childNotTake);

      if (notTakeRes) {
        if (isMemo) memoCache[key] = true;
        gridState[i][curTarget] = 1;
        if (currentTreeNode) {
          currentTreeNode.status = 'visited';
          currentTreeNode.tag = '= true';
        }
        activeStack.pop();
        return true;
      }

      // 分支 2: 选入当前数字 nums[i]
      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'match-branch',
          i,
          j: curTarget,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBranchTake,
          tag: `选入 nums[${i}]=${nums[i]}`,
          log: `| 📦 决策 2: 选入 nums[${i}] (${nums[i]})，剩余目标扣减为 ${curTarget - nums[i]}，进入 dfs(${i + 1}, ${curTarget - nums[i]})`,
          msg: `📦 决策 2：<strong>选入</strong> 当前数字 <code>nums[${i}] = ${nums[i]}</code>，剩余目标变为 <code>${curTarget - nums[i]}</code>。`,
          gridHighlight: { i, j: curTarget },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
      }

      let childTake: UniversalTreeNode | undefined;
      if (shouldRecord && currentTreeNode) {
        childTake = {
          id: `node-${++nodeIdCounter}`,
          r: i + 1,
          c: Math.max(0, curTarget - nums[i]),
          val: `选入: dfs(${i + 1},${curTarget - nums[i]})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childTake);
      }
      const takeRes = dfs(i + 1, curTarget - nums[i], childTake);

      const finalRes = takeRes;
      if (isMemo) memoCache[key] = finalRes;
      gridState[i][curTarget] = finalRes ? 1 : 0;

      if (currentTreeNode) {
        currentTreeNode.status = finalRes ? 'visited' : 'pruned';
        currentTreeNode.tag = `= ${finalRes}`;
      }

      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'update',
          i,
          j: curTarget,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCombine,
          tag: `状态汇总: ${finalRes}`,
          log: `| ✨ 合并分支: dfs(${i}, ${curTarget}) = ${finalRes}${isMemo ? ' [存入备忘录]' : ''}`,
          msg: `✨ 汇总分支决策结果：<code>dfs(${i}, ${curTarget}) = <strong>${finalRes}</strong></code>。`,
          gridHighlight: { i, j: curTarget },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
      }

      activeStack.pop();
      return finalRes;
    }

    const total = dfs(0, target, rootNode);

    generated.push({
      type: 'return',
      i: 0,
      j: target,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineCombine,
      tag: '最终判定答案',
      log: `| 🏆 分割等和子集演化计算完成！canPartition([${nums}]) = ${total}`,
      msg: `🏆 演化计算完成！数组 <code>[${nums.join(', ')}]</code> ${total ? '<strong>可以</strong>分割成两个和相等的子集（和为 ' + target + '）' : '<strong>无法</strong>分割成两个和相等的子集'}。`,
      gridHighlight: { i: 0, j: target },
      activeNodeId: rootNode.id,
      treeRoot: UniversalStageEngine.cloneTree(rootNode)
    });

    return generated;
  }

  /**
   * 生成阶段 1 (朴素递归) 或阶段 2 (记忆化搜索) 的完整演化步骤
   */
  public static generateStage1or2Steps(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse' = 'forward',
    isMemo: boolean = false,
    anchorMap?: Record<string, number>,
    variant: string = 'terminal'
  ): UniversalStep[] {
    // 1D 模型特化派发
    if (model.id === 'fibonacci' || model.id === 'climb-stairs') {
      return UniversalStageEngine.generate1DStage1or2Steps(model, Math.max(mVal, nVal), isMemo, anchorMap);
    }
    // 字符串子序列 DP 特化派发
    if (model.id === 'distinct-subsequences') {
      return UniversalStageEngine.generateDistinctSubsequencesStage1or2Steps(model, isMemo, anchorMap);
    }
    // 两个字符串的删除操作特化派发
    if (model.id === 'delete-operation-for-two-strings') {
      return UniversalStageEngine.generateDeleteDistanceStage1or2Steps(model, isMemo, anchorMap);
    }
    // 编辑距离特化派发
    if (model.id === 'edit-distance') {
      return UniversalStageEngine.generateEditDistanceStage1or2Steps(model, isMemo, anchorMap);
    }
    // 回文子串特化派发
    if (model.id === 'palindromic-substrings') {
      return UniversalStageEngine.generatePalindromicSubstringsStage1or2Steps(model, isMemo, anchorMap);
    }
    // 最长回文子序列特化派发
    if (model.id === 'longest-palindromic-subsequence') {
      return UniversalStageEngine.generateLongestPalindromicSubsequenceStage1or2Steps(model, isMemo, anchorMap);
    }
    // 分割等和子集特化派发
    if (model.id === 'partition-equal-subset-sum') {
      return UniversalStageEngine.generatePartitionSubsetStage1or2Steps(model, isMemo, anchorMap);
    }

    const generated: UniversalStep[] = [];
    const memoCache: Record<string, number> = {};
    const gridState: (number | null)[][] = Array.from({ length: mVal }, () => new Array(nVal).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let callCount = 0;
    let nodeIdCounter = 0;

    const isMinPath = model.id === 'min-path-sum';
    const obstacleGrid = UniversalStageEngine.getDynamicObstacleGrid(model, mVal, nVal);
    const weightsGrid = UniversalStageEngine.getDynamicWeightsGrid(model, mVal, nVal);

    const isForward = direction === 'forward';
    const isTerminal = variant === 'terminal';
    const startR = isForward ? 0 : mVal - 1;
    const startC = isForward ? 0 : nVal - 1;

    // 行号映射 fallback
    const lineEntry = anchorMap?.entry || (isMemo ? 7 : 5);
    const lineOutOfBounds = anchorMap?.out_of_bounds || (isMemo ? 8 : 6);
    const lineObstacle = anchorMap?.obstacle || anchorMap?.out_of_bounds || (isMemo ? 8 : 6);
    const lineBoundary = anchorMap?.boundary || (isMemo ? (isTerminal ? 9 : 8) : (isTerminal ? 7 : 6));
    const lineCacheHit = anchorMap?.cache_hit || (isTerminal ? 10 : 9);
    const lineBranch1 = anchorMap?.branch_down || anchorMap?.branch_left || (isMemo ? (isTerminal ? 11 : 10) : (isTerminal ? 8 : 7));
    const lineBranch2 = anchorMap?.branch_right || anchorMap?.branch_up || (isMemo ? (isTerminal ? 12 : 11) : (isTerminal ? 9 : 8));
    const lineCombine = anchorMap?.combine || (isMemo ? (isTerminal ? 13 : 12) : (isTerminal ? 10 : 9));
    const lineReturn = isMemo ? 5 : 3;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: startR,
      c: startC,
      val: `dfs(${startR},${startC})`,
      status: 'current',
      children: []
    };

    function isOutOfBounds(r: number, c: number): boolean {
      if (isForward) {
        return r >= mVal || c >= nVal;
      } else {
        return r < 0 || c < 0;
      }
    }

    function isTarget(r: number, c: number): boolean {
      if (isForward) {
        return r === mVal - 1 && c === nVal - 1;
      } else {
        return r === 0 && c === 0;
      }
    }

    function isBoundary(r: number, c: number): boolean {
      if (isForward) {
        return r === mVal - 1 || c === nVal - 1;
      } else {
        return r === 0 || c === 0;
      }
    }

    function dfs(r: number, c: number, currentTreeNode: UniversalTreeNode, fromR: number = -1, fromC: number = -1): number {
      callCount++;
      const key = `${r},${c}`;
      const isRepeated = !isMemo && memoCache[key] !== undefined;

      activeStack.push(key);
      visitedCells.add(key);

      currentTreeNode.status = 'current';
      if (isRepeated) {
        currentTreeNode.tag = '⚠️重复';
      }

      generated.push({
        type: 'dfs-call',
        i: r,
        j: c,
        fromI: fromR,
        fromJ: fromC,
        obstacleGrid,
        weightsGrid,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineEntry,
        tag: `${isForward ? '顺推' : '逆推'} DFS #${callCount}`,
        log: `| 📥 进入 dfs(i=${r}, j=${c}) [${isForward ? '顺推' : '逆推'}调用 #${callCount}]`,
        msg: `📥 进入 dfs(i = ${r}, j = ${c})，${isForward ? '从起点向右向下分支探索' : '从终点向左向上寻找来源'}。`,
        topI: -1,
        topJ: -1,
        leftI: -1,
        leftJ: -1,
        gridHighlight: { i: r, j: c },
        activeNodeId: currentTreeNode.id,
        treeRoot: UniversalStageEngine.cloneTree(rootNode)
      });

      // 越界拦截判断 (Terminal Variant)
      if (isTerminal) {
        if (isOutOfBounds(r, c)) {
          const outOfBoundsDir = isForward
            ? (r >= mVal ? 'river' : 'right-wall')
            : (r < 0 ? 'top-wall' : 'left-wall');
          const oobHighlightText = isForward
            ? (r >= mVal ? 'i >= m' : 'j >= n')
            : (r < 0 ? 'i < 0' : 'j < 0');

          currentTreeNode.status = 'pruned';
          currentTreeNode.tag = isMinPath ? '🚫=MAX' : '🚫=0';

          generated.push({
            type: 'out-of-bounds',
            i: r,
            j: c,
            fromI: fromR,
            fromJ: fromC,
            outOfBoundsDir,
            isOutOfBounds: true,
            isBlockedStep: true,
            highlightText: oobHighlightText,
            obstacleGrid,
            weightsGrid,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineOutOfBounds,
            tag: outOfBoundsDir === 'river' ? '🌊 触水反弹' : '🚧 撞墙反弹',
            log: outOfBoundsDir === 'river'
              ? `| 🌊 【越界触水拦截】dfs(i=${r}, j=${c}) 跳入边界深水河流！水花四溅并立即弹回，return ${isMinPath ? 'MAX' : '0'}`
              : `| 🚧 【越界撞墙拦截】dfs(i=${r}, j=${c}) 越出网格边界！撞上高墙立即弹回，return ${isMinPath ? 'MAX' : '0'}`,
            msg: outOfBoundsDir === 'river'
              ? `🌊 <strong>【越界触水拦截】</strong>探险家向下方移动跳入边界深水河流 (i = ${r})，水花四溅并弹回！return <strong>${isMinPath ? 'MAX_VALUE' : '0'}</strong>。`
              : `🚧 <strong>【越界撞墙拦截】</strong>探险家向右方越界 (j = ${c})，撞上边界高墙弹回！return <strong>${isMinPath ? 'MAX_VALUE' : '0'}</strong>。`,
            topI: -1,
            topJ: -1,
            leftI: -1,
            leftJ: -1,
            gridHighlight: { i: r, j: c },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
          activeStack.pop();
          return isMinPath ? 999999 : 0;
        }

        // 障碍物阻断 (Obstacle Hit)
        if (obstacleGrid && obstacleGrid[r]?.[c] === 1) {
          currentTreeNode.status = 'pruned';
          currentTreeNode.tag = '🚧障碍=0';

          generated.push({
            type: 'obstacle-hit',
            i: r,
            j: c,
            fromI: fromR,
            fromJ: fromC,
            isBlockedStep: true,
            highlightText: 'grid[i][j] == 1',
            obstacleGrid,
            weightsGrid,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineObstacle,
            tag: '🚧 遇障碍阻断',
            log: `| 🚧 【遇到障碍物阻断】dfs(i=${r}, j=${c}) 遭遇障碍物 (obstacleGrid[${r}][${c}] == 1)！路径阻断不可通行，return 0`,
            msg: `🚧 <strong>【遭遇障碍物阻断】</strong>探险家到达障碍物格点 (i = ${r}, j = ${c})，路径被阻断无法通行！return <strong>0</strong>。`,
            topI: -1,
            topJ: -1,
            leftI: -1,
            leftJ: -1,
            gridHighlight: { i: r, j: c },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
          activeStack.pop();
          return 0;
        }

        if (isTarget(r, c)) {
          const targetVal = isMinPath && weightsGrid ? weightsGrid[r][c] : 1;
          gridState[r][c] = targetVal;
          currentTreeNode.status = 'base';
          currentTreeNode.tag = `= ${targetVal}`;

          generated.push({
            type: 'boundary',
            i: r,
            j: c,
            fromI: fromR,
            fromJ: fromC,
            highlightText: isForward ? 'i == m - 1 && j == n - 1' : 'i == 0 && j == 0',
            obstacleGrid,
            weightsGrid,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBoundary,
            tag: '🏆 到达终点',
            log: `| 🏆 【终点达成】dfs(i=${r}, j=${c}) 到达目标${isForward ? '终点' : '起点'}，返回权值 ${targetVal}`,
            msg: `🏆 <strong>【终点达成】</strong>到达目标${isForward ? '终点' : '起点'} (i = ${r}, j = ${c})，返回目标格点值 <strong>${targetVal}</strong>。`,
            topI: -1,
            topJ: -1,
            leftI: -1,
            leftJ: -1,
            gridHighlight: { i: r, j: c },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
          activeStack.pop();
          return targetVal;
        }
      } else {
        // 边缘直达版 (Boundary Variant)
        if (obstacleGrid && obstacleGrid[r]?.[c] === 1) {
          currentTreeNode.status = 'pruned';
          currentTreeNode.tag = '🚧障碍=0';

          generated.push({
            type: 'obstacle-hit',
            i: r,
            j: c,
            fromI: fromR,
            fromJ: fromC,
            isBlockedStep: true,
            obstacleGrid,
            weightsGrid,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineObstacle,
            tag: '🚧 遇障碍阻断',
            log: `| 🚧 【遇到障碍物阻断】dfs(i=${r}, j=${c}) 遭遇障碍物！路径阻断不可通行，return 0`,
            msg: `🚧 <strong>【遭遇障碍物阻断】</strong>探险家到达障碍物格点 (i = ${r}, j = ${c})，路径被阻断！return <strong>0</strong>。`,
            topI: -1,
            topJ: -1,
            leftI: -1,
            leftJ: -1,
            gridHighlight: { i: r, j: c },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
          activeStack.pop();
          return 0;
        }

        if (obstacleGrid ? isTarget(r, c) : (isMinPath ? isTarget(r, c) : isBoundary(r, c))) {
          const targetVal = isMinPath && weightsGrid ? weightsGrid[r][c] : 1;
          gridState[r][c] = targetVal;
          currentTreeNode.status = 'base';
          currentTreeNode.tag = `= ${targetVal}`;

          generated.push({
            type: 'boundary',
            i: r,
            j: c,
            fromI: fromR,
            fromJ: fromC,
            obstacleGrid,
            weightsGrid,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBoundary,
            tag: isTarget(r, c) ? '🏆 到达终点' : 'Base Case',
            log: `| 🎬 到达目标 (i=${r}, j=${c})，返回 ${targetVal}`,
            msg: `🎬 到达目标 (i = ${r}, j = ${c})，返回 <strong>${targetVal}</strong>。`,
            topI: -1,
            topJ: -1,
            leftI: -1,
            leftJ: -1,
            gridHighlight: { i: r, j: c },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
          activeStack.pop();
          return targetVal;
        }
      }

      if (isMemo && memoCache[key] !== undefined) {
        currentTreeNode.status = 'pruned';
        currentTreeNode.tag = `⚡=${memoCache[key]}`;

        generated.push({
          type: 'cache-hit',
          i: r,
          j: c,
          fromI: fromR,
          fromJ: fromC,
          obstacleGrid,
          weightsGrid,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCacheHit,
          tag: '⚡ 备忘录命中',
          log: `| ⚡ 【备忘录命中剪枝】memo[${r}][${c}] 已有缓存 ${memoCache[key]}！直接 O(1) 返回，跳过子树展开`,
          msg: `⚡ 【${isForward ? '顺推' : '逆推'}备忘录剪枝】memo[${r}][${c}] 已缓存 ${memoCache[key]}！直接 O(1) 返回。`,
          topI: -1,
          topJ: -1,
          leftI: -1,
          leftJ: -1,
          gridHighlight: { i: r, j: c },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
        activeStack.pop();
        return memoCache[key];
      }

      memoCache[key] = (memoCache[key] || 0) + 1;

      // 分支 1：顺推向下 (r+1, c) / 逆推向左 (r, c-1)
      const b1R = isForward ? r + 1 : r;
      const b1C = isForward ? c : c - 1;
      const canBranch1 = isTerminal || (isForward ? r < mVal - 1 : c > 0);
      let val1 = isMinPath ? 999999 : 0;

      if (canBranch1) {
        const b1Tag = isForward ? '顺推向下探索' : '逆推向左寻源';
        const b1Log = isForward
          ? `| ⬇️ 执行 int down = dfs(${b1R}, ${b1C})，准备向下探索子分支`
          : `| ⬅️ 执行 int left = dfs(${b1R}, ${b1C})，准备向左寻找来源`;
        const b1Msg = isForward
          ? `⬇️ 执行 int down = dfs(${b1R}, ${b1C})，准备向下探索子分支。`
          : `⬅️ 执行 int left = dfs(${b1R}, ${b1C})，准备向左寻找来源。`;

        generated.push({
          type: isForward ? 'branch-down' : 'branch-left',
          i: r,
          j: c,
          obstacleGrid,
          weightsGrid,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBranch1,
          tag: b1Tag,
          log: b1Log,
          msg: b1Msg,
          topI: -1,
          topJ: -1,
          leftI: -1,
          leftJ: -1,
          gridHighlight: { i: r, j: c },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });

        const childNode1: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: b1R,
          c: b1C,
          val: `dfs(${b1R},${b1C})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNode1);
        val1 = dfs(b1R, b1C, childNode1, r, c);
      }

      // 分支 2：顺推向右 (r, c+1) / 逆推向上 (r-1, c)
      const b2R = isForward ? r : r - 1;
      const b2C = isForward ? c + 1 : c;
      const canBranch2 = isTerminal || (isForward ? c < nVal - 1 : r > 0);
      let val2 = isMinPath ? 999999 : 0;

      if (canBranch2) {
        const b2Tag = isForward ? '顺推向右探索' : '逆推向上寻源';
        const b2Log = isForward
          ? `| ➡️ 执行 int right = dfs(${b2R}, ${b2C}) [down已得 ${val1}]，准备向右探索子分支`
          : `| ⬆️ 执行 int up = dfs(${b2R}, ${b2C}) [left已得 ${val1}]，准备向上寻找来源`;
        const b2Msg = isForward
          ? `➡️ 执行 int right = dfs(${b2R}, ${b2C}) [down已得 ${val1}]，准备向右探索子分支。`
          : `⬆️ 执行 int up = dfs(${b2R}, ${b2C}) [left已得 ${val1}]，准备向上寻找来源。`;

        generated.push({
          type: isForward ? 'branch-right' : 'branch-up',
          i: r,
          j: c,
          fromI: fromR,
          fromJ: fromC,
          obstacleGrid,
          weightsGrid,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBranch2,
          tag: b2Tag,
          log: b2Log,
          msg: b2Msg,
          topI: -1,
          topJ: -1,
          leftI: -1,
          leftJ: -1,
          gridHighlight: { i: r, j: c },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });

        const childNode2: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: b2R,
          c: b2C,
          val: `dfs(${b2R},${b2C})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNode2);
        val2 = dfs(b2R, b2C, childNode2, r, c);
      }

      let res = 0;
      if (isMinPath && weightsGrid) {
        const minBranch = Math.min(val1, val2);
        res = (minBranch < 900000 ? minBranch : 0) + weightsGrid[r][c];
      } else {
        res = val1 + val2;
      }

      if (isMemo) memoCache[key] = res;
      gridState[r][c] = res;

      currentTreeNode.status = 'visited';
      currentTreeNode.tag = `= ${res}`;

      const mergeLog = isMinPath
        ? `| ✨ 合并最小权值: (${r}, ${c}) = min(${val1}, ${val2}) + grid(${weightsGrid?.[r]?.[c]}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`
        : (isForward
          ? `| ✨ 顺推合并: (${r}, ${c}) = 下(${val1}) + 右(${val2}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`
          : `| ✨ 逆推合并: (${r}, ${c}) = 左(${val1}) + 上(${val2}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`);

      const mergeMsg = isMinPath
        ? `✨ 坐标 (${r}, ${c}) 合并：min(下=${val1}, 右=${val2}) + 格点权值 (${weightsGrid?.[r]?.[c]}) = <strong>${res}</strong>${isMemo ? ' [存入缓存]' : ''}。`
        : (isForward
          ? `✨ 坐标 (${r}, ${c}) 顺推合并：下方 (${val1}) + 右方 (${val2}) = ${res}${isMemo ? ' [存入缓存]' : ''}。`
          : `✨ 坐标 (${r}, ${c}) 逆推合并：左方 (${val1}) + 上方 (${val2}) = ${res}${isMemo ? ' [存入缓存]' : ''}。`);

      generated.push({
        type: 'update',
        i: r,
        j: c,
        obstacleGrid,
        weightsGrid,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineCombine,
        tag: isMinPath ? '合并最小权值' : `${isForward ? '顺推' : '逆推'}合并子问题`,
        log: mergeLog,
        msg: mergeMsg,
        topI: isForward ? r + 1 : r - 1,
        topJ: c,
        leftI: r,
        leftJ: isForward ? c + 1 : c - 1,
        gridHighlight: { i: r, j: c },
        activeNodeId: currentTreeNode.id,
        treeRoot: UniversalStageEngine.cloneTree(rootNode)
      });

      activeStack.pop();
      return res;
    }

    const total = dfs(startR, startC, rootNode);

    generated.push({
      type: 'return',
      i: startR,
      j: startC,
      obstacleGrid,
      weightsGrid,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineReturn,
      tag: '最终答案',
      log: isMinPath ? `| 🏆 最终最小路径和: minPathSum(${mVal}, ${nVal}) = ${total}` : `| 🏆 最终答案: uniquePaths(${mVal}, ${nVal}) = ${total}`,
      msg: isMinPath
        ? `🏆 演化计算完成！起点到终点最小路径和为 <strong>${total}</strong>。`
        : `🏆 演化计算完成！最终不同路径数: uniquePaths(${mVal}, ${nVal}) = <strong>${total}</strong>。`,
      topI: -1,
      topJ: -1,
      leftI: -1,
      leftJ: -1,
      gridHighlight: { i: startR, j: startC },
      activeNodeId: rootNode.id,
      treeRoot: UniversalStageEngine.cloneTree(rootNode)
    });

    return generated;
  }

  /**
   * 构建阶段 3 二维 DP 状态转移依赖树 (State Dependency Tree)
   */
  public static build2DDPDependencyTree(
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse' = 'forward',
    obstacleGrid?: number[][],
    currentGrid?: (number | null)[][],
    currentI?: number,
    currentJ?: number
  ): UniversalTreeNode {
    let nodeIdCounter = 0;
    const isForward = direction === 'forward';
    const startR = isForward ? mVal - 1 : 0;
    const startC = isForward ? nVal - 1 : 0;
    const MAX_TREE_DEPTH = 4;
    const MAX_NODES = 40;

    function buildNode(r: number, c: number, depth: number = 0): UniversalTreeNode {
      const id = `dp-node-${r}-${c}-${++nodeIdCounter}`;
      const isCurrent = currentI === r && currentJ === c;
      const isObstacle = obstacleGrid?.[r]?.[c] === 1;
      const val = currentGrid?.[r]?.[c] ?? null;

      let status: 'normal' | 'current' | 'base' | 'pruned' | 'visited' = 'normal';
      let tag: string | undefined = undefined;

      if (isObstacle) {
        status = 'pruned';
        tag = '🚧障碍=0';
      } else if (isForward ? (r === 0 && c === 0) : (r === mVal - 1 && c === nVal - 1)) {
        status = val !== null ? 'base' : (isCurrent ? 'current' : 'normal');
        tag = val !== null ? `= ${val}` : '= 1';
      } else if (val !== null) {
        status = 'visited';
        tag = `= ${val}`;
      }

      if (isCurrent) {
        status = 'current';
        if (isObstacle) {
          tag = '🚧=0';
        } else if (val !== null) {
          tag = `= ${val}`;
        } else {
          tag = '当前计算';
        }
      }

      const node: UniversalTreeNode = {
        id,
        r,
        c,
        val: `dp[${r}][${c}]`,
        status,
        tag,
        children: []
      };

      // 遇障碍物、Base 起点或超出深度/节点上限停止向下展开
      if (
        isObstacle ||
        (isForward ? (r === 0 && c === 0) : (r === mVal - 1 && c === nVal - 1)) ||
        depth >= MAX_TREE_DEPTH ||
        nodeIdCounter >= MAX_NODES
      ) {
        return node;
      }

      // 顺推：依赖上方 (r - 1, c) 与左方 (r, c - 1)
      if (isForward) {
        if (r > 0) {
          node.children.push(buildNode(r - 1, c, depth + 1));
        }
        if (c > 0 && nodeIdCounter < MAX_NODES) {
          node.children.push(buildNode(r, c - 1, depth + 1));
        }
      } else {
        // 逆推：依赖下方 (r + 1, c) 与右方 (r, c + 1)
        if (r + 1 < mVal) {
          node.children.push(buildNode(r + 1, c, depth + 1));
        }
        if (c + 1 < nVal && nodeIdCounter < MAX_NODES) {
          node.children.push(buildNode(r, c + 1, depth + 1));
        }
      }

      return node;
    }

    return buildNode(startR, startC, 0);
  }

  /**
   * 按坐标在树中查找对应节点 ID
   */
  public static findNodeIdByCoord(root: any, r?: number, c?: number): string | undefined {
    if (!root || r === undefined || c === undefined || r < 0 || c < 0) return undefined;
    if (root.r === r && root.c === c) {
      return root.id;
    }
    if (root.val && (root.val === `dp[${r}][${c}]` || root.val.includes(`dfs(${r},${c})`) || root.val.includes(`dfs(${r}, ${c})`))) {
      return root.id;
    }
    if (root.children) {
      for (const child of root.children) {
        const found = UniversalStageEngine.findNodeIdByCoord(child, r, c);
        if (found) return found;
      }
    }
    return undefined;
  }

  /**
   * 生成不同的子序列 (Distinct Subsequences) 阶段 3 二维 DP 填表步骤
   */
  public static generateDistinctSubsequencesStage3Steps(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'rabbbit') as string;
    const t = ((model.defaultParams as any)?.t || 'rabbit') as string;
    const m = s.length;
    const n = t.length;

    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineInitVal = anchorMap?.init_val || 7;
    const lineLoopI = anchorMap?.loop_i || 11;
    const lineLoopJ = anchorMap?.loop_j || 13;
    const lineCond = anchorMap?.cond || 15;
    const lineTransferMatch = anchorMap?.transfer_match || 17;
    const lineTransferSkip = anchorMap?.transfer_skip || 20;
    const lineReturn = anchorMap?.return || 24;

    // 1. 初始化二维矩阵
    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建二维 DP 表格',
      log: `| 📦 创建 (m+1)×(n+1) = ${m + 1}×${n + 1} 的二维 DP 状态表格`,
      msg: `创建 <code>${m + 1}×${n + 1}</code> 的二维 DP 表格，行对应源串 <code>s[0..${m - 1}]</code>，列对应目标串 <code>t[0..${n - 1}]</code>。`
    });

    // 2. 初始化首列 dp[i][0] = 1 (t 为空串时恒有 1 种方案)
    for (let i = 0; i <= m; i++) {
      dp[i][0] = 1;
      steps.push({
        type: 'init-col',
        line: lineInitVal,
        i,
        j: 0,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `Base Case dp[${i}][0]=1`,
        log: `| 🎬 初始化首列: dp[${i}][0] = 1 (目标串为空串，方案数为 1)`,
        msg: `初始化首列：<code>dp[${i}][0] = 1</code>（匹配空串 <code>t = ""</code> 时，唯一方案是删除 <code>s</code> 中所有字符）。`
      });
    }

    // 初始化首行其余位置为 0
    for (let j = 1; j <= n; j++) {
      dp[0][j] = 0;
    }

    // 3. 双重循环自底向上填表
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const isMatch = s[i - 1] === t[j - 1];

        if (isMatch) {
          const fromMatch = dp[i - 1][j - 1] ?? 0;
          const fromSkip = dp[i - 1][j] ?? 0;
          const sum = fromMatch + fromSkip;
          dp[i][j] = sum;

          steps.push({
            type: 'transfer',
            line: lineTransferMatch,
            i,
            j,
            topI: i - 1,
            topJ: j,
            leftI: i - 1,
            leftJ: j - 1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `匹配 s[${i - 1}]=='${s[i - 1]}': 匹配 + 跳过`,
            log: `| 🔄 字符匹配 s[${i - 1}] == t[${j - 1}] ('${s[i - 1]}'): dp[${i}][${j}] = dp[${i - 1}][${j - 1}](${fromMatch}) + dp[${i - 1}][${j}](${fromSkip}) = ${sum}`,
            msg: `字符匹配 <code>s[${i - 1}] == t[${j - 1}] == '${s[i - 1]}'</code>：<code>dp[${i}][${j}] = dp[${i - 1}][${j - 1}] (${fromMatch}) + dp[${i - 1}][${j}] (${fromSkip}) = <strong>${sum}</strong></code>。`
          });
        } else {
          const fromSkip = dp[i - 1][j] ?? 0;
          dp[i][j] = fromSkip;

          steps.push({
            type: 'transfer',
            line: lineTransferSkip,
            i,
            j,
            topI: i - 1,
            topJ: j,
            leftI: -1,
            leftJ: -1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `不匹配: dp[${i}][${j}] = 上方旧值`,
            log: `| 🔄 字符不匹配 s[${i - 1}]('${s[i - 1]}') != t[${j - 1}]('${t[j - 1]}'): dp[${i}][${j}] = dp[${i - 1}][${j}](${fromSkip})`,
            msg: `字符不匹配 <code>s[${i - 1}] ('${s[i - 1]}') != t[${j - 1}] ('${t[j - 1]}')</code>：只能不用 <code>s[${i - 1}]</code>，<code>dp[${i}][${j}] = dp[${i - 1}][${j}] = <strong>${fromSkip}</strong></code>。`
          });
        }
      }
    }

    // 4. 最终返回步骤
    steps.push({
      type: 'return',
      line: lineReturn,
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '返回最终结果',
      log: `| 🏆 填表计算完成！最终结果 dp[${m}][${n}] = ${dp[m][n]}`,
      msg: `🏆 二维填表全部完成！在 <code>"${s}"</code> 中匹配 <code>"${t}"</code> 的不同子序列数为: <strong>${dp[m][n]}</strong>。`
    });

    return steps;
  }

  /**
   * 生成两个字符串的删除操作 (Delete Operation for Two Strings) 阶段 3 二维 DP 填表步骤
   */
  public static generateDeleteDistanceStage3Steps(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.word1 || (model.defaultParams as any)?.s || 'sea') as string;
    const t = ((model.defaultParams as any)?.word2 || (model.defaultParams as any)?.t || 'eat') as string;
    const m = s.length;
    const n = t.length;

    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineInitCol = anchorMap?.init_col || 5;
    const lineInitRow = anchorMap?.init_row || 6;
    const lineLoopI = anchorMap?.loop_i || 7;
    const lineLoopJ = anchorMap?.loop_j || 8;
    const lineCond = anchorMap?.cond || 9;
    const lineTransferMatch = anchorMap?.transfer_match || 10;
    const lineTransferDiff = anchorMap?.transfer_diff || 12;
    const lineReturn = anchorMap?.return || 16;

    // 1. 初始化二维矩阵
    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建二维 DP 表格',
      log: `| 📦 创建 (m+1)×(n+1) = ${m + 1}×${n + 1} 的二维 DP 状态表格`,
      msg: `创建 <code>${m + 1}×${n + 1}</code> 的二维 DP 表格，行对应 <code>word1[0..${m - 1}]</code>，列对应 <code>word2[0..${n - 1}]</code>。`
    });

    // 2. 初始化首列 dp[i][0] = i (word2 为空串时需删去 word1 的全部 i 个字符)
    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
      steps.push({
        type: 'init-col',
        line: lineInitCol,
        i,
        j: 0,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `Base Case dp[${i}][0]=${i}`,
        log: `| 🎬 初始化首列: dp[${i}][0] = ${i} (word2 为空串，需删除 word1 全部 ${i} 个字符)`,
        msg: `初始化首列：<code>dp[${i}][0] = ${i}</code>（word2 为空时，需删去 <code>word1</code> 的全部 <code>${i}</code> 个字符）。`
      });
    }

    // 初始化首行 dp[0][j] = j (word1 为空串时需删去 word2 的全部 j 个字符)
    for (let j = 1; j <= n; j++) {
      dp[0][j] = j;
      steps.push({
        type: 'init-row',
        line: lineInitRow,
        i: 0,
        j,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `Base Case dp[0][${j}]=${j}`,
        log: `| 🎬 初始化首行: dp[0][${j}] = ${j} (word1 为空串，需删除 word2 全部 ${j} 个字符)`,
        msg: `初始化首行：<code>dp[0][${j}] = ${j}</code>（word1 为空时，需删去 <code>word2</code> 的全部 <code>${j}</code> 个字符）。`
      });
    }

    // 3. 双重循环自底向上填表
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const isMatch = s[i - 1] === t[j - 1];

        if (isMatch) {
          const fromMatch = dp[i - 1][j - 1] ?? 0;
          dp[i][j] = fromMatch;

          steps.push({
            type: 'transfer',
            line: lineTransferMatch,
            i,
            j,
            topI: i - 1,
            topJ: j - 1,
            leftI: -1,
            leftJ: -1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `字符相同 '${s[i - 1]}': 继承左上角`,
            log: `| 🔄 字符相同 word1[${i - 1}] == word2[${j - 1}] ('${s[i - 1]}'): dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${fromMatch}`,
            msg: `字符相同 <code>word1[${i - 1}] == word2[${j - 1}] == '${s[i - 1]}'</code>：无需额外删除，<code>dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = <strong>${fromMatch}</strong></code>。`
          });
        } else {
          const fromTop = dp[i - 1][j] ?? 0;
          const fromLeft = dp[i][j - 1] ?? 0;
          const minVal = Math.min(fromTop, fromLeft) + 1;
          dp[i][j] = minVal;

          steps.push({
            type: 'transfer',
            line: lineTransferDiff,
            i,
            j,
            topI: i - 1,
            topJ: j,
            leftI: i,
            leftJ: j - 1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `字符不同: min(上, 左) + 1`,
            log: `| 🔄 字符不同 word1[${i - 1}]('${s[i - 1]}') != word2[${j - 1}]('${t[j - 1]}'): dp[${i}][${j}] = min(上=${fromTop}, 左=${fromLeft}) + 1 = ${minVal}`,
            msg: `字符不同 <code>word1[${i - 1}] ('${s[i - 1]}') != word2[${j - 1}] ('${t[j - 1]}')</code>：<code>dp[${i}][${j}] = min(上 ${fromTop}, 左 ${fromLeft}) + 1 = <strong>${minVal}</strong></code>。`
          });
        }
      }
    }

    // 4. 最终返回步骤
    steps.push({
      type: 'return',
      line: lineReturn,
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '返回最终结果',
      log: `| 🏆 填表计算完成！最少删除步数 dp[${m}][${n}] = ${dp[m][n]}`,
      msg: `🏆 二维填表全部完成！使得 <code>"${s}"</code> 与 <code>"${t}"</code> 相同所需的最少删除字符步数为: <strong>${dp[m][n]}</strong>。`
    });

    for (const step of steps) {
      step.treeRoot = UniversalStageEngine.build2DDPDependencyTree(m + 1, n + 1, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = UniversalStageEngine.findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  /**
   * 生成编辑距离 (Edit Distance) 阶段 3 二维 DP 填表步骤
   */
  public static generateEditDistanceStage3Steps(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.word1 || (model.defaultParams as any)?.s || 'horse') as string;
    const t = ((model.defaultParams as any)?.word2 || (model.defaultParams as any)?.t || 'ros') as string;
    const m = s.length;
    const n = t.length;

    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineInitCol = anchorMap?.init_col || 5;
    const lineInitRow = anchorMap?.init_row || 6;
    const lineLoopI = anchorMap?.loop_i || 7;
    const lineLoopJ = anchorMap?.loop_j || 8;
    const lineCond = anchorMap?.cond || 9;
    const lineTransferMatch = anchorMap?.transfer_match || 10;
    const lineTransferDiff = anchorMap?.transfer_diff || 12;
    const lineReturn = anchorMap?.return || 16;

    // 1. 初始化二维矩阵
    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建二维 DP 表格',
      log: `| 📦 创建 (m+1)×(n+1) = ${m + 1}×${n + 1} 的二维 DP 状态表格`,
      msg: `创建 <code>${m + 1}×${n + 1}</code> 的二维 DP 表格，行对应 <code>word1[0..${m - 1}]</code>，列对应 <code>word2[0..${n - 1}]</code>。`
    });

    // 2. 初始化首列 dp[i][0] = i (word2 为空串时需删去 word1 的全部 i 个字符)
    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
      steps.push({
        type: 'init-col',
        line: lineInitCol,
        i,
        j: 0,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `Base Case dp[${i}][0]=${i}`,
        log: `| 🎬 初始化首列: dp[${i}][0] = ${i} (word2 为空串，需删除 word1 全部 ${i} 个字符)`,
        msg: `初始化首列：<code>dp[${i}][0] = ${i}</code>（word2 为空时，需删去 <code>word1</code> 的全部 <code>${i}</code> 个字符）。`
      });
    }

    // 初始化首行 dp[0][j] = j (word1 为空串时需插入 word2 的全部 j 个字符)
    for (let j = 1; j <= n; j++) {
      dp[0][j] = j;
      steps.push({
        type: 'init-row',
        line: lineInitRow,
        i: 0,
        j,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `Base Case dp[0][${j}]=${j}`,
        log: `| 🎬 初始化首行: dp[0][${j}] = ${j} (word1 为空串，需插入 word2 全部 ${j} 个字符)`,
        msg: `初始化首行：<code>dp[0][${j}] = ${j}</code>（word1 为空时，需插入 <code>word2</code> 的全部 <code>${j}</code> 个字符）。`
      });
    }

    // 3. 双重循环自底向上填表
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const isMatch = s[i - 1] === t[j - 1];

        if (isMatch) {
          const fromMatch = dp[i - 1][j - 1] ?? 0;
          dp[i][j] = fromMatch;

          steps.push({
            type: 'transfer',
            line: lineTransferMatch,
            i,
            j,
            topI: i - 1,
            topJ: j - 1,
            leftI: -1,
            leftJ: -1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `字符相同 '${s[i - 1]}': 继承对角线`,
            log: `| 🔄 字符相同 word1[${i - 1}] == word2[${j - 1}] ('${s[i - 1]}'): dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${fromMatch}`,
            msg: `字符相同 <code>word1[${i - 1}] == word2[${j - 1}] == '${s[i - 1]}'</code>：无需额外编辑，<code>dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = <strong>${fromMatch}</strong></code>。`
          });
        } else {
          const fromRep = dp[i - 1][j - 1] ?? 0;
          const fromDel = dp[i - 1][j] ?? 0;
          const fromIns = dp[i][j - 1] ?? 0;
          const minVal = Math.min(fromRep, Math.min(fromDel, fromIns)) + 1;
          dp[i][j] = minVal;

          steps.push({
            type: 'transfer',
            line: lineTransferDiff,
            i,
            j,
            topI: i - 1,
            topJ: j,
            leftI: i,
            leftJ: j - 1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `字符不同: min(替换, 删除, 插入) + 1`,
            log: `| 🔄 字符不同 word1[${i - 1}]('${s[i - 1]}') != word2[${j - 1}]('${t[j - 1]}'): dp[${i}][${j}] = min(替换=${fromRep}, 删=${fromDel}, 插=${fromIns}) + 1 = ${minVal}`,
            msg: `字符不同 <code>word1[${i - 1}] ('${s[i - 1]}') != word2[${j - 1}] ('${t[j - 1]}')</code>：<code>dp[${i}][${j}] = min(替换 ${fromRep}, 删 ${fromDel}, 插 ${fromIns}) + 1 = <strong>${minVal}</strong></code>。`
          });
        }
      }
    }

    // 4. 最终返回步骤
    steps.push({
      type: 'return',
      line: lineReturn,
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '返回最终结果',
      log: `| 🏆 填表计算完成！最少编辑步数 dp[${m}][${n}] = ${dp[m][n]}`,
      msg: `🏆 二维填表全部完成！将 <code>"${s}"</code> 转换成 <code>"${t}"</code> 所需的最少编辑操作数为: <strong>${dp[m][n]}</strong>。`
    });

    for (const step of steps) {
      step.treeRoot = UniversalStageEngine.build2DDPDependencyTree(m + 1, n + 1, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = UniversalStageEngine.findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  /**
   * 生成回文子串 (Palindromic Substrings) 阶段 3 二维 DP 填表步骤 (上三角区间自底向上)
   */
  public static generatePalindromicSubstringsStage3Steps(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'aaa') as string;
    const n = s.length;

    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
    let count = 0;

    const lineInit = anchorMap?.init || 4;
    const lineLoopI = anchorMap?.loop_i || 8;
    const lineLoopJ = anchorMap?.loop_j || 10;
    const lineCond = anchorMap?.cond || 12;
    const lineTransferShort = anchorMap?.transfer_short || 14;
    const lineTransferSub = anchorMap?.transfer_sub || 18;
    const lineReturn = anchorMap?.return || 25;

    // 1. 初始化二维表格
    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建 n×n 上三角状态表',
      log: `| 📦 创建 ${n}×${n} 的二维 DP 状态表格 (仅填上三角 i <= j)`,
      msg: `创建 <code>${n}×${n}</code> 的二维 DP 表格，<code>dp[i][j]</code> 表示子串 <code>s[i..j]</code> 是否为回文。`
    });

    // 2. 自底向上倒序遍历 i，正序遍历 j
    for (let i = n - 1; i >= 0; i--) {
      for (let j = i; j < n; j++) {
        const isMatch = s[i] === s[j];

        if (isMatch) {
          if (j - i <= 1) {
            dp[i][j] = 1;
            count++;

            steps.push({
              type: 'transfer',
              line: lineTransferShort,
              i,
              j,
              topI: -1,
              topJ: -1,
              leftI: -1,
              leftJ: -1,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `长度 <= 2 回文: "${s.slice(i, j + 1)}"`,
              log: `| 🎬 s[${i}] == s[${j}] ('${s[i]}') 且长度 <= 2: dp[${i}][${j}] = true, count = ${count}`,
              msg: `端点相同 <code>s[${i}] == s[${j}] == '${s[i]}'</code> 且长度 <code>${j - i + 1} <= 2</code>：<code>dp[${i}][${j}] = true</code>，回文总数累加至 <strong>${count}</strong>。`
            });
          } else if (dp[i + 1][j - 1] === 1) {
            dp[i][j] = 1;
            count++;

            steps.push({
              type: 'transfer',
              line: lineTransferSub,
              i,
              j,
              topI: i + 1,
              topJ: j - 1,
              leftI: -1,
              leftJ: -1,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `内层回文: dp[${i}][${j}] = true`,
              log: `| 🔄 s[${i}] == s[${j}] 且内层 dp[${i + 1}][${j - 1}] == true: dp[${i}][${j}] = true, count = ${count}`,
              msg: `端点相同且内层 <code>dp[${i + 1}][${j - 1}] == true</code>：<code>dp[${i}][${j}] = true</code>，回文子串 <code>"${s.slice(i, j + 1)}"</code> 成立，总数 = <strong>${count}</strong>。`
            });
          } else {
            dp[i][j] = 0;

            steps.push({
              type: 'transfer',
              line: lineTransferSub,
              i,
              j,
              topI: i + 1,
              topJ: j - 1,
              leftI: -1,
              leftJ: -1,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `内层非回文: dp[${i}][${j}] = false`,
              log: `| ❌ s[${i}] == s[${j}] 但内层 dp[${i + 1}][${j - 1}] == false: dp[${i}][${j}] = false`,
              msg: `端点虽相同但内层 <code>dp[${i + 1}][${j - 1}] == false</code>：<code>dp[${i}][${j}] = false</code>。`
            });
          }
        } else {
          dp[i][j] = 0;

          steps.push({
            type: 'transfer',
            line: lineCond,
            i,
            j,
            topI: -1,
            topJ: -1,
            leftI: -1,
            leftJ: -1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `端点不同: dp[${i}][${j}] = false`,
            log: `| ❌ s[${i}]('${s[i]}') != s[${j}]('${s[j]}'): dp[${i}][${j}] = false`,
            msg: `端点字符不匹配 <code>s[${i}] ('${s[i]}') != s[${j}] ('${s[j]}')</code>：<code>dp[${i}][${j}] = false</code>。`
          });
        }
      }
    }

    // 3. 最终返回步骤
    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: n - 1,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '返回最终结果',
      log: `| 🏆 上三角填表完成！回文子串总数 count = ${count}`,
      msg: `🏆 二维上三角填表全部完成！字符串 <code>"${s}"</code> 中共有 <strong>${count}</strong> 个回文子串。`
    });

    for (const step of steps) {
      step.treeRoot = UniversalStageEngine.build2DDPDependencyTree(n, n, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = UniversalStageEngine.findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  /**
   * 生成最长回文子序列 (Longest Palindromic Subsequence) 阶段 3 二维 DP 填表步骤 (上三角自底向上)
   */
  public static generateLongestPalindromicSubsequenceStage3Steps(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'bbbab') as string;
    const n = s.length;

    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineInitDiag = anchorMap?.init_diag || 6;
    const lineLoopI = anchorMap?.loop_i || 8;
    const lineLoopJ = anchorMap?.loop_j || 10;
    const lineCond = anchorMap?.cond || 12;
    const lineTransferMatch = anchorMap?.transfer_match || 14;
    const lineTransferDiff = anchorMap?.transfer_diff || 16;
    const lineReturn = anchorMap?.return || 20;

    // 1. 初始化二维表格
    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建 n×n 状态表',
      log: `| 📦 创建 ${n}×${n} 的二维 DP 状态表格 (上三角)`,
      msg: `创建 <code>${n}×${n}</code> 的二维 DP 表格，<code>dp[i][j]</code> 表示子串 <code>s[i..j]</code> 的最长回文子序列长度。`
    });

    // 2. 对角线初始化: dp[i][i] = 1
    for (let i = 0; i < n; i++) {
      dp[i][i] = 1;
      steps.push({
        type: 'init-diag',
        line: lineInitDiag,
        i,
        j: i,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `对角线初始化: dp[${i}][${i}] = 1`,
        log: `| 🎬 对角线单字符初始化: dp[${i}][${i}] = 1 ('${s[i]}')`,
        msg: `对角线初始化：单字符 <code>'${s[i]}'</code> 回文长度必然为 <code>dp[${i}][${i}] = 1</code>。`
      });
    }

    // 3. 自底向上倒序遍历 i，正序遍历 j
    for (let i = n - 1; i >= 0; i--) {
      for (let j = i + 1; j < n; j++) {
        const isMatch = s[i] === s[j];

        if (isMatch) {
          const fromDiag = dp[i + 1][j - 1] ?? 0;
          const sum = fromDiag + 2;
          dp[i][j] = sum;

          steps.push({
            type: 'transfer',
            line: lineTransferMatch,
            i,
            j,
            topI: i + 1,
            topJ: j - 1,
            leftI: -1,
            leftJ: -1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `端点相同 '${s[i]}': dp[${i+1}][${j-1}] + 2 = ${sum}`,
            log: `| 🔄 端点字符相同 s[${i}] == s[${j}] ('${s[i]}'): dp[${i}][${j}] = dp[${i + 1}][${j - 1}] (${fromDiag}) + 2 = ${sum}`,
            msg: `端点字符相同 <code>s[${i}] == s[${j}] == '${s[i]}'</code>：<code>dp[${i}][${j}] = dp[${i + 1}][${j - 1}] (${fromDiag}) + 2 = <strong>${sum}</strong></code>。`
          });
        } else {
          const fromDown = dp[i + 1][j] ?? 0; // 下方
          const fromLeft = dp[i][j - 1] ?? 0; // 左方
          const maxVal = Math.max(fromDown, fromLeft);
          dp[i][j] = maxVal;

          steps.push({
            type: 'transfer',
            line: lineTransferDiff,
            i,
            j,
            topI: i + 1,
            topJ: j,
            leftI: i,
            leftJ: j - 1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `端点不同: max(下, 左) = ${maxVal}`,
            log: `| 🔄 端点字符不同 s[${i}]('${s[i]}') != s[${j}]('${s[j]}'): dp[${i}][${j}] = max(下=${fromDown}, 左=${fromLeft}) = ${maxVal}`,
            msg: `端点字符不同 <code>s[${i}] ('${s[i]}') != s[${j}] ('${s[j]}')</code>：<code>dp[${i}][${j}] = max(下 ${fromDown}, 左 ${fromLeft}) = <strong>${maxVal}</strong></code>。`
          });
        }
      }
    }

    // 4. 最终返回步骤
    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: n - 1,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '返回最终结果',
      log: `| 🏆 上三角填表完成！最长回文子序列长度 dp[0][${n - 1}] = ${dp[0][n - 1]}`,
      msg: `🏆 二维上三角填表全部完成！字符串 <code>"${s}"</code> 的最长回文子序列长度为: <strong>${dp[0][n - 1]}</strong>。`
    });

    for (const step of steps) {
      step.treeRoot = UniversalStageEngine.build2DDPDependencyTree(n, n, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = UniversalStageEngine.findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  /**
   * 生成分割等和子集 (Partition Equal Subset Sum) 阶段 3 二维 0-1 背包 DP 填表步骤
   */
  public static generatePartitionSubsetStage3Steps(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const rawNums = (model.defaultParams as any)?.nums || [1, 5, 11, 5];
    const nums: number[] = Array.isArray(rawNums) ? rawNums : String(rawNums).split(',').map(Number);
    const n = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);

    const steps: UniversalStep[] = [];
    const lineOddCheck = anchorMap?.odd_check || 4;
    const lineInit = anchorMap?.init || 8;
    const lineInitRow = anchorMap?.init_row || 11;
    const lineLoopI = anchorMap?.loop_i || 16;
    const lineLoopJ = anchorMap?.loop_j || 18;
    const lineCond = anchorMap?.cond || 20;
    const lineTransferMax = anchorMap?.transfer_max || 23;
    const lineReturn = anchorMap?.return || 28;

    if (sum % 2 !== 0) {
      steps.push({
        type: 'init',
        line: lineOddCheck,
        i: 0,
        j: 0,
        grid: [[0]],
        tag: `奇数总和 ${sum} 无法平分`,
        log: `| ❌ 数组总和 sum = ${sum} 为奇数，无法等分为两个整数子集，直接 return false`,
        msg: `数组总和 <code>sum = ${sum}</code> 为奇数，无法平分成两个相等的整数子集，直接返回 <strong>false</strong>。`
      });
      return steps;
    }

    const target = sum / 2;
    const dp: (number | null)[][] = Array.from({ length: n }, () => new Array(target + 1).fill(0));

    // 1. 初始化表格
    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建二维 0-1 背包表',
      log: `| 📦 创建 ${n}×${target + 1} 的二维 0-1 背包表格, 目标 target = ${target}`,
      msg: `创建 <code>${n}×${target + 1}</code> 的二维 DP 表格，<code>dp[i][j]</code> 表示前 <code>i</code> 个物品在容量 <code>j</code> 时的最大价值（数值和）。`
    });

    // 2. 初始化首行: i = 0 (仅放第一个物品 nums[0])
    for (let j = nums[0]; j <= target; j++) {
      dp[0][j] = nums[0];
    }
    steps.push({
      type: 'init-row',
      line: lineInitRow,
      i: 0,
      j: nums[0],
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `首行初始化: 仅容量 >= ${nums[0]} 能装下`,
      log: `| 🎬 首行初始化物品 nums[0]=${nums[0]}: 当 j >= ${nums[0]} 时 dp[0][j] = ${nums[0]}`,
      msg: `初始化第 0 行：对于首个物品 <code>nums[0] = ${nums[0]}</code>，当容量 <code>j >= ${nums[0]}</code> 时 <code>dp[0][j] = ${nums[0]}</code>。`
    });

    // 3. 递推填表
    for (let i = 1; i < n; i++) {
      for (let j = 0; j <= target; j++) {
        if (j < nums[i]) {
          dp[i][j] = dp[i - 1][j];

          steps.push({
            type: 'transfer',
            line: lineCond,
            i,
            j,
            topI: i - 1,
            topJ: j,
            leftI: -1,
            leftJ: -1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `容量 ${j} < nums[${i}](${nums[i]}): 继承上方`,
            log: `| 🔄 容量 j=${j} < nums[${i}](${nums[i]}): 无法装入，dp[${i}][${j}] = dp[${i - 1}][${j}] = ${dp[i][j]}`,
            msg: `容量 <code>j = ${j} < nums[${i}] (${nums[i]})</code>：背包空间不足以放入当前数字，继承上方 <code>dp[${i}][${j}] = dp[${i - 1}][${j}] = <strong>${dp[i][j]}</strong></code>。`
          });
        } else {
          const notTake = dp[i - 1][j] ?? 0;
          const take = (dp[i - 1][j - nums[i]] ?? 0) + nums[i];
          const maxVal = Math.max(notTake, take);
          dp[i][j] = maxVal;

          steps.push({
            type: 'transfer',
            line: lineTransferMax,
            i,
            j,
            topI: i - 1,
            topJ: j,
            leftI: i - 1,
            leftJ: j - nums[i],
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `max(不选=${notTake}, 选=${take}) = ${maxVal}`,
            log: `| 🔄 容量 j=${j} >= nums[${i}](${nums[i]}): dp[${i}][${j}] = max(不选=${notTake}, 选=${take}) = ${maxVal}`,
            msg: `容量充足：<code>max(不选=${notTake}, 选=${take}) = <strong>${maxVal}</strong></code>。`
          });
        }
      }
    }

    const isMatch = dp[n - 1][target] === target;

    // 4. 最终返回步骤
    steps.push({
      type: 'return',
      line: lineReturn,
      i: n - 1,
      j: target,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `最终判定: ${isMatch}`,
      log: `| 🏆 二维填表完成！dp[${n - 1}][${target}] = ${dp[n - 1][target]}, 是否恰好装满 target(${target}): ${isMatch}`,
      msg: `🏆 二维填表全部完成！最大容量为 <code>dp[${n - 1}][${target}] = ${dp[n - 1][target]}</code>，${isMatch ? '<strong>恰好等于目标和 ' + target + '</strong>，可以等分（return true）' : '<strong>无法凑齐目标和 ' + target + '</strong>（return false）'}。`
    });

    for (const step of steps) {
      step.treeRoot = UniversalStageEngine.build2DDPDependencyTree(n, target + 1, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = UniversalStageEngine.findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  /**
   * 生成阶段 3 (经典二维 DP 填表) 演化步骤
   */
  public static generateStage3Steps(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse' = 'forward',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    // 1D 模型特化派发
    if (model.id === 'fibonacci' || model.id === 'climb-stairs') {
      return UniversalStageEngine.generate1DStage3Steps(model, Math.max(mVal, nVal), anchorMap);
    }
    // 字符串子序列 DP 特化派发
    if (model.id === 'distinct-subsequences') {
      return UniversalStageEngine.generateDistinctSubsequencesStage3Steps(model, anchorMap);
    }
    // 两个字符串的删除操作特化派发
    if (model.id === 'delete-operation-for-two-strings') {
      return UniversalStageEngine.generateDeleteDistanceStage3Steps(model, anchorMap);
    }
    // 编辑距离特化派发
    if (model.id === 'edit-distance') {
      return UniversalStageEngine.generateEditDistanceStage3Steps(model, anchorMap);
    }
    // 回文子串特化派发
    if (model.id === 'palindromic-substrings') {
      return UniversalStageEngine.generatePalindromicSubstringsStage3Steps(model, anchorMap);
    }
    // 最长回文子序列特化派发
    if (model.id === 'longest-palindromic-subsequence') {
      return UniversalStageEngine.generateLongestPalindromicSubsequenceStage3Steps(model, anchorMap);
    }
    // 分割等和子集特化派发
    if (model.id === 'partition-equal-subset-sum') {
      return UniversalStageEngine.generatePartitionSubsetStage3Steps(model, anchorMap);
    }

    const steps: UniversalStep[] = [];
    const dp = Array.from({ length: mVal }, () => new Array(nVal).fill(null));
    const isForward = direction === 'forward';
    const isMinPath = model.id === 'min-path-sum';

    const obstacleGrid = UniversalStageEngine.getDynamicObstacleGrid(model, mVal, nVal);
    const weightsGrid = UniversalStageEngine.getDynamicWeightsGrid(model, mVal, nVal);

    const lineInit = anchorMap?.init || 3;
    const lineInitRow = anchorMap?.init_row || 4;
    const lineInitCol = anchorMap?.init_col || 5;
    const lineInitVal = anchorMap?.init_val || 8;
    const lineTransfer = anchorMap?.transfer || 9;
    const lineReturn = anchorMap?.return || 11;
    const lineCond = anchorMap?.cond || anchorMap?.obstacle || 7;

    const lineCalcTop = anchorMap?.calc_top;
    const lineCalcLeft = anchorMap?.calc_left;
    const lineCalcDown = anchorMap?.calc_down;
    const lineCalcRight = anchorMap?.calc_right;

    // 1. 初始化数组
    steps.push({
      type: 'init',
      line: lineInit,
      i: isForward ? 0 : mVal - 1,
      j: isForward ? 0 : nVal - 1,
      obstacleGrid,
      weightsGrid,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '初始化二维矩阵',
      log: `| 📦 创建二维 DP 状态矩阵 dp[${mVal}][${nVal}]`,
      msg: `创建 ${mVal}×${nVal} 的二维 DP 表格，准备按${isForward ? '顺推' : '逆推'}顺序自底向上计算。`
    });

    if (isMinPath && weightsGrid) {
      if (isForward) {
        dp[0][0] = weightsGrid[0][0];
        steps.push({
          type: 'init-val',
          line: lineInitVal,
          i: 0,
          j: 0,
          weightsGrid,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: '起点初始化',
          log: `| 🎬 起点 dp[0][0] = grid[0][0] = ${weightsGrid[0][0]}`,
          msg: `🎬 起点 (0, 0) 初始化为自身权值：<code>dp[0][0] = ${weightsGrid[0][0]}</code>。`
        });

        // 最左列初始化
        for (let r = 1; r < mVal; r++) {
          dp[r][0] = dp[r - 1][0] + weightsGrid[r][0];
          steps.push({
            type: 'init-col',
            line: lineInitVal,
            i: r,
            j: 0,
            weightsGrid,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: '首列前缀累加',
            log: `| 🎬 首列 dp[${r}][0] = dp[${r - 1}][0] + grid[${r}][0] = ${dp[r][0]}`,
            msg: `首列只能从上方直达：<code>dp[${r}][0] = dp[${r - 1}][0] + grid[${r}][0] = <strong>${dp[r][0]}</strong></code>。`
          });
        }

        // 最上行初始化
        for (let c = 1; c < nVal; c++) {
          dp[0][c] = dp[0][c - 1] + weightsGrid[0][c];
          steps.push({
            type: 'init-row',
            line: lineInitVal,
            i: 0,
            j: c,
            weightsGrid,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: '首行前缀累加',
            log: `| 🎬 首行 dp[0][${c}] = dp[0][${c - 1}] + grid[0][${c}] = ${dp[0][c]}`,
            msg: `首行只能从左方直达：<code>dp[0][${c}] = dp[0][${c - 1}] + grid[0][${c}] = <strong>${dp[0][c]}</strong></code>。`
          });
        }

        // 内部双重循环
        for (let r = 1; r < mVal; r++) {
          for (let c = 1; c < nVal; c++) {
            const topVal = dp[r - 1][c];
            const leftVal = dp[r][c - 1];
            const sum = Math.min(topVal, leftVal) + weightsGrid[r][c];
            dp[r][c] = sum;

            steps.push({
              type: 'transfer',
              line: lineTransfer,
              i: r,
              j: c,
              topI: r - 1,
              topJ: c,
              leftI: r,
              leftJ: c - 1,
              weightsGrid,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: '状态转移求最小和',
              log: `| 🔄 dp[${r}][${c}] = min(上=${topVal}, 左=${leftVal}) + grid[${r}][${c}](${weightsGrid[r][c]}) = ${sum}`,
              msg: `状态转移：<code>dp[${r}][${c}] = min(上 ${topVal}, 左 ${leftVal}) + grid (${weightsGrid[r][c]}) = <strong>${sum}</strong></code>。`
            });
          }
        }

        steps.push({
          type: 'return',
          line: lineReturn,
          i: mVal - 1,
          j: nVal - 1,
          weightsGrid,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: '返回最终结果',
          log: `| 🏆 顺推填表完成！右下角最小路径和 = ${dp[mVal - 1][nVal - 1]}`,
          msg: `🏆 顺推填表全部完成！右下角终点最小路径和: <strong>${dp[mVal - 1][nVal - 1]}</strong>。`
        });
      } else {
        // 逆推最小路径和
        dp[mVal - 1][nVal - 1] = weightsGrid[mVal - 1][nVal - 1];
        steps.push({
          type: 'init-val',
          line: lineInitVal,
          i: mVal - 1,
          j: nVal - 1,
          weightsGrid,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: '逆推终点初始化',
          log: `| 🎬 逆推终点 dp[${mVal - 1}][${nVal - 1}] = ${weightsGrid[mVal - 1][nVal - 1]}`,
          msg: `🎬 逆推终点初始化为自身权值：<code>dp[${mVal - 1}][${nVal - 1}] = ${weightsGrid[mVal - 1][nVal - 1]}</code>。`
        });

        for (let r = mVal - 2; r >= 0; r--) {
          dp[r][nVal - 1] = dp[r + 1][nVal - 1] + weightsGrid[r][nVal - 1];
          steps.push({
            type: 'init-col',
            line: lineInitVal,
            i: r,
            j: nVal - 1,
            weightsGrid,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: '逆推最右列累加',
            log: `| 🎬 最右列 dp[${r}][${nVal - 1}] = dp[${r + 1}][${nVal - 1}] + grid[${r}][${nVal - 1}] = ${dp[r][nVal - 1]}`,
            msg: `最右列只能从下方直达：<code>dp[${r}][${nVal - 1}] = ${dp[r][nVal - 1]}</code>。`
          });
        }

        for (let c = nVal - 2; c >= 0; c--) {
          dp[mVal - 1][c] = dp[mVal - 1][c + 1] + weightsGrid[mVal - 1][c];
          steps.push({
            type: 'init-row',
            line: lineInitVal,
            i: mVal - 1,
            j: c,
            weightsGrid,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: '逆推最底行累加',
            log: `| 🎬 最底行 dp[${mVal - 1}][${c}] = dp[${mVal - 1}][${c + 1}] + grid[${mVal - 1}][${c}] = ${dp[mVal - 1][c]}`,
            msg: `最底行只能从右方直达：<code>dp[${mVal - 1}][${c}] = ${dp[mVal - 1][c]}</code>。`
          });
        }

        for (let r = mVal - 2; r >= 0; r--) {
          for (let c = nVal - 2; c >= 0; c--) {
            const downVal = dp[r + 1][c];
            const rightVal = dp[r][c + 1];
            const sum = Math.min(downVal, rightVal) + weightsGrid[r][c];
            dp[r][c] = sum;

            steps.push({
              type: 'transfer',
              line: lineTransfer,
              i: r,
              j: c,
              topI: r + 1,
              topJ: c,
              leftI: r,
              leftJ: c + 1,
              weightsGrid,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: '逆推状态转移',
              log: `| 🔄 dp[${r}][${c}] = min(下=${downVal}, 右=${rightVal}) + grid[${r}][${c}] = ${sum}`,
              msg: `逆推转移：<code>dp[${r}][${c}] = min(下 ${downVal}, 右 ${rightVal}) + grid (${weightsGrid[r][c]}) = <strong>${sum}</strong></code>。`
            });
          }
        }

        steps.push({
          type: 'return',
          line: lineReturn,
          i: 0,
          j: 0,
          weightsGrid,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: '返回最终结果',
          log: `| 🏆 逆推填表完成！起点最小路径和 = ${dp[0][0]}`,
          msg: `🏆 逆推填表全部完成！左上角起点最小路径和: <strong>${dp[0][0]}</strong>。`
        });
      }
    } else if (obstacleGrid) {
      if (isForward) {
        for (let r = 0; r < mVal; r++) {
          for (let c = 0; c < nVal; c++) {
            if (obstacleGrid[r][c] === 1) {
              dp[r][c] = 0;
              const fromR = c > 0 ? r : (r > 0 ? r - 1 : 0);
              const fromC = c > 0 ? c - 1 : 0;
              steps.push({
                type: 'obstacle-cell',
                line: lineCond,
                i: r,
                j: c,
                fromI: fromR,
                fromJ: fromC,
                isBlockedStep: true,
                obstacleGrid,
                grid: JSON.parse(JSON.stringify(dp)),
                tag: '🚧 遇障碍置 0',
                log: `| 🚧 坐标 (${r}, ${c}) 为障碍物，从 (${fromR}, ${fromC}) 尝试进入受阻弹回，路径数 dp[${r}][${c}] = 0`,
                msg: `🚧 坐标 (${r}, ${c}) 为障碍物，探险家从 (${fromR}, ${fromC}) 尝试进入受阻并弹回安全格，路径阻断，直接置 <code>dp[${r}][${c}] = 0</code>。`
              });
            } else if (r === 0 && c === 0) {
              dp[0][0] = 1;
              steps.push({
                type: 'init-val',
                line: lineInitVal,
                i: 0,
                j: 0,
                obstacleGrid,
                grid: JSON.parse(JSON.stringify(dp)),
                tag: '起点初始化',
                log: `| 🎬 起点 dp[0][0] = 1`,
                msg: `🎬 起点 (0, 0) 无障碍，初始化路径数为 1。`
              });
            } else {
              const topVal = (r > 0) ? dp[r - 1][c] : 0;
              const leftVal = (c > 0) ? dp[r][c - 1] : 0;
              const sum = topVal + leftVal;

              if (lineCalcTop !== undefined) {
                steps.push({
                  type: 'calc-top',
                  line: lineCalcTop,
                  i: r,
                  j: c,
                  topI: r > 0 ? r - 1 : -1,
                  topJ: r > 0 ? c : -1,
                  leftI: -1,
                  leftJ: -1,
                  gridHighlight: { i: r, j: c },
                  highlightText: r > 0 ? 'dp[i - 1][j]' : '0',
                  obstacleGrid,
                  grid: JSON.parse(JSON.stringify(dp)),
                  tag: '查找上方路径',
                  log: `| ⬆️ 检查上方格 (${r - 1}, ${c}): ${r > 0 ? `读取 dp[${r - 1}][${c}] = ${topVal}` : '上方越界置 0'}，得到 fromTop = ${topVal}`,
                  msg: `⬆️ <strong>【查找上方路径】</strong>：${r > 0 ? `读取上方 <code>dp[${r - 1}][${c}] = ${topVal}</code>` : '上方越界，置 0'}，故 <code>fromTop = ${topVal}</code>。`
                });
              }

              if (lineCalcLeft !== undefined) {
                steps.push({
                  type: 'calc-left',
                  line: lineCalcLeft,
                  i: r,
                  j: c,
                  topI: -1,
                  topJ: -1,
                  leftI: c > 0 ? r : -1,
                  leftJ: c > 0 ? c - 1 : -1,
                  gridHighlight: { i: r, j: c },
                  highlightText: c > 0 ? 'dp[i][j - 1]' : '0',
                  obstacleGrid,
                  grid: JSON.parse(JSON.stringify(dp)),
                  tag: '查找左方路径',
                  log: `| ⬅️ 检查左方格 (${r}, ${c - 1}): ${c > 0 ? `读取 dp[${r}][${c - 1}] = ${leftVal}` : '左方越界置 0'}，得到 fromLeft = ${leftVal}`,
                  msg: `⬅️ <strong>【查找左方路径】</strong>：${c > 0 ? `读取左方 <code>dp[${r}][${c - 1}] = ${leftVal}</code>` : '左方越界，置 0'}，故 <code>fromLeft = ${leftVal}</code>。`
                });
              }

              dp[r][c] = sum;

              steps.push({
                type: 'transfer',
                line: lineTransfer,
                i: r,
                j: c,
                topI: r > 0 ? r - 1 : -1,
                topJ: r > 0 ? c : -1,
                leftI: c > 0 ? r : -1,
                leftJ: c > 0 ? c - 1 : -1,
                gridHighlight: { i: r, j: c },
                highlightText: 'fromTop + fromLeft',
                obstacleGrid,
                grid: JSON.parse(JSON.stringify(dp)),
                tag: '状态转移求和',
                log: `| 🔄 汇总状态转移: dp[${r}][${c}] = fromTop(${topVal}) + fromLeft(${leftVal}) = ${sum}`,
                msg: `🔄 <strong>【状态转移汇总】</strong>：<code>dp[${r}][${c}] = fromTop(${topVal}) + fromLeft(${leftVal}) = <strong>${sum}</strong></code>，写入 DP 表格。`
              });
            }
          }
        }

        steps.push({
          type: 'return',
          line: lineReturn,
          i: mVal - 1,
          j: nVal - 1,
          obstacleGrid,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: '返回最终结果',
          log: `| 🏆 顺推填表完成！最终结果 dp[${mVal - 1}][${nVal - 1}] = ${dp[mVal - 1][nVal - 1]}`,
          msg: `🏆 顺推填表全部完成！右下角终点路径数: <strong>${dp[mVal - 1][nVal - 1]}</strong>。`
        });
      } else {
        // 逆推带障碍物
        for (let r = mVal - 1; r >= 0; r--) {
          for (let c = nVal - 1; c >= 0; c--) {
            if (obstacleGrid[r][c] === 1) {
              dp[r][c] = 0;
              const fromR = c < nVal - 1 ? r : (r < mVal - 1 ? r + 1 : mVal - 1);
              const fromC = c < nVal - 1 ? c + 1 : nVal - 1;
              steps.push({
                type: 'obstacle-cell',
                line: lineCond,
                i: r,
                j: c,
                fromI: fromR,
                fromJ: fromC,
                isBlockedStep: true,
                obstacleGrid,
                grid: JSON.parse(JSON.stringify(dp)),
                tag: '🚧 遇障碍置 0',
                log: `| 🚧 坐标 (${r}, ${c}) 为障碍物，从 (${fromR}, ${fromC}) 尝试进入受阻弹回，逆推路径数 dp[${r}][${c}] = 0`,
                msg: `🚧 坐标 (${r}, ${c}) 为障碍物，探险家从 (${fromR}, ${fromC}) 尝试进入受阻并弹回安全格，逆推路径阻断置 0。`
              });
            } else if (r === mVal - 1 && c === nVal - 1) {
              dp[mVal - 1][nVal - 1] = 1;
              steps.push({
                type: 'init-val',
                line: lineInitVal,
                i: mVal - 1,
                j: nVal - 1,
                obstacleGrid,
                grid: JSON.parse(JSON.stringify(dp)),
                tag: '逆推终点初始化',
                log: `| 🎬 终点 dp[${mVal - 1}][${nVal - 1}] = 1`,
                msg: `🎬 终点 (${mVal - 1}, ${nVal - 1}) 无障碍，初始化路径数为 1。`
              });
            } else {
              const downVal = (r + 1 < mVal) ? dp[r + 1][c] : 0;
              const rightVal = (c + 1 < nVal) ? dp[r][c + 1] : 0;
              const sum = downVal + rightVal;

              if (lineCalcDown !== undefined) {
                steps.push({
                  type: 'calc-down',
                  line: lineCalcDown,
                  i: r,
                  j: c,
                  topI: r + 1 < mVal ? r + 1 : -1,
                  topJ: r + 1 < mVal ? c : -1,
                  leftI: -1,
                  leftJ: -1,
                  gridHighlight: { i: r, j: c },
                  highlightText: r + 1 < mVal ? 'dp[i + 1][j]' : '0',
                  obstacleGrid,
                  grid: JSON.parse(JSON.stringify(dp)),
                  tag: '逆推查找下方路径',
                  log: `| ⬇️ 检查下方格 (${r + 1}, ${c}): ${r + 1 < mVal ? `读取下方 dp[${r + 1}][${c}] = ${downVal}` : '下方越界置 0'}，得到 fromDown = ${downVal}`,
                  msg: `⬇️ <strong>【逆推查找下方路径】</strong>：${r + 1 < mVal ? `读取下方 <code>dp[${r + 1}][${c}] = ${downVal}</code>` : '下方越界，置 0'}，故 <code>fromDown = ${downVal}</code>。`
                });
              }

              if (lineCalcRight !== undefined) {
                steps.push({
                  type: 'calc-right',
                  line: lineCalcRight,
                  i: r,
                  j: c,
                  topI: -1,
                  topJ: -1,
                  leftI: c + 1 < nVal ? r : -1,
                  leftJ: c + 1 < nVal ? c + 1 : -1,
                  gridHighlight: { i: r, j: c },
                  highlightText: c + 1 < nVal ? 'dp[i][j + 1]' : '0',
                  obstacleGrid,
                  grid: JSON.parse(JSON.stringify(dp)),
                  tag: '逆推查找右方路径',
                  log: `| ➡️ 检查右方格 (${r}, ${c + 1}): ${c + 1 < nVal ? `读取右方 dp[${r}][${c + 1}] = ${rightVal}` : '右方越界置 0'}，得到 fromRight = ${rightVal}`,
                  msg: `➡️ <strong>【逆推查找右方路径】</strong>：${c + 1 < nVal ? `读取右方 <code>dp[${r}][${c + 1}] = ${rightVal}</code>` : '右方越界，置 0'}，故 <code>fromRight = ${rightVal}</code>。`
                });
              }

              dp[r][c] = sum;

              steps.push({
                type: 'transfer',
                line: lineTransfer,
                i: r,
                j: c,
                topI: r + 1 < mVal ? r + 1 : -1,
                topJ: r + 1 < mVal ? c : -1,
                leftI: c + 1 < nVal ? r : -1,
                leftJ: c + 1 < nVal ? c + 1 : -1,
                gridHighlight: { i: r, j: c },
                highlightText: 'fromDown + fromRight',
                obstacleGrid,
                grid: JSON.parse(JSON.stringify(dp)),
                tag: '逆推状态转移求和',
                log: `| 🔄 dp[${r}][${c}] = fromDown(${downVal}) + fromRight(${rightVal}) = ${sum}`,
                msg: `🔄 <strong>【逆推状态转移】</strong>：<code>dp[${r}][${c}] = fromDown(${downVal}) + fromRight(${rightVal}) = <strong>${sum}</strong></code>，写入 DP 表格。`
              });
            }
          }
        }

        steps.push({
          type: 'return',
          line: lineReturn,
          i: 0,
          j: 0,
          obstacleGrid,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: '返回最终结果',
          log: `| 🏆 逆推填表完成！起点结果 dp[0][0] = ${dp[0][0]}`,
          msg: `🏆 逆推填表全部完成！左上角起点路径数: <strong>${dp[0][0]}</strong>。`
        });
      }
    } else {
      if (isForward) {
        for (let r = 0; r < mVal; r++) {
          dp[r][0] = 1;
          steps.push({
            type: 'init-col',
            line: lineInitRow,
            i: r,
            j: 0,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: '边界初始化',
            log: `| 🎬 初始化边界 dp[${r}][0] = 1 (最左列只能向下走)`,
            msg: `最左列坐标 (${r}, 0) 只能一直向下走，路径数为 1。`
          });
        }
        for (let c = 1; c < nVal; c++) {
          dp[0][c] = 1;
          steps.push({
            type: 'init-row',
            line: lineInitCol,
            i: 0,
            j: c,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: '边界初始化',
            log: `| 🎬 初始化边界 dp[0][${c}] = 1 (最上行只能向右走)`,
            msg: `最上行坐标 (0, ${c}) 只能一直向右走，路径数为 1。`
          });
        }

        for (let r = 1; r < mVal; r++) {
          for (let c = 1; c < nVal; c++) {
            const topVal = dp[r - 1][c];
            const leftVal = dp[r][c - 1];
            const sum = topVal + leftVal;
            dp[r][c] = sum;

            steps.push({
              type: 'transfer',
              line: lineTransfer,
              i: r,
              j: c,
              topI: r - 1,
              topJ: c,
              leftI: r,
              leftJ: c - 1,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: '状态转移',
              log: `| 🔄 dp[${r}][${c}] = 上方(${topVal}) + 左方(${leftVal}) = ${sum}`,
              msg: `状态转移: dp[${r}][${c}] = dp[${r - 1}][${c}] (上方 ${topVal}) + dp[${r}][${c - 1}] (左方 ${leftVal}) = <strong>${sum}</strong>。`
            });
          }
        }

        steps.push({
          type: 'return',
          line: lineReturn,
          i: mVal - 1,
          j: nVal - 1,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: '返回最终结果',
          log: `| 🏆 顺推填表完成！最终结果 dp[${mVal - 1}][${nVal - 1}] = ${dp[mVal - 1][nVal - 1]}`,
          msg: `🏆 顺推填表全部完成！右下角终点路径数: <strong>${dp[mVal - 1][nVal - 1]}</strong>。`
        });
      } else {
        for (let r = 0; r < mVal; r++) {
          dp[r][nVal - 1] = 1;
          steps.push({
            type: 'init-col',
            line: lineInitRow,
            i: r,
            j: nVal - 1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: '逆推边界初始化',
            log: `| 🎬 逆推初始化边界 dp[${r}][${nVal - 1}] = 1 (最右列)`,
            msg: `最右列坐标 (${r}, ${nVal - 1}) 逆推到达终点只有 1 条直达路径。`
          });
        }
        for (let c = 0; c < nVal - 1; c++) {
          dp[mVal - 1][c] = 1;
          steps.push({
            type: 'init-row',
            line: lineInitCol,
            i: mVal - 1,
            j: c,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: '逆推边界初始化',
            log: `| 🎬 逆推初始化边界 dp[${mVal - 1}][${c}] = 1 (最底行)`,
            msg: `最底行坐标 (${mVal - 1}, ${c}) 逆推到达终点只有 1 条直达路径。`
          });
        }

        for (let r = mVal - 2; r >= 0; r--) {
          for (let c = nVal - 2; c >= 0; c--) {
            const downVal = dp[r + 1][c];
            const rightVal = dp[r][c + 1];
            const sum = downVal + rightVal;
            dp[r][c] = sum;

            steps.push({
              type: 'transfer',
              line: lineTransfer,
              i: r,
              j: c,
              topI: r + 1,
              topJ: c,
              leftI: r,
              leftJ: c + 1,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: '逆推状态转移',
              log: `| 🔄 dp[${r}][${c}] = 下方(${downVal}) + 右方(${rightVal}) = ${sum}`,
              msg: `逆推转移: dp[${r}][${c}] = 下方 dp[${r + 1}][${c}] (${downVal}) + 右方 dp[${r}][${c + 1}] (${rightVal}) = <strong>${sum}</strong>。`
            });
          }
        }

        steps.push({
          type: 'return',
          line: lineReturn,
          i: 0,
          j: 0,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: '返回最终结果',
          log: `| 🏆 逆推填表完成！起点结果 dp[0][0] = ${dp[0][0]}`,
          msg: `🏆 逆推填表全部完成！左上角起点路径数: <strong>${dp[0][0]}</strong>。`
        });
      }
    }

    for (const step of steps) {
      step.treeRoot = UniversalStageEngine.build2DDPDependencyTree(mVal, nVal, direction, obstacleGrid, step.grid, step.i, step.j);
      step.activeNodeId = UniversalStageEngine.findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  /**
   * 生成不同的子序列 (Distinct Subsequences) 阶段 4 一维倒序空间压缩步骤
   */
  public static generateDistinctSubsequencesStage4Steps(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'rabbbit') as string;
    const t = ((model.defaultParams as any)?.t || 'rabbit') as string;
    const m = s.length;
    const n = t.length;

    const steps: UniversalStep[] = [];
    const memo = new Array(n + 1).fill(0);
    const gridState = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineInitVal = anchorMap?.init_val || 6;
    const lineLoopI = anchorMap?.loop_i || 9;
    const lineLoopJReverse = anchorMap?.loop_j_reverse || 11;
    const lineCond = anchorMap?.cond || 13;
    const lineAccumulateReverse = anchorMap?.accumulate_reverse || 15;
    const lineReturn = anchorMap?.return || 19;

    memo[0] = 1;
    gridState[0][0] = 1;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      activeSlot: 0,
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '初始化一维滚动数组',
      log: `| 📦 创建长度为 ${n + 1} 的一维滚动数组 memo[0..${n}], 初始化 memo[0] = 1`,
      msg: `创建长度为 <code>${n + 1}</code> 的一维滚动状态数组 <code>memo[0..${n}]</code>，初始化空串 Base Case <code>memo[0] = 1</code>。`
    });

    for (let i = 1; i <= m; i++) {
      gridState[i][0] = 1;

      for (let j = n; j >= 1; j--) {
        const isMatch = s[i - 1] === t[j - 1];

        if (isMatch) {
          const downVal = memo[j];
          const rightVal = memo[j - 1];
          memo[j] += rightVal;
          gridState[i][j] = memo[j];

          steps.push({
            type: 'accumulate',
            line: lineAccumulateReverse,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            down: downVal,
            right: rightVal,
            memoj: memo[j],
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `倒序累加: memo[${j}] += memo[${j - 1}]`,
            log: `| ✨ s[${i - 1}] == t[${j - 1}] ('${s[i - 1]}'): memo[${j}] (${downVal}) += memo[${j - 1}] (${rightVal}) = ${memo[j]} [倒序确保取到旧值]`,
            msg: `字符匹配 <code>s[${i - 1}] == t[${j - 1}] == '${s[i - 1]}'</code>：倒序原地累加 <code>memo[${j}] (${downVal}) += memo[${j - 1}] (${rightVal}) = <strong>${memo[j]}</strong></code>。`
          });
        }
      }
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: m,
      j: n,
      activeSlot: n,
      slotMode: 'final',
      down: memo[n],
      right: memo[n - 1],
      memoj: memo[n],
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '最终答案',
      log: `| 🏆 一维倒序优化完成！最终答案 memo[${n}] = ${memo[n]}`,
      msg: `🏆 一维倒序压缩计算完成！在 <code>"${s}"</code> 中匹配 <code>"${t}"</code> 的方案数: <strong>${memo[n]}</strong>。`
    });

    return steps;
  }

  /**
   * 生成两个字符串的删除操作 (Delete Operation for Two Strings) 阶段 4 一维空间压缩步骤
   */
  public static generateDeleteDistanceStage4Steps(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.word1 || (model.defaultParams as any)?.s || 'sea') as string;
    const t = ((model.defaultParams as any)?.word2 || (model.defaultParams as any)?.t || 'eat') as string;
    const m = s.length;
    const n = t.length;

    const steps: UniversalStep[] = [];
    const memo = new Array(n + 1).fill(0);
    const gridState = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineInitVal = anchorMap?.init_val || 5;
    const lineLoopI = anchorMap?.loop_i || 6;
    const lineLoopJ = anchorMap?.loop_j || 9;
    const lineCond = anchorMap?.cond || 11;
    const lineAssignMatch = anchorMap?.assign_match || 12;
    const lineCalcMin = anchorMap?.calc_min || 14;
    const lineReturn = anchorMap?.return || 19;

    for (let j = 0; j <= n; j++) {
      memo[j] = j;
      gridState[0][j] = j;
    }

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      activeSlot: 0,
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '初始化一维滚动数组',
      log: `| 📦 创建长度为 ${n + 1} 的一维滚动数组 memo[0..${n}], 初始化首行 memo[j] = j`,
      msg: `创建长度为 <code>${n + 1}</code> 的一维滚动状态数组 <code>memo[0..${n}]</code>，初始化首行 <code>memo[j] = j</code>。`
    });

    for (let i = 1; i <= m; i++) {
      let pre = memo[0];
      memo[0] = i;
      gridState[i][0] = i;

      steps.push({
        type: 'init-col',
        line: lineLoopI,
        i,
        j: 0,
        activeSlot: 0,
        slotMode: 'updated',
        memoj: i,
        memo: [...memo],
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: `第${i}行首列置为 ${i}`,
        log: `| 🎬 第 ${i} 行开始: 暂存 pre = ${pre}, 更新 memo[0] = ${i}`,
        msg: `第 <code>${i}</code> 行开始：暂存左上角 <code>pre = ${pre}</code>，更新首列 <code>memo[0] = ${i}</code>。`
      });

      for (let j = 1; j <= n; j++) {
        const temp = memo[j];
        const isMatch = s[i - 1] === t[j - 1];

        if (isMatch) {
          memo[j] = pre;
          gridState[i][j] = pre;

          steps.push({
            type: 'accumulate',
            line: lineAssignMatch,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            down: temp,
            right: pre,
            memoj: pre,
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `字符相同: memo[${j}] = pre(${pre})`,
            log: `| ✨ word1[${i - 1}] == word2[${j - 1}] ('${s[i - 1]}'): 直接继承左上角 pre = ${pre}`,
            msg: `字符相同 <code>word1[${i - 1}] == word2[${j - 1}] == '${s[i - 1]}'</code>：直接继承左上角 <code>memo[${j}] = pre = <strong>${pre}</strong></code>。`
          });
        } else {
          const downVal = memo[j];
          const leftVal = memo[j - 1];
          const minVal = Math.min(downVal, leftVal) + 1;
          memo[j] = minVal;
          gridState[i][j] = minVal;

          steps.push({
            type: 'accumulate',
            line: lineCalcMin,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            down: downVal,
            right: leftVal,
            memoj: minVal,
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `字符不同: min(上, 左) + 1 = ${minVal}`,
            log: `| ✨ word1[${i - 1}]('${s[i - 1]}') != word2[${j - 1}]('${t[j - 1]}'): memo[${j}] = min(上=${downVal}, 左=${leftVal}) + 1 = ${minVal}`,
            msg: `字符不同 <code>word1[${i - 1}] ('${s[i - 1]}') != word2[${j - 1}] ('${t[j - 1]}')</code>：<code>memo[${j}] = min(上 ${downVal}, 左 ${leftVal}) + 1 = <strong>${minVal}</strong></code>。`
          });
        }
        pre = temp;
      }
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: m,
      j: n,
      activeSlot: n,
      slotMode: 'final',
      down: memo[n],
      right: memo[n - 1],
      memoj: memo[n],
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '最终答案',
      log: `| 🏆 一维滚动空间优化完成！最终答案 memo[${n}] = ${memo[n]}`,
      msg: `🏆 一维滚动压缩计算完成！使得 <code>"${s}"</code> 与 <code>"${t}"</code> 相同所需的最少删除步数: <strong>${memo[n]}</strong>。`
    });

    return steps;
  }

  /**
   * 生成编辑距离 (Edit Distance) 阶段 4 一维空间压缩步骤
   */
  public static generateEditDistanceStage4Steps(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.word1 || (model.defaultParams as any)?.s || 'horse') as string;
    const t = ((model.defaultParams as any)?.word2 || (model.defaultParams as any)?.t || 'ros') as string;
    const m = s.length;
    const n = t.length;

    const steps: UniversalStep[] = [];
    const memo = new Array(n + 1).fill(0);
    const gridState = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineInitVal = anchorMap?.init_val || 5;
    const lineLoopI = anchorMap?.loop_i || 6;
    const linePreInit = anchorMap?.pre_init || 7;
    const lineLoopJ = anchorMap?.loop_j || 9;
    const lineCond = anchorMap?.cond || 11;
    const lineAssignMatch = anchorMap?.assign_match || 12;
    const lineCalcMin = anchorMap?.calc_min || 14;
    const lineReturn = anchorMap?.return || 19;

    for (let j = 0; j <= n; j++) {
      memo[j] = j;
      gridState[0][j] = j;
    }

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      activeSlot: 0,
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '初始化一维滚动数组',
      log: `| 📦 创建长度为 ${n + 1} 的一维滚动数组 memo[0..${n}], 初始化首行 memo[j] = j`,
      msg: `创建长度为 <code>${n + 1}</code> 的一维滚动状态数组 <code>memo[0..${n}]</code>，初始化首行 <code>memo[j] = j</code>。`
    });

    for (let i = 1; i <= m; i++) {
      let pre = memo[0];
      memo[0] = i;
      gridState[i][0] = i;

      steps.push({
        type: 'init-col',
        line: linePreInit || lineLoopI,
        i,
        j: 0,
        activeSlot: 0,
        slotMode: 'updated',
        memoj: i,
        memo: [...memo],
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: `第${i}行首列置为 ${i}`,
        log: `| 🎬 第 ${i} 行开始: 暂存 pre = ${pre}, 更新 memo[0] = ${i}`,
        msg: `第 <code>${i}</code> 行开始：暂存对角线 <code>pre = ${pre}</code>，更新首列 <code>memo[0] = ${i}</code>。`
      });

      for (let j = 1; j <= n; j++) {
        const temp = memo[j];
        const isMatch = s[i - 1] === t[j - 1];

        if (isMatch) {
          memo[j] = pre;
          gridState[i][j] = pre;

          steps.push({
            type: 'accumulate',
            line: lineAssignMatch,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            down: temp,
            right: pre,
            memoj: pre,
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `字符相同: memo[${j}] = pre(${pre})`,
            log: `| ✨ word1[${i - 1}] == word2[${j - 1}] ('${s[i - 1]}'): 直接继承对角线 pre = ${pre}`,
            msg: `字符相同 <code>word1[${i - 1}] == word2[${j - 1}] == '${s[i - 1]}'</code>：直接继承对角线 <code>memo[${j}] = pre = <strong>${pre}</strong></code>。`
          });
        } else {
          const downVal = memo[j];
          const leftVal = memo[j - 1];
          const repVal = pre;
          const minVal = Math.min(repVal, Math.min(downVal, leftVal)) + 1;
          memo[j] = minVal;
          gridState[i][j] = minVal;

          steps.push({
            type: 'accumulate',
            line: lineCalcMin,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            down: downVal,
            right: leftVal,
            memoj: minVal,
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `字符不同: min(替换, 删除, 插入) + 1 = ${minVal}`,
            log: `| ✨ word1[${i - 1}]('${s[i - 1]}') != word2[${j - 1}]('${t[j - 1]}'): memo[${j}] = min(替=${repVal}, 删=${downVal}, 插=${leftVal}) + 1 = ${minVal}`,
            msg: `字符不同 <code>word1[${i - 1}] ('${s[i - 1]}') != word2[${j - 1}] ('${t[j - 1]}')</code>：<code>memo[${j}] = min(替换 ${repVal}, 删除 ${downVal}, 插入 ${leftVal}) + 1 = <strong>${minVal}</strong></code>。`
          });
        }
        pre = temp;
      }
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: m,
      j: n,
      activeSlot: n,
      slotMode: 'final',
      down: memo[n],
      right: memo[n - 1],
      memoj: memo[n],
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '最终答案',
      log: `| 🏆 编辑距离一维滚动空间优化完成！最终答案 memo[${n}] = ${memo[n]}`,
      msg: `🏆 一维滚动压缩计算完成！将 <code>"${s}"</code> 转换成 <code>"${t}"</code> 所需最少操作数: <strong>${memo[n]}</strong>。`
    });

    return steps;
  }

  /**
   * 生成回文子串 (Palindromic Substrings) 阶段 4 中心扩散法步骤
   */
  public static generatePalindromicSubstringsStage4Steps(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'aaa') as string;
    const n = s.length;

    const steps: UniversalStep[] = [];
    const memo = new Array(n).fill(0);
    const gridState = Array.from({ length: n }, () => new Array(n).fill(null));
    let count = 0;

    const lineLoopCenter = anchorMap?.loop_center || 5;
    const lineSpread = anchorMap?.spread || 10;
    const lineMatchInc = anchorMap?.match_inc || 12;
    const lineReturn = anchorMap?.return || 18;

    steps.push({
      type: 'init',
      line: lineLoopCenter,
      i: 0,
      j: 0,
      activeSlot: 0,
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '初始化中心扩散',
      log: `| 📦 准备遍历 2n-1 = ${2 * n - 1} 个回文中心`,
      msg: `准备遍历 <code>${2 * n - 1}</code> 个潜在回文中心（包含 <code>${n}</code> 个单字符中心与 <code>${n - 1}</code> 个双字符间隙）。`
    });

    for (let center = 0; center < 2 * n - 1; center++) {
      let l = Math.floor(center / 2);
      let r = l + (center % 2);
      const isOdd = center % 2 === 0;

      steps.push({
        type: 'init-center',
        line: lineLoopCenter,
        i: l,
        j: r,
        activeSlot: l,
        slotMode: 'updated',
        memoj: count,
        memo: [...memo],
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: `中心 #${center} (${isOdd ? `单字符 '${s[l]}'` : `间隙 '${s[l]}'-'${s[r]}'`})`,
        log: `| 🎯 探索中心 #${center}: l=${l}, r=${r} [${isOdd ? `奇数中心 "${s[l]}"` : `偶数间隙 "${s[l]}|${s[r]}"`}]`,
        msg: `探索回文中心 <code>#${center}</code>：<code>l = ${l}, r = ${r}</code>（${isOdd ? `单字符 "${s[l]}"` : `双字符间隙 "${s[l]}|${s[r]}"`}）。`
      });

      while (l >= 0 && r < n && s[l] === s[r]) {
        count++;
        memo[l] = count;
        gridState[l][r] = 1;

        steps.push({
          type: 'spread',
          line: lineMatchInc,
          i: l,
          j: r,
          activeSlot: l,
          slotMode: 'updated',
          down: l,
          right: r,
          memoj: count,
          memo: [...memo],
          memoSnapshot: [...memo],
          grid: JSON.parse(JSON.stringify(gridState)),
          tag: `扩散命中: "${s.slice(l, r + 1)}" (count=${count})`,
          log: `| ✨ 双向扩散成功 s[${l}] == s[${r}] ('${s[l]}'): 发现回文子串 "${s.slice(l, r + 1)}", count = ${count}`,
          msg: `双向扩散成功 <code>s[${l}] == s[${r}] == '${s[l]}'</code>：发现回文子串 <code>"${s.slice(l, r + 1)}"</code>，回文总数累加至 <strong>${count}</strong>。`
        });

        l--;
        r++;
      }
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: n - 1,
      activeSlot: n - 1,
      slotMode: 'final',
      down: count,
      right: count,
      memoj: count,
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '最终答案',
      log: `| 🏆 中心扩散完成！回文子串总数 count = ${count}`,
      msg: `🏆 中心扩散法计算完成！字符串 <code>"${s}"</code> 中的回文子串总数为: <strong>${count}</strong>。`
    });

    return steps;
  }

  /**
   * 生成最长回文子序列 (Longest Palindromic Subsequence) 阶段 4 一维空间压缩步骤
   */
  public static generateLongestPalindromicSubsequenceStage4Steps(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'bbbab') as string;
    const n = s.length;

    const steps: UniversalStep[] = [];
    const memo = new Array(n).fill(0);
    const gridState = Array.from({ length: n }, () => new Array(n).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineLoopI = anchorMap?.loop_i || 7;
    const lineLoopJ = anchorMap?.loop_j || 11;
    const lineCond = anchorMap?.cond || 13;
    const lineAssignMatch = anchorMap?.assign_match || 14;
    const lineCalcMax = anchorMap?.calc_max || 16;
    const lineReturn = anchorMap?.return || 21;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      activeSlot: 0,
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '初始化一维状态数组',
      log: `| 📦 创建长度为 ${n} 的一维滚动数组 memo[0..${n - 1}]`,
      msg: `创建长度为 <code>${n}</code> 的一维滚动状态数组 <code>memo[0..${n - 1}]</code>。`
    });

    for (let i = n - 1; i >= 0; i--) {
      memo[i] = 1;
      gridState[i][i] = 1;
      let pre = 0; // pre 暂存左下角 dp[i+1][j-1]

      steps.push({
        type: 'init-slot',
        line: lineLoopI,
        i,
        j: i,
        activeSlot: i,
        slotMode: 'updated',
        memoj: 1,
        memo: [...memo],
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: `第 ${i} 行单字符初始化 memo[${i}] = 1`,
        log: `| 🎬 第 ${i} 行开始: memo[${i}] = 1, 初始化 pre = 0`,
        msg: `第 <code>${i}</code> 行开始：初始化 <code>memo[${i}] = 1</code>，重置 <code>pre = 0</code>。`
      });

      for (let j = i + 1; j < n; j++) {
        const temp = memo[j]; // 暂存未覆盖前的下方旧值
        const isMatch = s[i] === s[j];

        if (isMatch) {
          const sum = pre + 2;
          memo[j] = sum;
          gridState[i][j] = sum;

          steps.push({
            type: 'accumulate',
            line: lineAssignMatch,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            down: temp,
            right: pre,
            memoj: sum,
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `端点相同: pre(${pre}) + 2 = ${sum}`,
            log: `| ✨ s[${i}] == s[${j}] ('${s[i]}'): memo[${j}] = pre(${pre}) + 2 = ${sum}`,
            msg: `端点字符相同 <code>s[${i}] == s[${j}] == '${s[i]}'</code>：<code>memo[${j}] = pre (${pre}) + 2 = <strong>${sum}</strong></code>。`
          });
        } else {
          const downVal = memo[j];
          const leftVal = memo[j - 1];
          const maxVal = Math.max(downVal, leftVal);
          memo[j] = maxVal;
          gridState[i][j] = maxVal;

          steps.push({
            type: 'accumulate',
            line: lineCalcMax,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            down: downVal,
            right: leftVal,
            memoj: maxVal,
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `端点不同: max(下, 左) = ${maxVal}`,
            log: `| ✨ s[${i}]('${s[i]}') != s[${j}]('${s[j]}'): memo[${j}] = max(下=${downVal}, 左=${leftVal}) = ${maxVal}`,
            msg: `端点字符不同 <code>s[${i}] ('${s[i]}') != s[${j}] ('${s[j]}')</code>：<code>memo[${j}] = max(下 ${downVal}, 左 ${leftVal}) = <strong>${maxVal}</strong></code>。`
          });
        }

        pre = temp;
      }
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: n - 1,
      activeSlot: n - 1,
      slotMode: 'final',
      down: memo[n - 1],
      right: memo[n - 1],
      memoj: memo[n - 1],
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '最终答案',
      log: `| 🏆 一维空间压缩完成！最长回文子序列长度 = ${memo[n - 1]}`,
      msg: `🏆 一维滚动压缩计算完成！字符串 <code>"${s}"</code> 的最长回文子序列长度为: <strong>${memo[n - 1]}</strong>。`
    });

    return steps;
  }

  /**
   * 生成分割等和子集 (Partition Equal Subset Sum) 阶段 4 一维倒序滚动 0-1 背包步骤
   */
  public static generatePartitionSubsetStage4Steps(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const rawNums = (model.defaultParams as any)?.nums || [1, 5, 11, 5];
    const nums: number[] = Array.isArray(rawNums) ? rawNums : String(rawNums).split(',').map(Number);
    const n = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);

    const steps: UniversalStep[] = [];
    const lineOddCheck = anchorMap?.odd_check || 4;
    const lineInit = anchorMap?.init || 7;
    const lineLoopI = anchorMap?.loop_i || 10;
    const lineLoopJ = anchorMap?.loop_j || 12;
    const lineCalcMax = anchorMap?.calc_max || 14;
    const lineReturn = anchorMap?.return || 18;

    if (sum % 2 !== 0) {
      steps.push({
        type: 'init',
        line: lineOddCheck,
        i: 0,
        j: 0,
        activeSlot: 0,
        memo: [0],
        memoSnapshot: [0],
        grid: [[0]],
        tag: `奇数总和 ${sum} 无法平分`,
        log: `| ❌ 数组总和 sum = ${sum} 为奇数，无法等分为两个整数子集，直接 return false`,
        msg: `数组总和 <code>sum = ${sum}</code> 为奇数，无法平分成两个相等的整数子集，直接返回 <strong>false</strong>。`
      });
      return steps;
    }

    const target = sum / 2;
    const memo = new Array(target + 1).fill(0);
    const gridState = Array.from({ length: n }, () => new Array(target + 1).fill(null));

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      activeSlot: 0,
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '初始化一维状态数组',
      log: `| 📦 创建长度为 ${target + 1} 的一维 0-1 背包状态数组 dp[0..${target}], 目标 target = ${target}`,
      msg: `创建长度为 <code>${target + 1}</code> 的一维 0-1 背包状态数组 <code>dp[0..${target}]</code>，初始值全为 0。`
    });

    for (let i = 0; i < n; i++) {
      const num = nums[i];

      steps.push({
        type: 'init-slot',
        line: lineLoopI,
        i,
        j: target,
        activeSlot: target,
        slotMode: 'updated',
        memoj: memo[target],
        memo: [...memo],
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: `第 ${i} 轮物品: nums[${i}] = ${num}`,
        log: `| 🎬 遍历物品 i=${i} (nums[${i}]=${num}): 开始容量倒序遍历 j 从 ${target} 递减到 ${num}`,
        msg: `开始放入第 <code>${i}</code> 个物品 <code>nums[${i}] = ${num}</code>：从最大容量 <code>j = ${target}</code> 倒序更新至 <code>${num}</code>。`
      });

      for (let j = target; j >= num; j--) {
        const prevVal = memo[j];
        const candidate = memo[j - num] + num;
        const maxVal = Math.max(prevVal, candidate);
        memo[j] = maxVal;
        gridState[i][j] = maxVal;

        steps.push({
          type: 'accumulate',
          line: lineCalcMax,
          i,
          j,
          activeSlot: j,
          slotMode: 'updated',
          down: prevVal,
          right: memo[j - num],
          memoj: maxVal,
          memo: [...memo],
          memoSnapshot: [...memo],
          grid: JSON.parse(JSON.stringify(gridState)),
          tag: `容量 ${j}: max(${prevVal}, ${candidate}) = ${maxVal}`,
          log: `| ✨ 倒序更新 dp[${j}] = max(保持=${prevVal}, 放入=${candidate}) = ${maxVal}`,
          msg: `容量 <code>j = ${j}</code>：<code>max(保持原值 ${prevVal}, 放入 nums[${i}] (${prevVal < candidate ? candidate : prevVal})) = <strong>${maxVal}</strong></code>。`
        });
      }
    }

    const isMatch = memo[target] === target;

    steps.push({
      type: 'return',
      line: lineReturn,
      i: n - 1,
      j: target,
      activeSlot: target,
      slotMode: 'final',
      down: memo[target],
      right: memo[target],
      memoj: memo[target],
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: `最终判定: ${isMatch}`,
      log: `| 🏆 一维倒序 0-1 背包计算完成！dp[${target}] = ${memo[target]}, 是否恰好等于 target(${target}): ${isMatch}`,
      msg: `🏆 一维滚动压缩计算完成！最终 <code>dp[${target}] = ${memo[target]}</code>，${isMatch ? '<strong>恰好等于目标和 ' + target + '</strong>，可以等分（return true）' : '<strong>无法凑齐目标和 ' + target + '</strong>（return false）'}。`
    });

    return steps;
  }

  /**
   * 生成阶段 4 (一维空间压缩) 演化步骤
   */
  public static generateStage4Steps(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse' = 'forward',
    variant: 'if' | 'for' = 'if',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    // 1D 模型特化派发
    if (model.id === 'fibonacci' || model.id === 'climb-stairs') {
      return UniversalStageEngine.generate1DStage4Steps(model, Math.max(mVal, nVal), anchorMap);
    }
    // 字符串子序列 DP 特化派发
    if (model.id === 'distinct-subsequences') {
      return UniversalStageEngine.generateDistinctSubsequencesStage4Steps(model, anchorMap);
    }
    // 两个字符串的删除操作特化派发
    if (model.id === 'delete-operation-for-two-strings') {
      return UniversalStageEngine.generateDeleteDistanceStage4Steps(model, anchorMap);
    }
    // 编辑距离特化派发
    if (model.id === 'edit-distance') {
      return UniversalStageEngine.generateEditDistanceStage4Steps(model, anchorMap);
    }
    // 回文子串特化派发
    if (model.id === 'palindromic-substrings') {
      return UniversalStageEngine.generatePalindromicSubstringsStage4Steps(model, anchorMap);
    }
    // 最长回文子序列特化派发
    if (model.id === 'longest-palindromic-subsequence') {
      return UniversalStageEngine.generateLongestPalindromicSubsequenceStage4Steps(model, anchorMap);
    }
    // 分割等和子集特化派发
    if (model.id === 'partition-equal-subset-sum') {
      return UniversalStageEngine.generatePartitionSubsetStage4Steps(model, anchorMap);
    }

    const steps: UniversalStep[] = [];
    const memo = new Array(nVal).fill(0);
    const gridState = Array.from({ length: mVal }, () => new Array(nVal).fill(null));
    const isForward = direction === 'forward';
    const isMinPath = model.id === 'min-path-sum';

    const obstacleGrid = UniversalStageEngine.getDynamicObstacleGrid(model, mVal, nVal);
    const weightsGrid = UniversalStageEngine.getDynamicWeightsGrid(model, mVal, nVal);

    const lineInit = anchorMap?.init || (variant === 'if' ? 4 : (isForward ? 4 : 4));
    const lineInitVal = anchorMap?.init_val || anchorMap?.init_row || 8;
    const lineFetchDown = anchorMap?.fetch_down || (variant === 'if' ? 10 : 8);
    const lineFetchRight = anchorMap?.fetch_right || (variant === 'if' ? 11 : 9);
    const lineAccumulate = anchorMap?.accumulate || (variant === 'if' ? 12 : 10);
    const lineReturn = anchorMap?.return || (variant === 'if' ? 16 : 13);

    const pushStep = (params: Partial<UniversalStep> & {
      type: string;
      line: number;
      i: number;
      j: number;
      tag: string;
      log: string;
      msg: string;
      activeSlot?: number;
      slotMode?: 'updated' | 'down' | 'right' | 'final';
      down?: number;
      right?: number;
      memoj?: number;
      isBlockedStep?: boolean;
      fromI?: number;
      fromJ?: number;
    }) => {
      if (params.i >= 0 && params.i < mVal && params.j >= 0 && params.j < nVal && memo[params.j] !== undefined) {
        gridState[params.i][params.j] = memo[params.j];
      }

      let topI = -1;
      let topJ = -1;
      let leftI = -1;
      let leftJ = -1;

      if (params.slotMode === 'down') {
        topI = isForward ? params.i - 1 : params.i + 1;
        topJ = params.j;
      } else if (params.slotMode === 'right') {
        leftI = params.i;
        leftJ = isForward ? params.j - 1 : params.j + 1;
      } else if (params.slotMode === 'updated' || params.type === 'accumulate') {
        topI = isForward ? params.i - 1 : params.i + 1;
        topJ = params.j;
        leftI = params.i;
        leftJ = isForward ? params.j - 1 : params.j + 1;
      }

      steps.push({
        ...params,
        topI: topI >= 0 && topI < mVal ? topI : -1,
        topJ: topJ >= 0 && topJ < nVal ? topJ : -1,
        leftI: leftI >= 0 && leftI < mVal ? leftI : -1,
        leftJ: leftJ >= 0 && leftJ < nVal ? leftJ : -1,
        gridHighlight: { i: params.i, j: params.j },
        obstacleGrid,
        weightsGrid,
        memo: [...memo],
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState))
      });
    };

    // 初始状态
    pushStep({
      type: 'init',
      line: lineInit,
      i: isForward ? 0 : mVal - 1,
      j: isForward ? 0 : nVal - 1,
      activeSlot: -1,
      tag: '创建一维滚动数组',
      log: `| 📦 创建长度为 ${nVal} 的一维 memo 数组 [空间压缩至 O(n)]`,
      msg: `创建长度为 ${nVal} 的一维滚动数组 <code>memo[0..${nVal - 1}]</code>，准备滚动覆盖。`
    });

    if (isMinPath && weightsGrid) {
      if (isForward) {
        memo[0] = weightsGrid[0][0];
        pushStep({
          type: 'init-slot',
          line: lineInitVal,
          i: 0,
          j: 0,
          activeSlot: 0,
          slotMode: 'updated',
          memoj: memo[0],
          tag: '起点初始化',
          log: `| 🎬 起点 memo[0] = ${memo[0]}`,
          msg: `起点 (0, 0) 初始化 <code>memo[0] = ${memo[0]}</code>。`
        });

        for (let j = 1; j < nVal; j++) {
          memo[j] = memo[j - 1] + weightsGrid[0][j];
          pushStep({
            type: 'init-slot',
            line: lineInitVal,
            i: 0,
            j,
            activeSlot: j,
            slotMode: 'updated',
            memoj: memo[j],
            tag: '首行前缀累加',
            log: `| 🎬 memo[${j}] = memo[${j - 1}] + grid[0][${j}] = ${memo[j]}`,
            msg: `首行前缀累加：<code>memo[${j}] = memo[${j - 1}] + grid[0][${j}] = <strong>${memo[j]}</strong></code>。`
          });
        }

        for (let i = 1; i < mVal; i++) {
          memo[0] += weightsGrid[i][0];
          pushStep({
            type: 'init-slot',
            line: lineInitVal,
            i,
            j: 0,
            activeSlot: 0,
            slotMode: 'updated',
            memoj: memo[0],
            tag: `第${i}行首列更新`,
            log: `| ⬇️ memo[0] += grid[${i}][0] = ${memo[0]}`,
            msg: `第 ${i} 行首列累加上方：<code>memo[0] += grid[${i}][0] = <strong>${memo[0]}</strong></code>。`
          });

          for (let j = 1; j < nVal; j++) {
            const downVal = memo[j];
            const rightVal = memo[j - 1];

            pushStep({
              type: 'fetch-down',
              line: lineFetchDown,
              i,
              j,
              activeSlot: j,
              slotMode: 'down',
              down: downVal,
              right: rightVal,
              memoj: downVal,
              tag: '读取上方旧值 (down)',
              log: `| ⬇️ 读取上方旧值 fromTop = memo[${j}] = ${downVal}`,
              msg: `读取上方旧值 <code>fromTop = memo[${j}] = ${downVal}</code>。`
            });

            pushStep({
              type: 'fetch-right',
              line: lineFetchRight,
              i,
              j,
              activeSlot: j - 1,
              slotMode: 'right',
              down: downVal,
              right: rightVal,
              memoj: rightVal,
              tag: '读取左侧新值 (right)',
              log: `| ➡️ 读取左侧新值 fromLeft = memo[${j - 1}] = ${rightVal}`,
              msg: `读取左侧新值 <code>fromLeft = memo[${j - 1}] = ${rightVal}</code>。`
            });

            const sum = Math.min(downVal, rightVal) + weightsGrid[i][j];
            memo[j] = sum;

            pushStep({
              type: 'accumulate',
              line: lineAccumulate,
              i,
              j,
              activeSlot: j,
              slotMode: 'updated',
              down: downVal,
              right: rightVal,
              memoj: sum,
              tag: '滚动累加求最小',
              log: `| ✨ memo[${j}] = min(${downVal}, ${rightVal}) + grid[${i}][${j}] = ${sum}`,
              msg: `滚动覆盖：<code>memo[${j}] = min(${downVal}, ${rightVal}) + ${weightsGrid[i][j]} = <strong>${sum}</strong></code>。`
            });
          }
        }
      } else {
        // 逆推最小路径和一维滚动
        memo[nVal - 1] = weightsGrid[mVal - 1][nVal - 1];
        pushStep({
          type: 'init-slot',
          line: lineInitVal,
          i: mVal - 1,
          j: nVal - 1,
          activeSlot: nVal - 1,
          slotMode: 'updated',
          memoj: memo[nVal - 1],
          tag: '终点初始化',
          log: `| 🎬 终点 memo[${nVal - 1}] = ${memo[nVal - 1]}`,
          msg: `终点初始化 <code>memo[${nVal - 1}] = ${memo[nVal - 1]}</code>。`
        });

        for (let j = nVal - 2; j >= 0; j--) {
          memo[j] = memo[j + 1] + weightsGrid[mVal - 1][j];
          pushStep({
            type: 'init-slot',
            line: lineInitVal,
            i: mVal - 1,
            j,
            activeSlot: j,
            slotMode: 'updated',
            memoj: memo[j],
            tag: '最底行累加',
            log: `| 🎬 memo[${j}] = memo[${j + 1}] + grid = ${memo[j]}`,
            msg: `最底行累加：<code>memo[${j}] = ${memo[j]}</code>。`
          });
        }

        for (let i = mVal - 2; i >= 0; i--) {
          memo[nVal - 1] += weightsGrid[i][nVal - 1];
          pushStep({
            type: 'init-slot',
            line: lineInitVal,
            i,
            j: nVal - 1,
            activeSlot: nVal - 1,
            slotMode: 'updated',
            memoj: memo[nVal - 1],
            tag: `第${i}行最右列更新`,
            log: `| ⬇️ memo[${nVal - 1}] += grid = ${memo[nVal - 1]}`,
            msg: `最右列累加下方：<code>memo[${nVal - 1}] = ${memo[nVal - 1]}</code>。`
          });

          for (let j = nVal - 2; j >= 0; j--) {
            const downVal = memo[j];
            const rightVal = memo[j + 1];
            const sum = Math.min(downVal, rightVal) + weightsGrid[i][j];
            memo[j] = sum;

            pushStep({
              type: 'accumulate',
              line: lineAccumulate,
              i,
              j,
              activeSlot: j,
              slotMode: 'updated',
              down: downVal,
              right: rightVal,
              memoj: sum,
              tag: '逆推滚动更新',
              log: `| ✨ 逆推 memo[${j}] = min(${downVal}, ${rightVal}) + grid = ${sum}`,
              msg: `逆推覆盖：<code>memo[${j}] = min(${downVal}, ${rightVal}) + ${weightsGrid[i][j]} = <strong>${sum}</strong></code>。`
            });
          }
        }
      }
    } else if (obstacleGrid) {
      if (isForward) {
        memo[0] = (obstacleGrid[0][0] === 0) ? 1 : 0;
        pushStep({
          type: 'init-slot',
          line: lineInitVal,
          i: 0,
          j: 0,
          activeSlot: 0,
          slotMode: 'updated',
          tag: '起点初始化',
          log: `| 🎬 起点初始化 memo[0] = ${memo[0]}`,
          msg: `起点 (0, 0) ${memo[0] === 1 ? '无障碍' : '为障碍物'}，初始化 <code>memo[0] = ${memo[0]}</code>。`
        });

        for (let i = 0; i < mVal; i++) {
          for (let j = 0; j < nVal; j++) {
            if (i === 0 && j === 0) {
              continue;
            }
            if (obstacleGrid[i][j] === 1) {
              memo[j] = 0;
              const fromR = j > 0 ? i : (i > 0 ? i - 1 : 0);
              const fromC = j > 0 ? j - 1 : 0;
              pushStep({
                type: 'obstacle-cell',
                line: lineInitVal,
                i,
                j,
                fromI: fromR,
                fromJ: fromC,
                isBlockedStep: true,
                activeSlot: j,
                slotMode: 'updated',
                memoj: 0,
                tag: '🚧 障碍物清零',
                log: `| 🚧 遇到障碍物 (${i}, ${j})，从 (${fromR}, ${fromC}) 尝试进入受阻弹回，一维状态 memo[${j}] 原地清零置 0`,
                msg: `🚧 坐标 (${i}, ${j}) 为障碍物，探险家从 (${fromR}, ${fromC}) 尝试进入受阻弹回，一维状态 <code>memo[${j}] = 0</code> 原地清零。`
              });
            } else if (j === 0) {
              pushStep({
                type: 'keep-val',
                line: lineInitVal,
                i,
                j: 0,
                activeSlot: 0,
                slotMode: 'down',
                down: memo[0],
                right: 0,
                memoj: memo[0],
                tag: '首列保持上一行旧值',
                log: `| ⬇️ 首列 (${i}, 0) 无左侧新值，保持上一行 memo[0] = ${memo[0]}`,
                msg: `首列坐标 (${i}, 0) 无左侧路径，一维状态保持上一行旧值 <code>memo[0] = <strong>${memo[0]}</strong></code>。`
              });
            } else {
              const downVal = memo[j];
              const rightVal = memo[j - 1];
              memo[j] += rightVal;

              pushStep({
                type: 'accumulate',
                line: lineAccumulate,
                i,
                j,
                activeSlot: j,
                slotMode: 'updated',
                down: downVal,
                right: rightVal,
                memoj: memo[j],
                tag: '一维原地累加',
                log: `| ✨ memo[${j}] += memo[${j - 1}] (${rightVal}) = ${memo[j]}`,
                msg: `一维状态覆盖: <code>memo[${j}] (${downVal}) += memo[${j - 1}] (${rightVal}) = <strong>${memo[j]}</strong></code>。`
              });
            }
          }
        }
      } else {
        // 逆推带障碍物
        memo[nVal - 1] = (obstacleGrid[mVal - 1][nVal - 1] === 0) ? 1 : 0;
        pushStep({
          type: 'init-slot',
          line: lineInitVal,
          i: mVal - 1,
          j: nVal - 1,
          activeSlot: nVal - 1,
          slotMode: 'updated',
          tag: '逆推终点初始化',
          log: `| 🎬 终点初始化 memo[${nVal - 1}] = ${memo[nVal - 1]}`,
          msg: `终点 (${mVal - 1}, ${nVal - 1}) 初始化 <code>memo[${nVal - 1}] = ${memo[nVal - 1]}</code>。`
        });

        for (let i = mVal - 1; i >= 0; i--) {
          for (let j = nVal - 1; j >= 0; j--) {
            if (i === mVal - 1 && j === nVal - 1) {
              continue;
            }
            if (obstacleGrid[i][j] === 1) {
              memo[j] = 0;
              const fromR = j < nVal - 1 ? i : (i < mVal - 1 ? i + 1 : mVal - 1);
              const fromC = j < nVal - 1 ? j + 1 : nVal - 1;
              pushStep({
                type: 'obstacle-cell',
                line: lineInitVal,
                i,
                j,
                fromI: fromR,
                fromJ: fromC,
                isBlockedStep: true,
                activeSlot: j,
                slotMode: 'updated',
                memoj: 0,
                tag: '🚧 障碍物清零',
                log: `| 🚧 遇到障碍物 (${i}, ${j})，从 (${fromR}, ${fromC}) 尝试进入受阻弹回，逆推一维状态 memo[${j}] 原地清零置 0`,
                msg: `🚧 坐标 (${i}, ${j}) 为障碍物，探险家从 (${fromR}, ${fromC}) 尝试进入受阻弹回，逆推一维状态 <code>memo[${j}] = 0</code> 原地清零。`
              });
            } else if (j === nVal - 1) {
              pushStep({
                type: 'keep-val',
                line: lineInitVal,
                i,
                j: nVal - 1,
                activeSlot: nVal - 1,
                slotMode: 'down',
                down: memo[nVal - 1],
                right: 0,
                memoj: memo[nVal - 1],
                tag: '最右列保持下方旧值',
                log: `| ⬇️ 最右列 (${i}, ${nVal - 1}) 无右侧新值，保持下方 memo[${nVal - 1}] = ${memo[nVal - 1]}`,
                msg: `最右列坐标 (${i}, ${nVal - 1}) 无右侧路径，逆推一维状态保持下方旧值 <code>memo[${nVal - 1}] = <strong>${memo[nVal - 1]}</strong></code>。`
              });
            } else {
              const downVal = memo[j];
              const rightVal = memo[j + 1];
              memo[j] += rightVal;

              pushStep({
                type: 'accumulate',
                line: lineAccumulate,
                i,
                j,
                activeSlot: j,
                slotMode: 'updated',
                down: downVal,
                right: rightVal,
                memoj: memo[j],
                tag: '逆推原地累加',
                log: `| ✨ 逆推 memo[${j}] += memo[${j + 1}] (${rightVal}) = ${memo[j]}`,
                msg: `逆推覆盖: <code>memo[${j}] (${downVal}) += memo[${j + 1}] (${rightVal}) = <strong>${memo[j]}</strong></code>。`
              });
            }
          }
        }
      }
    } else if (variant === 'for') {
      for (let j = 0; j < nVal; j++) {
        memo[j] = 1;
        pushStep({
          type: 'init-slot',
          line: lineInitVal,
          i: isForward ? 0 : mVal - 1,
          j: j,
          activeSlot: j,
          slotMode: 'updated',
          tag: isForward ? '初始化第0行' : '逆推初始化最底行',
          log: `| 🎬 初始化 memo[${j}] = 1`,
          msg: `外层 for: 初始化边界 <code>memo[${j}] = 1</code>。`
        });
      }

      if (isForward) {
        for (let i = 1; i < mVal; i++) {
          pushStep({
            type: 'keep-val',
            line: lineInitVal,
            i,
            j: 0,
            activeSlot: 0,
            slotMode: 'down',
            down: memo[0],
            right: 0,
            memoj: memo[0],
            tag: '首列保持上一行旧值',
            log: `| ⬇️ 第 ${i} 行首列保持上一行 memo[0] = ${memo[0]}`,
            msg: `第 ${i} 行首列坐标 (${i}, 0) 只能从上方到达，保持 <code>memo[0] = <strong>${memo[0]}</strong></code>。`
          });

          for (let j = 1; j < nVal; j++) {
            const downVal = memo[j];
            const rightVal = memo[j - 1];

            pushStep({
              type: 'fetch-down',
              line: lineFetchDown,
              i,
              j,
              activeSlot: j,
              slotMode: 'down',
              down: downVal,
              right: rightVal,
              memoj: downVal,
              tag: '读取上方旧值 (down)',
              log: `| ⬇️ 读取 memo[${j}] 旧值 (来自上方) = ${downVal}`,
              msg: `读取当前格未更新前的旧值 <code>down = memo[${j}] = ${downVal}</code> (等价于上方 <code>dp[i-1][j]</code>)。`
            });

            pushStep({
              type: 'fetch-right',
              line: lineFetchRight,
              i,
              j,
              activeSlot: j - 1,
              slotMode: 'right',
              down: downVal,
              right: rightVal,
              memoj: rightVal,
              tag: '读取左侧新值 (right)',
              log: `| ➡️ 读取 memo[${j - 1}] 新值 (来自左方) = ${rightVal}`,
              msg: `读取本行刚更新出的新值 <code>right = memo[${j - 1}] = ${rightVal}</code> (等价于左方 <code>dp[i][j-1]</code>)。`
            });

            const sum = downVal + rightVal;
            memo[j] = sum;

            pushStep({
              type: 'accumulate',
              line: lineAccumulate,
              i,
              j,
              activeSlot: j,
              slotMode: 'updated',
              down: downVal,
              right: rightVal,
              memoj: sum,
              tag: '滚动累加覆盖',
              log: `| ✨ memo[${j}] = right(${rightVal}) + down(${downVal}) = ${sum}`,
              msg: `状态覆盖: <code>memo[${j}] = right (${rightVal}) + down (${downVal}) = <strong>${sum}</strong></code>。`
            });
          }
        }
      } else {
        for (let i = mVal - 2; i >= 0; i--) {
          pushStep({
            type: 'keep-val',
            line: lineInitVal,
            i,
            j: nVal - 1,
            activeSlot: nVal - 1,
            slotMode: 'down',
            down: memo[nVal - 1],
            right: 0,
            memoj: memo[nVal - 1],
            tag: '最右列保持下方旧值',
            log: `| ⬇️ 第 ${i} 行最右列保持下方 memo[${nVal - 1}] = ${memo[nVal - 1]}`,
            msg: `第 ${i} 行最右列坐标 (${i}, ${nVal - 1}) 逆推只能从下方到达，保持 <code>memo[${nVal - 1}] = <strong>${memo[nVal - 1]}</strong></code>。`
          });

          for (let j = nVal - 2; j >= 0; j--) {
            const downVal = memo[j];
            const rightVal = memo[j + 1];

            pushStep({
              type: 'fetch-down',
              line: lineFetchDown,
              i,
              j,
              activeSlot: j,
              slotMode: 'down',
              down: downVal,
              right: rightVal,
              memoj: downVal,
              tag: '逆推读取旧值 (down)',
              log: `| ⬇️ 逆推读取 memo[${j}] 旧值 = ${downVal}`,
              msg: `逆推读取下方旧值 <code>down = memo[${j}] = ${downVal}</code>。`
            });

            pushStep({
              type: 'fetch-right',
              line: lineFetchRight,
              i,
              j,
              activeSlot: j + 1,
              slotMode: 'right',
              down: downVal,
              right: rightVal,
              memoj: rightVal,
              tag: '逆推读取右侧新值 (right)',
              log: `| ➡️ 逆推读取 memo[${j + 1}] 新值 = ${rightVal}`,
              msg: `逆推读取右侧新值 <code>right = memo[${j + 1}] = ${rightVal}</code>。`
            });

            const sum = downVal + rightVal;
            memo[j] = sum;

            pushStep({
              type: 'accumulate',
              line: lineAccumulate,
              i,
              j,
              activeSlot: j,
              slotMode: 'updated',
              down: downVal,
              right: rightVal,
              memoj: sum,
              tag: '逆推滚动累加',
              log: `| ✨ 逆推覆盖 memo[${j}] = ${sum}`,
              msg: `逆推状态覆盖: <code>memo[${j}] = right (${rightVal}) + down (${downVal}) = <strong>${sum}</strong></code>。`
            });
          }
        }
      }
    } else {
      if (isForward) {
        for (let i = 0; i < mVal; i++) {
          for (let j = 0; j < nVal; j++) {
            if (i === 0 || j === 0) {
              memo[j] = 1;
              pushStep({
                type: 'init-val',
                line: lineInitVal,
                i,
                j,
                activeSlot: j,
                slotMode: 'updated',
                memoj: 1,
                tag: '边界初始化',
                log: `| 🎬 满足 (i=${i} || j=${j})，memo[${j}] = 1`,
                msg: `边界判断: 当前位于网格边缘 (i = ${i} 或 j = ${j})，直接置 <code>memo[${j}] = 1</code>。`
              });
            } else {
              const downVal = memo[j];
              const rightVal = memo[j - 1];

              pushStep({
                type: 'fetch-down',
                line: lineFetchDown,
                i,
                j,
                activeSlot: j,
                slotMode: 'down',
                down: downVal,
                right: rightVal,
                memoj: downVal,
                tag: '读取上方旧值',
                log: `| ⬇️ 读取 memo[${j}] 旧值 = ${downVal}`,
                msg: `读取当前格未更新前的旧值 <code>down = memo[${j}] = ${downVal}</code>。`
              });

              pushStep({
                type: 'fetch-right',
                line: lineFetchRight,
                i,
                j,
                activeSlot: j - 1,
                slotMode: 'right',
                down: downVal,
                right: rightVal,
                memoj: rightVal,
                tag: '读取左侧新值',
                log: `| ➡️ 读取 memo[${j - 1}] 新值 = ${rightVal}`,
                msg: `读取本行刚更新出的新值 <code>right = memo[${j - 1}] = ${rightVal}</code>。`
              });

              const sum = downVal + rightVal;
              memo[j] = sum;

              pushStep({
                type: 'accumulate',
                line: lineAccumulate,
                i,
                j,
                activeSlot: j,
                slotMode: 'updated',
                down: downVal,
                right: rightVal,
                memoj: sum,
                tag: '累加覆盖',
                log: `| ✨ memo[${j}] = right + down = ${sum}`,
                msg: `累加覆盖: <code>memo[${j}] = right (${rightVal}) + down (${downVal}) = <strong>${sum}</strong></code>。`
              });
            }
          }
        }
      } else {
        for (let i = mVal - 1; i >= 0; i--) {
          for (let j = nVal - 1; j >= 0; j--) {
            if (i === mVal - 1 || j === nVal - 1) {
              memo[j] = 1;
              pushStep({
                type: 'init-val',
                line: lineInitVal,
                i,
                j,
                activeSlot: j,
                slotMode: 'updated',
                memoj: 1,
                tag: '逆推边界初始化',
                log: `| 🎬 满足逆推边界 (i=${i} || j=${j})，memo[${j}] = 1`,
                msg: `逆推边界判断: 位于终点边缘 (i = ${i} 或 j = ${j})，置 <code>memo[${j}] = 1</code>。`
              });
            } else {
              const downVal = memo[j];
              const rightVal = memo[j + 1];

              pushStep({
                type: 'fetch-down',
                line: lineFetchDown,
                i,
                j,
                activeSlot: j,
                slotMode: 'down',
                down: downVal,
                right: rightVal,
                memoj: downVal,
                tag: '逆推读取旧值',
                log: `| ⬇️ 逆推读取 memo[${j}] 旧值 = ${downVal}`,
                msg: `逆推读取下方旧值 <code>down = memo[${j}] = ${downVal}</code>。`
              });

              pushStep({
                type: 'fetch-right',
                line: lineFetchRight,
                i,
                j,
                activeSlot: j + 1,
                slotMode: 'right',
                down: downVal,
                right: rightVal,
                memoj: rightVal,
                tag: '逆推读取右侧新值',
                log: `| ➡️ 逆推读取 memo[${j + 1}] 新值 = ${rightVal}`,
                msg: `逆推读取右侧新值 <code>right = memo[${j + 1}] = ${rightVal}</code>。`
              });

              const sum = downVal + rightVal;
              memo[j] = sum;

              pushStep({
                type: 'accumulate',
                line: lineAccumulate,
                i,
                j,
                activeSlot: j,
                slotMode: 'updated',
                down: downVal,
                right: rightVal,
                memoj: sum,
                tag: '逆推累加覆盖',
                log: `| ✨ 逆推 memo[${j}] = ${sum}`,
                msg: `逆推累加覆盖: <code>memo[${j}] = right (${rightVal}) + down (${downVal}) = <strong>${sum}</strong></code>。`
              });
            }
          }
        }
      }
    }

    const finalIdx = isForward ? nVal - 1 : 0;
    pushStep({
      type: 'return',
      line: lineReturn,
      i: isForward ? mVal - 1 : 0,
      j: isForward ? nVal - 1 : 0,
      activeSlot: finalIdx,
      slotMode: 'final',
      tag: '最终答案',
      log: isMinPath ? `| 🏆 一维空间优化完成！最终最小路径和 = ${memo[finalIdx]}` : `| 🏆 一维空间优化完成！最终答案 memo[${finalIdx}] = ${memo[finalIdx]}`,
      msg: isMinPath ? `🏆 一维滚动压缩计算完成！最终最小路径和为: <strong>${memo[finalIdx]}</strong>。` : `🏆 一维滚动压缩计算完成！最终不同路径数: <strong>${memo[finalIdx]}</strong>。`
    });

    return steps;
  }
}
