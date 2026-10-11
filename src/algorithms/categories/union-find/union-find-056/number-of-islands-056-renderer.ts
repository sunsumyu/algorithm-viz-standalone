/**
 * Class 056: Code05 岛屿数量并查集二维合并 (Number of Islands)
 * LeetCode 200
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言 1-based 源码行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { UNION_FIND_056_PROBLEMS } from './union-find-056-problem-content';
import { CODE05_ISLANDS_UF_CODES } from './union-find-056-stage-codes';
import { Step056, renderIslandsUnionFindBoard } from './union-find-056-shared';
import { buildNumberOfIslandsSteps } from './number-of-islands-056-step-compiler';

export { buildNumberOfIslandsSteps };

export const numberOfIslands056Renderer = registerDeclarativeAlgorithm<Step056>({
  id: 'number-of-islands-056',
  aliases: ['class056-code05', 'number-of-islands-200-uf'],
  name: '岛屿数量并查集二维合并 (Class 056)',
  category: 'union-find',
  difficulty: 'medium',
  badge: { mode: '二维扁平化', complexity: 'O(R·C)' },
  description: '左程云算法通关课【必备篇】Class 056：二维网格一维坐标展平与向左向上动态加边合并 (LeetCode 200 并查集解法)',
  learningGoal: '深刻理解二维网格图论并查集建模：行优先扫描中只需向左向上连边即可无遗漏收敛全图连通分量。',
  icon: '🏝️',

  inputs: [
    {
      id: 'gridStr',
      label: '网格行数据 (每行以换行或斜杠分隔, 1为陆地 0为水)',
      type: 'text',
      defaultValue: '11110 / 11010 / 11000 / 00000',
      placeholder: '例如: 11110 / 11010 / 11000 / 00000',
    },
  ],

  presets: [
    {
      label: '经典案例 1: 单一巨大岛屿 (结果: 1)',
      values: { gridStr: '11110 / 11010 / 11000 / 00000' },
    },
    {
      label: '经典案例 2: 三座孤立岛屿 (结果: 3)',
      values: { gridStr: '11000 / 11000 / 00100 / 00011' },
    },
    {
      label: '全孤立点岛屿: 棋盘网状 (结果: 4)',
      values: { gridStr: '1010 / 0101 / 1010 / 0101' },
    },
    {
      label: '回字形大岛环绕 (结果: 1)',
      values: { gridStr: '1111 / 1001 / 1001 / 1111' },
    },
  ],

  problemContent: UNION_FIND_056_PROBLEMS.numberOfIslands056,
  codeLanguages: CODE05_ISLANDS_UF_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let grid = [
      ['1', '1', '1', '1', '0'],
      ['1', '1', '0', '1', '0'],
      ['1', '1', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
    ];

    if (params && params.gridStr) {
      const raw = String(params.gridStr);
      const rows = raw.split(/[\/\n\r]+/).map(s => s.trim()).filter(Boolean);
      if (rows.length > 0) {
        const parsedGrid = rows.map(r => r.split('').filter(ch => ch === '0' || ch === '1'));
        if (parsedGrid.length > 0 && parsedGrid[0].length > 0) {
          grid = parsedGrid;
        }
      }
    }

    return buildNumberOfIslandsSteps(grid);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderIslandsUnionFindBoard(step);
  },
});
