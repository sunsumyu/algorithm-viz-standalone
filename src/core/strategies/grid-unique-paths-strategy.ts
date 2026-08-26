import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import { UniversalStageEngine, type UniversalStep, type UniversalTreeNode } from '../universal-stage-engine';

/**
 * 不同路径 (Unique Paths / Unique Paths II) 独立算法策略模块
 * 遵循策略模式 (Strategy Pattern)，封装 4 阶段推演逻辑
 */
export class GridUniquePathsStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: 'unique-paths' | 'unique-paths-ii' = 'unique-paths') {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, m, n, direction, isMemo, stageVariant, anchorMap } = params;

    switch (stage) {
      case 1:
      case 2:
        return this.generateStage1or2(model, m, n, direction === 'reverse' ? 'reverse' : 'forward', Boolean(isMemo), anchorMap, stageVariant);
      case 3:
        return this.generateStage3(model, m, n, direction === 'reverse' ? 'reverse' : 'forward', anchorMap);
      case 4:
        return this.generateStage4(model, m, n, direction === 'reverse' ? 'reverse' : 'forward', (stageVariant === 'for' ? 'for' : 'if'), anchorMap);
      default:
        return [];
    }
  }

  private generateStage1or2(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse',
    isMemo: boolean,
    anchorMap?: Record<string, number>,
    variant: string = 'terminal'
  ): UniversalStep[] {
    const generated: UniversalStep[] = [];
    const memoCache: Record<string, number> = {};
    const gridState: (number | null)[][] = Array.from({ length: mVal }, () => new Array(nVal).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let callCount = 0;
    let nodeIdCounter = 0;

    const obstacleGrid = UniversalStageEngine.getDynamicObstacleGrid(model, mVal, nVal);
    const weightsGrid = UniversalStageEngine.getDynamicWeightsGrid(model, mVal, nVal);

    const isForward = direction === 'forward';
    const isTerminal = variant === 'terminal';
    const startR = isForward ? 0 : mVal - 1;
    const startC = isForward ? 0 : nVal - 1;

    // 行号映射
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
        treeRoot: (UniversalStageEngine as any).cloneTree(rootNode)
      });

      // 越界拦截判断 (Terminal Variant)
      if (isTerminal) {
        if (isOutOfBounds(r, c)) {
          currentTreeNode.status = 'pruned';
          currentTreeNode.tag = '⛔越界=0';

          const outOfBoundsDir = r >= mVal ? 'river' : (c >= nVal ? 'right-wall' : (r < 0 ? 'top-wall' : 'left-wall'));

          generated.push({
            type: 'out-of-bounds',
            i: r,
            j: c,
            fromI: fromR,
            fromJ: fromC,
            isOutOfBounds: true,
            isBlockedStep: true,
            outOfBoundsDir,
            highlightText: isForward ? 'i >= m || j >= n' : 'i < 0 || j < 0',
            obstacleGrid,
            weightsGrid,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineOutOfBounds,
            tag: '🌊 越界落水/撞墙拦截',
            log: `| 🌊 【越界触水拦截】dfs(i=${r}, j=${c}) 跳入边界深水河流！水花四溅并立即弹回，return 0`,
            msg: `🌊 <strong>【越界触水拦截】</strong>探险家跳出边界 (i = ${r}, j = ${c}) 跌入深水，被立即拦截阻断并弹回起点！return <strong>0</strong>。`,
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

        // 障碍物阻断
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
          const targetVal = 1;
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
            tag: '🎯 到达目标终点',
            log: `| 🎯 探险家成功到达目标终点 (${r}, ${c})！发现 1 条完整可行路径，return 1`,
            msg: `🎯 <strong>【成功触达目标终点】</strong>探险家成功到达目标终点 (${r}, ${c})，记录 1 条通畅路径！return <strong>1</strong>。`,
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
        // 边界直达模式 (Direct Boundary Mode)
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
            log: `| 🚧 【遇到障碍物阻断】dfs(i=${r}, j=${c}) 遭遇障碍物，return 0`,
            msg: `🚧 遇到障碍物 (i = ${r}, j = ${c})，路径阻断置 0。`,
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

        if (isBoundary(r, c)) {
          const boundaryVal = 1;
          gridState[r][c] = boundaryVal;
          currentTreeNode.status = 'base';
          currentTreeNode.tag = `= ${boundaryVal}`;

          generated.push({
            type: 'boundary',
            i: r,
            j: c,
            fromI: fromR,
            fromJ: fromC,
            highlightText: isForward ? 'i == m - 1 || j == n - 1' : 'i == 0 || j == 0',
            obstacleGrid,
            weightsGrid,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBoundary,
            tag: '边缘直达基准',
            log: `| 🎬 满足边缘直达条件 (${r}, ${c})，return ${boundaryVal}`,
            msg: `边界特判：位于边缘 (i = ${r} 或 j = ${c})，仅剩 1 种唯一单向走法，return <strong>${boundaryVal}</strong>。`,
            topI: -1,
            topJ: -1,
            leftI: -1,
            leftJ: -1,
            gridHighlight: { i: r, j: c },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
          activeStack.pop();
          return boundaryVal;
        }
      }

      // 记忆化缓存命中
      if (isMemo && memoCache[key] !== undefined) {
        const cached = memoCache[key];
        currentTreeNode.status = 'visited';
        currentTreeNode.tag = `⚡记忆=${cached}`;

        generated.push({
          type: 'cache-hit',
          i: r,
          j: c,
          fromI: fromR,
          fromJ: fromC,
          highlightText: 'memo[i][j] != 0',
          obstacleGrid,
          weightsGrid,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCacheHit,
          tag: '⚡ 备忘录剪枝命中',
          log: `| ⚡ 【备忘录命中】dfs(${r}, ${c}) 已被计算过，直接复用 memo[${r}][${c}] = ${cached}`,
          msg: `⚡ <strong>【备忘录剪枝命中】</strong>状态 <code>(${r}, ${c})</code> 在之前已完成搜索并沉淀在备忘录中，直接读取 <code>memo[${r}][${c}] = <strong>${cached}</strong></code> 快速剪枝返回！`,
          topI: -1,
          topJ: -1,
          leftI: -1,
          leftJ: -1,
          gridHighlight: { i: r, j: c },
          activeNodeId: currentTreeNode.id,
          treeRoot: UniversalStageEngine.cloneTree(rootNode)
        });
        activeStack.pop();
        return cached;
      }

      // 分支 1 探索
      const next1R = isForward ? r + 1 : r - 1;
      const next1C = c;
      const child1Node: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: next1R,
        c: next1C,
        val: `dfs(${next1R},${next1C})`,
        edgeLabel: isForward ? '向下' : '向上',
        status: 'normal',
        children: []
      };
      currentTreeNode.children.push(child1Node);

      generated.push({
        type: 'branch-1',
        i: r,
        j: c,
        fromI: fromR,
        fromJ: fromC,
        highlightText: isForward ? 'down = dfs(i + 1, j)' : 'up = dfs(i - 1, j)',
        obstacleGrid,
        weightsGrid,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineBranch1,
        tag: `展开${isForward ? '向下' : '向上'}分支`,
        log: `| ⬇️ 执行 ${isForward ? 'down = dfs(' + (r + 1) + ', ' + c + ')' : 'up = dfs(' + (r - 1) + ', ' + c + ')'}，准备深入探索`,
        msg: `准备${isForward ? '向下 (i + 1)' : '向上 (i - 1)'}探索子问题。`,
        topI: isForward ? r + 1 : r - 1,
        topJ: c,
        leftI: -1,
        leftJ: -1,
        gridHighlight: { i: r, j: c },
        activeNodeId: currentTreeNode.id,
        treeRoot: (UniversalStageEngine as any).cloneTree(rootNode)
      });

      const res1 = dfs(next1R, next1C, child1Node, r, c);

      // 分支 2 探索
      const next2R = r;
      const next2C = isForward ? c + 1 : c - 1;
      const child2Node: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: next2R,
        c: next2C,
        val: `dfs(${next2R},${next2C})`,
        edgeLabel: isForward ? '向右' : '向左',
        status: 'normal',
        children: []
      };
      currentTreeNode.children.push(child2Node);

      generated.push({
        type: 'branch-2',
        i: r,
        j: c,
        fromI: fromR,
        fromJ: fromC,
        highlightText: isForward ? 'right = dfs(i, j + 1)' : 'left = dfs(i, j - 1)',
        obstacleGrid,
        weightsGrid,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineBranch2,
        tag: `展开${isForward ? '向右' : '向左'}分支`,
        log: `| ➡️ 执行 ${isForward ? 'right = dfs(' + r + ', ' + (c + 1) + ')' : 'left = dfs(' + r + ', ' + (c - 1) + ')'}，准备深入探索`,
        msg: `准备${isForward ? '向右 (j + 1)' : '向左 (j - 1)'}探索子问题。`,
        topI: -1,
        topJ: -1,
        leftI: r,
        leftJ: isForward ? c + 1 : c - 1,
        gridHighlight: { i: r, j: c },
        activeNodeId: currentTreeNode.id,
        treeRoot: (UniversalStageEngine as any).cloneTree(rootNode)
      });

      const res2 = dfs(next2R, next2C, child2Node, r, c);

      // 合并分支结果
      const combined = res1 + res2;
      gridState[r][c] = combined;
      currentTreeNode.status = 'visited';
      currentTreeNode.tag = `= ${combined}`;

      if (isMemo) {
        memoCache[key] = combined;
      }

      generated.push({
        type: 'combine',
        i: r,
        j: c,
        fromI: fromR,
        fromJ: fromC,
        highlightText: isForward ? 'down + right' : 'left + up',
        obstacleGrid,
        weightsGrid,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineCombine,
        tag: `合并子分支: ${combined}`,
        log: `| ✨ 汇总分支结果：dfs(${r}, ${c}) = (${res1} + ${res2}) = ${combined}${isMemo ? ' [写入备忘录]' : ''}`,
        msg: `✨ 汇总子分支：<code>dfs(${r}, ${c}) = ${res1} + ${res2} = <strong>${combined}</strong></code>${isMemo ? '，并记录至备忘录中。' : '。'}`,
        topI: isForward ? r + 1 : r - 1,
        topJ: c,
        leftI: r,
        leftJ: isForward ? c + 1 : c - 1,
        gridHighlight: { i: r, j: c },
        activeNodeId: currentTreeNode.id,
        treeRoot: (UniversalStageEngine as any).cloneTree(rootNode)
      });

      activeStack.pop();
      return combined;
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
      tag: '最终推演答案',
      log: `| 🏆 演化计算完成！最终路径数: uniquePaths(${mVal}, ${nVal}) = ${total}`,
      msg: `🏆 演化推导全部完成！从起点到终点的总路径数: <strong>${total}</strong>。`,
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

  private generateStage3(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: mVal }, () => new Array(nVal).fill(0));
    const isForward = direction === 'forward';
    const isUniquePathsII = model.id === 'unique-paths-ii';
    const obstacleGrid = UniversalStageEngine.getDynamicObstacleGrid(model, mVal, nVal);

    const lineInit = anchorMap?.init || (isUniquePathsII ? 4 : (isForward ? 4 : 4));
    const lineInitVal = anchorMap?.init_val || anchorMap?.init_row || (isUniquePathsII ? 7 : (isForward ? 6 : 6));
    const lineCond = anchorMap?.cond || (isUniquePathsII ? 13 : (isForward ? 9 : 9));
    const lineCalcTop = anchorMap?.calc_top;
    const lineCalcLeft = anchorMap?.calc_left;
    const lineCalcDown = anchorMap?.calc_down;
    const lineCalcRight = anchorMap?.calc_right;
    const lineTransfer = anchorMap?.transfer || (isUniquePathsII ? 16 : (isForward ? 11 : 11));
    const lineReturn = anchorMap?.return || (isUniquePathsII ? 20 : (isForward ? 15 : 15));

    steps.push({
      type: 'init',
      line: lineInit,
      i: isForward ? 0 : mVal - 1,
      j: isForward ? 0 : nVal - 1,
      obstacleGrid,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '初始化 DP 表格',
      log: `| 📦 创建大小为 ${mVal}×${nVal} 的 DP 表格矩阵`,
      msg: `创建大小为 <code>${mVal} × ${nVal}</code> 的二维 DP 状态表格，初始值全为 0。`
    });

    if (isForward) {
      // 顺推二维 DP
      for (let r = 0; r < mVal; r++) {
        for (let c = 0; c < nVal; c++) {
          const fromR = r > 0 ? r - 1 : (c > 0 ? r : 0);
          const fromC = r > 0 ? c : (c > 0 ? c - 1 : 0);

          if (obstacleGrid && obstacleGrid[r]?.[c] === 1) {
            dp[r][c] = 0;
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
              msg: `🚧 坐标 (${r}, ${c}) 为障碍物，探险家从 (${fromR}, ${fromC}) 尝试进入受阻并弹回安全格，路径阻断置 0。`
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
              highlightText: (lineCalcTop !== undefined && lineCalcLeft !== undefined) ? 'fromTop + fromLeft' : (isUniquePathsII ? '上 + 左' : undefined),
              topVal,
              leftVal,
              sumVal: sum,
              obstacleGrid,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `dp[${r}][${c}] = 上(${topVal}) + 左(${leftVal}) = ${sum}`,
              log: `| 🔄 状态转移 dp[${r}][${c}] = dp[${r - 1}][${c}](${topVal}) + dp[${r}][${c - 1}](${leftVal}) = ${sum}`,
              msg: `状态转移：<code>dp[${r}][${c}] = 上方 (${topVal}) + 左方 (${leftVal}) = <strong>${sum}</strong></code>。`
            });
          }
        }
      }
    } else {
      // 逆推二维 DP
      for (let r = mVal - 1; r >= 0; r--) {
        for (let c = nVal - 1; c >= 0; c--) {
          const fromR = r < mVal - 1 ? r + 1 : (c < nVal - 1 ? r : mVal - 1);
          const fromC = r < mVal - 1 ? c : (c < nVal - 1 ? c + 1 : nVal - 1);

          if (obstacleGrid && obstacleGrid[r]?.[c] === 1) {
            dp[r][c] = 0;
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
                log: `| ⬇️ 检查下方格 (${r + 1}, ${c}): ${r + 1 < mVal ? `读取 dp[${r + 1}][${c}] = ${downVal}` : '下方越界置 0'}，得到 fromDown = ${downVal}`,
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
                tag: '逆推查找右侧路径',
                log: `| ➡️ 检查右侧格 (${r}, ${c + 1}): ${c + 1 < nVal ? `读取 dp[${r}][${c + 1}] = ${rightVal}` : '右侧越界置 0'}，得到 fromRight = ${rightVal}`,
                msg: `➡️ <strong>【逆推查找右侧路径】</strong>：${c + 1 < nVal ? `读取右侧 <code>dp[${r}][${c + 1}] = ${rightVal}</code>` : '右侧越界，置 0'}，故 <code>fromRight = ${rightVal}</code>。`
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
              highlightText: (lineCalcDown !== undefined && lineCalcRight !== undefined) ? 'fromDown + fromRight' : undefined,
              topVal: downVal,
              leftVal: rightVal,
              sumVal: sum,
              obstacleGrid,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `逆推 dp[${r}][${c}] = 下(${downVal}) + 右(${rightVal}) = ${sum}`,
              log: `| 🔄 逆推转移 dp[${r}][${c}] = dp[${r + 1}][${c}](${downVal}) + dp[${r}][${c + 1}](${rightVal}) = ${sum}`,
              msg: `逆推转移：<code>dp[${r}][${c}] = 下方 (${downVal}) + 右方 (${rightVal}) = <strong>${sum}</strong></code>。`
            });
          }
        }
      }
    }

    const finalR = isForward ? mVal - 1 : 0;
    const finalC = isForward ? nVal - 1 : 0;
    steps.push({
      type: 'return',
      line: lineReturn,
      i: finalR,
      j: finalC,
      obstacleGrid,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '返回最终结果',
      log: `| 🏆 二维填表完成！${isForward ? '右下角终点' : '左上角起点'}总路径数 = ${dp[finalR][finalC]}`,
      msg: `🏆 二维填表全部完成！最终不同路径总数: <strong>${dp[finalR][finalC]}</strong>。`
    });

    for (const step of steps) {
      step.treeRoot = UniversalStageEngine.build2DDPDependencyTree(mVal, nVal, direction, obstacleGrid, step.grid, step.i, step.j);
      step.activeNodeId = UniversalStageEngine.findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  private generateStage4(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse',
    variant: 'if' | 'for',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const memo = new Array(nVal).fill(0);
    const gridState = Array.from({ length: mVal }, () => new Array(nVal).fill(null));
    const isForward = direction === 'forward';
    const isUniquePathsII = model.id === 'unique-paths-ii';
    const obstacleGrid = UniversalStageEngine.getDynamicObstacleGrid(model, mVal, nVal);

    const lineInit = anchorMap?.init || (variant === 'if' ? 4 : 4);
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
    }) => {
      gridState[params.i][params.j] = params.memoj !== undefined ? (typeof params.memoj === 'number' ? params.memoj : 0) : memo[params.j];
      steps.push({
        ...params,
        obstacleGrid,
        grid: JSON.parse(JSON.stringify(gridState)),
        memo: [...memo],
        memoSnapshot: [...memo]
      });
    };

    pushStep({
      type: 'init',
      line: lineInit,
      i: isForward ? 0 : mVal - 1,
      j: isForward ? 0 : nVal - 1,
      activeSlot: 0,
      slotMode: 'updated',
      memoj: 0,
      tag: '初始化一维状态数组',
      log: `| 📦 创建长度为 ${nVal} 的一维滚动状态数组 memo[0..${nVal - 1}]`,
      msg: `创建长度为 <code>${nVal}</code> 的一维滚动状态数组 <code>memo</code>，初始值全为 0。`
    });

    if (isUniquePathsII && obstacleGrid) {
      if (isForward) {
        memo[0] = (obstacleGrid[0][0] === 0) ? 1 : 0;
        pushStep({
          type: 'init-slot',
          line: lineInitVal,
          i: 0,
          j: 0,
          activeSlot: 0,
          slotMode: 'updated',
          memoj: memo[0],
          tag: '起点初始化',
          log: `| 🎬 起点初始化 memo[0] = ${memo[0]}`,
          msg: `起点初始化 <code>memo[0] = ${memo[0]}</code>。`
        });

        for (let j = 1; j < nVal; j++) {
          memo[j] = (obstacleGrid[0][j] === 0 && memo[j - 1] === 1) ? 1 : 0;
          pushStep({
            type: 'init-slot',
            line: lineInitVal,
            i: 0,
            j,
            activeSlot: j,
            slotMode: 'updated',
            memoj: memo[j],
            tag: '首行初始化',
            log: `| 🎬 memo[${j}] = ${memo[j]}`,
            msg: `首行初始化 <code>memo[${j}] = ${memo[j]}</code>。`
          });
        }

        for (let i = 1; i < mVal; i++) {
          for (let j = 0; j < nVal; j++) {
            const fromR = i - 1;
            const fromC = j;

            if (obstacleGrid[i][j] === 1) {
              memo[j] = 0;
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
          msg: `逆推终点初始化 <code>memo[${nVal - 1}] = ${memo[nVal - 1]}</code>。`
        });

        for (let j = nVal - 2; j >= 0; j--) {
          memo[j] = (obstacleGrid[mVal - 1][j] === 0 && memo[j + 1] === 1) ? 1 : 0;
          pushStep({
            type: 'init-slot',
            line: lineInitVal,
            i: mVal - 1,
            j,
            activeSlot: j,
            slotMode: 'updated',
            tag: '最底行逆推',
            log: `| 🎬 memo[${j}] = ${memo[j]}`,
            msg: `最底行逆推初始化 <code>memo[${j}] = ${memo[j]}</code>。`
          });
        }

        for (let i = mVal - 2; i >= 0; i--) {
          for (let j = nVal - 1; j >= 0; j--) {
            const fromR = i + 1;
            const fromC = j;

            if (obstacleGrid[i][j] === 1) {
              memo[j] = 0;
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
                tag: '🚧 逆推障碍物清零',
                log: `| 🚧 遇到障碍物 (${i}, ${j})，从 (${fromR}, ${fromC}) 尝试进入受阻弹回，memo[${j}] = 0`,
                msg: `🚧 坐标 (${i}, ${j}) 为障碍物，逆推状态 <code>memo[${j}] = 0</code> 原地清零。`
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
                tag: '最右列保持上一行旧值',
                log: `| ⬇️ 最右列 (${i}, ${nVal - 1}) 保持上一行 memo[${nVal - 1}] = ${memo[nVal - 1]}`,
                msg: `最右列保持上一行旧值 <code>memo[${nVal - 1}] = <strong>${memo[nVal - 1]}</strong></code>。`
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
                tag: '逆推一维原地累加',
                log: `| ✨ memo[${j}] += memo[${j + 1}] (${rightVal}) = ${memo[j]}`,
                msg: `逆推一维状态覆盖: <code>memo[${j}] (${downVal}) += memo[${j + 1}] (${rightVal}) = <strong>${memo[j]}</strong></code>。`
              });
            }
          }
        }
      }
    } else {
      // 普通无障碍物 Unique Paths
      if (isForward) {
        memo.fill(1);
        for (let j = 0; j < nVal; j++) {
          pushStep({
            type: 'init-val',
            line: lineInitVal,
            i: 0,
            j,
            activeSlot: j,
            slotMode: 'updated',
            memoj: 1,
            tag: '首行全 1 初始化',
            log: `| 🎬 满足首行边界 (i=0)，memo[${j}] = 1`,
            msg: `首行边界判断: 位于第 0 行，置 <code>memo[${j}] = 1</code>。`
          });
        }

        for (let i = 1; i < mVal; i++) {
          for (let j = 0; j < nVal; j++) {
            if (j === 0) {
              pushStep({
                type: 'init-val',
                line: lineInitVal,
                i,
                j: 0,
                activeSlot: 0,
                slotMode: 'updated',
                memoj: 1,
                tag: '首列全 1 初始化',
                log: `| 🎬 满足首列边界 (j=0)，memo[0] = 1`,
                msg: `首列边界判断: 位于第 0 列，置 <code>memo[0] = 1</code>。`
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
        // 逆推无障碍
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
      log: `| 🏆 一维空间优化完成！最终答案 memo[${finalIdx}] = ${memo[finalIdx]}`,
      msg: `🏆 一维滚动压缩计算完成！最终不同路径数: <strong>${memo[finalIdx]}</strong>。`
    });

    return steps;
  }
}
