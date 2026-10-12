/**
 * 回文忍者·神速飞刀切割者 (Palindrome Ninja: Backtracking Slicer)
 * 经典回溯算法、竹简神速飞刀切割与全解画廊
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  PalindromeNinjaVisualizer,
  PALINDROME_NINJA_TEMPLATE,
  SlashCut,
} from './palindrome-ninja-visualizer';

export {
  PalindromeNinjaVisualizer,
  PALINDROME_NINJA_TEMPLATE,
  type SlashCut,
};

registerAlgorithm({
  id: 'palindrome-ninja',
  name: '回文忍者·神速飞刀切割者',
  viewId: 'algo-palindrome-ninja-view',
  category: 'game',
  description: '回溯分割算法游戏：竹林修罗场、神速飞刀刀光粒子、回文有效性检测与全解画廊速览',
  icon: '🗡️',
  template: PALINDROME_NINJA_TEMPLATE,
  Visualizer: PalindromeNinjaVisualizer,
  difficulty: 2,
  levelOrder: 12,
  learningGoal: '掌握经典回溯算法在字符串分割、组合生成与回文子串判定中的应用机制',
});
