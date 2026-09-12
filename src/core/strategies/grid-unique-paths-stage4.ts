/**
 * 不同路径策略 — 阶段 4：一维滚动数组优化（空间压缩）
 * 从 grid-unique-paths-strategy 拆出的单阶段编译模块（SRP）：纯函数，无实例状态。
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import { UniversalStageEngine, type UniversalStep, type UniversalTreeNode } from '../universal-stage-engine';

  export function generateGridUniquePathsStage4(
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
    const weightsGrid = UniversalStageEngine.getDynamicWeightsGrid(model, mVal, nVal);
    const isMinPath = model.id === 'min-path-sum' || Boolean(weightsGrid);

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
        weightsGrid,
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
          tag: `起点初始化 memo[0]=${memo[0]}`,
          log: `| 🎬 起点初始化 memo[0] = ${memo[0]}`,
          msg: `起点初始化 <code>memo[0] = ${memo[0]}</code>。`
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
            tag: `首行累加 memo[${j}]=${memo[j]}`,
            log: `| 🎬 首行 memo[${j}] = ${memo[j]}`,
            msg: `首行累加 <code>memo[${j}] = ${memo[j]}</code>。`
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
            tag: `首列累加 memo[0]=${memo[0]}`,
            log: `| 🎬 首列 memo[0] = ${memo[0]}`,
            msg: `首列累加 <code>memo[0] = ${memo[0]}</code>。`
          });

          for (let j = 1; j < nVal; j++) {
            memo[j] = Math.min(memo[j], memo[j - 1]) + weightsGrid[i][j];
            pushStep({
              type: 'accumulate',
              line: lineAccumulate,
              i,
              j,
              activeSlot: j,
              slotMode: 'updated',
              memoj: memo[j],
              tag: `memo[${j}] = ${memo[j]}`,
              log: `| ✨ 滚动更新 memo[${j}] = ${memo[j]}`,
              msg: `一维状态覆盖：<code>memo[${j}] = <strong>${memo[j]}</strong></code>。`
            });
          }
        }
      } else {
        memo[nVal - 1] = weightsGrid[mVal - 1][nVal - 1];
        pushStep({
          type: 'init-slot',
          line: lineInitVal,
          i: mVal - 1,
          j: nVal - 1,
          activeSlot: nVal - 1,
          slotMode: 'updated',
          memoj: memo[nVal - 1],
          tag: `终点初始化 memo[${nVal - 1}]=${memo[nVal - 1]}`,
          log: `| 🎬 逆推终点 memo[${nVal - 1}] = ${memo[nVal - 1]}`,
          msg: `逆推终点初始化 <code>memo[${nVal - 1}] = ${memo[nVal - 1]}</code>。`
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
            tag: `最末行累加 memo[${j}]=${memo[j]}`,
            log: `| 🎬 最末行 memo[${j}] = ${memo[j]}`,
            msg: `最末行累加 <code>memo[${j}] = ${memo[j]}</code>。`
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
            tag: `最右列累加 memo[${nVal - 1}]=${memo[nVal - 1]}`,
            log: `| 🎬 最右列 memo[${nVal - 1}] = ${memo[nVal - 1]}`,
            msg: `最右列累加 <code>memo[${nVal - 1}] = ${memo[nVal - 1]}</code>。`
          });

          for (let j = nVal - 2; j >= 0; j--) {
            memo[j] = Math.min(memo[j], memo[j + 1]) + weightsGrid[i][j];
            pushStep({
              type: 'accumulate',
              line: lineAccumulate,
              i,
              j,
              activeSlot: j,
              slotMode: 'updated',
              memoj: memo[j],
              tag: `逆推 memo[${j}] = ${memo[j]}`,
              log: `| ✨ 逆推滚动更新 memo[${j}] = ${memo[j]}`,
              msg: `逆推一维状态覆盖：<code>memo[${j}] = <strong>${memo[j]}</strong></code>。`
            });
          }
        }
      }
    } else if (isUniquePathsII && obstacleGrid) {
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
