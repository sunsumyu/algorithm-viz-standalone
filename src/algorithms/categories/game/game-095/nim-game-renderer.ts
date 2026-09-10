/**
 * 经典尼姆博弈 (Nim Game) - 声明式教学级沙盘渲染器
 * 核心原理：Bouton 定理，所有石子堆的按位异或和 X != 0 则先手必胜
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_095_PROBLEMS } from './game-095-problem-content';
import { NIM_GAME_CODES, NIM_GAME_LINES } from './game-095-stage-codes';
import {
  Game095Step,
  renderBitwiseXorBoard,
  renderPlayerBanner,
  renderStonePiles,
} from './game-095-shared';

export interface NimGameStep extends Game095Step {
  piles: number[];
  curPileIdx: number;
  xorSum: number;
  bestMove?: {
    pileIdx: number;
    before: number;
    after: number;
    takeCount: number;
  };
}

export function buildNimGameSteps(initialPiles: number[]): NimGameStep[] {
  const steps: NimGameStep[] = [];
  const lines = NIM_GAME_LINES;
  const piles = [...initialPiles];

  // Step 0: 入口
  steps.push({
    piles: [...piles],
    curPileIdx: -1,
    xorSum: 0,
    decision: `主函数入口：接收 ${piles.length} 堆石子 [${piles.join(', ')}]`,
    message: '根据 Bouton 定理，全局异或和为 0 代表对称平衡（先手必败），非 0 代表先手必胜',
    log: `enter canWinNim(piles=[${piles.join(', ')}])`,
    codeLine: lines.entry,
    metrics: { '堆数 k': `${piles.length}`, '石子分布': `[${piles.join(', ')}]` },
  });

  // Step 1: 边界特判
  if (!piles || piles.length === 0) {
    steps.push({
      piles: [],
      curPileIdx: -1,
      xorSum: 0,
      isFirstWin: false,
      decision: '特判：石子堆为空，先手无石子可取，判负',
      message: '返回 false',
      log: 'empty piles, return false',
      codeLine: lines.guard,
      metrics: { '终局判定': '先手负' },
    });
    return steps;
  }

  // Step 2: 初始化 xorSum
  let xorSum = 0;
  steps.push({
    piles: [...piles],
    curPileIdx: -1,
    xorSum: 0,
    decision: '初始化异或和变量：xorSum = 0',
    message: '准备遍历所有堆并累加按位异或结果',
    log: 'init xorSum = 0',
    codeLine: lines.initXor,
    metrics: { '当前 xorSum': '0' },
  });

  // Step 3: 循环遍历每一堆累加异或和（逐行一步）
  for (let i = 0; i < piles.length; i++) {
    const stones = piles[i];
    const prevXor = xorSum;
    xorSum ^= stones;

    // 循环头
    steps.push({
      piles: [...piles],
      curPileIdx: i,
      xorSum: prevXor,
      decision: `考察第 ${i + 1} 堆：石子数 = ${stones} (二进制 ${stones.toString(2)})`,
      message: `准备执行 xorSum = ${prevXor} ^ ${stones}`,
      log: `loop pile #${i + 1} stones=${stones}`,
      codeLine: lines.loopHeader,
      metrics: { '当前处理堆': `第 ${i + 1} 堆`, '堆内石子': `${stones}` },
    });

    // 计算异或
    steps.push({
      piles: [...piles],
      curPileIdx: i,
      xorSum,
      decision: `异或累加：xorSum = ${prevXor} ^ ${stones} = ${xorSum} (二进制 ${xorSum.toString(2)})`,
      message: `当前累计异或和为 ${xorSum}`,
      log: `xorSum = ${prevXor} ^ ${stones} = ${xorSum}`,
      codeLine: lines.xorCompute,
      metrics: { '当前 xorSum': `${xorSum}`, '二进制': xorSum.toString(2) },
    });
  }

  // Step 4: 先手制胜决策分析
  const isFirstWin = xorSum !== 0;
  let bestMove: NimGameStep['bestMove'];

  if (isFirstWin) {
    // 寻找满足 piles[i] ^ xorSum < piles[i] 的堆
    for (let i = 0; i < piles.length; i++) {
      const target = piles[i] ^ xorSum;
      if (target < piles[i]) {
        bestMove = {
          pileIdx: i,
          before: piles[i],
          after: target,
          takeCount: piles[i] - target,
        };
        break;
      }
    }

    if (bestMove) {
      steps.push({
        piles: [...piles],
        curPileIdx: bestMove.pileIdx,
        xorSum,
        bestMove,
        isFirstWin: true,
        decision: `🎯 先手必胜第一步：从第 ${bestMove.pileIdx + 1} 堆拿走 ${bestMove.takeCount} 颗石子，将其从 ${bestMove.before} 颗削减为 ${bestMove.after} 颗！`,
        message: `操作后新堆异或和变为 (${xorSum} ^ ${bestMove.before} ^ ${bestMove.after}) = 0，瞬间将必败的平衡态留给对手！`,
        log: `best move: take ${bestMove.takeCount} from pile #${bestMove.pileIdx + 1}`,
        codeLine: lines.returnAns,
        metrics: { '必胜决策': `在第 ${bestMove.pileIdx + 1} 堆拿走 ${bestMove.takeCount} 颗`, '操作后异或和': '0' },
      });
    }
  } else {
    steps.push({
      piles: [...piles],
      curPileIdx: -1,
      xorSum: 0,
      isFirstWin: false,
      decision: '💀 先手必败态 (P-position)：当前所有堆异或和为 0！',
      message: '局势已经处于完美异或平衡，先手在任何一堆拿走任何数量石子，都必然破坏平衡导致异或和变为非 0，后手稳赢',
      log: 'xorSum is 0, first player in P-position',
      codeLine: lines.returnAns,
      metrics: { '局势状态': '完美对称平衡态 / 先手必败' },
    });
  }

  // Step 5: 最终返回
  steps.push({
    piles: [...piles],
    curPileIdx: -1,
    xorSum,
    isFirstWin,
    bestMove,
    decision: isFirstWin
      ? `🎉 最终判定：xorSum=${xorSum} != 0 ➔ 先手必胜！返回 true`
      : '💀 最终判定：xorSum=0 ➔ 先手必败！返回 false',
    message: isFirstWin ? '先手存在确定性必胜方案' : '后手掌控全局必胜方案',
    log: `return ${isFirstWin}`,
    codeLine: lines.returnAns,
    metrics: { '最终结果': isFirstWin ? '先手必胜 (true)' : '先手必败 (false)' },
  });

  return steps;
}

export const nimGameVisualizer = registerDeclarativeAlgorithm<NimGameStep>({
  id: 'nim-game-095',
  name: '经典尼姆博弈 (Nim Game)',
  category: 'game',
  icon: '🎲',
  difficulty: 3,
  levelOrder: 953,
  learningGoal: '深刻理解 Bouton 异或和定理、必胜态转化与二进制平衡拆解',
  problemHtml: GAME_095_PROBLEMS.nimGame.html,
  analysisHtml: GAME_095_PROBLEMS.nimGame.html,
  inputs: [
    {
      id: 'input-piles',
      label: '各堆石子数 (逗号隔开)',
      type: 'text',
      defaultValue: '3, 4, 5',
      placeholder: '例如 3, 4, 5',
    },
  ],
  codeLanguages: NIM_GAME_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-piles'] ?? '3, 4, 5');
    const piles = raw
      .split(/[,，\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0);
    return buildNimGameSteps(piles.length > 0 ? piles : [3, 4, 5]);
  },
  renderCanvas: (stageContainer: HTMLElement, step: NimGameStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部胜负 Banner
    const statusText = step.isFirstWin === undefined
      ? `正在扫描第 ${step.curPileIdx + 1} 堆...`
      : step.isFirstWin
      ? `异或和 X=${step.xorSum} != 0 ➔ 先手必胜`
      : '异或和 X=0 ➔ 局势平衡 (先手必败)';
    const formulaText = `X = ${step.piles.join(' ^ ')} = ${step.xorSum}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 石子物理堆叠图
    renderStonePiles(root, step.piles, step.curPileIdx);

    // 3. 二进制异或展开面板
    renderBitwiseXorBoard(root, step.piles, step.xorSum);

    // 4. 必胜决策建议卡片
    if (step.bestMove) {
      const moveCard = document.createElement('div');
      moveCard.style.cssText = 'padding: 10px 16px; background: #ecfdf5; border-radius: 8px; border: 1.5px solid #10b981; color: #065f46; font-size: 13px; line-height: 1.5;';
      moveCard.innerHTML = `
        <div style="font-weight: 800; display: flex; align-items: center; gap: 6px;">
          <span>🎯 先手最优操作提示:</span>
        </div>
        <div style="margin-top: 4px;">
          在<strong>第 ${step.bestMove.pileIdx + 1} 堆</strong>中拿走 <strong>${step.bestMove.takeCount}</strong> 颗石子（原 ${step.bestMove.before} 颗 ➔ 变为 ${step.bestMove.after} 颗）。
          操作完成后全局异或和降为 <strong>0</strong>，对手面对必败态！
        </div>
      `;
      root.appendChild(moveCard);
    }

    stageContainer.appendChild(root);
  },
});
