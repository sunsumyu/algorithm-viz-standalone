/**
 * 硬币购物方案数 (Coin Buy Ways) - 声明式教学级沙盘渲染器
 * 核心原理：完全背包预处理无限制方案 + 16状态子集奇减偶加容斥原理
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_099_PROBLEMS } from './math-099-problem-content';
import { COIN_BUY_WAYS_CODES } from './math-099-stage-codes';
import {
  CoinBuyStep,
  buildCoinBuySteps,
} from '../../../../core/renderers/adapters/coin-buy-ways-099-step-compiler';
import { coinBuyWays099CanvasAdapter } from '../../../../core/renderers/adapters/coin-buy-ways-099-canvas-adapter';

export type { CoinBuyStep };
export { buildCoinBuySteps };

export const coinBuyWaysVisualizer = registerDeclarativeAlgorithm<CoinBuyStep>({
  id: 'coin-buy-ways-099',
  name: '硬币购物方案数 (Coin Buy Ways)',
  category: 'math',
  icon: '🪙',
  difficulty: 3,
  levelOrder: 995,
  aliases: ['class099-code05', 'coin-buy-ways', 'haoi-2008-coins', 'luogu-p1450'],
  learningGoal: '掌握完全背包预处理无限制方案结合 2^4 状态奇减偶加容斥原理',
  problemHtml: MATH_099_PROBLEMS.coinBuyWays.html,
  analysisHtml: MATH_099_PROBLEMS.coinBuyWays.html,
  inputs: [
    {
      id: 'input-s',
      label: '支付总金额 s',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 1000,
      step: 1,
      placeholder: '例如 10',
    },
  ],
  codeLanguages: COIN_BUY_WAYS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const s = Math.max(1, parseInt(String(inputs?.['input-s'] ?? '10'), 10) || 10);
    const c = [1, 2, 5, 10];
    const d = [3, 2, 3, 1];
    return buildCoinBuySteps(c, d, s);
  },
  renderCanvas: (stageContainer: HTMLElement, step: CoinBuyStep) => {
    coinBuyWays099CanvasAdapter.render(stageContainer, step);
  },
});
