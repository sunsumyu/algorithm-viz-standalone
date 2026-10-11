/**
 * Class 056: Code03 情侣牵手与置换环定理 (Couples Holding Hands)
 * LeetCode 765
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言 1-based 源码行号联动
 * - 保留库内既有 couples-holding-hands 独立性，通过别名与主 ID 精准区分
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { UNION_FIND_056_PROBLEMS } from './union-find-056-problem-content';
import { CODE03_COUPLES_CODES } from './union-find-056-stage-codes';
import { Step056, renderCouplesHandsBoard } from './union-find-056-shared';
import { buildCouplesHandsSteps } from './couples-holding-hands-056-step-compiler';

export { buildCouplesHandsSteps };

export const couplesHoldingHands056Renderer = registerDeclarativeAlgorithm<Step056>({
  id: 'couples-holding-hands-056',
  aliases: ['class056-code03', 'couples-holding-hands-765'],
  name: '情侣牵手与置换环定理 (Class 056)',
  category: 'union-find',
  difficulty: 'hard',
  badge: { mode: '置换环定理', complexity: 'O(N)' },
  description: '左程云算法通关课【必备篇】Class 056：利用并查集求解情侣牵手置换环拆解，交换次数 = N - Sets (LeetCode 765)',
  learningGoal: '掌握图论缩点与置换环定理：当 k 个元素互相错位纠缠成环时，只需 k-1 次交换即可拆解环使全部元素归位。',
  icon: '👫',

  inputs: [
    {
      id: 'row',
      label: '座位排布人员编号 (偶数个, 逗号分隔)',
      type: 'text',
      defaultValue: '0, 2, 1, 3',
      placeholder: '例如: 0, 2, 1, 3 或 5, 4, 2, 6, 3, 1, 0, 7',
    },
  ],

  presets: [
    {
      label: '经典案例 1: [0, 2, 1, 3] (需1次交换)',
      values: { row: '0, 2, 1, 3' },
    },
    {
      label: '经典案例 2: [3, 2, 0, 1] (0次交换，天生牵手)',
      values: { row: '3, 2, 0, 1' },
    },
    {
      label: '复杂错位环: [5, 4, 2, 6, 3, 1, 0, 7] (4对情侣)',
      values: { row: '5, 4, 2, 6, 3, 1, 0, 7' },
    },
    {
      label: '完全混乱大环: [0, 3, 2, 5, 4, 7, 6, 1]',
      values: { row: '0, 3, 2, 5, 4, 7, 6, 1' },
    },
  ],

  problemContent: UNION_FIND_056_PROBLEMS.couplesHoldingHands056,
  codeLanguages: CODE03_COUPLES_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let row = [0, 2, 1, 3];

    if (params && params.row) {
      const parsed = String(params.row)
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
      if (parsed.length >= 2 && parsed.length % 2 === 0) {
        row = parsed;
      }
    }

    return buildCouplesHandsSteps(row);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderCouplesHandsBoard(step);
  },
});
