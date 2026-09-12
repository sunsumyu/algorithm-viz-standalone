/**
 * 不同路径策略 — 阶段 1/2：暴力递归与记忆化搜索（自顶向下 DFS 逐步推演）
 * 从 grid-unique-paths-strategy 拆出的单阶段编译模块（SRP）：纯函数，无实例状态。
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import { UniversalStageEngine, type UniversalStep, type UniversalTreeNode } from '../universal-stage-engine';

  export function generateGridUniquePathsStage12(
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
    const isMinPath = model.id === 'min-path-sum' || Boolean(weightsGrid);

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
          const oobVal = isMinPath ? Infinity : 0;
          currentTreeNode.status = 'pruned';
          currentTreeNode.tag = isMinPath ? '⛔越界=∞' : '⛔越界=0';

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
            log: `| 🌊 【越界触水拦截】dfs(i=${r}, j=${c}) 跳入边界深水河流！水花四溅并立即弹回，return ${isMinPath ? '∞' : '0'}`,
            msg: `🌊 <strong>【越界触水拦截】</strong>探险家跳出边界 (i = ${r}, j = ${c}) 跌入深水，被立即拦截阻断并弹回起点！return <strong>${isMinPath ? '∞' : '0'}</strong>。`,
            topI: -1,
            topJ: -1,
            leftI: -1,
            leftJ: -1,
            gridHighlight: { i: r, j: c },
            activeNodeId: currentTreeNode.id,
            treeRoot: UniversalStageEngine.cloneTree(rootNode)
          });
          activeStack.pop();
          return oobVal;
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
          const targetVal = isMinPath ? (weightsGrid ? weightsGrid[r][c] : 1) : 1;
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
            log: `| 🎯 探险家成功到达目标终点 (${r}, ${c})！${isMinPath ? `权重代价为 ${targetVal}` : '发现 1 条完整可行路径'}，return ${targetVal}`,
            msg: `🎯 <strong>【成功触达目标终点】</strong>探险家成功到达目标终点 (${r}, ${c})，${isMinPath ? `自身权重大小时为 <code>${targetVal}</code>` : '记录 1 条通畅路径'}！return <strong>${targetVal}</strong>。`,
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
      const cellWeight = isMinPath ? (weightsGrid ? (weightsGrid[r]?.[c] ?? 0) : 0) : 0;
      const combined = isMinPath ? (Math.min(res1, res2) + cellWeight) : (res1 + res2);
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
        highlightText: isForward ? (isMinPath ? 'min(down, right) + weight' : 'down + right') : (isMinPath ? 'min(left, up) + weight' : 'left + up'),
        obstacleGrid,
        weightsGrid,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineCombine,
        tag: isMinPath ? `最小路径和: ${combined}` : `合并子分支: ${combined}`,
        log: isMinPath
          ? `| ✨ 汇总分支结果：dfs(${r}, ${c}) = min(${res1}, ${res2}) + ${cellWeight} = ${combined}${isMemo ? ' [写入备忘录]' : ''}`
          : `| ✨ 汇总分支结果：dfs(${r}, ${c}) = (${res1} + ${res2}) = ${combined}${isMemo ? ' [写入备忘录]' : ''}`,
        msg: isMinPath
          ? `✨ 汇总子分支：<code>dfs(${r}, ${c}) = min(${res1}, ${res2}) + ${cellWeight} = <strong>${combined}</strong></code>${isMemo ? '，并记录至备忘录中。' : '。'}`
          : `✨ 汇总子分支：<code>dfs(${r}, ${c}) = ${res1} + ${res2} = <strong>${combined}</strong></code>${isMemo ? '，并记录至备忘录中。' : '。'}`,
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
      log: isMinPath
        ? `| 🏆 演化计算完成！最终最小路径和: minPathSum(${mVal}, ${nVal}) = ${total}`
        : `| 🏆 演化计算完成！最终路径数: uniquePaths(${mVal}, ${nVal}) = ${total}`,
      msg: `🏆 演化推导全部完成！${isMinPath ? '从起点到终点的最小路径和为' : '从起点到终点的总路径数'}: <strong>${total}</strong>。`,
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
