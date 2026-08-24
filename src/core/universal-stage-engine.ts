/**
 * 通用多阶段状态推导执行引擎 (UniversalStageEngine)
 * 遵循 LSP（里氏替换原则）与 OCP（开闭原则）：
 * 依据 YAML 算法模型声明的 directions, branches 与阶段规则，
 * 自动派发并生成 4 个阶段的标准单步快照，消除各处手写重复推导逻辑。
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
   * 生成阶段 1 (朴素递归) 或阶段 2 (记忆化搜索) 的完整演化步骤
   */
  public static generateStage1or2Steps(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse' = 'forward',
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const generated: UniversalStep[] = [];
    const memoCache: Record<string, number> = {};
    const gridState: (number | null)[][] = Array.from({ length: mVal }, () => new Array(nVal).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let callCount = 0;
    let nodeIdCounter = 0;

    const isForward = direction === 'forward';
    const startR = isForward ? 0 : mVal - 1;
    const startC = isForward ? 0 : nVal - 1;

    // 行号映射 fallback
    const lineEntry = anchorMap?.entry || (isMemo ? 7 : 5);
    const lineBoundary = anchorMap?.boundary || (isMemo ? 8 : 6);
    const lineCacheHit = anchorMap?.cache_hit || 9;
    const lineBranch1 = anchorMap?.branch_down || anchorMap?.branch_left || (isMemo ? 10 : 7);
    const lineBranch2 = anchorMap?.branch_right || anchorMap?.branch_up || (isMemo ? 11 : 8);
    const lineCombine = anchorMap?.combine || (isMemo ? 12 : 9);
    const lineReturn = isMemo ? 5 : 3;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: startR,
      c: startC,
      val: `dfs(${startR},${startC})`,
      status: 'current',
      children: []
    };

    function isBoundary(r: number, c: number): boolean {
      if (isForward) {
        return r === mVal - 1 || c === nVal - 1;
      } else {
        return r === 0 || c === 0;
      }
    }

    function dfs(r: number, c: number, currentTreeNode: UniversalTreeNode): number {
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

      if (isBoundary(r, c)) {
        gridState[r][c] = 1;
        currentTreeNode.status = 'base';
        currentTreeNode.tag = '= 1';

        generated.push({
          type: 'boundary',
          i: r,
          j: c,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundary,
          tag: 'Base Case',
          log: `| 🎬 边界 Base Case: (i=${r} 或 j=${c}) 到达${isForward ? '终点' : '起点'}边界，直达路径 1 条，return 1`,
          msg: `🎬 到达${isForward ? '终点' : '起点'}边界 (i = ${r} 或 j = ${c})，直达${isForward ? '终点' : '起点'}，return 1。`,
          topI: -1,
          topJ: -1,
          leftI: -1,
          leftJ: -1,
          gridHighlight: { i: r, j: c },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
        activeStack.pop();
        return 1;
      }

      if (isMemo && memoCache[key] !== undefined) {
        currentTreeNode.status = 'pruned';
        currentTreeNode.tag = `⚡=${memoCache[key]}`;

        generated.push({
          type: 'cache-hit',
          i: r,
          j: c,
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
      const val1 = dfs(b1R, b1C, childNode1);

      // 分支 2：顺推向右 (r, c+1) / 逆推向上 (r-1, c)
      const b2R = isForward ? r : r - 1;
      const b2C = isForward ? c + 1 : c;
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
      const val2 = dfs(b2R, b2C, childNode2);

      const res = val1 + val2;
      if (isMemo) memoCache[key] = res;
      gridState[r][c] = res;

      currentTreeNode.status = 'visited';
      currentTreeNode.tag = `= ${res}`;

      const mergeLog = isForward
        ? `| ✨ 顺推合并: (${r}, ${c}) = 下(${val1}) + 右(${val2}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`
        : `| ✨ 逆推合并: (${r}, ${c}) = 左(${val1}) + 上(${val2}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`;
      const mergeMsg = isForward
        ? `✨ 坐标 (${r}, ${c}) 顺推合并：下方 (${val1}) + 右方 (${val2}) = ${res}${isMemo ? ' [存入缓存]' : ''}。`
        : `✨ 坐标 (${r}, ${c}) 逆推合并：左方 (${val1}) + 上方 (${val2}) = ${res}${isMemo ? ' [存入缓存]' : ''}。`;

      generated.push({
        type: 'update',
        i: r,
        j: c,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineCombine,
        tag: `${isForward ? '顺推' : '逆推'}合并子问题`,
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
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineReturn,
      tag: '最终答案',
      log: `| 🏆 最终答案: uniquePaths(${mVal}, ${nVal}) = ${total}`,
      msg: `🏆 演化计算完成！最终不同路径数: uniquePaths(${mVal}, ${nVal}) = ${total}。`,
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
   * 生成阶段 3 (经典二维 DP 填表) 演化步骤
   */
  public static generateStage3Steps(
    _model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse' = 'forward',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const dp = Array.from({ length: mVal }, () => new Array(nVal).fill(null));
    const isForward = direction === 'forward';

    const lineInit = anchorMap?.init || 3;
    const lineInitRow = anchorMap?.init_row || 4;
    const lineInitCol = anchorMap?.init_col || 5;
    const lineLoopI = anchorMap?.loop_i || 6;
    const lineTransfer = anchorMap?.transfer || 8;
    const lineReturn = anchorMap?.return || 11;

    // 1. 初始化数组
    steps.push({
      type: 'init',
      line: lineInit,
      i: isForward ? 0 : mVal - 1,
      j: isForward ? 0 : nVal - 1,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '初始化二维矩阵',
      log: `| 📦 创建二维 DP 状态矩阵 dp[${mVal}][${nVal}]`,
      msg: `创建 ${mVal}×${nVal} 的二维 DP 表格，准备按${isForward ? '顺推' : '逆推'}顺序自底向上计算。`
    });

    if (isForward) {
      // 顺推初始化第 0 列
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
      // 顺推初始化第 0 行
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

      // 顺推双重循环填表
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
      // 逆推初始化最右列
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
      // 逆推初始化最底行
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

      // 逆推倒序双重循环
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

    return steps;
  }

  /**
   * 生成阶段 4 (一维空间压缩) 演化步骤
   */
  public static generateStage4Steps(
    _model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse' = 'forward',
    variant: 'if' | 'for' = 'if',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const memo = new Array(nVal).fill(0);
    const gridState = Array.from({ length: mVal }, () => new Array(nVal).fill(null));
    const isForward = direction === 'forward';

    const lineInit = anchorMap?.init || (variant === 'if' ? 4 : (isForward ? 4 : 4));
    const lineInitVal = anchorMap?.init_val || anchorMap?.init_row || 8;
    const lineFetchDown = anchorMap?.fetch_down || (variant === 'if' ? 10 : 8);
    const lineFetchRight = anchorMap?.fetch_right || (variant === 'if' ? 11 : 9);
    const lineAccumulate = anchorMap?.accumulate || (variant === 'if' ? 12 : 10);
    const lineReturn = anchorMap?.return || (variant === 'if' ? 16 : 13);

    // 初始状态
    steps.push({
      type: 'init',
      line: lineInit,
      i: isForward ? 0 : mVal - 1,
      j: isForward ? 0 : nVal - 1,
      activeSlot: -1,
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '创建一维滚动数组',
      log: `| 📦 创建长度为 ${nVal} 的一维 memo 数组 [空间压缩至 O(n)]`,
      msg: `创建长度为 ${nVal} 的一维滚动数组 <code>memo[0..${nVal - 1}]</code>，准备滚动覆盖。`
    });

    if (variant === 'for') {
      // 外层 for 初始化
      for (let j = 0; j < nVal; j++) {
        memo[j] = 1;
        steps.push({
          type: 'init-slot',
          line: lineInitVal,
          i: isForward ? 0 : mVal - 1,
          j: j,
          activeSlot: j,
          slotMode: 'updated',
          memoSnapshot: [...memo],
          tag: '初始化第0行',
          log: `| 🎬 初始化 memo[${j}] = 1`,
          msg: `外层 for: 初始化首行 <code>memo[${j}] = 1</code>。`
        });
      }

      if (isForward) {
        for (let i = 1; i < mVal; i++) {
          for (let j = 1; j < nVal; j++) {
            const downVal = memo[j];
            const rightVal = memo[j - 1];

            steps.push({
              type: 'fetch-down',
              line: lineFetchDown,
              i,
              j,
              activeSlot: j,
              slotMode: 'down',
              memoSnapshot: [...memo],
              down: downVal,
              right: rightVal,
              memoj: downVal,
              tag: '读取上方旧值 (down)',
              log: `| ⬇️ 读取 memo[${j}] 旧值 (来自上方) = ${downVal}`,
              msg: `读取当前格未更新前的旧值 <code>down = memo[${j}] = ${downVal}</code> (等价于上方 <code>dp[i-1][j]</code>)。`
            });

            steps.push({
              type: 'fetch-right',
              line: lineFetchRight,
              i,
              j,
              activeSlot: j - 1,
              slotMode: 'right',
              memoSnapshot: [...memo],
              down: downVal,
              right: rightVal,
              memoj: rightVal,
              tag: '读取左侧新值 (right)',
              log: `| ➡️ 读取 memo[${j - 1}] 新值 (来自左方) = ${rightVal}`,
              msg: `读取本行刚更新出的新值 <code>right = memo[${j - 1}] = ${rightVal}</code> (等价于左方 <code>dp[i][j-1]</code>)。`
            });

            const sum = downVal + rightVal;
            memo[j] = sum;

            steps.push({
              type: 'accumulate',
              line: lineAccumulate,
              i,
              j,
              activeSlot: j,
              slotMode: 'updated',
              memoSnapshot: [...memo],
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
        // 逆推 for 版
        for (let i = mVal - 2; i >= 0; i--) {
          for (let j = nVal - 2; j >= 0; j--) {
            const downVal = memo[j];
            const rightVal = memo[j + 1];

            steps.push({
              type: 'fetch-down',
              line: lineFetchDown,
              i,
              j,
              activeSlot: j,
              slotMode: 'down',
              memoSnapshot: [...memo],
              down: downVal,
              right: rightVal,
              memoj: downVal,
              tag: '逆推读取旧值 (down)',
              log: `| ⬇️ 逆推读取 memo[${j}] 旧值 = ${downVal}`,
              msg: `逆推读取下方旧值 <code>down = memo[${j}] = ${downVal}</code>。`
            });

            steps.push({
              type: 'fetch-right',
              line: lineFetchRight,
              i,
              j,
              activeSlot: j + 1,
              slotMode: 'right',
              memoSnapshot: [...memo],
              down: downVal,
              right: rightVal,
              memoj: rightVal,
              tag: '逆推读取右侧新值 (right)',
              log: `| ➡️ 逆推读取 memo[${j + 1}] 新值 = ${rightVal}`,
              msg: `逆推读取右侧新值 <code>right = memo[${j + 1}] = ${rightVal}</code>。`
            });

            const sum = downVal + rightVal;
            memo[j] = sum;

            steps.push({
              type: 'accumulate',
              line: lineAccumulate,
              i,
              j,
              activeSlot: j,
              slotMode: 'updated',
              memoSnapshot: [...memo],
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
      // 内嵌 if 版
      if (isForward) {
        for (let i = 0; i < mVal; i++) {
          for (let j = 0; j < nVal; j++) {
            if (i === 0 || j === 0) {
              memo[j] = 1;
              steps.push({
                type: 'init-val',
                line: lineInitVal,
                i,
                j,
                activeSlot: j,
                slotMode: 'updated',
                memoSnapshot: [...memo],
                memoj: 1,
                tag: '边界初始化',
                log: `| 🎬 满足 (i=${i} || j=${j})，memo[${j}] = 1`,
                msg: `边界判断: 当前位于网格边缘 (i = ${i} 或 j = ${j})，直接置 <code>memo[${j}] = 1</code>。`
              });
            } else {
              const downVal = memo[j];
              const rightVal = memo[j - 1];

              steps.push({
                type: 'fetch-down',
                line: lineFetchDown,
                i,
                j,
                activeSlot: j,
                slotMode: 'down',
                memoSnapshot: [...memo],
                down: downVal,
                right: rightVal,
                memoj: downVal,
                tag: '读取上方旧值',
                log: `| ⬇️ 读取 memo[${j}] 旧值 = ${downVal}`,
                msg: `读取当前格未更新前的旧值 <code>down = memo[${j}] = ${downVal}</code>。`
              });

              steps.push({
                type: 'fetch-right',
                line: lineFetchRight,
                i,
                j,
                activeSlot: j - 1,
                slotMode: 'right',
                memoSnapshot: [...memo],
                down: downVal,
                right: rightVal,
                memoj: rightVal,
                tag: '读取左侧新值',
                log: `| ➡️ 读取 memo[${j - 1}] 新值 = ${rightVal}`,
                msg: `读取本行刚更新出的新值 <code>right = memo[${j - 1}] = ${rightVal}</code>。`
              });

              const sum = downVal + rightVal;
              memo[j] = sum;

              steps.push({
                type: 'accumulate',
                line: lineAccumulate,
                i,
                j,
                activeSlot: j,
                slotMode: 'updated',
                memoSnapshot: [...memo],
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
        // 逆推 if 版
        for (let i = mVal - 1; i >= 0; i--) {
          for (let j = nVal - 1; j >= 0; j--) {
            if (i === mVal - 1 || j === nVal - 1) {
              memo[j] = 1;
              steps.push({
                type: 'init-val',
                line: lineInitVal,
                i,
                j,
                activeSlot: j,
                slotMode: 'updated',
                memoSnapshot: [...memo],
                memoj: 1,
                tag: '逆推边界初始化',
                log: `| 🎬 满足逆推边界 (i=${i} || j=${j})，memo[${j}] = 1`,
                msg: `逆推边界判断: 位于终点边缘 (i = ${i} 或 j = ${j})，置 <code>memo[${j}] = 1</code>。`
              });
            } else {
              const downVal = memo[j];
              const rightVal = memo[j + 1];

              steps.push({
                type: 'fetch-down',
                line: lineFetchDown,
                i,
                j,
                activeSlot: j,
                slotMode: 'down',
                memoSnapshot: [...memo],
                down: downVal,
                right: rightVal,
                memoj: downVal,
                tag: '逆推读取旧值',
                log: `| ⬇️ 逆推读取 memo[${j}] 旧值 = ${downVal}`,
                msg: `逆推读取下方旧值 <code>down = memo[${j}] = ${downVal}</code>。`
              });

              steps.push({
                type: 'fetch-right',
                line: lineFetchRight,
                i,
                j,
                activeSlot: j + 1,
                slotMode: 'right',
                memoSnapshot: [...memo],
                down: downVal,
                right: rightVal,
                memoj: rightVal,
                tag: '逆推读取右侧新值',
                log: `| ➡️ 逆推读取 memo[${j + 1}] 新值 = ${rightVal}`,
                msg: `逆推读取右侧新值 <code>right = memo[${j + 1}] = ${rightVal}</code>。`
              });

              const sum = downVal + rightVal;
              memo[j] = sum;

              steps.push({
                type: 'accumulate',
                line: lineAccumulate,
                i,
                j,
                activeSlot: j,
                slotMode: 'updated',
                memoSnapshot: [...memo],
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
    steps.push({
      type: 'return',
      line: lineReturn,
      i: isForward ? mVal - 1 : 0,
      j: isForward ? nVal - 1 : 0,
      activeSlot: finalIdx,
      slotMode: 'final',
      memoSnapshot: [...memo],
      tag: '最终答案',
      log: `| 🏆 一维空间优化完成！最终答案 memo[${finalIdx}] = ${memo[finalIdx]}`,
      msg: `🏆 一维滚动压缩计算完成！最终不同路径数: <strong>${memo[finalIdx]}</strong>。`
    });

    return steps;
  }
}
