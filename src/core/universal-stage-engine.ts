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

    function buildNode(r: number, c: number): UniversalTreeNode {
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

      // 遇障碍物或 Base 起点停止向下展开
      if (isObstacle || (isForward ? (r === 0 && c === 0) : (r === mVal - 1 && c === nVal - 1))) {
        return node;
      }

      // 顺推：依赖上方 (r - 1, c) 与左方 (r, c - 1)
      if (isForward) {
        if (r > 0) {
          node.children.push(buildNode(r - 1, c));
        }
        if (c > 0) {
          node.children.push(buildNode(r, c - 1));
        }
      } else {
        // 逆推：依赖下方 (r + 1, c) 与右方 (r, c + 1)
        if (r + 1 < mVal) {
          node.children.push(buildNode(r + 1, c));
        }
        if (c + 1 < nVal) {
          node.children.push(buildNode(r, c + 1));
        }
      }

      return node;
    }

    return buildNode(startR, startC);
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
