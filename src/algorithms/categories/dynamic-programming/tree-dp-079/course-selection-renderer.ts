/**
 * 选课（树上背包 DP / Course Selection / Luogu P2014 / 左程云 Class 079 Code02）
 * 接入顶层抽象架构：YAML 模型 + TreeDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileCourseSelection } from '../../../../core/strategies/tree-courseselection';

export {
  compileCourseSelection,
  UniversalStageVisualizer,
  UniversalStageVisualizer as CourseSelectionVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'course-selection',
  name: '选课（树上背包DP） (洛谷 P2014)',
  viewId: 'course-selection',
  category: 'dynamic-programming',
  description: '左程云算法讲解079 Code02：洛谷 P2014 选课，经典树上背包 DP：以虚拟超级节点 0 为根统一森林，dp[u][j] 表示以 u 为根选修 j 门课的最大学分，分组背包逆序转移合并子树收益。',
  icon: '🎓',
  aliases: ['class079-code02', 'course-schedule-tree', 'luogu-p2014'],
  template: '<div id="course-selection" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 7902,
  learningGoal: '掌握经典树上背包与分组背包结合的建模技巧：虚拟根节点 0 统一森林、容量 m+1 扩展、以及逆序枚举容量合并子树物品组的状态转移方程。',
});
