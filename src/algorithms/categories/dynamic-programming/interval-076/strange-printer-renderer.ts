/**
 * 奇怪的打印机 (LeetCode 664 / 左程云 Class 076 Code04)
 * 接入顶层抽象架构：YAML 模型 + IntervalDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import {
  buildStrangePrinterSteps,
  parseStrangePrinterInputs,
} from '../../../../core/renderers/adapters/strange-printer-step-compiler';

export {
  buildStrangePrinterSteps,
  parseStrangePrinterInputs,
  UniversalStageVisualizer,
  UniversalStageVisualizer as StrangePrinterVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'strange-printer',
  name: '奇怪的打印机 (LeetCode 664)',
  viewId: 'strange-printer',
  category: 'dynamic-programming',
  description: '左程云算法讲解076 Code04：LeetCode 664 奇怪的打印机，字符涂色刷漆贪心抵消的区间 DP。',
  icon: '🖨️',
  aliases: ['class076-code04', 'strange-printer-664', 'leetcode-664'],
  template: '<div id="strange-printer" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 664,
  learningGoal: '理解区间两端字符相同时可通过连续刷漆免费顺带刷出末尾字符的区间 DP 边界消减技巧与最优切分点枚举',
});
