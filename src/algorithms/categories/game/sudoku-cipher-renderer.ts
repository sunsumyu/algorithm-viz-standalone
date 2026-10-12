/**
 * 数独神偷·密码解构者 (Sudoku Cipher: Backtracking & MRV Solver)
 * 经典回溯算法、9x9 赛博密码矩阵与动态递归透视
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  SudokuCipherVisualizer,
  SUDOKU_CIPHER_TEMPLATE,
} from './sudoku-cipher-visualizer';

export {
  SudokuCipherVisualizer,
  SUDOKU_CIPHER_TEMPLATE,
};

registerAlgorithm({
  id: 'sudoku-cipher',
  name: '数独神偷·密码解构者',
  viewId: 'algo-sudoku-cipher-view',
  category: 'game',
  description: '回溯算法数独游戏：9x9 赛博密码矩阵、实时十字线冲突扫描、动态量子回溯求解与世界难题挑战',
  icon: '🧩',
  template: SUDOKU_CIPHER_TEMPLATE,
  Visualizer: SudokuCipherVisualizer,
  difficulty: 3,
  levelOrder: 9,
  learningGoal: '透视经典回溯与约束满足问题（CSP）在二维空间中的试探、冲突检测与撤销回溯机制',
});
