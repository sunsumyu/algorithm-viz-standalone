/**
 * 不同路径策略 — 阶段 3：二维 DP 逐格递推（自底向上填表）
 * 从 grid-unique-paths-strategy 拆出的单阶段编译模块（SRP）：纯函数，无实例状态。
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import { UniversalStageEngine, type UniversalStep, type UniversalTreeNode } from '../universal-stage-engine';

  export function generateGridUniquePathsStage3(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: mVal }, () => new Array(nVal).fill(null));
    const isForward = direction === 'forward';
    const isUniquePathsII = model.id === 'unique-paths-ii';
    const obstacleGrid = UniversalStageEngine.getDynamicObstacleGrid(model, mVal, nVal);
    const weightsGrid = UniversalStageEngine.getDynamicWeightsGrid(model, mVal, nVal);
    const isMinPath = model.id === 'min-path-sum' || Boolean(weightsGrid);

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
      weightsGrid,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '初始化 DP 表格',
      log: `| 📦 创建大小为 ${mVal}×${nVal} 的 DP 表格矩阵`,
      msg: `创建大小为 <code>${mVal} × ${nVal}</code> 的二维 DP 状态表格，初始值全为 0。`
    });

    if (isMinPath && weightsGrid) {
      if (isForward) {
        for (let r = 0; r < mVal; r++) {
          for (let c = 0; c < nVal; c++) {
            if (r === 0 && c === 0) {
              dp[0][0] = weightsGrid[0][0];
            } else {
              const topVal = r > 0 ? (dp[r - 1][c] ?? Infinity) : Infinity;
              const leftVal = c > 0 ? (dp[r][c - 1] ?? Infinity) : Infinity;
              dp[r][c] = Math.min(topVal, leftVal) + weightsGrid[r][c];
            }
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
              weightsGrid,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `dp[${r}][${c}] = ${dp[r][c]}`,
              log: `| 🔄 状态转移: dp[${r}][${c}] = ${dp[r][c]}`,
              msg: `状态转移：<code>dp[${r}][${c}] = <strong>${dp[r][c]}</strong></code>。`
            });
          }
        }
      } else {
        for (let r = mVal - 1; r >= 0; r--) {
          for (let c = nVal - 1; c >= 0; c--) {
            if (r === mVal - 1 && c === nVal - 1) {
              dp[r][c] = weightsGrid[r][c];
            } else {
              const downVal = r < mVal - 1 ? (dp[r + 1][c] ?? Infinity) : Infinity;
              const rightVal = c < nVal - 1 ? (dp[r][c + 1] ?? Infinity) : Infinity;
              dp[r][c] = Math.min(downVal, rightVal) + weightsGrid[r][c];
            }
            steps.push({
              type: 'transfer',
              line: lineTransfer,
              i: r,
              j: c,
              topI: r < mVal - 1 ? r + 1 : -1,
              topJ: r < mVal - 1 ? c : -1,
              leftI: c < nVal - 1 ? r : -1,
              leftJ: c < nVal - 1 ? c + 1 : -1,
              gridHighlight: { i: r, j: c },
              weightsGrid,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `逆推 dp[${r}][${c}] = ${dp[r][c]}`,
              log: `| 🔄 逆推状态转移: dp[${r}][${c}] = ${dp[r][c]}`,
              msg: `逆推状态转移：<code>dp[${r}][${c}] = <strong>${dp[r][c]}</strong></code>。`
            });
          }
        }
      }
    } else if (isForward) {
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
            const topVal = (r > 0) ? (dp[r - 1][c] ?? 0) : 0;
            const leftVal = (c > 0) ? (dp[r][c - 1] ?? 0) : 0;
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
            const downVal = (r + 1 < mVal) ? (dp[r + 1][c] ?? 0) : 0;
            const rightVal = (c + 1 < nVal) ? (dp[r][c + 1] ?? 0) : 0;
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
